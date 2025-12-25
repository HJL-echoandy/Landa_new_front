# Address 模型字段错误修复记录

## 🐛 问题描述

在实现技师端订单管理功能时，后端 API 出现字段名错误，导致 500 错误。

### 错误日志

```
AttributeError: 'Address' object has no attribute 'full_address'
AttributeError: 'Address' object has no attribute 'phone'
```

## 🔍 根本原因

**违反了开发规范第一条：没有先检查后端模型定义就使用字段！**

在 `backend/app/api/v1/therapist_orders.py` 中直接使用了不存在的字段：
- `address.full_address` ❌ （模型中不存在）
- `address.phone` ❌ （应该是 `address.contact_phone`）

## 📋 Address 模型实际字段

根据 `backend/app/models/user.py` 中的 `Address` 类定义：

```python
class Address(Base):
    """用户地址表"""
    __tablename__ = "addresses"

    id: Mapped[int]
    user_id: Mapped[int]
    
    # 地址信息
    label: Mapped[str]                              # ✅ 地址标签
    contact_name: Mapped[str]                       # ✅ 联系人姓名
    contact_phone: Mapped[str]                      # ✅ 联系电话（不是 phone！）
    
    province: Mapped[str]                           # ✅ 省份
    city: Mapped[str]                               # ✅ 城市
    district: Mapped[str]                           # ✅ 区县
    street: Mapped[str]                             # ✅ 街道
    detail: Mapped[Optional[str]]                   # ✅ 详细地址
    
    # 经纬度
    latitude: Mapped[Optional[float]]               # ✅ 纬度
    longitude: Mapped[Optional[float]]              # ✅ 经度
    
    # 状态
    is_default: Mapped[bool]                        # ✅ 是否默认
    is_deleted: Mapped[bool]                        # ✅ 是否删除
```

**注意**：
- ❌ 没有 `full_address` 字段（需要手动组合）
- ❌ 没有 `phone` 字段（正确的是 `contact_phone`）

## ✅ 修复方案

### 1. 手动组合完整地址

```python
# ❌ 错误写法
address_detail = address.full_address

# ✅ 正确写法
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"
address_detail = full_address
```

### 2. 使用正确的字段名

```python
# ❌ 错误写法
address_phone = address.phone

# ✅ 正确写法
address_phone = address.contact_phone
```

## 📝 修复文件

### backend/app/api/v1/therapist_orders.py

#### 修复位置 1: 订单列表 API (第 196-223 行)

```python
# 修复前
address_detail=address.full_address,
address_phone=address.phone,

# 修复后
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"

address_detail=full_address,
address_phone=address.contact_phone,
```

#### 修复位置 2: 订单详情 API (第 274-307 行)

```python
# 修复前
address_detail=address.full_address,
address_phone=address.phone,

# 修复后
full_address = f"{address.province}{address.city}{address.district}{address.street}"
if address.detail:
    full_address += f" {address.detail}"

address_detail=full_address,
address_phone=address.contact_phone,
```

## 🎓 经验教训

### 为什么会犯这个错误？

1. **没有遵守开发规范**：直接编写代码，没有先查看模型定义
2. **凭直觉猜测字段名**：认为应该有 `full_address` 和 `phone`
3. **缺少类型检查**：如果使用了 Python 类型检查工具，会在开发阶段就发现错误

### 如何避免类似错误？

✅ **必须做**：
1. 在编写任何使用模型的代码前，先打开模型文件
2. 复制粘贴确切的字段名，不要手打
3. 使用 IDE 的自动补全功能
4. 编写后运行 linter 检查

❌ **禁止做**：
1. 凭记忆或直觉使用字段名
2. 假设某个字段"应该"存在
3. 不看文档直接写代码

## 📚 相关规范文档

- `rules.md` - 开发规范（**必读**）
- `FIELD_MAPPING.md` - 字段映射文档
- `backend/app/models/` - 所有数据模型定义

## ⚠️ 重要提醒

**这是一个典型的"违反规范导致的错误"案例！**

如果在编写 `therapist_orders.py` 之前：
1. 打开 `backend/app/models/user.py`
2. 查看 `Address` 类的定义
3. 复制确切的字段名

**这个错误完全可以避免！**

---

**修复日期**: 2024-12-25  
**影响范围**: 技师端订单列表和详情 API  
**修复状态**: ✅ 已完成

