"""
API v1 路由
"""
from fastapi import APIRouter

from app.api.v1 import auth, therapist_auth, users, services, therapists, bookings

api_router = APIRouter()

# C端（客户端）路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证-客户端"])
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(services.router, prefix="/services", tags=["服务"])
api_router.include_router(therapists.router, prefix="/therapists", tags=["治疗师"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["预约"])

# B端（技师端）路由
api_router.include_router(therapist_auth.router, prefix="/therapist/auth", tags=["认证-技师端"])


