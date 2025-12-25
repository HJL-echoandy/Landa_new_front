# 数据库字段命名标准与模型分析

## 📊 核心数据模型概览

### 1. User (用户表 - users)
```python
# 主键
id: int

# 基本信息
phone: str                    # 手机号（唯一）
email: Optional[str]          # 邮箱（唯一）
nickname: Optional[str]       # 昵称
avatar: Optional[str]         # 头像URL
gender: Optional[str]         # 性别

# 认证信息
hashed_password: Optional[str]
wechat_openid: Optional[str]
wechat_unionid: Optional[str]

# 角色与状态
role: UserRole               # user/therapist/admin
is_active: bool              # 是否激活
is_verified: bool            # 是否验证
member_level: MemberLevel    # bronze/silver/gold/platinum
points: int                  # 积分

# 时间戳
created_at: datetime
updated_at: datetime
last_login_at: Optional[datetime]
```

### 2. Address (地址表 - addresses)
```python
# 主键与外键
id: int
user_id: int                 # 关联用户

# 地址信息
label: str                   # 地址标签（Home/Work/Other）
contact_name: str            # ⚠️ 联系人姓名
contact_phone: str           # ⚠️ 联系电话（注意：不是 phone！）

# 地址详情
province: str                # 省份
city: str                    # 城市
district: str                # 区县
street: str                  # 街道
detail: Optional[str]        # 详细地址（门牌号等）

# 地理位置
latitude: Optional[float]    # 纬度
longitude: Optional[float]   # 经度

# 状态
is_default: bool            # 是否默认地址
is_deleted: bool            # 是否删除

# 时间戳
created_at: datetime
updated_at: datetime
```

**⚠️ 重要**: Address 没有 `full_address` 字段，需要手动组合：
```python
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"
```

### 3. Therapist (技师表 - therapists)
```python
# 主键与外键
id: int
user_id: int                 # 关联用户（唯一）

# 基本信息
name: str                    # 姓名
title: str                   # 职称
avatar: Optional[str]        # 头像URL

# 介绍
about: Optional[str]         # 个人简介
experience_years: int        # 从业年限
specialties: Optional[List[str]]      # 专长（JSON）
certifications: Optional[List[str]]   # 资格证书（JSON）

# 媒体
video_url: Optional[str]
video_thumbnail: Optional[str]
gallery: Optional[List[str]] # 作品集（JSON）

# 评分与统计
rating: float                # 平均评分
review_count: int            # 评论数
booking_count: int           # 预约数
completed_count: int         # 完成订单数

# 价格
base_price: float            # 基础价格

# 服务区域
service_areas: Optional[List[str]]    # 服务区域（JSON）
max_distance: int            # 最大服务距离（km）

# 状态
is_active: bool              # 是否在线
is_verified: bool            # 是否认证
is_featured: bool            # 是否推荐

# 时间戳
created_at: datetime
updated_at: datetime
```

### 4. Service (服务表 - services)
```python
# 主键与外键
id: int
category_id: int             # 服务分类ID

# 基本信息
name: str                    # 服务名称
name_en: str                 # 英文名称
description: Optional[str]   # 详细描述
short_description: Optional[str]  # 简短描述

# 媒体
image: Optional[str]         # 主图
images: Optional[List[str]]  # 多图（JSON）

# 价格与时长
base_price: float            # 基础价格
duration: int                # 时长（分钟）

# 详情
benefits: Optional[List[str]]     # 功效（JSON）
includes: Optional[List[str]]     # 包含内容（JSON）
precautions: Optional[str]        # 注意事项

# 统计
booking_count: int           # 预约数
rating: float                # 评分
review_count: int            # 评论数

# 状态
is_active: bool              # 是否启用
is_featured: bool            # 是否推荐
sort_order: int              # 排序

# 时间戳
created_at: datetime
updated_at: datetime
```

### 5. Booking (预约/订单表 - bookings)
```python
# 主键与编号
id: int
booking_no: str              # ⚠️ 预约编号（唯一）

# 关联
user_id: int                 # 客户ID
therapist_id: int            # 技师ID
service_id: int              # 服务ID
address_id: int              # 地址ID

# 时间信息
booking_date: date           # 预约日期
start_time: time             # 开始时间
end_time: time               # 结束时间
duration: int                # 时长（分钟）

# 价格信息
service_price: float         # 服务价格
discount_amount: float       # 折扣金额
points_used: int             # 使用积分
points_deduction: float      # 积分抵扣金额
coupon_id: Optional[int]     # 优惠券ID
coupon_deduction: float      # 优惠券抵扣
total_price: float           # 总价

# 状态
status: BookingStatus        # pending/confirmed/en_route/in_progress/completed/cancelled/refunded

# 备注
user_note: Optional[str]     # 客户备注
therapist_note: Optional[str]  # 技师备注

# 取消信息
cancel_reason: Optional[str]
cancelled_by: Optional[str]  # user/therapist/admin
cancelled_at: Optional[datetime]

# 服务进度时间戳
therapist_arrived_at: Optional[datetime]    # 技师到达时间
service_started_at: Optional[datetime]      # 服务开始时间
service_completed_at: Optional[datetime]    # 服务完成时间

# 时间戳
created_at: datetime
updated_at: datetime
```

## 🔑 字段命名规范

### 1. 主键命名
- **统一使用** `id: int`
- **类型**: 整数，自增
- **所有表**都遵循此规范

### 2. 外键命名
- **格式**: `{关联表单数}_id`
- **示例**:
  - `user_id` → 关联 users 表
  - `therapist_id` → 关联 therapists 表
  - `service_id` → 关联 services 表
  - `address_id` → 关联 addresses 表

### 3. 时间戳命名（3个标准字段）
```python
created_at: datetime          # 创建时间
updated_at: datetime          # 更新时间
deleted_at: Optional[datetime]  # 软删除时间（如需要）
```

### 4. 状态标志命名
- **布尔值前缀**: `is_` 或 `has_`
  - `is_active` - 是否激活
  - `is_verified` - 是否验证
  - `is_default` - 是否默认
  - `is_deleted` - 是否删除
  - `is_featured` - 是否推荐

### 5. 联系信息命名
```python
# User 表（用户自己的）
phone: str               # 用户手机号
email: str               # 用户邮箱

# Address 表（地址联系人的）
contact_name: str        # ⚠️ 联系人姓名（不是 name）
contact_phone: str       # ⚠️ 联系电话（不是 phone）
```

**为什么不同？**
- User 表存储用户本人信息 → 直接用 `phone`
- Address 表存储收货/服务地址的联系人 → 用 `contact_phone`（可能不是用户本人）

### 6. 计数器命名
- **格式**: `{名词}_count`
- **示例**:
  - `review_count` - 评论数
  - `booking_count` - 预约数
  - `completed_count` - 完成数

### 7. 金额字段命名
- **格式**: `{描述}_price` 或 `{描述}_amount`
- **示例**:
  - `base_price` - 基础价格
  - `service_price` - 服务价格
  - `total_price` - 总价格
  - `discount_amount` - 折扣金额
  - `points_deduction` - 积分抵扣

### 8. 时间点命名
- **格式**: `{动作}_at`
- **示例**:
  - `created_at` - 创建时间
  - `updated_at` - 更新时间
  - `cancelled_at` - 取消时间
  - `therapist_arrived_at` - 技师到达时间
  - `service_started_at` - 服务开始时间
  - `service_completed_at` - 服务完成时间

## ⚠️ 常见错误字段

### 错误1: Address 表
```python
# ❌ 错误（不存在）
address.full_address
address.phone

# ✅ 正确
# 需要手动组合完整地址
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"

# 使用 contact_phone
address.contact_phone
```

### 错误2: User/Therapist 混淆
```python
# ❌ 错误
user.name          # User 表没有 name 字段！

# ✅ 正确
user.nickname      # User 表用 nickname
therapist.name     # Therapist 表用 name
```

### 错误3: 枚举值错误
```python
# ❌ 错误
UserRole.CUSTOMER       # 不存在！

# ✅ 正确
UserRole.USER           # user
UserRole.THERAPIST      # therapist
UserRole.ADMIN          # admin
```

## 📐 API 响应字段组装规则

### 规则1: 直接映射字段
如果模型字段可以直接使用，直接映射：
```python
booking_no=booking.booking_no,
total_price=booking.total_price,
status=booking.status,
```

### 规则2: 关联表字段
从关联表获取字段时，使用清晰的变量名：
```python
# 1. 先查询关联表
user = await db.get(User, booking.user_id)
service = await db.get(Service, booking.service_id)

# 2. 使用关联表字段
customer_name=user.nickname or "客户",
customer_phone=user.phone,
service_name=service.name,
```

### 规则3: 需要组合的字段
如完整地址、完整时间等，先组合再使用：
```python
# 组合完整地址
address = await db.get(Address, booking.address_id)
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"

# 使用组合后的值
address_detail=full_address,
```

### 规则4: 格式化字段
时间、日期等需要格式化：
```python
# 时间格式化
start_time=booking.start_time.strftime("%H:%M"),
end_time=booking.end_time.strftime("%H:%M"),

# 日期格式化
booking_date=booking.booking_date.isoformat(),
```

## 🎯 API 字段命名规范

### 客户相关字段（来自 User 表）
```python
customer_id: int              # 客户ID
customer_name: str            # 客户姓名（from user.nickname）
customer_phone: str           # 客户电话（from user.phone）
customer_avatar: str          # 客户头像（from user.avatar）
```

### 技师相关字段（来自 Therapist 表）
```python
therapist_id: int             # 技师ID
therapist_name: str           # 技师姓名（from therapist.name）
therapist_phone: str          # 技师电话（from user.phone via therapist.user_id）
therapist_avatar: str         # 技师头像（from therapist.avatar）
```

### 服务相关字段（来自 Service 表）
```python
service_id: int               # 服务ID
service_name: str             # 服务名称（from service.name）
service_duration: int         # 服务时长（from booking.duration）
service_price: float          # 服务价格（from booking.service_price）
service_image: str            # 服务图片（from service.image）
```

### 地址相关字段（来自 Address 表）
```python
address_id: int               # 地址ID
address_detail: str           # 完整地址（需组合）
address_contact: str          # 联系人（from address.contact_name）
address_phone: str            # 联系电话（from address.contact_phone）
address_lat: float            # 纬度（from address.latitude）
address_lng: float            # 经度（from address.longitude）
```

## 📋 检查清单

在编写 API 代码前，必须完成以下检查：

- [ ] 1. 打开所有相关模型文件
- [ ] 2. 记录每个模型的确切字段名和类型
- [ ] 3. 确认字段是否需要关联查询
- [ ] 4. 确认字段是否需要组合/格式化
- [ ] 5. 确认枚举类型的合法值
- [ ] 6. 确认可选字段（Optional）的处理
- [ ] 7. 确认前端 TypeScript 类型定义已匹配

## 🚀 最佳实践

### 1. 代码注释标注数据来源
```python
return TherapistOrderListItem(
    id=booking.id,
    booking_no=booking.booking_no,
    
    # 客户信息（from User）
    customer_name=user.nickname or "客户",
    customer_phone=user.phone,
    
    # 服务信息（from Service）
    service_name=service.name,
    service_duration=booking.duration,
    
    # 地址信息（from Address - 需组合）
    address_detail=full_address,
    address_phone=address.contact_phone,  # ⚠️ 注意是 contact_phone
)
```

### 2. 创建辅助函数
```python
def build_full_address(address: Address) -> str:
    """组合完整地址"""
    full = f"{address.province}{address.city}{address.district}{address.street}"
    if address.detail:
        full += f" {address.detail}"
    return full
```

### 3. 使用类型提示
```python
async def get_order_detail(
    booking_id: int,
    db: AsyncSession
) -> TherapistOrderDetail:
    """
    获取订单详情
    
    涉及表:
    - bookings (主表)
    - users (客户信息)
    - services (服务信息)
    - addresses (地址信息)
    """
    pass
```

---

**维护说明**:
- 任何模型变更必须更新此文档
- 发现字段不一致必须记录到此文档
- 新增 API 必须参考此文档的命名规范

