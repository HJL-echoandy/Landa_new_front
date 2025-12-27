"""
通知相关 API
"""
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.deps import require_role, get_current_user
from app.models.user import User, UserRole
from app.models.therapist import Therapist
from app.models.notification import (
    PushToken,
    Notification,
    NotificationType,
    NotificationStatus,
    TherapistNotificationSettings
)
from app.services.websocket_manager import ws_manager
from app.services.push_notification import push_service
from loguru import logger

router = APIRouter()


# ==================== 测试和调试 API ====================

class SendTestNotificationRequest(BaseModel):
    """发送测试通知请求"""
    therapist_id: int = Field(..., description="技师 ID")
    notification_type: str = Field("new_order", description="通知类型")
    title: Optional[str] = Field(None, description="自定义标题")
    body: Optional[str] = Field(None, description="自定义内容")


@router.get("/debug/online-therapists", summary="[调试] 查看在线技师列表")
async def get_online_therapists_debug():
    """查看当前所有在线的技师"""
    online_therapists = ws_manager.get_online_therapists()
    
    therapist_info = []
    for therapist_id in online_therapists:
        connection_count = ws_manager.get_connection_count(therapist_id)
        therapist_info.append({
            "therapist_id": therapist_id,
            "connection_count": connection_count,
            "is_online": ws_manager.is_therapist_online(therapist_id)
        })
    
    return {
        "total": len(online_therapists),
        "therapists": therapist_info
    }


@router.post("/debug/send-test-notification", summary="[调试] 发送测试通知")
async def send_test_notification_debug(request: SendTestNotificationRequest):
    """
    发送测试通知到指定技师
    
    用于测试 WebSocket 推送功能
    """
    # 预定义的测试通知模板
    templates = {
        "new_order": {
            "type": "new_order",
            "title": "🔔 新订单通知",
            "body": "您有一个新的【全身按摩】订单，请尽快处理！",
            "data": {
                "type": "new_order",
                "bookingId": 1,
                "orderNo": "TEST20231227001",
                "serviceName": "全身按摩",
                "customerName": "张三",
                "bookingTime": "2023-12-27 14:00",
                "screen": "OrderDetails"
            },
            "priority": "high"
        },
        "order_cancelled": {
            "type": "order_cancelled",
            "title": "❌ 订单取消通知",
            "body": "订单 #TEST20231227001 已被客户取消",
            "data": {
                "type": "order_cancelled",
                "bookingId": 1,
                "orderNo": "TEST20231227001",
                "reason": "客户临时有事",
                "screen": "OrderDetails"
            },
            "priority": "normal"
        },
        "order_completed": {
            "type": "order_completed",
            "title": "✅ 订单完成通知",
            "body": "订单 #TEST20231227001 已完成，收入 +¥280",
            "data": {
                "type": "order_completed",
                "bookingId": 1,
                "orderNo": "TEST20231227001",
                "income": 280,
                "screen": "OrderDetails"
            },
            "priority": "normal"
        },
        "system_message": {
            "type": "system_message",
            "title": "📢 系统消息",
            "body": "系统将于今晚 23:00 进行维护，预计持续 30 分钟",
            "data": {
                "type": "system_message",
                "maintenanceTime": "2023-12-27 23:00",
                "duration": 30,
                "screen": "NotificationsScreen"
            },
            "priority": "low"
        }
    }
    
    # 检查技师是否在线（WebSocket）
    is_online = ws_manager.is_therapist_online(request.therapist_id)
    
    # 获取通知模板
    if request.notification_type not in templates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的通知类型: {request.notification_type}"
        )
    
    notification = templates[request.notification_type].copy()
    
    # 使用自定义内容（如果提供）
    if request.title:
        notification["title"] = request.title
    if request.body:
        notification["body"] = request.body
    
    # 发送通知
    websocket_sent = False
    fcm_sent = False
    
    # 1. 尝试通过 WebSocket 发送（如果在线）
    if is_online:
        try:
            websocket_sent = await ws_manager.send_personal_message(notification, request.therapist_id)
            if websocket_sent:
                logger.success(f"✅ WebSocket 通知已发送到技师 {request.therapist_id}")
        except Exception as e:
            logger.error(f"❌ WebSocket 发送失败: {e}")
    
    # 2. 尝试通过 FCM 发送推送（如果未在线或 WebSocket 失败）
    if not websocket_sent:
        try:
            from app.services.fcm_service import fcm_service
            from app.db.session import get_db
            from app.models.therapist import TherapistPushToken
            from sqlalchemy import select
            
            # 获取技师的 FCM token
            async for db in get_db():
                result = await db.execute(
                    select(TherapistPushToken).where(
                        TherapistPushToken.therapist_id == request.therapist_id,
                        TherapistPushToken.is_active == True
                    ).order_by(TherapistPushToken.updated_at.desc())
                )
                push_token = result.scalar_one_or_none()
                
                if push_token:
                    fcm_sent = await fcm_service.send_notification(
                        token=push_token.token,
                        title=notification["title"],
                        body=notification["body"],
                        data=notification.get("data", {}),
                        priority=notification.get("priority", "high")
                    )
                    if fcm_sent:
                        logger.success(f"✅ FCM 推送已发送到技师 {request.therapist_id}")
                else:
                    logger.warning(f"⚠️ 技师 {request.therapist_id} 没有注册 Push Token")
                break
        except Exception as e:
            logger.error(f"❌ FCM 发送失败: {e}")
    
    # 返回结果
    if websocket_sent or fcm_sent:
        return {
            "success": True,
            "message": f"通知已成功发送到技师 {request.therapist_id}",
            "channels": {
                "websocket": websocket_sent,
                "fcm": fcm_sent
            },
            "notification": notification
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"技师 {request.therapist_id} 不在线且没有可用的推送渠道"
        )


# ==================== Schemas ====================

class PushTokenRequest(BaseModel):
    """更新 Push Token 请求"""
    token: str = Field(..., description="Expo Push Token")
    device_id: Optional[str] = Field(None, description="设备 ID")
    device_name: Optional[str] = Field(None, description="设备名称")
    platform: str = Field(..., description="平台: ios/android/web")
    app_version: Optional[str] = Field(None, description="应用版本")


class NotificationResponse(BaseModel):
    """通知响应"""
    id: int
    type: str
    priority: str
    title: str
    body: str
    data: dict
    status: str
    sent_via: Optional[str] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """通知列表响应"""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


class NotificationSettingsResponse(BaseModel):
    """通知设置响应"""
    notifications_enabled: bool
    sound_enabled: bool
    vibration_enabled: bool
    new_order_enabled: bool
    order_cancelled_enabled: bool
    order_completed_enabled: bool
    system_message_enabled: bool
    new_order_sound: Optional[str] = None
    new_order_vibration_pattern: Optional[str] = None
    do_not_disturb_periods: Optional[dict] = None
    
    class Config:
        from_attributes = True


class UpdateNotificationSettingsRequest(BaseModel):
    """更新通知设置请求"""
    notifications_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    vibration_enabled: Optional[bool] = None
    new_order_enabled: Optional[bool] = None
    order_cancelled_enabled: Optional[bool] = None
    order_completed_enabled: Optional[bool] = None
    system_message_enabled: Optional[bool] = None
    new_order_sound: Optional[str] = None
    new_order_vibration_pattern: Optional[str] = None
    do_not_disturb_periods: Optional[dict] = None


# ==================== WebSocket ====================

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="认证 Token")
):
    """
    WebSocket 连接端点
    
    连接后会保持长连接，接收实时通知
    """
    # 1. 验证 token 并获取用户
    try:
        from app.core.security import decode_access_token
        from app.core.database import AsyncSessionLocal
        
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        async with AsyncSessionLocal() as db:
            user_result = await db.execute(
                select(User).where(User.id == int(user_id))
            )
            user = user_result.scalar_one_or_none()
            
            if not user or user.role != UserRole.THERAPIST:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            therapist_result = await db.execute(
                select(Therapist).where(Therapist.user_id == user.id)
            )
            therapist = therapist_result.scalar_one_or_none()
            
            if not therapist:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
    
    except Exception as e:
        logger.error(f"❌ WebSocket 认证失败: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # 2. 建立连接
    await ws_manager.connect(websocket, therapist.id)
    
    try:
        # 发送连接成功消息
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket 连接成功",
            "therapist_id": therapist.id
        })
        
        # 3. 保持连接，接收客户端消息（心跳等）
        while True:
            data = await websocket.receive_text()
            logger.debug(f"📨 收到技师 {therapist.id} 的消息: {data}")
            
            # 可以处理心跳、已读确认等消息
            # 这里简单回复 pong
            await websocket.send_json({
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            })
    
    except WebSocketDisconnect:
        logger.info(f"🔌 技师 {therapist.id} 断开 WebSocket 连接")
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"❌ WebSocket 错误: {e}")
        ws_manager.disconnect(websocket)


# ==================== Push Token ====================

@router.post("/push-token", summary="更新推送 Token")
async def update_push_token(
    request: PushTokenRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """技师更新推送 Token"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 查询是否已存在
    result = await db.execute(
        select(PushToken).where(PushToken.therapist_id == therapist.id)
    )
    push_token = result.scalar_one_or_none()
    
    if push_token:
        # 更新
        push_token.expo_push_token = request.token
        push_token.device_id = request.device_id
        push_token.device_name = request.device_name
        push_token.platform = request.platform
        push_token.app_version = request.app_version
        push_token.is_active = True
        push_token.updated_at = datetime.utcnow()
    else:
        # 创建
        push_token = PushToken(
            therapist_id=therapist.id,
            expo_push_token=request.token,
            device_id=request.device_id,
            device_name=request.device_name,
            platform=request.platform,
            app_version=request.app_version
        )
        db.add(push_token)
    
    await db.commit()
    
    logger.info(f"✅ 技师 {therapist.id} Push Token 更新成功")
    
    return {"message": "Push Token 更新成功"}


# ==================== 通知列表 ====================

@router.get("/notifications", response_model=NotificationListResponse, summary="获取通知列表")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False, description="仅显示未读"),
    notification_type: Optional[NotificationType] = Query(None, description="通知类型筛选"),
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """获取技师通知列表"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 构建查询条件
    conditions = [Notification.therapist_id == therapist.id]
    
    if unread_only:
        conditions.append(Notification.read_at == None)
    
    if notification_type:
        conditions.append(Notification.type == notification_type)
    
    # 查询总数和未读数
    count_result = await db.execute(
        select(Notification).where(and_(*conditions))
    )
    total = len(count_result.scalars().all())
    
    unread_result = await db.execute(
        select(Notification).where(
            and_(
                Notification.therapist_id == therapist.id,
                Notification.read_at == None
            )
        )
    )
    unread_count = len(unread_result.scalars().all())
    
    # 分页查询
    offset = (page - 1) * page_size
    notifications_result = await db.execute(
        select(Notification)
        .where(and_(*conditions))
        .order_by(desc(Notification.created_at))
        .offset(offset)
        .limit(page_size)
    )
    notifications = notifications_result.scalars().all()
    
    return NotificationListResponse(
        notifications=[
            NotificationResponse(
                id=n.id,
                type=n.type.value,
                priority=n.priority.value,
                title=n.title,
                body=n.body,
                data=n.data,
                status=n.status.value,
                sent_via=n.sent_via,
                sent_at=n.sent_at,
                read_at=n.read_at,
                created_at=n.created_at
            )
            for n in notifications
        ],
        total=total,
        unread_count=unread_count,
        page=page,
        page_size=page_size
    )


@router.put("/notifications/{notification_id}/read", summary="标记通知已读")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """标记通知为已读"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 查询通知
    notification_result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.therapist_id == therapist.id
            )
        )
    )
    notification = notification_result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )
    
    # 更新已读状态
    notification.read_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "通知已标记为已读"}


@router.put("/notifications/read-all", summary="全部标记已读")
async def mark_all_notifications_read(
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """将所有未读通知标记为已读"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 查询所有未读通知
    unread_result = await db.execute(
        select(Notification).where(
            and_(
                Notification.therapist_id == therapist.id,
                Notification.read_at == None
            )
        )
    )
    unread_notifications = unread_result.scalars().all()
    
    # 批量更新
    now = datetime.utcnow()
    for notification in unread_notifications:
        notification.read_at = now
    
    await db.commit()
    
    return {
        "message": f"已标记 {len(unread_notifications)} 条通知为已读"
    }


# ==================== 通知设置 ====================

@router.get("/settings", response_model=NotificationSettingsResponse, summary="获取通知设置")
async def get_notification_settings(
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """获取技师通知设置"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 查询设置
    settings_result = await db.execute(
        select(TherapistNotificationSettings).where(
            TherapistNotificationSettings.therapist_id == therapist.id
        )
    )
    settings = settings_result.scalar_one_or_none()
    
    # 如果没有设置，返回默认值
    if not settings:
        settings = TherapistNotificationSettings(
            therapist_id=therapist.id
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return NotificationSettingsResponse(
        notifications_enabled=settings.notifications_enabled,
        sound_enabled=settings.sound_enabled,
        vibration_enabled=settings.vibration_enabled,
        new_order_enabled=settings.new_order_enabled,
        order_cancelled_enabled=settings.order_cancelled_enabled,
        order_completed_enabled=settings.order_completed_enabled,
        system_message_enabled=settings.system_message_enabled,
        new_order_sound=settings.new_order_sound,
        new_order_vibration_pattern=settings.new_order_vibration_pattern,
        do_not_disturb_periods=settings.do_not_disturb_periods
    )


@router.put("/settings", summary="更新通知设置")
async def update_notification_settings(
    request: UpdateNotificationSettingsRequest,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """更新技师通知设置"""
    # 获取技师信息
    therapist_result = await db.execute(
        select(Therapist).where(Therapist.user_id == current_user.id)
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="技师档案不存在"
        )
    
    # 查询或创建设置
    settings_result = await db.execute(
        select(TherapistNotificationSettings).where(
            TherapistNotificationSettings.therapist_id == therapist.id
        )
    )
    settings = settings_result.scalar_one_or_none()
    
    if not settings:
        settings = TherapistNotificationSettings(therapist_id=therapist.id)
        db.add(settings)
    
    # 更新设置（只更新提供的字段）
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    await db.commit()
    
    logger.info(f"✅ 技师 {therapist.id} 通知设置已更新")
    
    return {"message": "通知设置更新成功"}

