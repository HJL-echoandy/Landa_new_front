# 🔧 导航调试指南

## 在 Console 中查看当前页面

设置完成后，你可以在 **React Native Debugger** 或 **Chrome DevTools Console** 中使用以下命令：

### 方法 1：使用便捷函数（推荐）

```javascript
// 查看当前页面（会打印详细信息）
getCurrentPage()

// 查看整个导航栈
getNavStack()
```

### 方法 2：使用全局导航对象

```javascript
// 只获取当前页面名称
__NAV__.current

// 获取当前页面参数
__NAV__.params

// 获取导航栈数组
__NAV__.stack

// 获取当前完整路由信息
__NAV__.route

// 获取完整导航状态
__NAV__.state
```

### 方法 3：直接使用 navigation ref

```javascript
// 获取当前路由
navigation.getCurrentRoute()

// 只获取页面名称
navigation.getCurrentRoute()?.name

// 获取页面参数
navigation.getCurrentRoute()?.params

// 获取导航状态
navigation.getState()
```

## 如何打开 Console

### 使用 React Native Tools (VS Code 插件)

1. 安装 **React Native Tools** 插件
2. 按 `F1` 输入 "React Native: Show Dev Menu"
3. 在手机上选择 "Open JS Debugger"
4. Chrome 会自动打开，按 `F12` 打开 Console

### 使用终端快捷键

1. 在运行 `npx expo start` 的终端按 `j`
2. Chrome 会自动打开调试器
3. 按 `F12` 打开 Console

### 在手机上

1. 摇一摇手机
2. 点击 "Open JS Debugger"
3. 在电脑的 Chrome 中按 `F12`

## 示例输出

```javascript
// 输入：getCurrentPage()
📍 当前页面: OrderDetails
📦 页面参数: { orderId: '123' }
🔗 完整路由: { name: 'OrderDetails', params: { orderId: '123' }, ... }

// 输入：getNavStack()
📚 导航栈: ['Main', 'OrderDetails']
📍 当前索引: 1
🔍 完整状态: { routes: [...], index: 1, ... }

// 输入：__NAV__.current
"OrderDetails"

// 输入：__NAV__.stack
['Main', 'OrderDetails']
```

## 在代码中使用

如果你想在代码中使用导航工具：

```typescript
import { navigationRef, getCurrentRoute, getCurrentRouteName } from './src/navigation/navigationRef';

// 获取当前路由
const route = getCurrentRoute();

// 获取当前页面名称
const routeName = getCurrentRouteName();

// 编程式导航
if (navigationRef.isReady()) {
  navigationRef.navigate('OrderDetails', { orderId: '123' });
}
```

## 故障排除

### 提示 "Navigation 未就绪"

等待 App 完全加载后再调用命令。

### 提示 "Property 'navigation' doesn't exist"

1. 确保已重启 Metro bundler：在终端按 `Ctrl+C` 停止，然后重新运行 `npx expo start`
2. 在手机上完全关闭 App 重新打开
3. 清除缓存：`npx expo start -c`

### 没有看到调试提示

检查终端输出，应该能看到：
```
🔧 调试工具已加载！在 Console 中输入以下命令：
  getCurrentPage()     - 查看当前页面
  ...
```

如果没有，说明 `__DEV__` 模式未启用或代码未加载。


