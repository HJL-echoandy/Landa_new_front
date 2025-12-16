import { API_BASE_URL, REQUEST_TIMEOUT, RETRY_CONFIG, HTTP_STATUS } from './config';
import { ApiError, NetworkError, TimeoutError, AuthError, BusinessError, toApiError } from './errors';
import { store } from '../store';
import { logout, refreshTokenSuccess } from '../store/authSlice';

// 请求配置
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

// API 响应格式（根据后端实际格式调整）
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 日志等级
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 简单日志
function log(level: LogLevel, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[API ${level.toUpperCase()}] ${timestamp}`;
  
  if (__DEV__) {
    switch (level) {
      case 'debug':
        console.log(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }
  // TODO: 生产环境可接入错误监控（如 Sentry）
}

// 获取认证 token
function getAuthToken(): string | null {
  const state = store.getState();
  return state.auth.token;
}

// 带超时的 fetch
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 主请求函数
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    timeout = REQUEST_TIMEOUT,
    retries = RETRY_CONFIG.maxRetries,
    skipAuth = false,
    headers: customHeaders = {},
    ...fetchOptions
  } = config;

  const url = `${API_BASE_URL}${endpoint}`;
  
  // 构建请求头
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders,
  };

  // 添加认证头
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    ...fetchOptions,
    headers,
  };

  log('debug', `Request: ${fetchOptions.method || 'GET'} ${endpoint}`, {
    body: fetchOptions.body,
  });

  let lastError: ApiError | null = null;

  // 重试循环
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);

      // 处理 401 认证错误
      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        // TODO: 可在此处实现 token 刷新逻辑
        log('warn', 'Token expired, logging out');
        store.dispatch(logout());
        throw new AuthError();
      }

      // 解析响应
      const contentType = response.headers.get('content-type');
      let responseData: ApiResponse<T> | T;

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        // 非 JSON 响应
        const text = await response.text();
        throw new ApiError(`Unexpected response: ${text}`, response.status);
      }

      // 检查 HTTP 状态
      if (!response.ok) {
        const apiResp = responseData as ApiResponse<T>;
        throw new ApiError(
          apiResp?.message || response.statusText,
          response.status,
          String(apiResp?.code || 'HTTP_ERROR'),
          apiResp?.data
        );
      }

      // 检查业务状态码（根据后端约定调整）
      const apiResp = responseData as ApiResponse<T>;
      if (apiResp.code !== undefined && apiResp.code !== 0 && apiResp.code !== 200) {
        throw new BusinessError(apiResp.message, String(apiResp.code), apiResp.data);
      }

      log('debug', `Response: ${response.status}`, apiResp);

      // 返回数据部分
      return apiResp.data !== undefined ? apiResp.data : (responseData as T);

    } catch (error) {
      lastError = toApiError(error);

      // 记录错误
      log('error', `Request failed (attempt ${attempt + 1}/${retries + 1})`, {
        endpoint,
        error: lastError.message,
        code: lastError.code,
      });

      // 判断是否可重试
      if (lastError.isRetryable() && attempt < retries) {
        const retryDelay = RETRY_CONFIG.retryDelay * Math.pow(2, attempt); // 指数退避
        log('info', `Retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
        continue;
      }

      throw lastError;
    }
  }

  // 理论上不会到这里
  throw lastError || new ApiError('Unknown error', 0);
}

// HTTP 方法封装
export const api = {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'GET' });
  },

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'DELETE' });
  },
};

export default api;

