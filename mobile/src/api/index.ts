// API 层统一导出

// 核心
export { default as api } from './client';
export * from './config';
export * from './errors';

// 业务服务
export { authApi } from './services/auth';
export { userApi } from './services/user';
export { addressApi } from './services/address';
export { orderApi } from './services/order';

// 类型导出
export type * from './services/auth';
export type * from './services/order';

