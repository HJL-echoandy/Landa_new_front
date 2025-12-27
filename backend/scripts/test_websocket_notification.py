"""
WebSocket 通知测试脚本

用法:
    python scripts/test_websocket_notification.py --therapist-id 8 --type new_order

参数:
    --therapist-id: 技师 ID
    --type: 通知类型 (new_order/order_cancelled/order_completed/system_message)
    --title: 自定义标题（可选）
    --body: 自定义内容（可选）
"""
import asyncio
import argparse
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.websocket_manager import ws_manager
from loguru import logger


# 预定义的测试通知模板
NOTIFICATION_TEMPLATES = {
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


async def send_test_notification(
    therapist_id: int,
    notification_type: str = "new_order",
    custom_title: str = None,
    custom_body: str = None
):
    """
    发送测试通知
    
    Args:
        therapist_id: 技师 ID
        notification_type: 通知类型
        custom_title: 自定义标题
        custom_body: 自定义内容
    """
    # 获取通知模板
    if notification_type not in NOTIFICATION_TEMPLATES:
        logger.error(f"❌ 不支持的通知类型: {notification_type}")
        logger.info(f"支持的类型: {', '.join(NOTIFICATION_TEMPLATES.keys())}")
        return
    
    notification = NOTIFICATION_TEMPLATES[notification_type].copy()
    
    # 使用自定义内容（如果提供）
    if custom_title:
        notification["title"] = custom_title
    if custom_body:
        notification["body"] = custom_body
    
    # 检查技师是否在线
    if therapist_id not in ws_manager.active_connections:
        logger.warning(f"⚠️ 技师 {therapist_id} 未连接 WebSocket")
        logger.info("提示：请确保技师端 App 已登录并在前台运行")
        return
    
    logger.info(f"📤 发送通知到技师 {therapist_id}")
    logger.info(f"   类型: {notification_type}")
    logger.info(f"   标题: {notification['title']}")
    logger.info(f"   内容: {notification['body']}")
    
    # 发送通知
    try:
        success = await ws_manager.send_personal_message(notification, therapist_id)
        if success:
            logger.success(f"✅ 通知已发送成功！")
            logger.info(f"   当前在线技师数: {len(ws_manager.active_connections)}")
        else:
            logger.error(f"❌ 发送通知失败")
    except Exception as e:
        logger.error(f"❌ 发送通知失败: {e}")


async def list_online_therapists():
    """列出当前在线的技师"""
    if not ws_manager.active_connections:
        logger.info("📭 当前没有技师在线")
        return
    
    logger.info(f"📱 当前在线技师: {len(ws_manager.active_connections)} 位")
    for therapist_id, connections in ws_manager.active_connections.items():
        logger.info(f"   技师 ID: {therapist_id}, 连接数: {len(connections)}")


async def main():
    parser = argparse.ArgumentParser(description="WebSocket 通知测试工具")
    parser.add_argument(
        "--therapist-id",
        type=int,
        help="技师 ID"
    )
    parser.add_argument(
        "--type",
        choices=["new_order", "order_cancelled", "order_completed", "system_message"],
        default="new_order",
        help="通知类型"
    )
    parser.add_argument(
        "--title",
        type=str,
        help="自定义标题"
    )
    parser.add_argument(
        "--body",
        type=str,
        help="自定义内容"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="列出当前在线的技师"
    )
    
    args = parser.parse_args()
    
    # 列出在线技师
    if args.list:
        await list_online_therapists()
        return
    
    # 发送通知
    if not args.therapist_id:
        logger.error("❌ 请指定技师 ID (使用 --therapist-id)")
        logger.info("提示：使用 --list 查看当前在线的技师")
        return
    
    await send_test_notification(
        therapist_id=args.therapist_id,
        notification_type=args.type,
        custom_title=args.title,
        custom_body=args.body
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 测试已取消")

