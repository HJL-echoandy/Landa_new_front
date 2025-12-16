"""
服务接口
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.service import Service, ServiceCategory, TherapistService
from app.models.therapist import Therapist
from app.schemas.service import (
    ServiceCategoryResponse,
    ServiceListResponse,
    ServiceDetailResponse,
    ServiceTherapistResponse
)

router = APIRouter()


@router.get("/categories", response_model=List[ServiceCategoryResponse], summary="获取服务分类")
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    """获取所有服务分类"""
    result = await db.execute(
        select(ServiceCategory)
        .where(ServiceCategory.is_active == True)
        .order_by(ServiceCategory.sort_order)
    )
    categories = result.scalars().all()
    
    # 统计每个分类的服务数量
    response = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count(Service.id))
            .where(Service.category_id == cat.id)
            .where(Service.is_active == True)
        )
        service_count = count_result.scalar() or 0
        
        response.append(ServiceCategoryResponse(
            id=cat.id,
            name=cat.name,
            name_en=cat.name_en,
            description=cat.description,
            icon=cat.icon,
            service_count=service_count
        ))
    
    return response


@router.get("", response_model=List[ServiceListResponse], summary="获取服务列表")
async def get_services(
    category_id: Optional[int] = Query(None, description="分类ID"),
    featured: Optional[bool] = Query(None, description="是否推荐"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取服务列表"""
    query = select(Service, ServiceCategory).join(
        ServiceCategory, 
        Service.category_id == ServiceCategory.id,
        isouter=True
    ).where(Service.is_active == True)
    
    # 筛选条件
    if category_id:
        query = query.where(Service.category_id == category_id)
    if featured is not None:
        query = query.where(Service.is_featured == featured)
    if search:
        query = query.where(
            Service.name.ilike(f"%{search}%") | 
            Service.name_en.ilike(f"%{search}%")
        )
    
    # 排序和分页
    query = query.order_by(Service.sort_order, Service.id)
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    
    response = []
    for service, category in result:
        response.append(ServiceListResponse(
            id=service.id,
            name=service.name,
            name_en=service.name_en,
            short_description=service.short_description,
            image=service.image,
            base_price=service.base_price,
            duration=service.duration,
            rating=service.rating,
            review_count=service.review_count,
            is_featured=service.is_featured,
            category_id=service.category_id,
            category_name=category.name if category else None
        ))
    
    return response


@router.get("/{service_id}", response_model=ServiceDetailResponse, summary="获取服务详情")
async def get_service_detail(
    service_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取服务详情"""
    result = await db.execute(
        select(Service, ServiceCategory)
        .join(ServiceCategory, Service.category_id == ServiceCategory.id, isouter=True)
        .where(Service.id == service_id)
        .where(Service.is_active == True)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="服务不存在")
    
    service, category = row
    
    return ServiceDetailResponse(
        id=service.id,
        name=service.name,
        name_en=service.name_en,
        description=service.description,
        short_description=service.short_description,
        image=service.image,
        images=service.images,
        base_price=service.base_price,
        duration=service.duration,
        benefits=service.benefits,
        includes=service.includes,
        precautions=service.precautions,
        rating=service.rating,
        review_count=service.review_count,
        booking_count=service.booking_count,
        is_featured=service.is_featured,
        category_id=service.category_id,
        category_name=category.name if category else None
    )


@router.get("/{service_id}/therapists", response_model=List[ServiceTherapistResponse], summary="获取提供该服务的治疗师")
async def get_service_therapists(
    service_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """获取提供该服务的治疗师列表"""
    # 检查服务是否存在
    service_result = await db.execute(
        select(Service).where(Service.id == service_id).where(Service.is_active == True)
    )
    service = service_result.scalar_one_or_none()
    
    if not service:
        raise HTTPException(status_code=404, detail="服务不存在")
    
    # 查询提供此服务的治疗师
    result = await db.execute(
        select(TherapistService, Therapist)
        .join(Therapist, TherapistService.therapist_id == Therapist.id)
        .where(TherapistService.service_id == service_id)
        .where(TherapistService.is_active == True)
        .where(Therapist.is_active == True)
        .order_by(Therapist.rating.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    
    response = []
    for ts, therapist in result:
        # 使用治疗师自定义价格或服务基础价格
        price = ts.price if ts.price is not None else service.base_price
        
        response.append(ServiceTherapistResponse(
            therapist_id=therapist.id,
            therapist_name=therapist.name,
            therapist_avatar=therapist.avatar,
            therapist_rating=therapist.rating,
            therapist_review_count=therapist.review_count,
            price=price
        ))
    
    return response

