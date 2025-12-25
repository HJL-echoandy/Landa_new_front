/**
 * Axios 客户端配置
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import { store } from '../store';
import { logout, setError as setAuthError, updateToken } from '../store/authSlice';

// Token 刷新状态
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// 处理队列中的请求
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

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

// 响应拦截器 - 统一错误处理 + Token 自动刷新
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
    const originalRequest: any = error.config;
    
    console.error('❌ Response Error:', error);

    // 网络错误
    if (!error.response) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // 处理 401 - Token 过期，尝试刷新
    if (status === 401 && originalRequest && !originalRequest._retry) {
      
      // 如果正在刷新，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // 标记为正在刷新
      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        // 没有 refresh token，直接退出
        console.warn('🔒 没有 refresh token，退出登录');
        processQueue(error, null);
        store.dispatch(logout());
        store.dispatch(setAuthError(ERROR_MESSAGES.UNAUTHORIZED));
        isRefreshing = false;
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        });
      }

      try {
        console.log('🔄 尝试刷新 Token...');
        
        // 调用刷新 Token API
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/therapist/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;

        console.log('✅ Token 刷新成功');

        // 更新 Redux store
        store.dispatch(updateToken({ 
          token: access_token, 
          refreshToken: newRefreshToken 
        }));

        // 处理队列中的其他请求
        processQueue(null, access_token);

        // 重试原始请求
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('❌ Token 刷新失败:', refreshError);
        
        // 刷新失败，退出登录
        processQueue(refreshError, null);
        store.dispatch(logout());
        store.dispatch(setAuthError(ERROR_MESSAGES.UNAUTHORIZED));
        
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED',
        });
      } finally {
        isRefreshing = false;
      }
    }

    // 根据状态码处理其他错误
    switch (status) {
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
          message: (data as any)?.detail || (data as any)?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
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

