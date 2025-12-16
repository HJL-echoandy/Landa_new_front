"""
服务模型
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Text, Integer, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ServiceCategory(Base):
    """服务分类表"""
    __tablename__ = "service_categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    services: Mapped[List["Service"]] = relationship(
        "Service", 
        back_populates="category",
        lazy="selectin"
    )


class Service(Base):
    """服务表"""
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("service_categories.id"), index=True)
    
    name: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    images: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    
    base_price: Mapped[float] = mapped_column(Float)
    duration: Mapped[int] = mapped_column(Integer)
    
    benefits: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    includes: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    precautions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    booking_count: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    category: Mapped["ServiceCategory"] = relationship(
        "ServiceCategory", 
        back_populates="services"
    )
    therapist_services: Mapped[List["TherapistService"]] = relationship(
        "TherapistService",
        back_populates="service",
        lazy="selectin"
    )


class TherapistService(Base):
    """治疗师服务关联表"""
    __tablename__ = "therapist_services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), index=True)
    
    price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    therapist: Mapped["Therapist"] = relationship(
        "Therapist", 
        back_populates="therapist_services"
    )
    service: Mapped["Service"] = relationship(
        "Service", 
        back_populates="therapist_services"
    )


# 避免循环导入
from app.models.therapist import Therapist
