/**
 * 认证相关 API
 */

import { request } from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerificationCodeRequest,
  TherapistProfile,
} from '../types/user';

/**
 * 技师登录
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return request.post<LoginResponse>('/therapist/auth/login', data);
};

/**
 * 技师注册
 */
export const register = async (data: RegisterRequest): Promise<{ message: string }> => {
  return request.post('/therapist/auth/register', data);
};

/**
 * 发送验证码
 */
export const sendVerificationCode = async (data: VerificationCodeRequest): Promise<{ message: string }> => {
  return request.post('/therapist/auth/send-code', data);
};

/**
 * 刷新 Token
 */
export const refreshToken = async (): Promise<{ access_token: string; expires_in: number }> => {
  return request.post('/therapist/auth/refresh');
};

/**
 * 退出登录
 */
export const logout = async (): Promise<{ message: string }> => {
  return request.post('/therapist/auth/logout');
};

/**
 * 获取当前技师信息
 */
export const getCurrentTherapist = async (): Promise<TherapistProfile> => {
  return request.get<TherapistProfile>('/therapist/profile');
};

const authApi = {
  login,
  register,
  sendVerificationCode,
  refreshToken,
  logout,
  getCurrentTherapist,
};

export default authApi;

