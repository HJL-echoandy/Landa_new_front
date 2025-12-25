# 技师状态选择器设计说明

## 🎯 产品需求分析

### 用户角色：技师
**核心需求**：主动控制自己的接单状态

### 使用场景

#### 场景1: 工作开始
- 技师上线，打开APP
- 切换到"在线"状态
- 开始接收新订单推送

#### 场景2: 服务中
- 正在为客户服务
- 切换到"忙碌"状态
- 暂停接收新订单，但保持在线

#### 场景3: 休息/下班
- 需要休息或下班
- 切换到"离线"状态
- 完全停止接收订单

## 🎨 设计方案对比

### 方案1: 简单开关（原设计）
```
[在线] ●
```
**优点**：
- 简单直观
- 占用空间小

**缺点**：
- ❌ 只有开/关两种状态
- ❌ 无法区分"忙碌"和"离线"
- ❌ 不适合复杂业务场景

### 方案2: Segmented Control（推荐✅）
```
[🟢 在线] [🟡 忙碌] [⚫ 离线]
```
**优点**：
- ✅ 支持3种状态，满足不同场景
- ✅ 视觉清晰，一目了然
- ✅ 交互友好，点击切换
- ✅ 符合iOS/Android设计规范
- ✅ 易于扩展（可添加更多状态）

**缺点**：
- 占用空间稍大（但合理）

### 方案3: 下拉菜单
**优点**：
- 节省空间

**缺点**：
- ❌ 需要额外点击展开
- ❌ 当前状态不够明显
- ❌ 交互步骤多

### 方案4: 底部Action Sheet
**优点**：
- 可以有详细说明

**缺点**：
- ❌ 切换频繁时操作繁琐
- ❌ 状态不直观

## ✅ 最终选择：Segmented Control

### 设计细节

#### 3种状态定义

| 状态 | 图标 | 颜色 | 说明 | 业务规则 |
|-----|------|------|------|---------|
| 在线 | 🟢 | 绿色 | 可接单 | 接收所有新订单推送 |
| 忙碌 | 🟡 | 橙色 | 服务中 | 暂停新订单，可查看已接订单 |
| 离线 | ⚫ | 灰色 | 休息中 | 停止所有推送，仅查看订单 |

#### 交互逻辑

```typescript
// 状态切换
在线 → 忙碌  // 开始服务时
忙碌 → 在线  // 服务完成，继续接单
在线 → 离线  // 下班休息
离线 → 在线  // 重新上线
```

#### 视觉设计

**默认状态**（未选中）：
- 背景：透明
- 文字：灰色 (#71717A)
- 图标：显示

**选中状态**：
- 背景：对应状态颜色的浅色版（10% opacity）
- 文字：对应状态颜色（粗体）
- 图标：显示
- 阴影：轻微阴影提升层次

**交互反馈**：
- 点击：`activeOpacity={0.7}`
- 切换动画：平滑过渡
- 触觉反馈：可选

## 💻 实现细节

### 状态配置
```typescript
const STATUS_CONFIG = {
  online: {
    label: '在线',
    icon: '🟢',
    color: COLORS.green,
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  busy: {
    label: '忙碌',
    icon: '🟡',
    color: COLORS.orange,
    bg: 'rgba(249, 115, 22, 0.1)',
  },
  offline: {
    label: '离线',
    icon: '⚫',
    color: COLORS.textSec,
    bg: 'rgba(113, 113, 122, 0.1)',
  },
};
```

### 状态管理
```typescript
// Local State（UI层）
const [therapistStatus, setTherapistStatus] = useState<TherapistStatus>('online');

// 切换处理
const handleStatusChange = (status: TherapistStatus) => {
  setTherapistStatus(status);
  // TODO: 调用后端API更新状态
  // await therapistApi.updateStatus(status);
};
```

### 后端集成（待实现）

需要添加API端点：
```python
# backend/app/api/v1/therapist_profile.py
@router.put("/status")
async def update_therapist_status(
    status: TherapistStatus,
    current_user: User = Depends(require_role(UserRole.THERAPIST)),
    db: AsyncSession = Depends(get_db)
):
    """更新技师在线状态"""
    # 更新 therapist.is_active 或新增 status 字段
    pass
```

## 🔔 业务逻辑扩展

### 状态联动功能

#### 1. 订单推送
```typescript
if (therapistStatus === 'online') {
  // 接收新订单推送
  enableOrderNotifications();
} else {
  // 暂停推送
  disableOrderNotifications();
}
```

#### 2. 列表筛选
```typescript
// 离线状态下，隐藏"待接单"Tab
if (therapistStatus === 'offline') {
  // 只显示"进行中"和"已完成"
}
```

#### 3. 自动状态切换
```typescript
// 接单后自动切换到"忙碌"
onAcceptOrder(() => {
  setTherapistStatus('busy');
});

// 完成订单后询问是否继续接单
onCompleteOrder(() => {
  Alert.alert('继续接单？', '', [
    { text: '是', onPress: () => setTherapistStatus('online') },
    { text: '休息', onPress: () => setTherapistStatus('offline') },
  ]);
});
```

#### 4. 状态提醒
```typescript
// 长时间离线提醒
if (therapistStatus === 'offline' && offlineDuration > 2hours) {
  showNotification('您已离线2小时，是否继续接单？');
}
```

## 📊 数据追踪

### 需要记录的指标
1. **状态切换频率** - 分析技师工作习惯
2. **各状态时长** - 统计在线时长、忙碌时长
3. **状态与接单率关系** - 优化推荐算法
4. **峰值时段分析** - 订单分配优化

### 示例数据
```typescript
interface StatusLog {
  therapist_id: number;
  from_status: TherapistStatus;
  to_status: TherapistStatus;
  changed_at: datetime;
  reason?: string; // 'manual' | 'auto_accept' | 'auto_complete'
}
```

## 🎁 未来扩展

### 可能的新状态
- **"接单中"** - 正在前往客户处
- **"即将下线"** - 不再接新单，完成当前订单
- **"请勿打扰"** - 特殊情况（如培训、会议）

### 智能建议
```typescript
// 基于历史数据的状态建议
if (currentTime === '22:00' && avgOfflineTime === '22:30') {
  suggest('您通常在22:30下线，是否切换到离线状态？');
}
```

## 🔄 与现有功能对比

### 之前（简单开关）
```
[在线] ●
```
- 状态：2种（在线/离线）
- 交互：1次点击
- 业务场景：简单

### 现在（状态选择器）
```
[🟢 在线] [🟡 忙碌] [⚫ 离线]
```
- 状态：3种（可扩展）
- 交互：1次点击
- 业务场景：完整

### 用户体验提升
- ✅ 更精确的状态控制
- ✅ 更清晰的视觉反馈
- ✅ 更符合实际工作流程
- ✅ 降低误操作风险

## ✅ 总结

**为什么选择 Segmented Control？**

1. **符合产品需求** - 3种状态覆盖核心场景
2. **交互简单** - 1次点击完成切换
3. **视觉清晰** - 当前状态一目了然
4. **易于扩展** - 可添加更多状态
5. **符合规范** - 遵循iOS/Android设计指南
6. **提升体验** - 技师可精确控制接单状态

**产品价值**：
- 提高技师工作效率 📈
- 优化订单分配准确性 🎯
- 增强用户控制感 💪
- 降低误接单概率 ✅

---

**设计者**: Landa Product Team  
**日期**: 2024-12-25  
**版本**: 1.0

