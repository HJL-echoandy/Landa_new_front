"""
技师对客户评价 API
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.api.deps import get_current_therapist
from app.models.therapist import Therapist
from app.models.booking import Booking, BookingStatus
from app.models.therapist_customer_review import TherapistCustomerReview
from app.models.user import User
from app.models.service import Service
from app.schemas.therapist_customer_review import (
    TherapistCustomerReviewCreate,
    TherapistCustomerReviewResponse,
    TherapistCustomerReviewListResponse,
)

router = APIRouter()


@router.post(
    "/orders/{booking_id}/customer-review",
    response_model=TherapistCustomerReviewResponse,
    summary="提交客户评价"
)
async def submit_customer_review(
    booking_id: int,
    review_data: TherapistCustomerReviewCreate,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    技师完成服务后对客户进行评价
    
    - **rating**: 1-5星评分
    - **tags**: 快速标签（准时、礼貌、小费丰厚等）
    - **private_note**: 私密备注（仅管理员可见）
    """
    # 1. 验证订单存在且属于该技师
    booking_result = await db.execute(
        select(Booking).where(
            and_(
                Booking.id == booking_id,
                Booking.therapist_id == current_therapist.id
            )
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在或无权访问"
        )
    
    # 2. 验证订单已完成
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能对已完成的订单进行评价"
        )
    
    # 3. 检查是否已评价过
    existing_review_result = await db.execute(
        select(TherapistCustomerReview).where(
            TherapistCustomerReview.booking_id == booking_id
        )
    )
    existing_review = existing_review_result.scalar_one_or_none()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该订单已评价过"
        )
    
    # 4. 创建评价记录
    new_review = TherapistCustomerReview(
        therapist_id=current_therapist.id,
        user_id=booking.user_id,
        booking_id=booking_id,
        rating=review_data.rating,
        tags=review_data.tags,
        private_note=review_data.private_note,
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    return new_review


@router.get(
    "/customer-reviews",
    response_model=List[TherapistCustomerReviewListResponse],
    summary="获取客户评价列表"
)
async def get_customer_reviews(
    skip: int = 0,
    limit: int = 20,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    获取技师提交的所有客户评价列表
    """
    # 查询评价记录并关联客户、订单、服务信息
    result = await db.execute(
        select(TherapistCustomerReview, User, Booking, Service)
        .join(User, TherapistCustomerReview.user_id == User.id)
        .join(Booking, TherapistCustomerReview.booking_id == Booking.id)
        .join(Service, Booking.service_id == Service.id)
        .where(TherapistCustomerReview.therapist_id == current_therapist.id)
        .order_by(TherapistCustomerReview.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    reviews_data = result.all()
    
    # 组装响应数据
    reviews_list = []
    for review, user, booking, service in reviews_data:
        reviews_list.append(
            TherapistCustomerReviewListResponse(
                id=review.id,
                user_id=review.user_id,
                booking_id=review.booking_id,
                rating=review.rating,
                tags=review.tags,
                created_at=review.created_at,
                # 客户信息
                customer_name=user.nickname or "客户",
                customer_avatar=user.avatar,
                # 订单信息
                service_name=service.name,
                booking_date=booking.booking_date.isoformat() if booking.booking_date else "",
            )
        )
    
    return reviews_list


@router.get(
    "/orders/{booking_id}/customer-review",
    response_model=TherapistCustomerReviewResponse,
    summary="获取指定订单的客户评价"
)
async def get_customer_review_by_booking(
    booking_id: int,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: AsyncSession = Depends(get_db)
):
    """
    获取指定订单的客户评价详情
    """
    result = await db.execute(
        select(TherapistCustomerReview).where(
            and_(
                TherapistCustomerReview.booking_id == booking_id,
                TherapistCustomerReview.therapist_id == current_therapist.id
            )
        )
    )
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评价不存在"
        )
    
    return review

