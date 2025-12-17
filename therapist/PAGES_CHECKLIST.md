# 技师端页面开发清单

> 最后更新: 2024-12-17

---

## 📊 页面开发进度总览

```
总计: 20 个页面
已完成: 2 个  (10%)
进行中: 0 个  (0%)
待开发: 18 个 (90%)
```

---

## ✅ 已完成的页面 (2个)

### 1. 登录页面 (`LoginScreen.tsx`)
- **路径**: `/src/screens/auth/LoginScreen.tsx`
- **功能**:
  - 密码登录 / 验证码登录切换
  - 手机号输入 + 验证
  - 验证码倒计时
  - 表单验证
  - Redux 状态管理集成
- **状态**: ✅ 已完成

### 2. 注册页面 (`RegisterScreen.tsx`)
- **路径**: `/src/screens/auth/RegisterScreen.tsx`
- **功能**:
  - 姓名、手机号、密码输入
  - 验证码获取
  - 用户协议勾选
  - 审核流程提示
- **状态**: ✅ 已完成

---

## 🔥 优先级 P0 - 核心业务页面 (6个)

### 3. 订单列表页 (`OrdersScreen.tsx`)
- **路径**: `/src/screens/orders/OrdersScreen.tsx`
- **导航**: Bottom Tab - Orders
- **功能**:
  - 三个 Tab: 待接单 / 进行中 / 已完成
  - 订单卡片展示
    ```
    ┌─────────────────────────────┐
    │ 订单 #ORD20241217001       │
    │ 📍 北京市朝阳区xxx         │
    │ 💆 泰式按摩 (90分钟)       │
    │ 👤 客户：张女士            │
    │ 🕐 预约时间：14:00         │
    │ 💰 收入：¥180              │
    │ [倒计时: 04:35]            │
    │ [接受订单] [拒绝订单]      │
    └─────────────────────────────┘
    ```
  - 接单倒计时 (5分钟)
  - 下拉刷新
  - 订单筛选
  - 实时推送新订单
  - 点击跳转到订单详情
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 4. 订单详情页 (`OrderDetailsScreen.tsx`)
- **路径**: `/src/screens/orders/OrderDetailsScreen.tsx`
- **导航**: Stack - OrderDetails
- **功能**:
  - 客户信息 (姓名、电话、头像)
  - 服务信息 (项目、时长、价格)
  - 地址信息 (详细地址、门牌号、备注)
  - 预约时间
  - 订单状态时间轴
    ```
    ✅ 已接单      12:00
    🚗 前往中      12:30
    📍 已到达      13:45
    ⏰ 服务中      14:00
    ✨ 已完成      15:30
    ```
  - 操作按钮:
    - 拨打客户电话
    - 发送消息
    - 开始导航 (跳转到地图)
    - 到达打卡
    - 开始服务
    - 完成服务
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 5. 地图导航页 (`NavigationScreen.tsx`)
- **路径**: `/src/screens/orders/NavigationScreen.tsx`
- **导航**: Stack - Navigation
- **功能**:
  - 显示客户地址
  - 显示当前位置
  - 选择导航 App:
    - 高德地图
    - 百度地图
    - Apple Maps
    - Google Maps
  - 一键跳转到第三方导航
  - 预计到达时间
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 6. GPS 打卡页 (`CheckInScreen.tsx`)
- **路径**: `/src/screens/orders/CheckInScreen.tsx`
- **导航**: Stack - CheckIn
- **功能**:
  - 打卡类型: 到达 / 开始服务 / 完成服务
  - 显示当前位置
  - 距离验证 (100米内)
  - 打卡按钮
  - 打卡成功动画
  - 打卡失败提示
  - 上传打卡时间和位置到后端
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 7. 收入概览页 (`IncomeScreen.tsx`)
- **路径**: `/src/screens/income/IncomeScreen.tsx`
- **导航**: Bottom Tab - Income
- **功能**:
  - 顶部统计卡片
    ```
    ┌─────────────────────────────┐
    │ 本月收入                    │
    │ ¥ 12,580.00                │
    │ ↑ 较上月 +15%               │
    │                            │
    │ 今日: ¥580 | 本周: ¥3,240  │
    └─────────────────────────────┘
    ```
  - 收入图表:
    - 近7天折线图
    - 近30天柱状图
    - 服务类型饼图
  - 快速入口:
    - 收入明细
    - 提现申请
    - 提现记录
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 8. 个人中心页 (`ProfileScreen.tsx`)
- **路径**: `/src/screens/profile/ProfileScreen.tsx`
- **导航**: Bottom Tab - Profile
- **功能**:
  - 顶部信息卡
    ```
    ┌─────────────────────────────┐
    │    [头像]                   │
    │    李技师                   │
    │    ID: T10086              │
    │    手机: 138****8888       │
    │                            │
    │ ⭐ 4.9分 | 256单 | 98%好评  │
    │                            │
    │ [在线] / [离线] 开关       │
    └─────────────────────────────┘
    ```
  - 菜单列表:
    - 编辑资料
    - 我的日程
    - 收入管理 → IncomeScreen
    - 服务统计
    - 客户评价
    - 我的证书
    - 设置
    - 帮助与反馈
    - 退出登录
- **状态**: 🔴 待开发
- **预计时间**: 1天

---

## ⭐ 优先级 P1 - 重要功能页面 (6个)

### 9. 收入明细页 (`IncomeDetailsScreen.tsx`)
- **路径**: `/src/screens/income/IncomeDetailsScreen.tsx`
- **导航**: Stack - IncomeDetails
- **功能**:
  - 收入明细列表
    ```
    2024-12-17 14:00 - 泰式按摩 (90分钟)
    客户：张女士 | 订单号：ORD20241217001
    收入：¥180.00 ✅已结算
    ```
  - 筛选:
    - 按日期范围
    - 按结算状态
    - 按服务类型
  - 下拉刷新
  - 上拉加载更多
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 10. 提现申请页 (`WithdrawScreen.tsx`)
- **路径**: `/src/screens/income/WithdrawScreen.tsx`
- **导航**: Stack - Withdraw
- **功能**:
  - 显示可提现余额
  - 提现金额输入
  - 提现方式选择:
    - 银行卡
    - 支付宝
    - 微信
  - 账户信息输入
  - 手续费计算 (2%)
  - 预计到账时间
  - 提现规则说明
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 11. 提现记录页 (`WithdrawalRecordsScreen.tsx`)
- **路径**: `/src/screens/income/WithdrawalRecordsScreen.tsx`
- **导航**: Stack - WithdrawalRecords
- **功能**:
  - 提现记录列表
  - 状态标签:
    - 处理中
    - 已到账
    - 失败
  - 提现详情:
    - 提现金额
    - 手续费
    - 实际到账
    - 提现方式
    - 申请时间
    - 到账时间
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 12. 编辑资料页 (`EditProfileScreen.tsx`)
- **路径**: `/src/screens/profile/EditProfileScreen.tsx`
- **导航**: Stack - EditProfile
- **功能**:
  - 上传/更换头像
  - 修改昵称
  - 修改个人简介
  - 专业技能标签
  - 工作经验年限
  - 擅长服务类型
  - 保存按钮
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 13. 服务统计页 (`StatisticsScreen.tsx`)
- **路径**: `/src/screens/profile/StatisticsScreen.tsx`
- **导航**: Stack - Statistics
- **功能**:
  - 数据卡片:
    - 累计订单数
    - 平均评分
    - 好评率
    - 准时率
    - 客户复购率
    - 本月服务时长
  - 图表展示:
    - 每日订单趋势
    - 服务类型分布
    - 客户来源分析
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 14. 客户评价页 (`ReviewsScreen.tsx`)
- **路径**: `/src/screens/profile/ReviewsScreen.tsx`
- **导航**: Stack - Reviews
- **功能**:
  - 评价列表
  - 筛选:
    - 全部
    - 好评 (5星)
    - 中评 (3-4星)
    - 差评 (1-2星)
  - 评价卡片:
    - 客户姓名和头像
    - 评分 (星星)
    - 评价内容
    - 服务项目
    - 评价时间
    - 回复按钮
  - 回复评价功能
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

---

## 📅 优先级 P2 - 辅助功能页面 (4个)

### 15. 日程管理页 (`ScheduleScreen.tsx`)
- **路径**: `/src/screens/profile/ScheduleScreen.tsx`
- **导航**: Stack - Schedule
- **功能**:
  - 月视图日历
  - 显示每天的预约订单数
  - 点击日期查看当天详细订单
  - 设置可用时间:
    - 选择工作日
    - 设置时间段
    - 批量设置 (工作日/周末)
    - 临时请假设置
  - 同步到后端排班系统
- **状态**: 🔴 待开发
- **预计时间**: 1天

### 16. 设置页 (`SettingsScreen.tsx`)
- **路径**: `/src/screens/profile/SettingsScreen.tsx`
- **导航**: Stack - Settings
- **功能**:
  - 通知设置:
    - 新订单通知
    - 订单提醒
    - 收入通知
    - 系统消息
  - 账号安全:
    - 修改密码
    - 绑定手机号
    - 绑定邮箱
  - 语言切换
  - 关于我们
  - 用户协议
  - 隐私政策
  - 清除缓存
  - 退出登录
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 17. 消息列表页 (`MessagesScreen.tsx`)
- **路径**: `/src/screens/messages/MessagesScreen.tsx`
- **导航**: Bottom Tab - Messages
- **功能**:
  - 与客户的聊天记录列表
  - 未读消息角标
  - 最新消息预览
  - 按时间排序
  - 点击跳转到聊天页面
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 18. 聊天页 (`ChatScreen.tsx`)
- **路径**: `/src/screens/messages/ChatScreen.tsx`
- **导航**: Stack - Chat
- **功能**:
  - 发送文字消息
  - 发送图片
  - 显示订单卡片
  - 消息时间戳
  - 已读/未读状态
  - 输入框
  - 表情选择
- **状态**: 🔴 待开发
- **预计时间**: 1天

---

## 🌟 优先级 P3 - 增强功能页面 (2个)

### 19. 服务进行中页 (`ServiceInProgressScreen.tsx`)
- **路径**: `/src/screens/orders/ServiceInProgressScreen.tsx`
- **导航**: Stack - ServiceInProgress
- **功能**:
  - 显示服务进度
  - 服务倒计时
  - 客户信息
  - 服务项目
  - 服务备注输入
  - 完成服务按钮
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

### 20. 通知中心页 (`NotificationsScreen.tsx`)
- **路径**: `/src/screens/NotificationsScreen.tsx`
- **导航**: Stack - Notifications
- **功能**:
  - 通知列表
  - 通知类型:
    - 新订单通知
    - 订单提醒
    - 收入通知
    - 系统通知
  - 未读/已读标记
  - 清空全部通知
- **状态**: 🔴 待开发
- **预计时间**: 0.5天

---

## 📊 开发优先级总结

### 本周必须完成 (P0)
1. ✅ 登录页面
2. ✅ 注册页面
3. 🔴 **订单列表页** ⭐⭐⭐
4. 🔴 **订单详情页** ⭐⭐⭐
5. 🔴 地图导航页
6. 🔴 GPS 打卡页
7. 🔴 收入概览页
8. 🔴 个人中心页

### 下周完成 (P1)
9. 收入明细页
10. 提现申请页
11. 提现记录页
12. 编辑资料页
13. 服务统计页
14. 客户评价页

### 第三周完成 (P2)
15. 日程管理页
16. 设置页
17. 消息列表页
18. 聊天页

### 可选功能 (P3)
19. 服务进行中页
20. 通知中心页

---

## 🎯 建议开发顺序

### 第1天: 订单管理核心
- 订单列表页 (OrdersScreen)
- 订单详情页 (OrderDetailsScreen)

### 第2天: 订单操作
- 地图导航页 (NavigationScreen)
- GPS 打卡页 (CheckInScreen)

### 第3天: 收入与个人中心
- 收入概览页 (IncomeScreen)
- 个人中心页 (ProfileScreen)

### 第4天: 收入详细功能
- 收入明细页 (IncomeDetailsScreen)
- 提现申请页 (WithdrawScreen)
- 提现记录页 (WithdrawalRecordsScreen)

### 第5天: 个人资料管理
- 编辑资料页 (EditProfileScreen)
- 服务统计页 (StatisticsScreen)
- 客户评价页 (ReviewsScreen)

### 第6-7天: 辅助功能
- 日程管理页 (ScheduleScreen)
- 设置页 (SettingsScreen)
- 消息列表页 (MessagesScreen)
- 聊天页 (ChatScreen)

### 第8天: 增强功能 + 测试
- 服务进行中页 (ServiceInProgressScreen)
- 通知中心页 (NotificationsScreen)
- 全面测试和优化

---

## 📝 开发注意事项

1. **所有页面都使用 SafeAreaView** - 适配刘海屏
2. **统一使用 useAppNavigation** - 类型安全的导航
3. **统一使用 Redux** - 状态管理
4. **统一使用 API 层** - 调用后端接口
5. **统一的错误处理** - Alert 提示用户
6. **加载状态** - ActivityIndicator
7. **下拉刷新** - RefreshControl
8. **空状态** - 无数据时的占位图

---

## 🎨 UI 设计原则

1. **简洁高效** - 技师工作时需要快速操作
2. **大按钮** - 方便在户外/行进中点击
3. **清晰对比** - 重要信息突出显示
4. **状态明确** - 订单状态一目了然
5. **快速导航** - 最多3次点击到达任何功能

---

**预计总开发时间**: 约 8-10 个工作日

**当前进度**: 2/20 (10%)

