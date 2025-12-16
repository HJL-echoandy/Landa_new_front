// API 层统一导出

// 核心
export { default as api } from './client';
export * from './config';
export * from './errors';

// 业务服务
export { authApi } from './services/auth';
export { userApi } from './services/user';
export { addressApi } from './services/address';
export { servicesApi } from './services/services';
export { therapistsApi } from './services/therapists';
export { bookingsApi } from './services/bookings';
export { favoritesApi } from './services/favorites';

// 兼容旧代码
export { bookingsApi as orderApi } from './services/bookings';

// 类型导出
export type * from './services/auth';
export type * from './services/user';
export type * from './services/address';
export type * from './services/services';
export type * from './services/therapists';
export type * from './services/bookings';
export type * from './services/favorites';
