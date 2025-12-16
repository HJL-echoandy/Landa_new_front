// API 错误类型

export class ApiError extends Error {
  public status: number;
  public code: string;
  public data: unknown;

  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR', data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }

  // 是否为认证错误（需要重新登录）
  isAuthError(): boolean {
    return this.status === 401;
  }

  // 是否为权限错误
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  // 是否为网络错误
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  // 是否为超时错误
  isTimeoutError(): boolean {
    return this.code === 'TIMEOUT_ERROR';
  }

  // 是否可重试
  isRetryable(): boolean {
    return [408, 429, 500, 502, 503, 504].includes(this.status) || this.isNetworkError();
  }
}

// 网络错误
export class NetworkError extends ApiError {
  constructor(message: string = '网络连接失败，请检查网络') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// 超时错误
export class TimeoutError extends ApiError {
  constructor(message: string = '请求超时，请稍后重试') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// 认证错误
export class AuthError extends ApiError {
  constructor(message: string = '登录已过期，请重新登录') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

// 业务错误（服务器返回的业务逻辑错误）
export class BusinessError extends ApiError {
  constructor(message: string, code: string, data?: unknown) {
    super(message, 400, code, data);
    this.name = 'BusinessError';
  }
}

// 将原生错误转换为 ApiError
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new TimeoutError();
    }
    return new ApiError(error.message, 0, 'UNKNOWN_ERROR');
  }

  return new ApiError('未知错误', 0, 'UNKNOWN_ERROR');
}

