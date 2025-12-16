import api from '../client';

// ========== 请求/响应类型 ==========

export interface AddressResponse {
  id: number;
  user_id: number;
  label: string;
  contact_name: string;
  contact_phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  detail: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface CreateAddressRequest {
  label?: string;
  contact_name: string;
  contact_phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  contact_name?: string;
  contact_phone?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

// ========== API 调用 ==========

export const addressApi = {
  /**
   * 获取地址列表
   */
  getAddresses(): Promise<AddressResponse[]> {
    return api.get('/users/me/addresses');
  },

  /**
   * 添加地址
   */
  createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    return api.post('/users/me/addresses', data);
  },

  /**
   * 更新地址
   */
  updateAddress(addressId: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    return api.put(`/users/me/addresses/${addressId}`, data);
  },

  /**
   * 删除地址
   */
  deleteAddress(addressId: number): Promise<{ message: string }> {
    return api.delete(`/users/me/addresses/${addressId}`);
  },

  /**
   * 设为默认地址
   */
  setDefaultAddress(addressId: number): Promise<AddressResponse> {
    return api.put(`/users/me/addresses/${addressId}`, { is_default: true });
  },
};
