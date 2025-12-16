// API 配置
// 从环境变量读取，支持 dev/staging/prod 环境切换

// 开发环境默认使用本地后端
const DEV_API_URL = 'http://localhost:8000/api/v1';
const PROD_API_URL = 'https://api.landa.com/api/v1';

// 基础 URL（在 app.config.ts 中通过 extra 注入）
export const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL)
  : (process.env.EXPO_PUBLIC_API_URL || PROD_API_URL);

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 15000;

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 初始重试延迟
  retryOn: [408, 429, 500, 502, 503, 504], // 可重试的状态码
};

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};
