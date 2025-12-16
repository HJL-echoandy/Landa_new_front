import api from '../client';
import type { Order, OrderStatus } from '../../store/orderSlice';

// ========== 请求/响应类型 ==========

export interface CreateOrderRequest {
  serviceId: string;
  therapistId: string;
  addressId: string;
  scheduledDate: string;
  scheduledTime: string;
  couponCode?: string;
  pointsToUse?: number;
}

export interface PayOrderRequest {
  paymentMethod: 'wechat' | 'alipay' | 'apple' | 'huabei';
}

export interface PayOrderResponse {
  paymentParams: Record<string, unknown>; // 支付 SDK 需要的参数
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========== API 调用 ==========

export const orderApi = {
  /**
   * 获取订单列表
   */
  getOrders(params?: OrderListParams): Promise<OrderListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.status) query.set('status', params.status);
    
    const queryString = query.toString();
    return api.get(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取订单详情
   */
  getOrder(id: string): Promise<Order> {
    return api.get(`/orders/${id}`);
  },

  /**
   * 创建订单
   */
  createOrder(data: CreateOrderRequest): Promise<Order> {
    return api.post('/orders', data);
  },

  /**
   * 支付订单
   */
  payOrder(id: string, data: PayOrderRequest): Promise<PayOrderResponse> {
    return api.post(`/orders/${id}/pay`, data);
  },

  /**
   * 取消订单
   */
  cancelOrder(id: string, reason?: string): Promise<Order> {
    return api.post(`/orders/${id}/cancel`, { reason });
  },

  /**
   * 确认服务开始
   */
  confirmServiceStart(id: string): Promise<Order> {
    return api.post(`/orders/${id}/start-service`);
  },

  /**
   * 完成订单
   */
  completeOrder(id: string): Promise<Order> {
    return api.post(`/orders/${id}/complete`);
  },

  /**
   * 提交评价
   */
  submitReview(
    id: string,
    data: { rating: number; comment?: string; isAnonymous?: boolean; tipAmount?: number }
  ): Promise<void> {
    return api.post(`/orders/${id}/review`, data);
  },
};

