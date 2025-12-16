import api from '../client';
import type { UserProfile } from '../../store/userSlice';

// ========== 请求/响应类型 ==========

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  email?: string;
}

// ========== API 调用 ==========

export const userApi = {
  /**
   * 获取当前用户信息
   */
  getProfile(): Promise<UserProfile> {
    return api.get('/user/profile');
  },

  /**
   * 更新用户信息
   */
  updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return api.put('/user/profile', data);
  },

  /**
   * 上传头像
   */
  uploadAvatar(formData: FormData): Promise<{ url: string }> {
    return api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 注销账号
   */
  deleteAccount(): Promise<void> {
    return api.delete('/user/account');
  },
};

