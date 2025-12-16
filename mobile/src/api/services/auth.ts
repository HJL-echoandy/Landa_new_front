import api from '../client';

// ========== 请求/响应类型 ==========

export interface SendCodeRequest {
  phone: string;
}

export interface SendCodeResponse {
  message: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface UserInfo {
  id: number;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  member_level: string;
  points: number;
  is_new_user: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ========== API 调用 ==========

export const authApi = {
  /**
   * 发送验证码
   */
  sendCode(data: SendCodeRequest): Promise<SendCodeResponse> {
    return api.post('/auth/send-code', data, { skipAuth: true });
  },

  /**
   * 手机号+验证码登录
   */
  login(data: LoginRequest): Promise<LoginResponse> {
    return api.post('/auth/login', data, { skipAuth: true });
  },

  /**
   * 刷新 token
   */
  refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
    return api.post('/auth/refresh', data, { skipAuth: true });
  },
};
