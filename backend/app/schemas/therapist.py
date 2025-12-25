"""
治疗师相关 Schema
"""
from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, Field


class TherapistBase(BaseModel):
    """治疗师基础信息"""
    name: str
    title: str
    avatar: Optional[str] = None
    about: Optional[str] = None
    experience_years: int = 0
    specialties: Optional[List[str]] = None


class TherapistListResponse(BaseModel):
    """治疗师列表响应"""
    id: int
    name: str
    title: str
    avatar: Optional[str] = None
    rating: float
    review_count: int
    base_price: float
    specialties: Optional[List[str]] = None
    is_featured: bool = False

    class Config:
        from_attributes = True


class TherapistDetailResponse(TherapistListResponse):
    """治疗师详情响应"""
    about: Optional[str] = None
    experience_years: int
    certifications: Optional[List[str]] = None
    video_url: Optional[str] = None
    video_thumbnail: Optional[str] = None
    gallery: Optional[List[str]] = None
    booking_count: int
    completed_count: int
    service_areas: Optional[List[str]] = None
    is_verified: bool


class TherapistServiceResponse(BaseModel):
    """治疗师服务项响应"""
    service_id: int
    service_name: str
    service_description: Optional[str] = None
    duration: int
    price: float
    service_image: Optional[str] = None

    class Config:
        from_attributes = True


# ============ 排班 ============

class TimeSlotResponse(BaseModel):
    """时段响应"""
    time: str  # "09:00"
    available: bool
    booked: bool = False


class DayAvailabilityResponse(BaseModel):
    """某天可用性响应"""
    date: date
    slots: List[TimeSlotResponse]


class TherapistAvailabilityRequest(BaseModel):
    """查询治疗师可用性"""
    start_date: date
    end_date: Optional[date] = None  # 不传则只查单天


# ============ 评价 ============

class TherapistReviewResponse(BaseModel):
    """治疗师评价响应"""
    id: int
    user_nickname: str
    user_avatar: Optional[str] = None
    rating: int
    content: Optional[str] = None
    images: Optional[List[str]] = None
    is_anonymous: bool
    reply_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RatingDistribution(BaseModel):
    """评分分布"""
    star_5: int = 0
    star_4: int = 0
    star_3: int = 0
    star_2: int = 0
    star_1: int = 0


# ============ 个人信息管理 ============

class UpdateProfileRequest(BaseModel):
    """更新个人信息请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="姓名")
    title: Optional[str] = Field(None, min_length=1, max_length=100, description="职称")
    avatar: Optional[str] = Field(None, max_length=500, description="头像 URL")
    about: Optional[str] = Field(None, max_length=2000, description="个人简介")
    experience_years: Optional[int] = Field(None, ge=0, le=50, description="工作年限")
    specialties: Optional[List[str]] = Field(None, description="擅长服务")
    service_areas: Optional[List[str]] = Field(None, description="服务区域")
    base_price: Optional[float] = Field(None, ge=0, description="基础价格")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "张技师",
                "title": "高级按摩师",
                "about": "10年从业经验，擅长全身按摩和足底按摩",
                "experience_years": 10,
                "specialties": ["全身按摩", "足底按摩", "精油推拿"],
                "service_areas": ["上海市徐汇区", "上海市长宁区"],
                "base_price": 150.0
            }
        }


class UpdateProfileResponse(BaseModel):
    """更新个人信息响应"""
    message: str = "个人信息更新成功"
    therapist: "TherapistDetailResponse"


