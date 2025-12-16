"""
数据库模型导出
"""
from app.models.user import User, Address, Favorite, UserRole, MemberLevel
from app.models.therapist import Therapist, TherapistSchedule, TherapistTimeSlot
from app.models.service import Service, ServiceCategory, TherapistService
from app.models.booking import Booking, BookingStatus
from app.models.order import Order, PaymentMethod, PaymentStatus
from app.models.review import Review
from app.models.coupon import CouponTemplate, UserCoupon, PointsHistory, CouponType, CouponStatus

__all__ = [
    # User
    "User",
    "Address", 
    "Favorite",
    "UserRole",
    "MemberLevel",
    # Therapist
    "Therapist",
    "TherapistSchedule",
    "TherapistTimeSlot",
    # Service
    "Service",
    "ServiceCategory",
    "TherapistService",
    # Booking
    "Booking",
    "BookingStatus",
    # Order
    "Order",
    "PaymentMethod",
    "PaymentStatus",
    # Review
    "Review",
    # Coupon
    "CouponTemplate",
    "UserCoupon",
    "PointsHistory",
    "CouponType",
    "CouponStatus",
]

