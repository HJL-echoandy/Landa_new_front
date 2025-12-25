/**
 * 个人信息管理 API
 */

import { request } from './client';
import apiClient from './client';
import { TherapistProfile } from '../types/user';

export interface UpdateProfileRequest {
  name?: string;
  title?: string;
  avatar?: string;
  about?: string;
  experience_years?: number;
  specialties?: string[];
  service_areas?: string[];
  base_price?: number;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

/**
 * 更新个人信息
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<TherapistProfile> => {
  return request.put<TherapistProfile>('/therapist/auth/profile', data);
};

/**
 * 上传头像
 */
export const uploadAvatar = async (file: File | Blob): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 上传通用图片
 */
export const uploadImage = async (
  file: File | Blob,
  category: string = 'general'
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/upload/image?category=${category}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const profileApi = {
  updateProfile,
  uploadAvatar,
  uploadImage,
};

export default profileApi;
