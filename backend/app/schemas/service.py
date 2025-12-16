"""
服务相关 Schema
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ServiceCategoryResponse(BaseModel):
    """服务分类响应"""
    id: int
    name: str
    name_en: str
    description: Optional[str] = None
    icon: Optional[str] = None
    service_count: int = 0

    class Config:
        from_attributes = True


class ServiceListResponse(BaseModel):
    """服务列表响应"""
    id: int
    name: str
    name_en: str
    short_description: Optional[str] = None
    image: Optional[str] = None
    base_price: float
    duration: int
    rating: float
    review_count: int
    is_featured: bool = False
    category_id: int
    category_name: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceDetailResponse(ServiceListResponse):
    """服务详情响应"""
    description: Optional[str] = None
    images: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    includes: Optional[List[str]] = None
    precautions: Optional[str] = None
    booking_count: int = 0


class ServiceTherapistResponse(BaseModel):
    """提供该服务的治疗师"""
    therapist_id: int
    therapist_name: str
    therapist_avatar: Optional[str] = None
    therapist_rating: float
    therapist_review_count: int
    price: float  # 该治疗师提供此服务的价格

    class Config:
        from_attributes = True

