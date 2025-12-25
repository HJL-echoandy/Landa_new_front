/**
 * 订单相关类型定义（与后端 TherapistOrderListItem 匹配）
 */

// 订单状态（与后端 BookingStatus 枚举一致）
export enum BookingStatus {
  PENDING = 'pending',           // 待接单
  CONFIRMED = 'confirmed',       // 已接单
  EN_ROUTE = 'en_route',        // 前往中
  IN_PROGRESS = 'in_progress',  // 服务中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  REFUNDED = 'refunded'         // 已退款
}

// 订单列表项（与后端 TherapistOrderListItem 完全匹配）
export interface TherapistOrder {
  id: number;
  booking_no: string;
  
  // 客户信息
  customer_name: string;
  customer_phone: string;
  customer_avatar: string | null;
  
  // 服务信息
  service_id: number;
  service_name: string;
  service_duration: number;  // 分钟
  service_price: number;
  
  // 地址信息
  address_detail: string;
  address_contact: string;
  address_phone: string;
  address_lat: number | null;
  address_lng: number | null;
  
  // 时间信息
  booking_date: string;  // YYYY-MM-DD
  start_time: string;    // HH:MM
  end_time: string;      // HH:MM
  
  // 订单信息
  status: BookingStatus;
  total_price: number;
  user_note: string | null;
  therapist_note: string | null;
  
  // 时间戳
  therapist_arrived_at: string | null;
  service_started_at: string | null;
  service_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// 订单详情（与后端 TherapistOrderDetail 匹配）
export interface TherapistOrderDetail extends TherapistOrder {
  // 价格明细
  discount_amount: number;
  coupon_deduction: number;
  points_deduction: number;
  
  // 取消信息
  cancel_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
}

// 接单请求
export interface AcceptOrderRequest {
  // 技师接单不需要额外参数
}

// 拒单请求
export interface RejectOrderRequest {
  reason: string;  // 拒绝原因
}

// 更新订单状态请求
export interface UpdateOrderStatusRequest {
  status: BookingStatus;
  note?: string;
  latitude?: number;
  longitude?: number;
}

// 打卡请求
export interface CheckInRequest {
  latitude: number;
  longitude: number;
  check_type: 'arrived' | 'start_service' | 'complete_service';
}

// 订单统计
export interface OrderStats {
  pending_count: number;      // 待接单数量
  in_progress_count: number;  // 进行中数量
  completed_count: number;    // 已完成数量
  total_count: number;        // 总数量
}

// API 响应
export interface OrdersResponse {
  orders: TherapistOrder[];
}

// 兼容旧版（保留旧的 Order 类型作为别名）
export type Order = TherapistOrder;
export type OrderDetail = TherapistOrderDetail;

