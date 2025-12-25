"""
创建测试订单数据 - 技师端订单测试
"""
import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent.parent))

from datetime import datetime, date, time, timedelta
from sqlalchemy import select
import uuid

from app.core.database import AsyncSessionLocal
from app.models.user import User, Address, UserRole
from app.models.therapist import Therapist
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.models.order import Order, PaymentStatus, PaymentMethod
from app.utils.avatar import generate_default_avatar


def generate_booking_no() -> str:
    """生成预约编号"""
    return f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"


def generate_order_no() -> str:
    """生成订单编号"""
    return f"OD{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"


async def create_customer_users(session):
    """创建客户用户"""
    customers_data = [
        {
            "phone": "13900001001",
            "nickname": "Alice M.",
            "avatar": generate_default_avatar("13900001001"),
            "role": UserRole.USER,
            "is_verified": True,
        },
        {
            "phone": "13900001002",
            "nickname": "John D.",
            "avatar": generate_default_avatar("13900001002"),
            "role": UserRole.USER,
            "is_verified": True,
        },
        {
            "phone": "13900001003",
            "nickname": "Jane Smith",
            "avatar": generate_default_avatar("13900001003"),
            "role": UserRole.USER,
            "is_verified": True,
        }
    ]
    
    customers = []
    for data in customers_data:
        # 检查是否已存在
        result = await session.execute(
            select(User).where(User.phone == data["phone"])
        )
        existing = result.scalar_one_or_none()
        if existing:
            customers.append(existing)
            continue
            
        user = User(**data)
        session.add(user)
        customers.append(user)
    
    await session.flush()
    print(f"✅ 创建了 {len(customers_data)} 个客户用户")
    return customers


async def create_customer_addresses(session, customers):
    """创建客户地址"""
    addresses_data = [
        # Alice M. 的地址
        {
            "user_id": customers[0].id,
            "label": "Home",
            "contact_name": "Alice M.",
            "contact_phone": "13900001001",
            "province": "北京市",
            "city": "北京市",
            "district": "朝阳区",
            "street": "Green St.",
            "detail": "Apartment 4B",
            "is_default": True,
            "latitude": 39.9042,
            "longitude": 116.4074
        },
        # John D. 的地址
        {
            "user_id": customers[1].id,
            "label": "Hotel",
            "contact_name": "John D.",
            "contact_phone": "13900001002",
            "province": "北京市",
            "city": "北京市",
            "district": "东城区",
            "street": "王府井大街",
            "detail": "Hotel Luxe, Room 302",
            "is_default": True,
            "latitude": 39.9142,
            "longitude": 116.4178
        },
        # Jane Smith 的地址
        {
            "user_id": customers[2].id,
            "label": "Office",
            "contact_name": "Jane Smith",
            "contact_phone": "13900001003",
            "province": "上海市",
            "city": "上海市",
            "district": "浦东新区",
            "street": "陆家嘴环路",
            "detail": "上海中心大厦 66层",
            "is_default": True,
            "latitude": 31.2397,
            "longitude": 121.4997
        }
    ]
    
    addresses = []
    for addr_data in addresses_data:
        address = Address(**addr_data)
        session.add(address)
        addresses.append(address)
    
    await session.flush()
    print(f"✅ 创建了 {len(addresses_data)} 个地址")
    return addresses


async def create_test_bookings(session):
    """创建测试订单"""
    # 获取技师（使用已登录的技师 phone=15800158000）
    therapist_result = await session.execute(
        select(Therapist).join(User).where(User.phone == "15800158000")
    )
    therapist = therapist_result.scalar_one_or_none()
    
    if not therapist:
        print("❌ 错误：找不到技师 (phone=15800158000)")
        print("   请先使用该手机号登录技师端")
        return
    
    print(f"✅ 找到技师: {therapist.name} (ID: {therapist.id})")
    
    # 获取服务
    services_result = await session.execute(
        select(Service).limit(3)
    )
    services = list(services_result.scalars())
    
    if len(services) < 2:
        print("❌ 错误：服务数据不足，请先运行 seed_data.py")
        return
    
    # 创建客户用户和地址
    customers = await create_customer_users(session)
    addresses = await create_customer_addresses(session, customers)
    
    # 今天的日期
    today = date.today()
    
    # 创建订单数据（匹配 mock 数据）
    bookings_data = [
        {
            "booking_no": generate_booking_no(),
            "user_id": customers[0].id,
            "therapist_id": therapist.id,
            "service_id": services[1].id if len(services) > 1 else services[0].id,  # Deep Tissue Massage
            "address_id": addresses[0].id,
            "booking_date": today,
            "start_time": time(14, 0),
            "end_time": time(15, 0),
            "duration": 60,
            "service_price": 85.00,
            "discount_amount": 0,
            "points_used": 0,
            "points_deduction": 0,
            "coupon_deduction": 0,
            "total_price": 85.00,
            "status": BookingStatus.PENDING,
            "user_note": "Please use lavender oil. I have a sore lower back.",
        },
        {
            "booking_no": generate_booking_no(),
            "user_id": customers[1].id,
            "therapist_id": therapist.id,
            "service_id": services[0].id,  # Full Body Oil / Swedish Massage
            "address_id": addresses[1].id,
            "booking_date": today,
            "start_time": time(16, 30),
            "end_time": time(18, 0),
            "duration": 90,
            "service_price": 120.00,
            "discount_amount": 0,
            "points_used": 0,
            "points_deduction": 0,
            "coupon_deduction": 0,
            "total_price": 120.00,
            "status": BookingStatus.PENDING,
            "user_note": "First time massage. Medium pressure please.",
        },
        {
            "booking_no": generate_booking_no(),
            "user_id": customers[2].id,
            "therapist_id": therapist.id,
            "service_id": services[0].id,
            "address_id": addresses[2].id,
            "booking_date": today + timedelta(days=1),  # 明天
            "start_time": time(10, 0),
            "end_time": time(11, 0),
            "duration": 60,
            "service_price": 85.00,
            "discount_amount": 5.00,
            "points_used": 100,
            "points_deduction": 5.00,
            "coupon_deduction": 0,
            "total_price": 75.00,
            "status": BookingStatus.CONFIRMED,  # 已接单
            "user_note": None,
        },
    ]
    
    created_bookings = []
    for booking_data in bookings_data:
        booking = Booking(**booking_data)
        session.add(booking)
        created_bookings.append(booking)
    
    await session.flush()
    
    # 为每个订单创建对应的 Order 记录
    for booking in created_bookings:
        order = Order(
            booking_id=booking.id,
            order_no=generate_order_no(),
            user_id=booking.user_id,
            total_amount=booking.total_price,
            paid_amount=0 if booking.status == BookingStatus.PENDING else booking.total_price,
            refund_amount=0,
            payment_status=PaymentStatus.PENDING if booking.status == BookingStatus.PENDING else PaymentStatus.PAID,
            payment_method=PaymentMethod.WECHAT if booking.status != BookingStatus.PENDING else None,
            payment_time=datetime.utcnow() if booking.status != BookingStatus.PENDING else None,
            invoice_requested=False,
        )
        session.add(order)
    
    await session.commit()
    
    print(f"✅ 创建了 {len(created_bookings)} 个测试订单")
    print()
    print("📋 订单列表:")
    for i, booking in enumerate(created_bookings, 1):
        print(f"  {i}. {booking.booking_no}")
        print(f"     客户: {customers[i-1].nickname if i <= len(customers) else 'Unknown'}")
        print(f"     时间: {booking.booking_date} {booking.start_time.strftime('%H:%M')}")
        print(f"     状态: {booking.status.value}")
        print(f"     价格: ¥{booking.total_price}")
        print()


async def main():
    """主函数"""
    print("🚀 开始创建测试订单数据...")
    print("-" * 50)
    
    async with AsyncSessionLocal() as session:
        try:
            await create_test_bookings(session)
            
            print("-" * 50)
            print("🎉 测试订单创建完成!")
            print()
            print("💡 提示:")
            print("  1. 请使用技师账号登录: 15800158000")
            print("  2. 验证码: 888888")
            print("  3. 在订单列表页可以看到新创建的订单")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ 创建失败: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(main())

