"""
创建测试订单
为技师 ID=3 创建3个待完成的订单
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, date, time, timedelta

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.booking import Booking, BookingStatus
from app.models.user import User, Address
from app.models.therapist import Therapist
from app.models.service import Service


async def create_test_orders():
    """创建3个测试订单"""
    async with AsyncSessionLocal() as db:
        # 1. 获取技师 (ID=3)
        therapist_result = await db.execute(
            select(Therapist).where(Therapist.id == 3)
        )
        therapist = therapist_result.scalar_one_or_none()
        
        if not therapist:
            print("❌ 找不到技师 ID=3")
            return
        
        print(f"✅ 找到技师: {therapist.name} (ID={therapist.id})")
        
        # 2. 获取一个客户
        user_result = await db.execute(
            select(User).where(User.role == "user").limit(1)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            print("❌ 找不到客户")
            return
        
        print(f"✅ 找到客户: {user.nickname or user.phone} (ID={user.id})")
        
        # 3. 获取一个服务
        service_result = await db.execute(
            select(Service).limit(1)
        )
        service = service_result.scalar_one_or_none()
        
        if not service:
            print("❌ 找不到服务")
            return
        
        print(f"✅ 找到服务: {service.name} (ID={service.id})")
        
        # 4. 获取或创建一个地址
        address_result = await db.execute(
            select(Address).where(Address.user_id == user.id).limit(1)
        )
        address = address_result.scalar_one_or_none()
        
        if not address:
            # 创建默认地址
            address = Address(
                user_id=user.id,
                label="家",
                contact_name=user.nickname or "测试客户",
                contact_phone=user.phone,
                province="广东省",
                city="深圳市",
                district="南山区",
                street="科技园",
                detail="测试地址123号",
                latitude=22.5431,
                longitude=114.0579,
                is_default=True,
            )
            db.add(address)
            await db.flush()
            print(f"✅ 创建地址: {address.province}{address.city} (ID={address.id})")
        else:
            print(f"✅ 找到地址: {address.province}{address.city} (ID={address.id})")
        
        # 5. 创建3个订单
        today = date.today()
        now = datetime.utcnow()
        
        orders_data = [
            {
                "booking_no": f"BK{now.strftime('%Y%m%d%H%M%S')}001",
                "status": BookingStatus.IN_PROGRESS,
                "total_price": 298.00,
                "service_started_at": now - timedelta(hours=1),
            },
            {
                "booking_no": f"BK{now.strftime('%Y%m%d%H%M%S')}002",
                "status": BookingStatus.IN_PROGRESS,
                "total_price": 398.00,
                "service_started_at": now - timedelta(minutes=30),
            },
            {
                "booking_no": f"BK{now.strftime('%Y%m%d%H%M%S')}003",
                "status": BookingStatus.EN_ROUTE,
                "total_price": 498.00,
                "therapist_arrived_at": now - timedelta(minutes=10),
            },
        ]
        
        created_orders = []
        for order_data in orders_data:
            booking = Booking(
                booking_no=order_data["booking_no"],
                user_id=user.id,
                therapist_id=therapist.id,
                service_id=service.id,
                address_id=address.id,
                booking_date=today,
                start_time=time(14, 0),
                end_time=time(15, 30),
                duration=90,
                service_price=order_data["total_price"],
                total_price=order_data["total_price"],
                status=order_data["status"],
                therapist_arrived_at=order_data.get("therapist_arrived_at"),
                service_started_at=order_data.get("service_started_at"),
                created_at=now,
                updated_at=now,
            )
            db.add(booking)
            created_orders.append(booking)
        
        await db.commit()
        
        print("\n🎉 成功创建 3 个测试订单：")
        for booking in created_orders:
            await db.refresh(booking)
            print(f"  - 订单号: {booking.booking_no}")
            print(f"    ID: {booking.id}")
            print(f"    状态: {booking.status.value}")
            print(f"    金额: ¥{booking.total_price}")
            print(f"    技师ID: {booking.therapist_id}")
            print()


if __name__ == "__main__":
    print("🚀 开始创建测试订单...\n")
    asyncio.run(create_test_orders())
    print("✅ 完成！")
