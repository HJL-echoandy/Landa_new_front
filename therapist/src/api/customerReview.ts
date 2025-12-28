/**
 * 客户评价 API
 * 技师对客户的评价
 */

import { request } from './client';

export interface CustomerReviewCreateRequest {
  rating: number; // 1-5星
  tags?: string[]; // 快速标签
  private_note?: string; // 私密备注
}

export interface CustomerReviewResponse {
  id: number;
  therapist_id: number;
  user_id: number;
  booking_id: number;
  rating: number;
  tags: string[] | null;
  private_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerReviewListItem {
  id: number;
  user_id: number;
  booking_id: number;
  rating: number;
  tags: string[] | null;
  created_at: string;
  // 客户信息
  customer_name: string;
  customer_avatar: string | null;
  // 订单信息
  service_name: string;
  booking_date: string;
}

const customerReviewApi = {
  /**
   * 提交客户评价
   */
  async submitReview(
    bookingId: string,
    data: CustomerReviewCreateRequest
  ): Promise<CustomerReviewResponse> {
    return request.post<CustomerReviewResponse>(
      `/therapist/orders/${bookingId}/customer-review`,
      data
    );
  },

  /**
   * 获取客户评价列表
   */
  async getReviews(
    skip: number = 0,
    limit: number = 20
  ): Promise<CustomerReviewListItem[]> {
    return request.get<CustomerReviewListItem[]>(
      '/therapist/customer-reviews',
      { params: { skip, limit } }
    );
  },

  /**
   * 获取指定订单的客户评价
   */
  async getReviewByBooking(
    bookingId: string
  ): Promise<CustomerReviewResponse> {
    return request.get<CustomerReviewResponse>(
      `/therapist/orders/${bookingId}/customer-review`
    );
  },
};

export default customerReviewApi;

