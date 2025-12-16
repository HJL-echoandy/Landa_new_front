"""
Landa API 主入口
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.core.config import settings
from app.core.database import init_db, close_db
from app.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("Starting Landa API...")
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    # 关闭时
    logger.info("Shutting down Landa API...")
    await close_db()
    logger.info("Database connection closed")


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Landa 按摩预约服务 API
    
    ### 功能模块
    - 🔐 用户认证（手机验证码、微信登录）
    - 👤 用户管理（个人信息、地址、收藏）
    - 💆 服务管理（分类、服务列表）
    - 👩‍⚕️ 治疗师（列表、详情、排班、评价）
    - 📅 预约管理（创建、查询、取消）
    - 💳 订单与支付
    """,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# 健康检查
@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/", tags=["系统"])
async def root():
    """根路径"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Disabled in production"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

