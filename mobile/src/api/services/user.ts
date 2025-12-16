import api from '../client';

// ========== 请求/响应类型 ==========

export interface UserResponse {
  id: number;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  gender: string | null;
  email: string | null;
  member_level: string;
  points: number;
  created_at: string;
}

export interface UserDetailResponse extends UserResponse {
  is_verified: boolean;
  address_count: number;
  order_count: number;
  favorite_count: number;
}

export interface UpdateUserRequest {
  nickname?: string;
  avatar?: string;
  gender?: string;
  email?: string;
}

// ========== API 调用 ==========

export const userApi = {
  /**
   * 获取当前用户信息
   */
  getProfile(): Promise<UserDetailResponse> {
    return api.get('/users/me');
  },

  /**
   * 更新用户信息
   */
  updateProfile(data: UpdateUserRequest): Promise<UserResponse> {
    return api.put('/users/me', data);
  },
};
