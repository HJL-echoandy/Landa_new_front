"""
API v1 路由
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, services, therapists, bookings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(services.router, prefix="/services", tags=["服务"])
api_router.include_router(therapists.router, prefix="/therapists", tags=["治疗师"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["预约"])

