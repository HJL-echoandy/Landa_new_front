"""
用户相关 Schema
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


# ============ 用户 ============

class UserBase(BaseModel):
    """用户基础信息"""
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None


class UserUpdate(UserBase):
    """更新用户信息"""
    pass


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    phone: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    member_level: str
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    """用户详情响应"""
    is_verified: bool
    address_count: int = 0
    order_count: int = 0
    favorite_count: int = 0


# ============ 地址 ============

class AddressBase(BaseModel):
    """地址基础信息"""
    label: str = Field(default="Home", description="标签: Home/Work/Other")
    contact_name: str = Field(..., min_length=1, max_length=50)
    contact_phone: str = Field(..., pattern=r"^1[3-9]\d{9}$")
    province: str = Field(..., max_length=50)
    city: str = Field(..., max_length=50)
    district: str = Field(..., max_length=50)
    street: str = Field(..., max_length=200)
    detail: Optional[str] = Field(None, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AddressCreate(AddressBase):
    """创建地址"""
    is_default: bool = False


class AddressUpdate(BaseModel):
    """更新地址"""
    label: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    street: Optional[str] = None
    detail: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    """地址响应"""
    id: int
    user_id: int
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ 收藏 ============

class FavoriteCreate(BaseModel):
    """添加收藏"""
    therapist_id: int


class FavoriteResponse(BaseModel):
    """收藏响应"""
    id: int
    therapist_id: int
    therapist_name: str
    therapist_avatar: Optional[str] = None
    therapist_rating: float
    created_at: datetime

    class Config:
        from_attributes = True

