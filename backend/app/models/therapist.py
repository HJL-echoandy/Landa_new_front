"""
治疗师模型
"""
from datetime import datetime, date, time
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, Float, JSON, Date, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Therapist(Base):
    """治疗师表"""
    __tablename__ = "therapists"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, unique=True)
    
    # 基本信息
    name: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(100))
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # 介绍
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    specialties: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    certifications: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # 媒体
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    video_thumbnail: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    gallery: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    # 评分与统计
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    booking_count: Mapped[int] = mapped_column(Integer, default=0)
    completed_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # 价格
    base_price: Mapped[float] = mapped_column(Float, default=0)
    
    # 服务区域
    service_areas: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    max_distance: Mapped[int] = mapped_column(Integer, default=10)
    
    # 状态
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # 关系
    therapist_services: Mapped[List["TherapistService"]] = relationship(
        "TherapistService",
        back_populates="therapist",
        lazy="selectin"
    )
    schedules: Mapped[List["TherapistSchedule"]] = relationship(
        "TherapistSchedule",
        back_populates="therapist",
        lazy="selectin"
    )
    bookings: Mapped[List["Booking"]] = relationship(
        "Booking",
        back_populates="therapist",
        lazy="selectin"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="therapist",
        lazy="selectin"
    )
    favorited_by: Mapped[List["Favorite"]] = relationship(
        "Favorite",
        back_populates="therapist",
        lazy="selectin"
    )


class TherapistSchedule(Base):
    """治疗师排班表"""
    __tablename__ = "therapist_schedules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    
    date: Mapped[date] = mapped_column(Date, index=True)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    therapist: Mapped["Therapist"] = relationship(
        "Therapist", 
        back_populates="schedules"
    )


class TherapistTimeSlot(Base):
    """治疗师时段表"""
    __tablename__ = "therapist_time_slots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    
    date: Mapped[date] = mapped_column(Date, index=True)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False)
    booking_id: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )


# 避免循环导入
from app.models.service import TherapistService
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import Favorite
