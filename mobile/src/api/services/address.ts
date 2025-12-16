import api from '../client';
import type { Address } from '../../store/addressSlice';

// ========== 请求类型 ==========

export interface CreateAddressRequest {
  label: string;
  street: string;
  building: string;
  city: string;
  province: string;
  postalCode: string;
  contactPerson: string;
  phoneNumber: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

// ========== API 调用 ==========

export const addressApi = {
  /**
   * 获取地址列表
   */
  getAddresses(): Promise<Address[]> {
    return api.get('/addresses');
  },

  /**
   * 获取单个地址详情
   */
  getAddress(id: string): Promise<Address> {
    return api.get(`/addresses/${id}`);
  },

  /**
   * 创建地址
   */
  createAddress(data: CreateAddressRequest): Promise<Address> {
    return api.post('/addresses', data);
  },

  /**
   * 更新地址
   */
  updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
    return api.put(`/addresses/${id}`, data);
  },

  /**
   * 删除地址
   */
  deleteAddress(id: string): Promise<void> {
    return api.delete(`/addresses/${id}`);
  },

  /**
   * 设为默认地址
   */
  setDefault(id: string): Promise<Address> {
    return api.post(`/addresses/${id}/set-default`);
  },
};

