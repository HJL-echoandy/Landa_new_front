import api from '../client';

// ========== 枚举类型 ==========

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'en_route' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentMethod = 'wechat' | 'alipay' | 'apple_pay' | 'card';

export type PaymentStatus = 'pending' | 'paid' | 'refund_pending' | 'refunded' | 'failed';

// ========== 请求/响应类型 ==========

export interface BookingPricePreviewRequest {
  therapist_id: number;
  service_id: number;
  coupon_id?: number;
  points_to_use?: number;
}

export interface BookingPriceResponse {
  service_price: number;
  discount_amount: number;
  coupon_deduction: number;
  points_deduction: number;
  total_price: number;
}

export interface CreateBookingRequest {
  therapist_id: number;
  service_id: number;
  address_id: number;
  booking_date: string;  // YYYY-MM-DD
  start_time: string;    // HH:MM
  user_note?: string;
  coupon_id?: number;
  points_to_use?: number;
}

export interface BookingListResponse {
  id: number;
  booking_no: string;
  service_name: string;
  service_duration: number;
  therapist_id: number;
  therapist_name: string;
  therapist_avatar: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  total_price: number;
  created_at: string;
}

export interface BookingDetailResponse extends BookingListResponse {
  service_id: number;
  service_image: string | null;
  address_id: number;
  address_detail: string;
  address_contact: string;
  address_phone: string;
  service_price: number;
  discount_amount: number;
  coupon_deduction: number;
  points_deduction: number;
  user_note: string | null;
  therapist_note: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  therapist_arrived_at: string | null;
  service_started_at: string | null;
  service_completed_at: string | null;
}

export interface CancelBookingRequest {
  reason: string;
}

export interface BookingsQuery {
  status?: BookingStatus;
  page?: number;
  page_size?: number;
}

// ========== 评价 ==========

export interface CreateReviewRequest {
  booking_id: number;
  rating: number;
  content?: string;
  images?: string[];
  skill_rating?: number;
  attitude_rating?: number;
  punctuality_rating?: number;
  tip_amount?: number;
  is_anonymous?: boolean;
}

export interface ReviewResponse {
  id: number;
  booking_id: number;
  therapist_name: string;
  service_name: string;
  rating: number;
  content: string | null;
  images: string[] | null;
  tip_amount: number;
  is_anonymous: boolean;
  reply_content: string | null;
  created_at: string;
}

// ========== API 调用 ==========

export const bookingsApi = {
  /**
   * 预览预约价格
   */
  previewPrice(data: BookingPricePreviewRequest): Promise<BookingPriceResponse> {
    return api.post('/bookings/preview-price', data);
  },

  /**
   * 创建预约
   */
  createBooking(data: CreateBookingRequest): Promise<BookingDetailResponse> {
    return api.post('/bookings', data);
  },

  /**
   * 获取预约列表
   */
  getBookings(query?: BookingsQuery): Promise<BookingListResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', String(query.page));
    if (query?.page_size) params.append('page_size', String(query.page_size));
    
    const queryString = params.toString();
    return api.get(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取预约详情
   */
  getBookingDetail(bookingId: number): Promise<BookingDetailResponse> {
    return api.get(`/bookings/${bookingId}`);
  },

  /**
   * 取消预约
   */
  cancelBooking(bookingId: number, data: CancelBookingRequest): Promise<{ message: string }> {
    return api.post(`/bookings/${bookingId}/cancel`, data);
  },

  /**
   * 创建评价
   */
  createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    return api.post('/reviews', data);
  },
};

