/**
 * 错误监控模块
 * 
 * 生产环境可接入 Sentry 或其他错误监控服务
 * 
 * 安装 Sentry:
 *   npx expo install @sentry/react-native
 * 
 * 初始化示例:
 *   import * as Sentry from '@sentry/react-native';
 *   Sentry.init({ dsn: 'YOUR_DSN' });
 */

interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

// 是否启用错误监控
const ENABLE_ERROR_TRACKING = !__DEV__;

/**
 * 初始化错误监控
 * 在 App.tsx 中调用
 */
export function initErrorTracking() {
  if (!ENABLE_ERROR_TRACKING) {
    console.log('[ErrorTracking] Disabled in development mode');
    return;
  }

  // TODO: 初始化 Sentry
  // Sentry.init({
  //   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  //   environment: process.env.EXPO_PUBLIC_ENV || 'development',
  //   enableAutoSessionTracking: true,
  //   sessionTrackingIntervalMillis: 30000,
  // });

  console.log('[ErrorTracking] Initialized');
}

/**
 * 捕获异常
 */
export function captureException(error: Error, context?: ErrorContext) {
  if (!ENABLE_ERROR_TRACKING) {
    console.error('[ErrorTracking] Exception:', error, context);
    return;
  }

  // TODO: Sentry.captureException(error, { extra: context });
  console.error('[ErrorTracking] Captured exception:', error.message);
}

/**
 * 捕获消息
 */
export function captureMessage(message: string, context?: ErrorContext) {
  if (!ENABLE_ERROR_TRACKING) {
    console.log('[ErrorTracking] Message:', message, context);
    return;
  }

  // TODO: Sentry.captureMessage(message, { extra: context });
  console.log('[ErrorTracking] Captured message:', message);
}

/**
 * 设置用户上下文
 */
export function setUser(userId: string | null, email?: string) {
  if (!ENABLE_ERROR_TRACKING) return;

  // TODO: Sentry.setUser(userId ? { id: userId, email } : null);
}

/**
 * 添加面包屑（操作轨迹）
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  if (!ENABLE_ERROR_TRACKING) return;

  // TODO: Sentry.addBreadcrumb({ category, message, data, level: 'info' });
}

/**
 * React Error Boundary 包装
 * 用法: <ErrorBoundary><App /></ErrorBoundary>
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  // TODO: 使用 Sentry.withErrorBoundary 或自定义 ErrorBoundary
  return Component;
}

