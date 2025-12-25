"""
文件上传接口
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

# 允许的图片格式
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
# 最大文件大小: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024


class UploadResponse(BaseModel):
    """文件上传响应"""
    url: str
    filename: str
    size: int
    content_type: str


def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return os.path.splitext(filename)[1].lower()


def is_allowed_image(filename: str) -> bool:
    """检查是否为允许的图片格式"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_IMAGE_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """生成唯一文件名"""
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"


@router.post("/avatar", response_model=UploadResponse, summary="上传头像")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传头像图片
    
    - 支持格式: JPG, PNG, GIF, WEBP
    - 最大大小: 5MB
    - 返回图片 URL
    """
    # 验证文件名
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名不能为空"
        )

    # 验证文件格式
    if not is_allowed_image(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # 读取文件内容
    contents = await file.read()
    file_size = len(contents)

    # 验证文件大小
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制。最大允许: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    # 生成唯一文件名
    unique_filename = generate_unique_filename(file.filename)

    # 构建保存路径
    upload_dir = os.path.join("uploads", "avatars", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)

    # 保存文件
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件保存失败: {str(e)}"
        )

    # 构建访问 URL（根据实际部署情况调整）
    # 生产环境应使用 CDN 或对象存储服务（如阿里云 OSS）
    base_url = settings.BASE_URL if hasattr(settings, 'BASE_URL') else "http://localhost:8000"
    file_url = f"{base_url}/uploads/avatars/{current_user.id}/{unique_filename}"

    return UploadResponse(
        url=file_url,
        filename=unique_filename,
        size=file_size,
        content_type=file.content_type or "image/jpeg"
    )


@router.post("/image", response_model=UploadResponse, summary="上传通用图片")
async def upload_image(
    file: UploadFile = File(...),
    category: str = "general",  # general, gallery, certification, etc.
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传通用图片
    
    - 支持格式: JPG, PNG, GIF, WEBP
    - 最大大小: 5MB
    - category: 图片类别（general, gallery, certification）
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名不能为空"
        )

    if not is_allowed_image(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"文件大小超过限制。最大允许: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    unique_filename = generate_unique_filename(file.filename)

    upload_dir = os.path.join("uploads", category, str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件保存失败: {str(e)}"
        )

    base_url = settings.BASE_URL if hasattr(settings, 'BASE_URL') else "http://localhost:8000"
    file_url = f"{base_url}/uploads/{category}/{current_user.id}/{unique_filename}"

    return UploadResponse(
        url=file_url,
        filename=unique_filename,
        size=file_size,
        content_type=file.content_type or "image/jpeg"
    )

