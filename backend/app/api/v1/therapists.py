"""
治疗师接口
"""
from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.api.deps import get_current_user_optional
from app.models.user import User, Favorite
from app.models.therapist import Therapist, TherapistTimeSlot
from app.models.service import TherapistService, Service
from app.models.review import Review
from app.schemas.therapist import (
    TherapistListResponse,
    TherapistDetailResponse,
    TherapistServiceResponse,
    TimeSlotResponse,
    DayAvailabilityResponse,
    TherapistReviewResponse,
    RatingDistribution
)

router = APIRouter()


@router.get("", response_model=List[TherapistListResponse], summary="获取治疗师列表")
async def get_therapists(
    featured: Optional[bool] = Query(None, description="是否推荐"),
    specialty: Optional[str] = Query(None, description="专长"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="最低评分"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取治疗师列表"""
    query = select(Therapist).where(Therapist.is_active == True)
    
    if featured is not None:
        query = query.where(Therapist.is_featured == featured)
    if min_rating:
        query = query.where(Therapist.rating >= min_rating)
    if search:
        query = query.where(Therapist.name.ilike(f"%{search}%"))
    
    query = query.order_by(Therapist.is_featured.desc(), Therapist.rating.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    therapists = result.scalars().all()
    
    return [TherapistListResponse(
        id=t.id,
        name=t.name,
        title=t.title,
        avatar=t.avatar,
        rating=t.rating,
        review_count=t.review_count,
        base_price=t.base_price,
        specialties=t.specialties,
        is_featured=t.is_featured
    ) for t in therapists]


@router.get("/{therapist_id}", response_model=TherapistDetailResponse, summary="获取治疗师详情")
async def get_therapist_detail(
    therapist_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """获取治疗师详情"""
    result = await db.execute(
        select(Therapist)
        .where(Therapist.id == therapist_id)
        .where(Therapist.is_active == True)
    )
    therapist = result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(status_code=404, detail="治疗师不存在")
    
    return TherapistDetailResponse(
        id=therapist.id,
        name=therapist.name,
        title=therapist.title,
        avatar=therapist.avatar,
        about=therapist.about,
        rating=therapist.rating,
        review_count=therapist.review_count,
        base_price=therapist.base_price,
        specialties=therapist.specialties,
        experience_years=therapist.experience_years,
        certifications=therapist.certifications,
        video_url=therapist.video_url,
        video_thumbnail=therapist.video_thumbnail,
        gallery=therapist.gallery,
        booking_count=therapist.booking_count,
        completed_count=therapist.completed_count,
        service_areas=therapist.service_areas,
        is_verified=therapist.is_verified,
        is_featured=therapist.is_featured
    )


@router.get("/{therapist_id}/services", response_model=List[TherapistServiceResponse], summary="获取治疗师服务")
async def get_therapist_services(
    therapist_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取治疗师提供的服务列表"""
    result = await db.execute(
        select(TherapistService, Service)
        .join(Service, TherapistService.service_id == Service.id)
        .where(TherapistService.therapist_id == therapist_id)
        .where(TherapistService.is_active == True)
        .where(Service.is_active == True)
    )
    
    response = []
    for ts, service in result:
        price = ts.price if ts.price is not None else service.base_price
        response.append(TherapistServiceResponse(
            service_id=service.id,
            service_name=service.name,
            service_description=service.short_description,
            duration=service.duration,
            price=price,
            service_image=service.image
        ))
    
    return response


@router.get("/{therapist_id}/availability", response_model=List[DayAvailabilityResponse], summary="获取治疗师可用时段")
async def get_therapist_availability(
    therapist_id: int,
    start_date: date = Query(..., description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    db: AsyncSession = Depends(get_db)
):
    """
    获取治疗师指定日期范围内的可用时段
    
    - 不传 end_date 则只返回单天
    - 最多返回 14 天的数据
    """
    # 验证治疗师存在
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.id == therapist_id).where(Therapist.is_active == True)
    )
    if not therapist_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="治疗师不存在")
    
    if not end_date:
        end_date = start_date
    
    # 限制最多 14 天
    if (end_date - start_date).days > 14:
        end_date = start_date + timedelta(days=14)
    
    # 查询时段数据
    result = await db.execute(
        select(TherapistTimeSlot)
        .where(TherapistTimeSlot.therapist_id == therapist_id)
        .where(TherapistTimeSlot.date >= start_date)
        .where(TherapistTimeSlot.date <= end_date)
        .order_by(TherapistTimeSlot.date, TherapistTimeSlot.start_time)
    )
    slots = result.scalars().all()
    
    # 按日期分组
    availability_map = {}
    for slot in slots:
        date_str = slot.date.isoformat()
        if date_str not in availability_map:
            availability_map[date_str] = []
        
        availability_map[date_str].append(TimeSlotResponse(
            time=slot.start_time.strftime("%H:%M"),
            available=slot.is_available and not slot.is_booked,
            booked=slot.is_booked
        ))
    
    # 构建响应
    response = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        response.append(DayAvailabilityResponse(
            date=current_date,
            slots=availability_map.get(date_str, [])
        ))
        current_date += timedelta(days=1)
    
    return response


@router.get("/{therapist_id}/reviews", response_model=List[TherapistReviewResponse], summary="获取治疗师评价")
async def get_therapist_reviews(
    therapist_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取治疗师的评价列表"""
    result = await db.execute(
        select(Review, User)
        .join(User, Review.user_id == User.id)
        .where(Review.therapist_id == therapist_id)
        .where(Review.is_visible == True)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    
    response = []
    for review, user in result:
        response.append(TherapistReviewResponse(
            id=review.id,
            user_nickname=user.nickname if not review.is_anonymous else "匿名用户",
            user_avatar=user.avatar if not review.is_anonymous else None,
            rating=review.rating,
            content=review.content,
            images=review.images,
            is_anonymous=review.is_anonymous,
            reply_content=review.reply_content,
            created_at=review.created_at
        ))
    
    return response


@router.get("/{therapist_id}/rating-distribution", response_model=RatingDistribution, summary="获取评分分布")
async def get_rating_distribution(
    therapist_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取治疗师的评分分布"""
    result = await db.execute(
        select(Review.rating, func.count(Review.id))
        .where(Review.therapist_id == therapist_id)
        .where(Review.is_visible == True)
        .group_by(Review.rating)
    )
    
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for rating, count in result:
        distribution[rating] = count
    
    return RatingDistribution(
        star_5=distribution[5],
        star_4=distribution[4],
        star_3=distribution[3],
        star_2=distribution[2],
        star_1=distribution[1]
    )

