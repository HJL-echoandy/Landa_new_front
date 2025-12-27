"""
Expo 推送通知服务
"""
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from loguru import logger

from app.models.notification import (
    PushToken,
    Notification,
    NotificationType,
    NotificationStatus,
    NotificationPriority,
    TherapistNotificationSettings
)
from app.services.websocket_manager import ws_manager


class ExpoPushService:
    """Expo 推送通知服务"""
    
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
    
    @staticmethod
    async def send_push_notification(
        tokens: List[str],
        title: str,
        body: str,
        data: Dict[str, Any] = None,
        sound: str = "default",
        priority: str = "high",
        channel_id: str = "orders",
        badge: int = None
    ) -> Dict[str, Any]:
        """发送 Expo 推送通知"""
        if not tokens:
            logger.warning("⚠️ 没有可用的 push tokens")
            return {"success": False, "error": "No tokens provided"}
        
        messages = []
        for token in tokens:
            message = {
                "to": token,
                "sound": sound,
                "title": title,
                "body": body,
                "data": data or {},
                "priority": priority,
                "channelId": channel_id,
            }
            if badge is not None:
                message["badge"] = badge
            
            messages.append(message)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    ExpoPushService.EXPO_PUSH_URL,
                    json=messages,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✅ 推送发送成功: {len(messages)} 条")
                    return {"success": True, "data": result}
                else:
                    logger.error(f"❌ 推送发送失败: {response.status_code} - {response.text}")
                    return {"success": False, "error": response.text}
        
        except Exception as e:
            logger.error(f"❌ 推送发送异常: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def check_notification_settings(
        therapist_id: int,
        notification_type: NotificationType,
        db: AsyncSession
    ) -> bool:
        """检查技师是否启用了该类型的通知"""
        # 查询通知设置
        result = await db.execute(
            select(TherapistNotificationSettings).where(
                TherapistNotificationSettings.therapist_id == therapist_id
            )
        )
        settings = result.scalar_one_or_none()
        
        # 如果没有设置记录，默认全部启用
        if not settings:
            return True
        
        # 检查全局开关
        if not settings.notifications_enabled:
            return False
        
        # 检查分类开关
        type_settings_map = {
            NotificationType.NEW_ORDER: settings.new_order_enabled,
            NotificationType.ORDER_CANCELLED: settings.order_cancelled_enabled,
            NotificationType.ORDER_COMPLETED: settings.order_completed_enabled,
            NotificationType.SYSTEM_MESSAGE: settings.system_message_enabled,
        }
        
        return type_settings_map.get(notification_type, True)
    
    @staticmethod
    async def send_notification(
        therapist_id: int,
        notification_type: NotificationType,
        title: str,
        body: str,
        data: Dict[str, Any],
        priority: NotificationPriority = NotificationPriority.NORMAL,
        db: AsyncSession = None,
        sound: str = "default",
        badge: int = None
    ) -> Dict[str, Any]:
        """
        统一发送通知接口（WebSocket + Push 混合）
        
        策略：
        1. App 在前台 → 优先使用 WebSocket
        2. App 在后台/关闭 → 使用 Push
        3. 同时记录通知到数据库
        """
        # 1. 检查通知设置
        if db:
            is_enabled = await ExpoPushService.check_notification_settings(
                therapist_id, notification_type, db
            )
            if not is_enabled:
                logger.info(f"⏭️ 技师 {therapist_id} 已关闭 {notification_type} 通知")
                return {"success": False, "reason": "disabled_by_user"}
        
        sent_via = []
        errors = []
        
        # 2. 尝试通过 WebSocket 发送（如果在线）
        if ws_manager.is_therapist_online(therapist_id):
            logger.info(f"🌐 技师 {therapist_id} 在线，通过 WebSocket 发送通知")
            
            ws_message = {
                "type": "notification",
                "notification": {
                    "type": notification_type.value,
                    "title": title,
                    "body": body,
                    "data": data,
                    "priority": priority.value,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
            ws_success = await ws_manager.send_personal_message(ws_message, therapist_id)
            if ws_success:
                sent_via.append("websocket")
            else:
                errors.append("WebSocket 发送失败")
        
        # 3. 获取 Push Token 并发送推送
        if db:
            push_result = await db.execute(
                select(PushToken).where(
                    PushToken.therapist_id == therapist_id,
                    PushToken.is_active == True
                )
            )
            push_token = push_result.scalar_one_or_none()
            
            if push_token:
                logger.info(f"📱 发送推送通知给技师 {therapist_id}")
                
                # 获取自定义声音（如果是新订单）
                if notification_type == NotificationType.NEW_ORDER and db:
                    settings_result = await db.execute(
                        select(TherapistNotificationSettings).where(
                            TherapistNotificationSettings.therapist_id == therapist_id
                        )
                    )
                    settings = settings_result.scalar_one_or_none()
                    if settings and settings.new_order_sound:
                        sound = settings.new_order_sound
                
                push_result = await ExpoPushService.send_push_notification(
                    tokens=[push_token.expo_push_token],
                    title=title,
                    body=body,
                    data=data,
                    sound=sound,
                    priority="high" if priority == NotificationPriority.URGENT else "default",
                    channel_id="orders",
                    badge=badge
                )
                
                if push_result.get("success"):
                    sent_via.append("push")
                else:
                    errors.append(f"Push 发送失败: {push_result.get('error')}")
            else:
                logger.warning(f"⚠️ 技师 {therapist_id} 没有可用的 Push Token")
                errors.append("没有 Push Token")
        
        # 4. 记录通知到数据库
        if db:
            notification = Notification(
                therapist_id=therapist_id,
                type=notification_type,
                priority=priority,
                title=title,
                body=body,
                data=data,
                status=NotificationStatus.SENT if sent_via else NotificationStatus.FAILED,
                sent_via=",".join(sent_via) if sent_via else None,
                error_message="; ".join(errors) if errors else None,
                sent_at=datetime.utcnow() if sent_via else None
            )
            db.add(notification)
            await db.commit()
            
            logger.info(f"💾 通知已记录到数据库: ID={notification.id}")
        
        # 5. 返回结果
        if sent_via:
            return {
                "success": True,
                "sent_via": sent_via,
                "message": f"通知已通过 {', '.join(sent_via)} 发送"
            }
        else:
            return {
                "success": False,
                "errors": errors,
                "message": "通知发送失败"
            }
    
    @staticmethod
    async def send_new_order_notification(
        therapist_id: int,
        order_id: int,
        order_no: str,
        service_name: str,
        customer_name: str,
        booking_time: str,
        db: AsyncSession
    ):
        """发送新订单通知"""
        return await ExpoPushService.send_notification(
            therapist_id=therapist_id,
            notification_type=NotificationType.NEW_ORDER,
            title="🔔 新订单",
            body=f"{customer_name} 预约了 {service_name}",
            data={
                "type": "new_order",
                "orderId": order_id,
                "orderNo": order_no,
                "screen": "OrderDetails",
                "serviceName": service_name,
                "customerName": customer_name,
                "bookingTime": booking_time
            },
            priority=NotificationPriority.URGENT,
            db=db,
            sound="default",
            badge=1
        )
    
    @staticmethod
    async def send_order_cancelled_notification(
        therapist_id: int,
        order_id: int,
        order_no: str,
        service_name: str,
        cancel_reason: str,
        db: AsyncSession
    ):
        """发送订单取消通知"""
        return await ExpoPushService.send_notification(
            therapist_id=therapist_id,
            notification_type=NotificationType.ORDER_CANCELLED,
            title="❌ 订单已取消",
            body=f"订单 {order_no} 已被取消",
            data={
                "type": "order_cancelled",
                "orderId": order_id,
                "orderNo": order_no,
                "screen": "OrderDetails",
                "serviceName": service_name,
                "cancelReason": cancel_reason
            },
            priority=NotificationPriority.HIGH,
            db=db
        )
    
    @staticmethod
    async def send_system_message(
        therapist_id: int,
        title: str,
        message: str,
        db: AsyncSession
    ):
        """发送系统消息"""
        return await ExpoPushService.send_notification(
            therapist_id=therapist_id,
            notification_type=NotificationType.SYSTEM_MESSAGE,
            title=title,
            body=message,
            data={
                "type": "system_message",
                "screen": "Notifications"
            },
            priority=NotificationPriority.NORMAL,
            db=db
        )


# 全局推送服务实例
push_service = ExpoPushService()

