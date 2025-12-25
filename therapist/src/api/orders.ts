/**
 * 订单相关 API（与后端 therapist_orders.py 匹配）
 */

import { request } from './client';
import {
  TherapistOrder,
  TherapistOrderDetail,
  BookingStatus,
  AcceptOrderRequest,
  RejectOrderRequest,
  UpdateOrderStatusRequest,
  CheckInRequest,
  OrderStats,
} from '../types/order';

/**
 * 获取订单列表
 */
export const getOrders = async (params?: {
  status_filter?: string;  // BookingStatus 字符串
  date_from?: string;      // YYYY-MM-DD
  date_to?: string;        // YYYY-MM-DD
  page?: number;
  page_size?: number;
}): Promise<TherapistOrder[]> => {
  return request.get<TherapistOrder[]>('/therapist/orders', { params });
};

/**
 * 获取订单详情
 */
export const getOrderDetail = async (bookingId: number): Promise<TherapistOrderDetail> => {
  return request.get<TherapistOrderDetail>(`/therapist/orders/${bookingId}`);
};

/**
 * 接受订单
 */
export const acceptOrder = async (bookingId: number, data?: AcceptOrderRequest): Promise<{
  message: string;
  booking_id: number;
  status: string;
}> => {
  return request.post(`/therapist/orders/${bookingId}/accept`, data || {});
};

/**
 * 拒绝订单
 */
export const rejectOrder = async (bookingId: number, data: RejectOrderRequest): Promise<{
  message: string;
  booking_id: number;
}> => {
  return request.post(`/therapist/orders/${bookingId}/reject`, data);
};

/**
 * 更新订单状态
 */
export const updateOrderStatus = async (
  bookingId: number,
  data: UpdateOrderStatusRequest
): Promise<{
  message: string;
  booking_id: number;
  status: string;
}> => {
  return request.post(`/therapist/orders/${bookingId}/update-status`, data);
};

/**
 * 订单打卡（到达/开始服务/完成服务）
 */
export const checkin = async (
  bookingId: number,
  data: CheckInRequest
): Promise<{
  message: string;
  booking_id: number;
  status: string;
  check_time: string;
}> => {
  return request.post(`/therapist/orders/${bookingId}/checkin`, data);
};

/**
 * 获取订单统计
 */
export const getOrderStats = async (): Promise<OrderStats> => {
  return request.get<OrderStats>('/therapist/orders/stats/summary');
};

// ==================== 便捷方法 ====================

/**
 * 到达打卡
 */
export const checkInArrived = async (params: {
  bookingId: number;
  latitude: number;
  longitude: number;
}) => {
  return checkin(params.bookingId, {
    latitude: params.latitude,
    longitude: params.longitude,
    check_type: 'arrived',
  });
};

/**
 * 开始服务打卡
 */
export const checkInStartService = async (params: {
  bookingId: number;
  latitude: number;
  longitude: number;
}) => {
  return checkin(params.bookingId, {
    latitude: params.latitude,
    longitude: params.longitude,
    check_type: 'start_service',
  });
};

/**
 * 完成服务打卡
 */
export const checkInCompleteService = async (params: {
  bookingId: number;
  latitude: number;
  longitude: number;
}) => {
  return checkin(params.bookingId, {
    latitude: params.latitude,
    longitude: params.longitude,
    check_type: 'complete_service',
  });
};

const ordersApi = {
  getOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  checkin,
  checkInArrived,
  checkInStartService,
  checkInCompleteService,
  getOrderStats,
};

export default ordersApi;

