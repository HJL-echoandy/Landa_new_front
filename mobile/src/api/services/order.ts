// 订单相关 API 已迁移到 bookings.ts
// 此文件保留用于兼容性，请使用 bookingsApi

export { bookingsApi as orderApi } from './bookings';
export type * from './bookings';
