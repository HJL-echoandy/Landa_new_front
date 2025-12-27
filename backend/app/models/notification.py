"""
通知模型
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, Text, JSON, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base


class NotificationType(str, enum.Enum):
    """通知类型"""
    NEW_ORDER = "new_order"              # 新订单
    ORDER_CANCELLED = "order_cancelled"  # 订单取消
    ORDER_COMPLETED = "order_completed"  # 订单完成
    SYSTEM_MESSAGE = "system_message"    # 系统消息
    PAYMENT_SUCCESS = "payment_success"  # 支付成功


class NotificationStatus(str, enum.Enum):
    """通知状态"""
    PENDING = "pending"  # 待发送
    SENT = "sent"        # 已发送
    FAILED = "failed"    # 发送失败
    READ = "read"        # 已读


class NotificationPriority(str, enum.Enum):
    """通知优先级"""
    LOW = "low"       # 低优先级
    NORMAL = "normal" # 普通优先级
    HIGH = "high"     # 高优先级
    URGENT = "urgent" # 紧急


class PushToken(Base):
    """技师推送 Token"""
    __tablename__ = "push_tokens"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), unique=True, index=True)
    expo_push_token: Mapped[str] = mapped_column(String(200), index=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    device_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    platform: Mapped[str] = mapped_column(String(20))  # ios/android/web
    app_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    """通知记录"""
    __tablename__ = "notifications"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), index=True)
    type: Mapped[NotificationType] = mapped_column(SQLEnum(NotificationType), index=True)
    priority: Mapped[NotificationPriority] = mapped_column(
        SQLEnum(NotificationPriority),
        default=NotificationPriority.NORMAL
    )
    
    # 通知内容
    title: Mapped[str] = mapped_column(String(100))
    body: Mapped[str] = mapped_column(Text)
    data: Mapped[dict] = mapped_column(JSON, default={})  # 额外数据（订单ID、跳转路径等）
    
    # 发送状态
    status: Mapped[NotificationStatus] = mapped_column(
        SQLEnum(NotificationStatus),
        default=NotificationStatus.PENDING,
        index=True
    )
    sent_via: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # push/websocket/both
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # 时间戳
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class TherapistNotificationSettings(Base):
    """技师通知设置"""
    __tablename__ = "therapist_notification_settings"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    therapist_id: Mapped[int] = mapped_column(ForeignKey("therapists.id"), unique=True, index=True)
    
    # 全局开关
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sound_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    vibration_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 分类通知开关
    new_order_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    order_cancelled_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    order_completed_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    system_message_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # 新订单特殊设置
    new_order_sound: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="default")
    new_order_vibration_pattern: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="default")
    
    # 免打扰时段（JSON 格式）
    # 例如：[{"start": "22:00", "end": "08:00", "days": [0,1,2,3,4,5,6]}]
    do_not_disturb_periods: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# 避免循环导入
from app.models.therapist import Therapist

