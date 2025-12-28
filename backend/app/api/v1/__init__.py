"""
API v1 路由
"""
from fastapi import APIRouter

from app.api.v1 import auth, therapist_auth, therapist_orders, therapist_income, notifications, users, services, therapists, bookings, upload, finance, therapist_customer_reviews

api_router = APIRouter()

# C端（客户端）路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证-客户端"])
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(services.router, prefix="/services", tags=["服务"])
api_router.include_router(therapists.router, prefix="/therapists", tags=["治疗师"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["预约"])

# B端（技师端）路由
api_router.include_router(therapist_auth.router, prefix="/therapist/auth", tags=["认证-技师端"])
api_router.include_router(therapist_orders.router, prefix="/therapist", tags=["订单-技师端"])
api_router.include_router(therapist_income.router, prefix="/therapist/income", tags=["收入-技师端"])
api_router.include_router(notifications.router, prefix="/therapist/notifications", tags=["通知-技师端"])
api_router.include_router(finance.router, prefix="/therapist/finance", tags=["财务-技师端"])
api_router.include_router(therapist_customer_reviews.router, prefix="/therapist", tags=["客户评价-技师端"])

# 通用路由
api_router.include_router(upload.router, prefix="/upload", tags=["文件上传"])


