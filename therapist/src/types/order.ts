/**
 * 订单相关类型定义
 */

import { OrderStatus } from '../utils/constants';

export interface Order {
  id: string;
  booking_no: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_avatar?: string;
  service_id: string;
  service_name: string;
  service_duration: number; // 分钟
  service_price: number;
  address: string;
  address_detail: string;
  latitude: number;
  longitude: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  arrived_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface OrderDetail extends Order {
  customer_address_id: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  rating?: number;
  review?: string;
  therapist_income?: number; // 技师收入
}

export interface AcceptOrderRequest {
  order_id: string;
}

export interface RejectOrderRequest {
  order_id: string;
  reason: string;
}

export interface UpdateOrderStatusRequest {
  order_id: string;
  status: OrderStatus;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
}

