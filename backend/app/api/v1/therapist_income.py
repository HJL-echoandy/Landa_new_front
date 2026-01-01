"""
技师端收入统计接口
"""
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.deps import require_role, get_current_therapist
from app.models.user import User, UserRole
from app.models.therapist import Therapist
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.models.order import Order
from app.models.finance import TherapistBalance, Withdrawal, WithdrawalStatus

router = APIRouter()


# ==================== Schemas ====================

class IncomeSummary(BaseModel):
    """收入汇总"""
    today: float = Field(default=0, description="今日收入")
    this_week: float = Field(default=0, description="本周收入")
    this_month: float = Field(default=0, description="本月收入")
    total: float = Field(default=0, description="总收入")
    available_balance: float = Field(default=0, description="可提现余额")
    frozen_balance: float = Field(default=0, description="冻结金额")
    total_withdrawn: float = Field(default=0, description="累计提现")
    
    class Config:
        from_attributes = True


class DailyIncome(BaseModel):
    """每日收入"""
    date: str
    amount: float


class IncomeByService(BaseModel):
    """按服务类型统计收入"""
    service_name: str
    count: int
    total_amount: float


class IncomeStatistics(BaseModel):
    """收入统计"""
    period: str
    total_income: float
    total_orders: int
    average_income: float
    income_by_service: List[IncomeByService]
    daily_income: List[DailyIncome]


class IncomeDetail(BaseModel):
    """收入明细"""
    id: int
    order_id: int
    order_no: str
    service_name: str
    customer_name: str
    amount: float
    service_price: float
    commission_rate: float = Field(default=0.7, description="分成比例")
    settled: bool
    settled_at: Optional[datetime] = None
    created_at: datetime


class IncomeDetailsResponse(BaseModel):
    """收入明细响应"""
    records: List[IncomeDetail]
    total: int
    page: int
    page_size: int


# ==================== APIs ====================

@router.get("/summary", response_model=IncomeSummary, summary="获取收入汇总")
async def get_income_summary(
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """获取技师收入汇总数据"""
    
    # 计算今日收入
    today = date.today()
    today_income_result = await db.execute(
        select(func.sum(Booking.total_price))
        .where(
            and_(
                Booking.therapist_id == current_therapist.id,
                Booking.status == BookingStatus.COMPLETED,
                Booking.booking_date == today
            )
        )
    )
    today_income = today_income_result.scalar() or 0.0
    
    # 计算本周收入（从周一开始）
    week_start = today - timedelta(days=today.weekday())
    week_income_result = await db.execute(
        select(func.sum(Booking.total_price))
        .where(
            and_(
                Booking.therapist_id == current_therapist.id,
                Booking.status == BookingStatus.COMPLETED,
                Booking.booking_date >= week_start
            )
        )
    )
    week_income = week_income_result.scalar() or 0.0
    
    # 计算本月收入
    month_start = today.replace(day=1)
    month_income_result = await db.execute(
        select(func.sum(Booking.total_price))
        .where(
            and_(
                Booking.therapist_id == current_therapist.id,
                Booking.status == BookingStatus.COMPLETED,
                Booking.booking_date >= month_start
            )
        )
    )
    month_income = month_income_result.scalar() or 0.0
    
    # 计算总收入
    total_income_result = await db.execute(
        select(func.sum(Booking.total_price))
        .where(
            and_(
                Booking.therapist_id == current_therapist.id,
                Booking.status == BookingStatus.COMPLETED
            )
        )
    )
    total_income = total_income_result.scalar() or 0.0
    
    # ✅ 从 TherapistBalance 表获取余额信息
    balance_result = await db.execute(
        select(TherapistBalance).where(
            TherapistBalance.therapist_id == current_therapist.id
        )
    )
    balance = balance_result.scalar_one_or_none()
    
    if balance:
        # 使用数据库中的实际余额
        available_balance = balance.balance
        frozen_balance = balance.frozen_amount
        total_income_from_balance = balance.total_income
    else:
        # 如果还没有余额记录，使用计算值
        available_balance = total_income * 0.7  # 假设平台分成30%，技师得70%
        frozen_balance = 0.0
        total_income_from_balance = total_income
    
    # 计算累计提现金额
    total_withdrawn_result = await db.execute(
        select(func.sum(Withdrawal.amount))
        .where(
            and_(
                Withdrawal.therapist_id == current_therapist.id,
                Withdrawal.status.in_([WithdrawalStatus.APPROVED, WithdrawalStatus.PAID])
            )
        )
    )
    total_withdrawn = total_withdrawn_result.scalar() or 0.0
    
    return IncomeSummary(
        today=today_income,
        this_week=week_income,
        this_month=month_income,
        total=total_income,
        available_balance=available_balance,
        frozen_balance=frozen_balance,
        total_withdrawn=total_withdrawn
    )


@router.get("/statistics", response_model=IncomeStatistics, summary="获取收入统计")
async def get_income_statistics(
    period: str = Query(..., description="统计周期: today/this_week/this_month"),
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """获取技师收入统计数据"""
    
    # 根据周期计算日期范围
    today = date.today()
    if period == "today":
        start_date = today
        end_date = today
    elif period == "this_week":
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif period == "this_month":
        start_date = today.replace(day=1)
        end_date = today
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的统计周期"
        )
    
    # 查询订单数据
    bookings_result = await db.execute(
        select(Booking, Service)
        .join(Service, Booking.service_id == Service.id)
        .where(
            and_(
                Booking.therapist_id == current_therapist.id,
                Booking.status == BookingStatus.COMPLETED,
                Booking.booking_date >= start_date,
                Booking.booking_date <= end_date
            )
        )
    )
    bookings_data = bookings_result.all()
    
    # 计算总收入和订单数
    total_income = sum(booking.total_price for booking, _ in bookings_data)
    total_orders = len(bookings_data)
    average_income = total_income / total_orders if total_orders > 0 else 0
    
    # 按服务类型统计
    service_income_map = {}
    for booking, service in bookings_data:
        service_name = service.name
        if service_name not in service_income_map:
            service_income_map[service_name] = {"count": 0, "total_amount": 0}
        service_income_map[service_name]["count"] += 1
        service_income_map[service_name]["total_amount"] += booking.total_price
    
    income_by_service = [
        IncomeByService(
            service_name=name,
            count=data["count"],
            total_amount=data["total_amount"]
        )
        for name, data in service_income_map.items()
    ]
    
    # 按日期统计
    daily_income_map = {}
    for booking, _ in bookings_data:
        date_str = booking.booking_date.isoformat()
        if date_str not in daily_income_map:
            daily_income_map[date_str] = 0
        daily_income_map[date_str] += booking.total_price
    
    # 填充缺失的日期（收入为0）
    current_date = start_date
    daily_income = []
    while current_date <= end_date:
        date_str = current_date.isoformat()
        daily_income.append(DailyIncome(
            date=date_str,
            amount=daily_income_map.get(date_str, 0)
        ))
        current_date += timedelta(days=1)
    
    return IncomeStatistics(
        period=period,
        total_income=total_income,
        total_orders=total_orders,
        average_income=average_income,
        income_by_service=income_by_service,
        daily_income=daily_income
    )


@router.get("/details", response_model=IncomeDetailsResponse, summary="获取收入明细")
async def get_income_details(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    settled: Optional[bool] = Query(None, description="是否已结算"),
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """获取技师收入明细列表"""
    
    # 构建查询条件
    conditions = [
        Booking.therapist_id == current_therapist.id,
        Booking.status == BookingStatus.COMPLETED
    ]
    
    # 查询总数
    count_query = select(func.count(Booking.id)).where(and_(*conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # 分页查询
    offset = (page - 1) * page_size
    bookings_result = await db.execute(
        select(Booking, Service, User)
        .join(Service, Booking.service_id == Service.id)
        .join(User, Booking.user_id == User.id)
        .where(and_(*conditions))
        .order_by(Booking.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    bookings_data = bookings_result.all()
    
    # 构建响应
    records = []
    for booking, service, user in bookings_data:
        records.append(IncomeDetail(
            id=booking.id,
            order_id=booking.id,
            order_no=booking.booking_no,
            service_name=service.name,
            customer_name=user.nickname or "客户",
            amount=booking.total_price * 0.7,  # 假设技师得70%
            service_price=booking.service_price,
            commission_rate=0.7,
            settled=True,  # 简化处理：完成的订单都视为已结算
            settled_at=booking.service_completed_at,
            created_at=booking.created_at
        ))
    
    return IncomeDetailsResponse(
        records=records,
        total=total,
        page=page,
        page_size=page_size
    )

