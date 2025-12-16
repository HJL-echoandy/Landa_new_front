import api from '../client';

// ========== 请求/响应类型 ==========

export interface SendVerificationCodeRequest {
  phone: string;
}

export interface SendVerificationCodeResponse {
  success: boolean;
  expiresIn: number; // 验证码有效期（秒）
}

export interface LoginWithPhoneRequest {
  phone: string;
  code: string;
}

export interface LoginWithWechatRequest {
  code: string; // 微信授权码
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
  isNewUser: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// ========== API 调用 ==========

export const authApi = {
  /**
   * 发送验证码
   */
  sendVerificationCode(data: SendVerificationCodeRequest): Promise<SendVerificationCodeResponse> {
    return api.post('/auth/send-code', data, { skipAuth: true });
  },

  /**
   * 手机号+验证码登录
   */
  loginWithPhone(data: LoginWithPhoneRequest): Promise<LoginResponse> {
    return api.post('/auth/login/phone', data, { skipAuth: true });
  },

  /**
   * 微信登录
   */
  loginWithWechat(data: LoginWithWechatRequest): Promise<LoginResponse> {
    return api.post('/auth/login/wechat', data, { skipAuth: true });
  },

  /**
   * 刷新 token
   */
  refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return api.post('/auth/refresh-token', data, { skipAuth: true });
  },

  /**
   * 退出登录
   */
  logout(): Promise<void> {
    return api.post('/auth/logout');
  },
};

