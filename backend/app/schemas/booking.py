"""
预约相关 Schema
"""
from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.booking import BookingStatus
from app.models.order import PaymentMethod, PaymentStatus


# ============ 预约 ============

class BookingCreate(BaseModel):
    """创建预约"""
    therapist_id: int
    service_id: int
    address_id: int
    booking_date: date
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")  # "14:00"
    user_note: Optional[str] = None
    coupon_id: Optional[int] = None
    points_to_use: int = Field(default=0, ge=0)


class BookingPricePreview(BaseModel):
    """预约价格预览请求"""
    therapist_id: int
    service_id: int
    coupon_id: Optional[int] = None
    points_to_use: int = Field(default=0, ge=0)


class BookingPriceResponse(BaseModel):
    """预约价格响应"""
    service_price: float
    discount_amount: float = 0
    coupon_deduction: float = 0
    points_deduction: float = 0
    total_price: float


class BookingListResponse(BaseModel):
    """预约列表响应"""
    id: int
    booking_no: str
    service_name: str
    service_duration: int
    therapist_id: int
    therapist_name: str
    therapist_avatar: Optional[str] = None
    booking_date: date
    start_time: time
    end_time: time
    status: BookingStatus
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True


class BookingDetailResponse(BookingListResponse):
    """预约详情响应"""
    service_id: int
    service_image: Optional[str] = None
    address_id: int
    address_detail: str
    address_contact: str
    address_phone: str
    service_price: float
    discount_amount: float
    coupon_deduction: float
    points_deduction: float
    user_note: Optional[str] = None
    therapist_note: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    therapist_arrived_at: Optional[datetime] = None
    service_started_at: Optional[datetime] = None
    service_completed_at: Optional[datetime] = None


class BookingCancelRequest(BaseModel):
    """取消预约请求"""
    reason: str = Field(..., min_length=1, max_length=500)


# ============ 订单 ============

class OrderListResponse(BaseModel):
    """订单列表响应"""
    id: int
    order_no: str
    booking_no: str
    service_name: str
    therapist_name: str
    total_amount: float
    paid_amount: float
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetailResponse(OrderListResponse):
    """订单详情响应"""
    booking_id: int
    refund_amount: float
    transaction_id: Optional[str] = None
    payment_time: Optional[datetime] = None
    invoice_requested: bool
    invoice_no: Optional[str] = None


class PaymentRequest(BaseModel):
    """支付请求"""
    order_id: int
    payment_method: PaymentMethod


class PaymentResponse(BaseModel):
    """支付响应（返回支付参数）"""
    order_no: str
    payment_method: PaymentMethod
    # 微信支付参数
    wechat_params: Optional[dict] = None
    # 支付宝参数
    alipay_params: Optional[dict] = None


# ============ 评价 ============

class ReviewCreate(BaseModel):
    """创建评价"""
    booking_id: int
    rating: int = Field(..., ge=1, le=5)
    content: Optional[str] = Field(None, max_length=500)
    images: Optional[List[str]] = None
    skill_rating: Optional[int] = Field(None, ge=1, le=5)
    attitude_rating: Optional[int] = Field(None, ge=1, le=5)
    punctuality_rating: Optional[int] = Field(None, ge=1, le=5)
    tip_amount: float = Field(default=0, ge=0)
    is_anonymous: bool = False


class ReviewResponse(BaseModel):
    """评价响应"""
    id: int
    booking_id: int
    therapist_name: str
    service_name: str
    rating: int
    content: Optional[str] = None
    images: Optional[List[str]] = None
    tip_amount: float
    is_anonymous: bool
    reply_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

