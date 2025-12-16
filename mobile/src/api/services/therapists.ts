import api from '../client';

// ========== 请求/响应类型 ==========

export interface TherapistListResponse {
  id: number;
  name: string;
  title: string;
  avatar: string | null;
  rating: number;
  review_count: number;
  base_price: number;
  specialties: string[] | null;
  is_featured: boolean;
}

export interface TherapistDetailResponse extends TherapistListResponse {
  about: string | null;
  experience_years: number;
  certifications: string[] | null;
  video_url: string | null;
  video_thumbnail: string | null;
  gallery: string[] | null;
  booking_count: number;
  completed_count: number;
  service_areas: string[] | null;
  is_verified: boolean;
}

export interface TherapistServiceResponse {
  service_id: number;
  service_name: string;
  service_description: string | null;
  duration: number;
  price: number;
  service_image: string | null;
}

export interface TimeSlotResponse {
  time: string;
  available: boolean;
  booked: boolean;
}

export interface DayAvailabilityResponse {
  date: string;
  slots: TimeSlotResponse[];
}

export interface TherapistReviewResponse {
  id: number;
  user_nickname: string;
  user_avatar: string | null;
  rating: number;
  content: string | null;
  images: string[] | null;
  is_anonymous: boolean;
  reply_content: string | null;
  created_at: string;
}

export interface RatingDistribution {
  star_5: number;
  star_4: number;
  star_3: number;
  star_2: number;
  star_1: number;
}

export interface TherapistsQuery {
  featured?: boolean;
  specialty?: string;
  search?: string;
  min_rating?: number;
  page?: number;
  page_size?: number;
}

// ========== API 调用 ==========

export const therapistsApi = {
  /**
   * 获取治疗师列表
   */
  getTherapists(query?: TherapistsQuery): Promise<TherapistListResponse[]> {
    const params = new URLSearchParams();
    if (query?.featured !== undefined) params.append('featured', String(query.featured));
    if (query?.specialty) params.append('specialty', query.specialty);
    if (query?.search) params.append('search', query.search);
    if (query?.min_rating) params.append('min_rating', String(query.min_rating));
    if (query?.page) params.append('page', String(query.page));
    if (query?.page_size) params.append('page_size', String(query.page_size));
    
    const queryString = params.toString();
    return api.get(`/therapists${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取治疗师详情
   */
  getTherapistDetail(therapistId: number): Promise<TherapistDetailResponse> {
    return api.get(`/therapists/${therapistId}`);
  },

  /**
   * 获取治疗师服务
   */
  getTherapistServices(therapistId: number): Promise<TherapistServiceResponse[]> {
    return api.get(`/therapists/${therapistId}/services`);
  },

  /**
   * 获取治疗师可用时段
   */
  getAvailability(
    therapistId: number, 
    startDate: string, 
    endDate?: string
  ): Promise<DayAvailabilityResponse[]> {
    const params = new URLSearchParams({ start_date: startDate });
    if (endDate) params.append('end_date', endDate);
    return api.get(`/therapists/${therapistId}/availability?${params.toString()}`);
  },

  /**
   * 获取治疗师评价
   */
  getReviews(
    therapistId: number, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<TherapistReviewResponse[]> {
    return api.get(`/therapists/${therapistId}/reviews?page=${page}&page_size=${pageSize}`);
  },

  /**
   * 获取评分分布
   */
  getRatingDistribution(therapistId: number): Promise<RatingDistribution> {
    return api.get(`/therapists/${therapistId}/rating-distribution`);
  },
};

