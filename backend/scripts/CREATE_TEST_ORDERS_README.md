# 测试订单数据生成指南

## 📋 说明

这个脚本会为技师端创建测试订单数据，基于前端的 mock 数据生成真实的数据库记录。

## 🚀 使用步骤

### 1. 确保后端正在运行

```bash
cd backend
docker-compose up -d
```

### 2. 在 Docker 容器中运行脚本创建测试订单

```bash
# 方法1: 直接在容器中执行（推荐）
docker exec landa-backend python scripts/create_test_orders.py

# 方法2: 进入容器后执行
docker exec -it landa-backend bash
python scripts/create_test_orders.py
exit
```

### 3. 验证数据

脚本会创建以下数据：

#### 客户用户（3个）
- Alice M. (13900001001)
- John D. (13900001002)  
- Jane Smith (13900001003)

#### 地址（3个）
- Alice M. - 北京朝阳区 Apartment 4B
- John D. - 北京东城区 Hotel Luxe, Room 302
- Jane Smith - 上海浦东新区 上海中心大厦

#### 订单（3个）

**订单 1 - 待接单**
- 客户: Alice M.
- 服务: Deep Tissue Massage (深层组织按摩)
- 时间: 今天 14:00-15:00
- 时长: 60分钟
- 价格: ¥85.00
- 状态: `pending` (待接单)
- 备注: "Please use lavender oil. I have a sore lower back."

**订单 2 - 待接单**
- 客户: John D.
- 服务: Swedish Massage (瑞典式按摩)
- 时间: 今天 16:30-18:00
- 时长: 90分钟
- 价格: ¥120.00
- 状态: `pending` (待接单)
- 备注: "First time massage. Medium pressure please."

**订单 3 - 已接单**
- 客户: Jane Smith
- 服务: Swedish Massage
- 时间: 明天 10:00-11:00
- 时长: 60分钟
- 价格: ¥75.00 (使用了积分和折扣)
- 状态: `confirmed` (已接单)

## 🔧 技术细节

### 数据生成逻辑

1. **检查技师**: 脚本会查找 `phone=15800158000` 的技师账号
2. **创建客户**: 创建3个测试客户用户
3. **创建地址**: 为每个客户创建地址
4. **创建订单**: 创建3个订单（2个待接单，1个已接单）
5. **创建支付记录**: 为每个订单创建对应的 Order 记录

### 订单编号格式

- Booking No: `BK{YYYYMMDDHHMMSS}{6位随机}`
- Order No: `OD{YYYYMMDDHHMMSS}{6位随机}`

### 订单状态

```python
BookingStatus.PENDING      # 待接单
BookingStatus.CONFIRMED    # 已接单
BookingStatus.EN_ROUTE     # 前往中
BookingStatus.IN_PROGRESS  # 服务中
BookingStatus.COMPLETED    # 已完成
BookingStatus.CANCELLED    # 已取消
```

## 📱 在技师端查看

### 1. 登录技师账号

```
手机号: 15800158000
验证码: 888888
```

### 2. 查看订单列表

- **待接单 Tab**: 显示 2 个待接单订单
- **进行中 Tab**: 显示 1 个已接单订单
- **已完成 Tab**: 暂无订单

### 3. 测试功能

- ✅ 点击订单进入详情页
- ✅ 查看客户信息、服务信息、地址
- ✅ 点击"Accept Order"接单
- ✅ 点击"Reject"拒单

## 🔄 重复运行

脚本可以多次运行，会自动：
- 跳过已存在的客户用户
- 每次创建新的订单记录
- 使用不同的订单编号

## ⚠️ 注意事项

1. **技师账号**: 必须先用 `15800158000` 登录过技师端，脚本才能找到技师ID
2. **服务数据**: 需要先运行 `seed_data.py` 创建服务数据
3. **时间**: 订单时间基于当前日期生成（今天和明天）

## 🐛 故障排除

### 错误: "找不到技师"

**原因**: 数据库中没有 `phone=15800158000` 的技师记录

**解决**:
```bash
# 1. 用该手机号在技师端登录一次
# 2. 或者运行创建技师脚本
python backend/scripts/create_test_therapist.py
```

### 错误: "服务数据不足"

**原因**: 数据库中没有服务数据

**解决**:
```bash
python backend/scripts/seed_data.py
```

## 📊 验证数据

### 方法 1: 通过 API

```bash
# 获取订单列表
curl -X GET http://localhost:8000/api/v1/therapist/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 方法 2: 数据库查询

```bash
# 进入数据库容器
docker exec -it landa-postgres psql -U postgres -d landa

# 查询订单
SELECT id, booking_no, status, booking_date, start_time 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;
```

### 方法 3: 通过技师端 APP

1. 打开技师端 APP
2. 登录账号 `15800158000`
3. 进入"Orders"页面
4. 应该能看到 2-3 个订单

## 🎯 测试场景

### 场景 1: 接单流程

1. 进入订单列表
2. 点击待接单订单
3. 查看订单详情
4. 点击"Accept Order"
5. 确认接单
6. 验证订单状态变为"已接单"

### 场景 2: 拒单流程

1. 进入订单列表
2. 点击待接单订单
3. 点击"Reject"
4. 输入拒绝原因
5. 确认拒单
6. 验证订单状态变为"已取消"

### 场景 3: 查看已接单订单

1. 切换到"进行中" Tab
2. 应该能看到已接单的订单
3. 点击查看详情
4. 验证不显示"Accept/Reject"按钮

---

**创建时间**: 2024-12-25  
**维护者**: Landa Development Team

