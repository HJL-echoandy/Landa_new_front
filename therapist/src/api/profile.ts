/**
 * 技师资料相关 API
 */

import { request } from './client';
import {
  TherapistProfile,
  TherapistStats,
  UpdateProfileRequest,
  UpdateStatusRequest,
  Certification,
} from '../types/user';

/**
 * 获取技师资料
 */
export const getProfile = async (): Promise<TherapistProfile> => {
  return request.get<TherapistProfile>('/therapist/profile');
};

/**
 * 更新技师资料
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<{
  message: string;
  profile: TherapistProfile;
}> => {
  return request.put('/therapist/profile', data);
};

/**
 * 更新在线状态
 */
export const updateStatus = async (data: UpdateStatusRequest): Promise<{
  message: string;
  status: string;
}> => {
  return request.put('/therapist/status', data);
};

/**
 * 获取技师统计数据
 */
export const getTherapistStats = async (): Promise<TherapistStats> => {
  return request.get<TherapistStats>('/therapist/stats');
};

/**
 * 上传头像
 */
export const uploadAvatar = async (formData: FormData): Promise<{
  message: string;
  avatar_url: string;
}> => {
  return request.post('/therapist/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 添加证书
 */
export const addCertification = async (data: {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  image_url?: string;
}): Promise<{
  message: string;
  certification: Certification;
}> => {
  return request.post('/therapist/profile/certifications', data);
};

/**
 * 删除证书
 */
export const deleteCertification = async (certificationId: string): Promise<{ message: string }> => {
  return request.delete(`/therapist/profile/certifications/${certificationId}`);
};

/**
 * 获取评价列表
 */
export const getReviews = async (params?: {
  page?: number;
  page_size?: number;
  min_rating?: number;
}): Promise<{
  reviews: Array<{
    id: string;
    customer_name: string;
    customer_avatar?: string;
    rating: number;
    comment: string;
    service_name: string;
    created_at: string;
    reply?: string;
    replied_at?: string;
  }>;
  total: number;
  page: number;
  page_size: number;
}> => {
  return request.get('/therapist/reviews', { params });
};

/**
 * 回复评价
 */
export const replyReview = async (params: {
  review_id: string;
  reply: string;
}): Promise<{ message: string }> => {
  return request.post(`/therapist/reviews/${params.review_id}/reply`, {
    reply: params.reply,
  });
};

const profileApi = {
  getProfile,
  updateProfile,
  updateStatus,
  getTherapistStats,
  uploadAvatar,
  addCertification,
  deleteCertification,
  getReviews,
  replyReview,
};

export default profileApi;

