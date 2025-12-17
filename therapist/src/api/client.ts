/**
 * Axios 客户端配置
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { store } from '../store';
import { logout, setError as setAuthError } from '../store/authSlice';

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 记录请求日志
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 记录响应日志
    console.log('📥 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ Response Error:', error);

    // 网络错误
    if (!error.response) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // 根据状态码处理
    switch (status) {
      case 401:
        // Token 过期或无效，退出登录
        console.warn('🔒 Token 过期，退出登录');
        store.dispatch(logout());
        store.dispatch(setAuthError(ERROR_MESSAGES.UNAUTHORIZED));
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        });

      case 403:
        return Promise.reject({
          message: ERROR_MESSAGES.FORBIDDEN,
          code: 'FORBIDDEN',
        });

      case 404:
        return Promise.reject({
          message: ERROR_MESSAGES.NOT_FOUND,
          code: 'NOT_FOUND',
        });

      case 500:
      case 502:
      case 503:
      case 504:
        return Promise.reject({
          message: ERROR_MESSAGES.SERVER_ERROR,
          code: 'SERVER_ERROR',
        });

      default:
        return Promise.reject({
          message: (data as any)?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          code: 'UNKNOWN_ERROR',
          data,
        });
    }
  }
);

// 导出 API 客户端
export default apiClient;

// 通用请求方法
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
};

