"""
用户模型
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    """用户角色"""
    USER = "user"
    THERAPIST = "therapist"
    ADMIN = "admin"


class MemberLevel(str, enum.Enum):
    """会员等级"""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # 基本信息
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    nickname: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # 认证信息
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    wechat_openid: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    wechat_unionid: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # 角色与状态
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), 
        default=UserRole.USER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 会员信息
    member_level: Mapped[MemberLevel] = mapped_column(
        SQLEnum(MemberLevel),
        default=MemberLevel.BRONZE
    )
    points: Mapped[int] = mapped_column(default=0)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # 关系
    addresses: Mapped[List["Address"]] = relationship(
        "Address", 
        back_populates="user",
        lazy="selectin"
    )
    orders: Mapped[List["Order"]] = relationship(
        "Order",
        back_populates="user",
        lazy="selectin"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="user",
        lazy="selectin"
    )
    favorites: Mapped[List["Favorite"]] = relationship(
        "Favorite",
        back_populates="user",
        lazy="selectin"
    )


class Address(Base):
    """用户地址表"""
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    
    # 地址信息
    label: Mapped[str] = mapped_column(String(50), default="Home")
    contact_name: Mapped[str] = mapped_column(String(50))
    contact_phone: Mapped[str] = mapped_column(String(20))
    
    province: Mapped[str] = mapped_column(String(50))
    city: Mapped[str] = mapped_column(String(50))
    district: Mapped[str] = mapped_column(String(50))
    street: Mapped[str] = mapped_column(String(200))
    detail: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    # 经纬度
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    
    # 状态
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # 关系
    user: Mapped["User"] = relationship("User", back_populates="addresses")


class Favorite(Base):
    """收藏表"""
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # 关系
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    therapist: Mapped["Therapist"] = relationship("Therapist", back_populates="favorited_by")


# 避免循环导入
from app.models.order import Order
from app.models.review import Review
from app.models.therapist import Therapist
