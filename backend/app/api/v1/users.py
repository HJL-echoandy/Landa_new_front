"""
用户接口
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Address, Favorite
from app.models.therapist import Therapist
from app.schemas.user import (
    UserResponse,
    UserDetailResponse,
    UserUpdate,
    AddressCreate,
    AddressUpdate,
    AddressResponse,
    FavoriteCreate,
    FavoriteResponse
)

router = APIRouter()


# ============ 用户信息 ============

@router.get("/me", response_model=UserDetailResponse, summary="获取当前用户信息")
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前登录用户的详细信息"""
    # 统计数据
    address_count = len(current_user.addresses) if current_user.addresses else 0
    order_count = len(current_user.orders) if current_user.orders else 0
    favorite_count = len(current_user.favorites) if current_user.favorites else 0
    
    return UserDetailResponse(
        id=current_user.id,
        phone=current_user.phone,
        nickname=current_user.nickname,
        avatar=current_user.avatar,
        gender=current_user.gender,
        email=current_user.email,
        member_level=current_user.member_level.value,
        points=current_user.points,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        address_count=address_count,
        order_count=order_count,
        favorite_count=favorite_count
    )


@router.put("/me", response_model=UserResponse, summary="更新用户信息")
async def update_user_info(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新当前用户信息"""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


# ============ 地址管理 ============

@router.get("/me/addresses", response_model=List[AddressResponse], summary="获取地址列表")
async def get_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取当前用户的地址列表"""
    result = await db.execute(
        select(Address)
        .where(Address.user_id == current_user.id)
        .where(Address.is_deleted == False)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    addresses = result.scalars().all()
    return addresses


@router.post("/me/addresses", response_model=AddressResponse, summary="添加地址")
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """添加新地址"""
    # 如果设为默认，取消其他默认地址
    if address_data.is_default:
        await db.execute(
            select(Address)
            .where(Address.user_id == current_user.id)
            .where(Address.is_default == True)
        )
        # 更新现有默认地址
        result = await db.execute(
            select(Address)
            .where(Address.user_id == current_user.id)
            .where(Address.is_default == True)
        )
        for addr in result.scalars():
            addr.is_default = False
    
    address = Address(
        user_id=current_user.id,
        **address_data.model_dump()
    )
    db.add(address)
    await db.commit()
    await db.refresh(address)
    
    return address


@router.put("/me/addresses/{address_id}", response_model=AddressResponse, summary="更新地址")
async def update_address(
    address_id: int,
    address_data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新地址"""
    result = await db.execute(
        select(Address)
        .where(Address.id == address_id)
        .where(Address.user_id == current_user.id)
        .where(Address.is_deleted == False)
    )
    address = result.scalar_one_or_none()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在"
        )
    
    update_dict = address_data.model_dump(exclude_unset=True)
    
    # 如果设为默认，取消其他默认地址
    if update_dict.get("is_default"):
        result = await db.execute(
            select(Address)
            .where(Address.user_id == current_user.id)
            .where(Address.is_default == True)
            .where(Address.id != address_id)
        )
        for addr in result.scalars():
            addr.is_default = False
    
    for field, value in update_dict.items():
        setattr(address, field, value)
    
    await db.commit()
    await db.refresh(address)
    
    return address


@router.delete("/me/addresses/{address_id}", summary="删除地址")
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除地址（软删除）"""
    result = await db.execute(
        select(Address)
        .where(Address.id == address_id)
        .where(Address.user_id == current_user.id)
    )
    address = result.scalar_one_or_none()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在"
        )
    
    address.is_deleted = True
    await db.commit()
    
    return {"message": "删除成功"}


# ============ 收藏管理 ============

@router.get("/me/favorites", response_model=List[FavoriteResponse], summary="获取收藏列表")
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取收藏的治疗师列表"""
    result = await db.execute(
        select(Favorite, Therapist)
        .join(Therapist, Favorite.therapist_id == Therapist.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    
    favorites = []
    for fav, therapist in result:
        favorites.append(FavoriteResponse(
            id=fav.id,
            therapist_id=therapist.id,
            therapist_name=therapist.name,
            therapist_avatar=therapist.avatar,
            therapist_rating=therapist.rating,
            created_at=fav.created_at
        ))
    
    return favorites


@router.post("/me/favorites", response_model=FavoriteResponse, summary="添加收藏")
async def add_favorite(
    data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """收藏治疗师"""
    # 检查治疗师是否存在
    result = await db.execute(
        select(Therapist).where(Therapist.id == data.therapist_id)
    )
    therapist = result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="治疗师不存在"
        )
    
    # 检查是否已收藏
    result = await db.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .where(Favorite.therapist_id == data.therapist_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已收藏该治疗师"
        )
    
    favorite = Favorite(
        user_id=current_user.id,
        therapist_id=data.therapist_id
    )
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    
    return FavoriteResponse(
        id=favorite.id,
        therapist_id=therapist.id,
        therapist_name=therapist.name,
        therapist_avatar=therapist.avatar,
        therapist_rating=therapist.rating,
        created_at=favorite.created_at
    )


@router.delete("/me/favorites/{therapist_id}", summary="取消收藏")
async def remove_favorite(
    therapist_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """取消收藏治疗师"""
    result = await db.execute(
        delete(Favorite)
        .where(Favorite.user_id == current_user.id)
        .where(Favorite.therapist_id == therapist_id)
    )
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未收藏该治疗师"
        )
    
    await db.commit()
    return {"message": "取消收藏成功"}

