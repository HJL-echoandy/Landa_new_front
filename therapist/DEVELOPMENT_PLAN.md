# 技师端 APP 开发计划

## 项目概述
为 Landa 按摩预约平台开发技师端移动应用，使技师能够接收订单、管理工作、查看收入。

---

## Phase 1: 核心功能 (2-3 周)

### 1. 项目基础配置
- [ ] 安装核心依赖包
  - React Navigation (Stack + Bottom Tabs)
  - Gluestack UI / NativeBase
  - Redux Toolkit + Redux Persist
  - Expo Location / Maps
  - Expo Notifications
  - Axios
- [ ] 配置 TypeScript 类型系统
- [ ] 配置 Redux Store (auth, orders, income, profile)
- [ ] 创建 API 层和后端通信模块
- [ ] 配置环境变量 (.env)

---

### 2. 认证系统 ⭐

#### 2.1 技师登录页面
- [ ] 手机号 + 验证码登录
- [ ] 密码登录
- [ ] 记住登录状态
- [ ] 自动登录

#### 2.2 技师注册/审核
- [ ] 技师注册表单（姓名、手机、证书照片）
- [ ] 等待审核提示页
- [ ] 审核通过/拒绝通知

---

### 3. 订单接收与管理 ⭐⭐⭐

#### 3.1 订单列表页 (HomeScreen)
**Tabs:**
- **待接单** - 新订单推送，倒计时自动过期
- **进行中** - 已接单，显示导航按钮、打卡按钮
- **已完成** - 历史订单，可查看收入

**订单卡片显示:**
```
┌─────────────────────────────────┐
│ 订单 #ORD20241217001            │
│ 📍 北京市朝阳区xxx街道123号      │
│ 💆 泰式按摩 (90分钟)             │
│ 👤 客户：张女士                  │
│ 🕐 预约时间：2024-12-17 14:00   │
│ 💰 收入：¥180                    │
│                                 │
│ [接受订单] [拒绝订单]            │
└─────────────────────────────────┘
```

**功能:**
- [ ] 下拉刷新
- [ ] 订单筛选 (按日期/状态)
- [ ] 实时推送新订单（声音+震动+弹窗）
- [ ] 接单倒计时（5分钟自动过期）

#### 3.2 订单详情页
**显示信息:**
- 客户信息（姓名、电话、头像）
- 服务信息（项目、时长、价格）
- 地址信息（详细地址、门牌号、备注）
- 预约时间
- 订单状态时间轴

**操作按钮:**
- [ ] 拨打客户电话
- [ ] 发送消息给客户
- [ ] 开始导航
- [ ] 到达打卡
- [ ] 开始服务
- [ ] 完成服务

#### 3.3 接单功能
- [ ] 接受订单 API 调用
- [ ] 拒绝订单 + 原因选择
- [ ] 订单状态更新
- [ ] 本地通知提醒

#### 3.4 订单状态流转
```
待接单 → 已接单 → 前往中 → 已到达 → 服务中 → 已完成
```

**状态操作:**
- [ ] **待接单** → 接受/拒绝
- [ ] **已接单** → 开始导航
- [ ] **前往中** → 到达打卡（GPS验证）
- [ ] **已到达** → 开始服务打卡
- [ ] **服务中** → 完成服务打卡
- [ ] **已完成** → 查看收入

---

### 4. 导航与打卡 ⭐⭐

#### 4.1 地图导航
- [ ] 集成高德地图 / Google Maps
- [ ] 一键跳转到第三方导航 App
  - 高德地图
  - 百度地图
  - Apple Maps
- [ ] 显示预计到达时间
- [ ] 实时路况

#### 4.2 GPS 打卡系统
**到达打卡:**
- [ ] 获取当前位置
- [ ] 验证距离目的地 < 100米
- [ ] 打卡成功 → 通知客户
- [ ] 上传打卡时间到后端

**开始服务打卡:**
- [ ] 确认客户准备好
- [ ] 开始计时
- [ ] 通知后端

**完成服务打卡:**
- [ ] 确认服务完成
- [ ] 上传完成时间
- [ ] 触发客户评价流程

**权限处理:**
- [ ] 请求位置权限
- [ ] 后台位置追踪（服务进行中）
- [ ] 位置权限被拒处理

---

### 5. 收入查看 ⭐⭐

#### 5.1 收入概览页 (IncomeScreen)
**顶部卡片:**
```
┌─────────────────────────────────┐
│ 本月收入                         │
│ ¥ 12,580.00                     │
│ ↑ 较上月 +15%                    │
│                                 │
│ 今日: ¥580 | 本周: ¥3,240       │
└─────────────────────────────────┘
```

**统计图表:**
- [ ] 近7天收入折线图
- [ ] 近30天收入柱状图
- [ ] 服务类型收入占比（饼图）

**快速统计:**
- [ ] 今日收入
- [ ] 本周收入
- [ ] 本月收入
- [ ] 累计收入

#### 5.2 收入明细列表
**列表项:**
```
2024-12-17 14:00 - 泰式按摩 (90分钟)
客户：张女士 | 订单号：ORD20241217001
收入：¥180.00 ✅已结算
```

**筛选:**
- [ ] 按日期范围
- [ ] 按结算状态（已结算/待结算）
- [ ] 按服务类型

#### 5.3 提现功能
- [ ] 查看可提现余额
- [ ] 提现申请表单
  - 提现金额
  - 提现账户（银行卡/支付宝/微信）
- [ ] 提现记录
- [ ] 提现状态追踪

#### 5.4 提现记录
**列表显示:**
- 提现时间
- 提现金额
- 提现方式
- 状态（处理中/已到账/失败）
- 预计到账时间

---

### 6. 个人中心 ⭐

#### 6.1 个人资料页 (ProfileScreen)
**顶部信息卡:**
```
┌─────────────────────────────────┐
│    [头像]                        │
│    李技师                        │
│    ID: T10086                   │
│    手机: 138****8888            │
│                                 │
│    ⭐ 4.9分 | 完成256单 | 好评率98% │
│                                 │
│    [在线] / [离线]  开关         │
└─────────────────────────────────┘
```

**菜单项:**
- [ ] 编辑资料
- [ ] 我的日程
- [ ] 收入管理
- [ ] 服务统计
- [ ] 客户评价
- [ ] 我的证书
- [ ] 设置
- [ ] 帮助与反馈
- [ ] 退出登录

#### 6.2 编辑资料
- [ ] 上传/更换头像
- [ ] 修改昵称
- [ ] 修改个人简介
- [ ] 专业技能标签
- [ ] 工作经验年限
- [ ] 擅长服务类型

#### 6.3 工作状态切换
- [ ] 在线/离线状态开关
- [ ] 离线后不接收新订单
- [ ] 状态同步到后端
- [ ] 状态变更通知

#### 6.4 服务统计
**数据展示:**
- 累计完成订单数
- 平均评分
- 好评率
- 准时率
- 客户复购率
- 本月服务时长

---

### 7. 日程管理

#### 7.1 日历视图
- [ ] 月视图日历
- [ ] 显示每天的预约订单数
- [ ] 点击日期查看当天详细订单

#### 7.2 设置可用时间
- [ ] 选择工作日
- [ ] 设置每日可用时间段
- [ ] 批量设置（工作日/周末）
- [ ] 临时请假设置
- [ ] 同步到后端排班系统

**示例:**
```
周一至周五: 09:00 - 18:00
周六周日: 10:00 - 20:00
休息日: 2024-12-25 (圣诞节)
```

---

### 8. 客户沟通

#### 8.1 消息列表 (MessagesScreen)
- [ ] 与客户的聊天记录
- [ ] 未读消息角标
- [ ] 最新消息预览
- [ ] 按时间排序

#### 8.2 聊天页面 (ChatScreen)
- [ ] 发送文字消息
- [ ] 发送图片
- [ ] 显示订单卡片
- [ ] 消息时间戳
- [ ] 已读/未读状态

---

## Phase 2: 增强功能 (2 周)

### 9. 客户评价管理
- [ ] 查看所有评价
- [ ] 筛选好评/中评/差评
- [ ] 回复客户评价
- [ ] 评价统计分析

### 10. 服务记录
- [ ] 服务照片上传（前/后对比）
- [ ] 服务备注记录
- [ ] 客户反馈记录

### 11. 通知中心
- [ ] 系统通知
- [ ] 订单通知
- [ ] 收入通知
- [ ] 审核通知

### 12. 数据分析
- [ ] 每日服务统计
- [ ] 客户分布图
- [ ] 服务类型分析
- [ ] 收入趋势分析

---

## 后端 API 需求

### 技师认证
```
POST   /api/therapist/login          # 技师登录
POST   /api/therapist/register       # 技师注册
POST   /api/therapist/verify-code    # 发送验证码
GET    /api/therapist/profile        # 获取技师资料
PUT    /api/therapist/profile        # 更新技师资料
PUT    /api/therapist/status         # 更新在线状态
```

### 订单管理
```
GET    /api/therapist/orders                    # 获取订单列表
GET    /api/therapist/orders/:id                # 订单详情
POST   /api/therapist/orders/:id/accept         # 接受订单
POST   /api/therapist/orders/:id/reject         # 拒绝订单
PUT    /api/therapist/orders/:id/status         # 更新订单状态
POST   /api/therapist/orders/:id/checkin        # 打卡
```

### 位置打卡
```
POST   /api/therapist/location/checkin          # 到达打卡
POST   /api/therapist/location/start-service    # 开始服务
POST   /api/therapist/location/complete-service # 完成服务
```

### 收入管理
```
GET    /api/therapist/income/summary            # 收入概览
GET    /api/therapist/income/details            # 收入明细
GET    /api/therapist/income/statistics         # 收入统计
POST   /api/therapist/income/withdraw           # 申请提现
GET    /api/therapist/income/withdraw-history   # 提现记录
```

### 日程管理
```
GET    /api/therapist/schedule                  # 获取日程
PUT    /api/therapist/schedule                  # 更新可用时间
GET    /api/therapist/availability/:date        # 查询某日可用性
```

### 评价管理
```
GET    /api/therapist/reviews                   # 获取评价列表
POST   /api/therapist/reviews/:id/reply         # 回复评价
GET    /api/therapist/reviews/statistics        # 评价统计
```

### 消息通知
```
GET    /api/therapist/messages                  # 消息列表
GET    /api/therapist/messages/:id              # 聊天记录
POST   /api/therapist/messages/:id              # 发送消息
GET    /api/therapist/notifications             # 通知列表
PUT    /api/therapist/notifications/:id/read    # 标记已读
```

---

## 技术栈

### 前端
- **框架**: React Native (Expo)
- **UI**: Gluestack UI / NativeBase
- **导航**: React Navigation 6
- **状态管理**: Redux Toolkit + Redux Persist
- **地图**: react-native-maps / expo-location
- **通知**: expo-notifications
- **相机**: expo-camera / expo-image-picker
- **网络**: Axios
- **图表**: react-native-chart-kit / Victory Native

### 后端
- **框架**: Python + FastAPI
- **数据库**: PostgreSQL
- **缓存**: Redis
- **实时通信**: WebSocket / Socket.io
- **推送**: Firebase Cloud Messaging (FCM)
- **地图**: 高德地图 API / Google Maps API

---

## 开发优先级

### P0 (必须有 - 2周)
1. ✅ 项目基础配置
2. ✅ 技师登录认证
3. ✅ 订单列表与详情
4. ✅ 接单/拒绝订单
5. ✅ 地图导航跳转
6. ✅ GPS 打卡系统
7. ✅ 基础个人中心

### P1 (核心功能 - 1周)
1. 收入概览与明细
2. 提现功能
3. 订单实时推送
4. 客户沟通（聊天）
5. 工作状态切换

### P2 (增强功能 - 1周)
1. 日程管理
2. 评价管理
3. 服务统计
4. 通知中心

### P3 (可选功能)
1. 数据分析
2. 服务照片上传
3. 客户偏好记录

---

## 页面结构

```
技师端 APP
│
├── StartScreen (启动页)
├── LoginScreen (登录页)
├── RegisterScreen (注册页)
│
├── MainTabs (底部导航)
│   ├── HomeScreen (订单首页)
│   │   ├── Tabs: 待接单 / 进行中 / 已完成
│   │   └── OrderCard (订单卡片)
│   │
│   ├── IncomeScreen (收入)
│   │   ├── IncomeSummary (收入概览)
│   │   ├── IncomeDetails (明细列表)
│   │   └── WithdrawScreen (提现页)
│   │
│   ├── MessagesScreen (消息)
│   │   └── ChatScreen (聊天页)
│   │
│   └── ProfileScreen (我的)
│       ├── EditProfileScreen (编辑资料)
│       ├── ScheduleScreen (日程管理)
│       ├── ReviewsScreen (客户评价)
│       ├── StatisticsScreen (服务统计)
│       └── SettingsScreen (设置)
│
├── OrderDetailsScreen (订单详情)
├── NavigationScreen (导航页)
├── CheckInScreen (打卡页)
├── ServiceInProgressScreen (服务进行中)
└── NotificationsScreen (通知中心)
```

---

## UI/UX 设计原则

1. **简洁高效** - 技师工作时需要快速操作
2. **大按钮** - 方便在户外/行进中点击
3. **清晰对比** - 重要信息突出显示
4. **状态明确** - 订单状态一目了然
5. **快速导航** - 最多3次点击到达任何功能
6. **离线支持** - 缓存关键数据，网络恢复后同步

---

## 测试计划

### 功能测试
- [ ] 登录注册流程
- [ ] 订单接收与状态流转
- [ ] GPS 打卡准确性
- [ ] 收入计算正确性
- [ ] 推送通知及时性

### 性能测试
- [ ] 订单列表加载速度
- [ ] 地图渲染性能
- [ ] 大量数据滚动流畅度
- [ ] 内存占用

### 兼容性测试
- [ ] iOS 14+
- [ ] Android 10+
- [ ] 不同屏幕尺寸适配

---

## 上线准备

- [ ] App Store 审核准备
- [ ] Google Play 审核准备
- [ ] 用户手册
- [ ] 技师培训文档
- [ ] 客服支持文档
- [ ] 错误监控 (Sentry)
- [ ] 数据分析 (Firebase Analytics)

---

## 预估时间

- **项目搭建**: 2天
- **认证系统**: 2天
- **订单管理**: 5天
- **导航打卡**: 3天
- **收入管理**: 3天
- **个人中心**: 2天
- **测试优化**: 3天

**总计**: 约 20 天（3周）

---

## 下一步行动

1. ✅ 创建 Expo 项目
2. 安装依赖包
3. 配置导航和 Redux
4. 创建 API 层
5. 开发登录页面
6. 开发订单列表页

