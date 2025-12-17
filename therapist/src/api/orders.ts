/**
 * 订单相关 API
 */

import { request } from './client';
import {
  Order,
  OrderDetail,
  OrdersResponse,
  AcceptOrderRequest,
  RejectOrderRequest,
  UpdateOrderStatusRequest,
} from '../types/order';
import { OrderStatus } from '../utils/constants';

/**
 * 获取订单列表
 */
export const getOrders = async (params?: {
  status?: OrderStatus;
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
}): Promise<OrdersResponse> => {
  return request.get<OrdersResponse>('/therapist/orders', { params });
};

/**
 * 获取订单详情
 */
export const getOrderDetail = async (orderId: string): Promise<OrderDetail> => {
  return request.get<OrderDetail>(`/therapist/orders/${orderId}`);
};

/**
 * 接受订单
 */
export const acceptOrder = async (data: AcceptOrderRequest): Promise<{ message: string; order: Order }> => {
  return request.post(`/therapist/orders/${data.order_id}/accept`);
};

/**
 * 拒绝订单
 */
export const rejectOrder = async (data: RejectOrderRequest): Promise<{ message: string }> => {
  return request.post(`/therapist/orders/${data.order_id}/reject`, {
    reason: data.reason,
  });
};

/**
 * 更新订单状态
 */
export const updateOrderStatus = async (data: UpdateOrderStatusRequest): Promise<{ message: string; order: Order }> => {
  return request.put(`/therapist/orders/${data.order_id}/status`, {
    status: data.status,
    latitude: data.latitude,
    longitude: data.longitude,
    notes: data.notes,
  });
};

/**
 * 到达打卡
 */
export const checkInArrived = async (params: {
  order_id: string;
  latitude: number;
  longitude: number;
}): Promise<{ message: string; order: Order }> => {
  return request.post('/therapist/orders/checkin/arrived', params);
};

/**
 * 开始服务打卡
 */
export const checkInStartService = async (params: {
  order_id: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ message: string; order: Order }> => {
  return request.post('/therapist/orders/checkin/start-service', params);
};

/**
 * 完成服务打卡
 */
export const checkInCompleteService = async (params: {
  order_id: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}): Promise<{ message: string; order: Order }> => {
  return request.post('/therapist/orders/checkin/complete-service', params);
};

/**
 * 获取今日订单统计
 */
export const getTodayOrderStats = async (): Promise<{
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
}> => {
  return request.get('/therapist/orders/stats/today');
};

const ordersApi = {
  getOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  checkInArrived,
  checkInStartService,
  checkInCompleteService,
  getTodayOrderStats,
};

export default ordersApi;

