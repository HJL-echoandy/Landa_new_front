import api from '../client';

// ========== 请求/响应类型 ==========

export interface ServiceCategoryResponse {
  id: number;
  name: string;
  name_en: string;
  description: string | null;
  icon: string | null;
  service_count: number;
}

export interface ServiceListResponse {
  id: number;
  name: string;
  name_en: string;
  short_description: string | null;
  image: string | null;
  base_price: number;
  duration: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  category_id: number;
  category_name: string | null;
}

export interface ServiceDetailResponse extends ServiceListResponse {
  description: string | null;
  images: string[] | null;
  benefits: string[] | null;
  includes: string[] | null;
  precautions: string | null;
  booking_count: number;
}

export interface ServiceTherapistResponse {
  therapist_id: number;
  therapist_name: string;
  therapist_avatar: string | null;
  therapist_rating: number;
  therapist_review_count: number;
  price: number;
}

export interface ServicesQuery {
  category_id?: number;
  featured?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

// ========== API 调用 ==========

export const servicesApi = {
  /**
   * 获取服务分类
   */
  getCategories(): Promise<ServiceCategoryResponse[]> {
    return api.get('/services/categories');
  },

  /**
   * 获取服务列表
   */
  getServices(query?: ServicesQuery): Promise<ServiceListResponse[]> {
    const params = new URLSearchParams();
    if (query?.category_id) params.append('category_id', String(query.category_id));
    if (query?.featured !== undefined) params.append('featured', String(query.featured));
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', String(query.page));
    if (query?.page_size) params.append('page_size', String(query.page_size));
    
    const queryString = params.toString();
    return api.get(`/services${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * 获取服务详情
   */
  getServiceDetail(serviceId: number): Promise<ServiceDetailResponse> {
    return api.get(`/services/${serviceId}`);
  },

  /**
   * 获取提供该服务的治疗师
   */
  getServiceTherapists(
    serviceId: number, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<ServiceTherapistResponse[]> {
    return api.get(`/services/${serviceId}/therapists?page=${page}&page_size=${pageSize}`);
  },
};

