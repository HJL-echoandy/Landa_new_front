import api from '../client';

// ========== 请求/响应类型 ==========

export interface FavoriteResponse {
  id: number;
  therapist_id: number;
  therapist_name: string;
  therapist_avatar: string | null;
  therapist_title: string | null;
  therapist_rating: number;
  created_at: string;
}

export interface AddFavoriteRequest {
  therapist_id: number;
}

// ========== API 调用 ==========

export const favoritesApi = {
  /**
   * 获取收藏列表
   */
  getFavorites(): Promise<FavoriteResponse[]> {
    return api.get('/users/me/favorites');
  },

  /**
   * 添加收藏
   */
  addFavorite(data: AddFavoriteRequest): Promise<FavoriteResponse> {
    return api.post('/users/me/favorites', data);
  },

  /**
   * 取消收藏
   */
  removeFavorite(therapistId: number): Promise<{ message: string }> {
    return api.delete(`/users/me/favorites/${therapistId}`);
  },
};

