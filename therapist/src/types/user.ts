/**
 * 用户/技师相关类型定义
 */

import { TherapistStatus } from '../utils/constants';

export interface TherapistProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  bio?: string; // 个人简介
  experience_years?: number; // 工作年限
  specialties: string[]; // 擅长服务类型
  certifications: Certification[]; // 证书
  status: TherapistStatus;
  rating: number; // 平均评分
  total_reviews: number; // 总评价数
  total_orders: number; // 完成订单数
  on_time_rate: number; // 准时率
  positive_rate: number; // 好评率
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string; // 证书名称
  issuer: string; // 颁发机构
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  image_url?: string;
  verified: boolean; // 是否已验证
}

export interface TherapistStats {
  today_orders: number;
  today_income: number;
  this_week_orders: number;
  this_week_income: number;
  this_month_orders: number;
  this_month_income: number;
  total_orders: number;
  total_income: number;
  rating: number;
  total_reviews: number;
  positive_reviews: number;
  positive_rate: number;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  bio?: string;
  experience_years?: number;
  specialties?: string[];
}

export interface UpdateStatusRequest {
  status: TherapistStatus;
}

export interface LoginRequest {
  phone: string;
  code: string; // 后端使用 'code' 字段
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  therapist: TherapistInfo; // 后端返回 'therapist' 字段
}

export interface TherapistInfo {
  id: number;
  user_id: number;
  phone: string;
  nickname: string;
  avatar: string;
  role: string;
  name: string;
  title: string;
  experience_years: number;
  rating: number;
  review_count: number;  // 与后端一致
  completed_count: number;  // 与后端一致
  is_verified: boolean;
  is_active: boolean;  // 与后端一致
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  verification_code: string;
  certifications?: {
    name: string;
    image_url: string;
  }[];
}

export interface VerificationCodeRequest {
  phone: string;
}

export interface VerificationCodeResponse {
  message: string;
}

