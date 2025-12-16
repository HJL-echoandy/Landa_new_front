"""
预约接口
"""
import uuid
from datetime import datetime, date, time, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Address
from app.models.therapist import Therapist, TherapistTimeSlot
from app.models.service import Service, TherapistService
from app.models.booking import Booking, BookingStatus
from app.models.order import Order, PaymentStatus
from app.models.coupon import UserCoupon, CouponStatus
from app.schemas.booking import (
    BookingCreate,
    BookingPricePreview,
    BookingPriceResponse,
    BookingListResponse,
    BookingDetailResponse,
    BookingCancelRequest,
    OrderListResponse,
    ReviewCreate,
    ReviewResponse
)

router = APIRouter()


def generate_booking_no() -> str:
    """生成预约编号"""
    return f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"


def generate_order_no() -> str:
    """生成订单编号"""
    return f"OD{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"


@router.post("/preview-price", response_model=BookingPriceResponse, summary="预约价格预览")
async def preview_booking_price(
    data: BookingPricePreview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """预览预约价格（计算优惠）"""
    # 获取服务价格
    ts_result = await db.execute(
        select(TherapistService, Service)
        .join(Service, TherapistService.service_id == Service.id)
        .where(TherapistService.therapist_id == data.therapist_id)
        .where(TherapistService.service_id == data.service_id)
        .where(TherapistService.is_active == True)
    )
    row = ts_result.first()
    
    if not row:
        raise HTTPException(status_code=400, detail="该治疗师不提供此服务")
    
    ts, service = row
    service_price = ts.price if ts.price is not None else service.base_price
    
    discount_amount = 0
    coupon_deduction = 0
    points_deduction = 0
    
    # 计算优惠券抵扣
    if data.coupon_id:
        coupon_result = await db.execute(
            select(UserCoupon)
            .where(UserCoupon.id == data.coupon_id)
            .where(UserCoupon.user_id == current_user.id)
            .where(UserCoupon.status == CouponStatus.ACTIVE)
        )
        coupon = coupon_result.scalar_one_or_none()
        
        if coupon and service_price >= coupon.min_order_amount:
            if coupon.coupon_type.value == "percentage":
                coupon_deduction = service_price * coupon.value / 100
                if coupon.max_discount:
                    coupon_deduction = min(coupon_deduction, coupon.max_discount)
            else:
                coupon_deduction = coupon.value
    
    # 计算积分抵扣（100积分 = 1元）
    if data.points_to_use > 0:
        max_points = min(data.points_to_use, current_user.points)
        points_deduction = max_points / 100
        # 积分抵扣不能超过订单金额的一定比例（如20%）
        max_points_deduction = service_price * 0.2
        points_deduction = min(points_deduction, max_points_deduction)
    
    total_price = max(0, service_price - discount_amount - coupon_deduction - points_deduction)
    
    return BookingPriceResponse(
        service_price=service_price,
        discount_amount=discount_amount,
        coupon_deduction=round(coupon_deduction, 2),
        points_deduction=round(points_deduction, 2),
        total_price=round(total_price, 2)
    )


@router.post("", response_model=BookingDetailResponse, summary="创建预约")
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建预约"""
    # 验证治疗师
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.id == data.therapist_id).where(Therapist.is_active == True)
    )
    therapist = therapist_result.scalar_one_or_none()
    if not therapist:
        raise HTTPException(status_code=400, detail="治疗师不存在")
    
    # 验证服务
    ts_result = await db.execute(
        select(TherapistService, Service)
        .join(Service, TherapistService.service_id == Service.id)
        .where(TherapistService.therapist_id == data.therapist_id)
        .where(TherapistService.service_id == data.service_id)
        .where(TherapistService.is_active == True)
    )
    row = ts_result.first()
    if not row:
        raise HTTPException(status_code=400, detail="该治疗师不提供此服务")
    
    ts, service = row
    
    # 验证地址
    address_result = await db.execute(
        select(Address)
        .where(Address.id == data.address_id)
        .where(Address.user_id == current_user.id)
        .where(Address.is_deleted == False)
    )
    address = address_result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=400, detail="地址不存在")
    
    # 解析时间
    start_time = datetime.strptime(data.start_time, "%H:%M").time()
    end_time = (datetime.combine(date.today(), start_time) + timedelta(minutes=service.duration)).time()
    
    # 检查时段是否可用
    slot_result = await db.execute(
        select(TherapistTimeSlot)
        .where(TherapistTimeSlot.therapist_id == data.therapist_id)
        .where(TherapistTimeSlot.date == data.booking_date)
        .where(TherapistTimeSlot.start_time == start_time)
        .where(TherapistTimeSlot.is_available == True)
        .where(TherapistTimeSlot.is_booked == False)
    )
    time_slot = slot_result.scalar_one_or_none()
    
    if not time_slot:
        raise HTTPException(status_code=400, detail="该时段不可预约")
    
    # 计算价格
    price_data = await preview_booking_price(
        BookingPricePreview(
            therapist_id=data.therapist_id,
            service_id=data.service_id,
            coupon_id=data.coupon_id,
            points_to_use=data.points_to_use
        ),
        current_user,
        db
    )
    
    # 创建预约
    booking = Booking(
        booking_no=generate_booking_no(),
        user_id=current_user.id,
        therapist_id=data.therapist_id,
        service_id=data.service_id,
        address_id=data.address_id,
        booking_date=data.booking_date,
        start_time=start_time,
        end_time=end_time,
        duration=service.duration,
        service_price=price_data.service_price,
        discount_amount=price_data.discount_amount,
        coupon_id=data.coupon_id,
        coupon_deduction=price_data.coupon_deduction,
        points_used=data.points_to_use,
        points_deduction=price_data.points_deduction,
        total_price=price_data.total_price,
        user_note=data.user_note,
        status=BookingStatus.PENDING
    )
    db.add(booking)
    
    # 创建订单
    order = Order(
        order_no=generate_order_no(),
        user_id=current_user.id,
        booking_id=0,  # 稍后更新
        total_amount=price_data.total_price,
        payment_status=PaymentStatus.PENDING
    )
    db.add(order)
    
    # 锁定时段
    time_slot.is_booked = True
    
    await db.flush()
    
    # 更新订单的 booking_id
    order.booking_id = booking.id
    time_slot.booking_id = booking.id
    
    # 使用优惠券
    if data.coupon_id:
        coupon_result = await db.execute(
            select(UserCoupon).where(UserCoupon.id == data.coupon_id)
        )
        coupon = coupon_result.scalar_one_or_none()
        if coupon:
            coupon.status = CouponStatus.USED
            coupon.used_at = datetime.utcnow()
            coupon.used_order_id = order.id
    
    # 扣除积分
    if data.points_to_use > 0:
        actual_points = int(price_data.points_deduction * 100)
        current_user.points -= actual_points
    
    await db.commit()
    await db.refresh(booking)
    
    # 构建响应
    return BookingDetailResponse(
        id=booking.id,
        booking_no=booking.booking_no,
        service_name=service.name,
        service_duration=service.duration,
        service_id=service.id,
        service_image=service.image,
        therapist_id=therapist.id,
        therapist_name=therapist.name,
        therapist_avatar=therapist.avatar,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        total_price=booking.total_price,
        service_price=booking.service_price,
        discount_amount=booking.discount_amount,
        coupon_deduction=booking.coupon_deduction,
        points_deduction=booking.points_deduction,
        address_id=address.id,
        address_detail=f"{address.province}{address.city}{address.district}{address.street}",
        address_contact=address.contact_name,
        address_phone=address.contact_phone,
        user_note=booking.user_note,
        created_at=booking.created_at
    )


@router.get("", response_model=List[BookingListResponse], summary="获取预约列表")
async def get_bookings(
    status: Optional[BookingStatus] = Query(None, description="预约状态"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户的预约列表"""
    query = (
        select(Booking, Service, Therapist)
        .join(Service, Booking.service_id == Service.id)
        .join(Therapist, Booking.therapist_id == Therapist.id)
        .where(Booking.user_id == current_user.id)
    )
    
    if status:
        query = query.where(Booking.status == status)
    
    query = query.order_by(Booking.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    
    response = []
    for booking, service, therapist in result:
        response.append(BookingListResponse(
            id=booking.id,
            booking_no=booking.booking_no,
            service_name=service.name,
            service_duration=service.duration,
            therapist_id=therapist.id,
            therapist_name=therapist.name,
            therapist_avatar=therapist.avatar,
            booking_date=booking.booking_date,
            start_time=booking.start_time,
            end_time=booking.end_time,
            status=booking.status,
            total_price=booking.total_price,
            created_at=booking.created_at
        ))
    
    return response


@router.get("/{booking_id}", response_model=BookingDetailResponse, summary="获取预约详情")
async def get_booking_detail(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取预约详情"""
    result = await db.execute(
        select(Booking, Service, Therapist, Address)
        .join(Service, Booking.service_id == Service.id)
        .join(Therapist, Booking.therapist_id == Therapist.id)
        .join(Address, Booking.address_id == Address.id)
        .where(Booking.id == booking_id)
        .where(Booking.user_id == current_user.id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="预约不存在")
    
    booking, service, therapist, address = row
    
    return BookingDetailResponse(
        id=booking.id,
        booking_no=booking.booking_no,
        service_name=service.name,
        service_duration=service.duration,
        service_id=service.id,
        service_image=service.image,
        therapist_id=therapist.id,
        therapist_name=therapist.name,
        therapist_avatar=therapist.avatar,
        booking_date=booking.booking_date,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
        total_price=booking.total_price,
        service_price=booking.service_price,
        discount_amount=booking.discount_amount,
        coupon_deduction=booking.coupon_deduction,
        points_deduction=booking.points_deduction,
        address_id=address.id,
        address_detail=f"{address.province}{address.city}{address.district}{address.street}",
        address_contact=address.contact_name,
        address_phone=address.contact_phone,
        user_note=booking.user_note,
        therapist_note=booking.therapist_note,
        cancel_reason=booking.cancel_reason,
        cancelled_at=booking.cancelled_at,
        therapist_arrived_at=booking.therapist_arrived_at,
        service_started_at=booking.service_started_at,
        service_completed_at=booking.service_completed_at,
        created_at=booking.created_at
    )


@router.post("/{booking_id}/cancel", summary="取消预约")
async def cancel_booking(
    booking_id: int,
    data: BookingCancelRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """取消预约"""
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .where(Booking.user_id == current_user.id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="预约不存在")
    
    # 检查是否可取消
    if booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise HTTPException(status_code=400, detail="当前状态不可取消")
    
    # 更新预约状态
    booking.status = BookingStatus.CANCELLED
    booking.cancel_reason = data.reason
    booking.cancelled_by = "user"
    booking.cancelled_at = datetime.utcnow()
    
    # 释放时段
    slot_result = await db.execute(
        select(TherapistTimeSlot)
        .where(TherapistTimeSlot.booking_id == booking.id)
    )
    slot = slot_result.scalar_one_or_none()
    if slot:
        slot.is_booked = False
        slot.booking_id = None
    
    # TODO: 退还优惠券和积分
    # TODO: 处理退款
    
    await db.commit()
    
    return {"message": "取消成功"}

