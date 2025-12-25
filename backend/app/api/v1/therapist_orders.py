"""
技师端订单接口
"""
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.deps import require_role
from app.models.user import User, UserRole, Address
from app.models.therapist import Therapist
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.models.order import Order

router = APIRouter()


# ==================== Schemas ====================

class TherapistOrderListItem(BaseModel):
    """技师端订单列表项"""
    id: int
    booking_no: str
    
    # 客户信息
    customer_name: str
    customer_phone: str
    customer_avatar: Optional[str] = None
    
    # 服务信息
    service_id: int
    service_name: str
    service_duration: int
    service_price: float
    
    # 地址信息
    address_detail: str
    address_contact: str
    address_phone: str
    address_lat: Optional[float] = None
    address_lng: Optional[float] = None
    
    # 时间信息
    booking_date: date
    start_time: str  # "14:00"
    end_time: str    # "16:00"
    
    # 订单信息
    status: BookingStatus
    total_price: float
    user_note: Optional[str] = None
    therapist_note: Optional[str] = None
    
    # 时间戳
    therapist_arrived_at: Optional[datetime] = None
    service_started_at: Optional[datetime] = None
    service_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TherapistOrderDetail(TherapistOrderListItem):
    """技师端订单详情（包含更多信息）"""
    # 价格明细
    discount_amount: float
    coupon_deduction: float
    points_deduction: float
    
    # 取消信息
    cancel_reason: Optional[str] = None
    cancelled_by: Optional[str] = None
    cancelled_at: Optional[datetime] = None


class AcceptOrderRequest(BaseModel):
    """接受订单请求"""
    pass  # 技师接单不需要额外参数


class RejectOrderRequest(BaseModel):
    """拒绝订单请求"""
    reason: str = Field(..., min_length=1, max_length=200, description="拒绝原因")


class UpdateOrderStatusRequest(BaseModel):
    """更新订单状态请求"""
    status: BookingStatus = Field(..., description="新状态")
    note: Optional[str] = Field(None, max_length=500, description="备注")
    latitude: Optional[float] = Field(None, description="当前纬度（打卡用）")
    longitude: Optional[float] = Field(None, description="当前经度（打卡用）")


class CheckInRequest(BaseModel):
    """打卡请求"""
    latitude: float = Field(..., description="当前纬度")
    longitude: float = Field(..., description="当前经度")
    check_type: str = Field(..., description="打卡类型: arrived/start_service/complete_service")


# ==================== APIs ====================

@router.get("/orders", response_model=List[TherapistOrderListItem], summary="获取技师订单列表")
async def get_therapist_orders(
    status_filter: Optional[str] = Query(None, description="状态筛选: pending/confirmed/in_progress/completed/cancelled"),
    date_from: Optional[date] = Query(None, description="开始日期"),
    date_to: Optional[date] = Query(None, description="结束日期"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """
    获取技师的订单列表
    
    - pending: 待接单
    - confirmed: 已接单（待服务）
    - en_route: 前往中
    - in_progress: 服务中
    - completed: 已完成
    - cancelled: 已取消
    """
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 构建查询
    query = select(Booking).where(Booking.therapist_id == therapist.id)
    
    # 状态筛选
    if status_filter:
        try:
            status_enum = BookingStatus(status_filter)
            query = query.where(Booking.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的状态: {status_filter}"
            )
    
    # 日期筛选
    if date_from:
        query = query.where(Booking.booking_date >= date_from)
    if date_to:
        query = query.where(Booking.booking_date <= date_to)
    
    # 排序：按预约日期和时间倒序
    query = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc())
    
    # 分页
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # 执行查询
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    # 构建响应数据
    response_data = []
    for booking in bookings:
        # 获取客户信息
        user_result = await db.execute(
            select(User).where(User.id == booking.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        # 获取服务信息
        service_result = await db.execute(
            select(Service).where(Service.id == booking.service_id)
        )
        service = service_result.scalar_one_or_none()
        
        # 获取地址信息
        address_result = await db.execute(
            select(Address).where(Address.id == booking.address_id)
        )
        address = address_result.scalar_one_or_none()
        
        if not user or not service or not address:
            continue
        
        # 组合完整地址
        full_address = f"{address.province}{address.city}{address.district}{address.street}"
        if address.detail:
            full_address += f" {address.detail}"
        
        response_data.append(TherapistOrderListItem(
            id=booking.id,
            booking_no=booking.booking_no,
            customer_name=user.nickname or "客户",
            customer_phone=user.phone,
            customer_avatar=user.avatar,
            service_id=service.id,
            service_name=service.name,
            service_duration=booking.duration,
            service_price=booking.service_price,
            address_detail=full_address,  # 使用组合的完整地址
            address_contact=address.contact_name,
            address_phone=address.contact_phone,  # 修复：使用 contact_phone
            address_lat=address.latitude,
            address_lng=address.longitude,
            booking_date=booking.booking_date,
            start_time=booking.start_time.strftime("%H:%M"),
            end_time=booking.end_time.strftime("%H:%M"),
            status=booking.status,
            total_price=booking.total_price,
            user_note=booking.user_note,
            therapist_note=booking.therapist_note,
            therapist_arrived_at=booking.therapist_arrived_at,
            service_started_at=booking.service_started_at,
            service_completed_at=booking.service_completed_at,
            created_at=booking.created_at,
            updated_at=booking.updated_at
        ))
    
    return response_data


@router.get("/orders/{booking_id}", response_model=TherapistOrderDetail, summary="获取订单详情")
async def get_order_detail(
    booking_id: int,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """获取订单详细信息"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 获取订单
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 获取关联信息
    user_result = await db.execute(select(User).where(User.id == booking.user_id))
    user = user_result.scalar_one()
    
    service_result = await db.execute(select(Service).where(Service.id == booking.service_id))
    service = service_result.scalar_one()
    
    address_result = await db.execute(select(Address).where(Address.id == booking.address_id))
    address = address_result.scalar_one()
    
    # 组合完整地址
    full_address = f"{address.province}{address.city}{address.district}{address.street}"
    if address.detail:
        full_address += f" {address.detail}"
    
    return TherapistOrderDetail(
        id=booking.id,
        booking_no=booking.booking_no,
        customer_name=user.nickname or "客户",
        customer_phone=user.phone,
        customer_avatar=user.avatar,
        service_id=service.id,
        service_name=service.name,
        service_duration=booking.duration,
        service_price=booking.service_price,
        address_detail=full_address,
        address_contact=address.contact_name,
        address_phone=address.contact_phone,  # 修复：使用 contact_phone
        address_lat=address.latitude,
        address_lng=address.longitude,
        booking_date=booking.booking_date,
        start_time=booking.start_time.strftime("%H:%M"),
        end_time=booking.end_time.strftime("%H:%M"),
        status=booking.status,
        total_price=booking.total_price,
        user_note=booking.user_note,
        therapist_note=booking.therapist_note,
        discount_amount=booking.discount_amount,
        coupon_deduction=booking.coupon_deduction,
        points_deduction=booking.points_deduction,
        cancel_reason=booking.cancel_reason,
        cancelled_by=booking.cancelled_by,
        cancelled_at=booking.cancelled_at,
        therapist_arrived_at=booking.therapist_arrived_at,
        service_started_at=booking.service_started_at,
        service_completed_at=booking.service_completed_at,
        created_at=booking.created_at,
        updated_at=booking.updated_at
    )


@router.post("/orders/{booking_id}/accept", summary="接受订单")
async def accept_order(
    booking_id: int,
    request: AcceptOrderRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """技师接受订单"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 获取订单
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 检查订单状态
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"订单当前状态为 {booking.status.value}，无法接单"
        )
    
    # 更新订单状态
    booking.status = BookingStatus.CONFIRMED
    booking.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(booking)
    
    return {"message": "接单成功", "booking_id": booking.id, "status": booking.status.value}


@router.post("/orders/{booking_id}/reject", summary="拒绝订单")
async def reject_order(
    booking_id: int,
    request: RejectOrderRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """技师拒绝订单"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 获取订单
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 检查订单状态
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"订单当前状态为 {booking.status.value}，无法拒单"
        )
    
    # 更新订单状态
    booking.status = BookingStatus.CANCELLED
    booking.cancel_reason = request.reason
    booking.cancelled_by = "therapist"
    booking.cancelled_at = datetime.utcnow()
    booking.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(booking)
    
    return {"message": "拒单成功", "booking_id": booking.id}


@router.post("/orders/{booking_id}/update-status", summary="更新订单状态")
async def update_order_status(
    booking_id: int,
    request: UpdateOrderStatusRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """更新订单状态（开始服务、完成服务等）"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 获取订单
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 更新状态和备注
    booking.status = request.status
    if request.note:
        booking.therapist_note = request.note
    booking.updated_at = datetime.utcnow()
    
    # 根据状态更新时间戳
    if request.status == BookingStatus.EN_ROUTE:
        booking.therapist_arrived_at = None  # 正在前往
    elif request.status == BookingStatus.IN_PROGRESS:
        booking.service_started_at = datetime.utcnow()
    elif request.status == BookingStatus.COMPLETED:
        booking.service_completed_at = datetime.utcnow()
        # 更新技师完成订单数
        therapist.completed_count += 1
    
    await db.commit()
    await db.refresh(booking)
    
    return {
        "message": "状态更新成功",
        "booking_id": booking.id,
        "status": booking.status.value
    }


@router.post("/orders/{booking_id}/checkin", summary="订单打卡")
async def checkin_order(
    booking_id: int,
    request: CheckInRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """
    订单打卡（到达打卡、开始服务、完成服务）
    
    check_type:
    - arrived: 到达客户地址
    - start_service: 开始服务
    - complete_service: 完成服务
    """
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 获取订单
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 获取地址信息进行距离验证
    address_result = await db.execute(
        select(Address).where(Address.id == booking.address_id)
    )
    address = address_result.scalar_one()
    
    # TODO: 计算距离，验证是否在有效范围内（100米）
    # distance = calculate_distance(request.latitude, request.longitude, address.latitude, address.longitude)
    # if distance > 100:
    #     raise HTTPException(status_code=400, detail="距离目标地址太远，无法打卡")
    
    # 根据打卡类型更新状态
    now = datetime.utcnow()
    
    if request.check_type == "arrived":
        booking.therapist_arrived_at = now
        booking.status = BookingStatus.EN_ROUTE
        message = "到达打卡成功"
    elif request.check_type == "start_service":
        booking.service_started_at = now
        booking.status = BookingStatus.IN_PROGRESS
        message = "开始服务打卡成功"
    elif request.check_type == "complete_service":
        booking.service_completed_at = now
        booking.status = BookingStatus.COMPLETED
        therapist.completed_count += 1
        message = "完成服务打卡成功"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的打卡类型"
        )
    
    booking.updated_at = now
    await db.commit()
    await db.refresh(booking)
    
    return {
        "message": message,
        "booking_id": booking.id,
        "status": booking.status.value,
        "check_time": now
    }


@router.get("/orders/stats/summary", summary="订单统计")
async def get_order_stats(
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """获取技师订单统计"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 统计各状态订单数量
    pending_count_result = await db.execute(
        select(func.count(Booking.id)).where(
            and_(
                Booking.therapist_id == therapist.id,
                Booking.status == BookingStatus.PENDING
            )
        )
    )
    pending_count = pending_count_result.scalar() or 0
    
    in_progress_count_result = await db.execute(
        select(func.count(Booking.id)).where(
            and_(
                Booking.therapist_id == therapist.id,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS])
            )
        )
    )
    in_progress_count = in_progress_count_result.scalar() or 0
    
    completed_count = therapist.completed_count
    
    return {
        "pending_count": pending_count,
        "in_progress_count": in_progress_count,
        "completed_count": completed_count,
        "total_count": therapist.booking_count
    }

