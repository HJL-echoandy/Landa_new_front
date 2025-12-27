/**
 * 常量配置文件
 */

import { Platform } from 'react-native';

// API 配置
export const API_CONFIG = {
  // Android 模拟器使用 10.0.2.2 代替 localhost
  // iOS 模拟器使用 localhost
  // 真机使用电脑的局域网 IP (如: 192.168.1.100)
  BASE_URL: 'http://192.168.13.145:8000',
  TIMEOUT: 10000,
  API_PREFIX: '/api/v1',
};

// 订单状态
export const ORDER_STATUS = {
  PENDING: 'pending', // 待接单
  ACCEPTED: 'accepted', // 已接单
  EN_ROUTE: 'en_route', // 前往中
  ARRIVED: 'arrived', // 已到达
  IN_PROGRESS: 'in_progress', // 服务中
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled', // 已取消
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// 订单状态标签
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: '待接单',
  [ORDER_STATUS.ACCEPTED]: '已接单',
  [ORDER_STATUS.EN_ROUTE]: '前往中',
  [ORDER_STATUS.ARRIVED]: '已到达',
  [ORDER_STATUS.IN_PROGRESS]: '服务中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
};

// 订单状态颜色
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: '#F59E0B', // 橙色
  [ORDER_STATUS.ACCEPTED]: '#3B82F6', // 蓝色
  [ORDER_STATUS.EN_ROUTE]: '#8B5CF6', // 紫色
  [ORDER_STATUS.ARRIVED]: '#06B6D4', // 青色
  [ORDER_STATUS.IN_PROGRESS]: '#10B981', // 绿色
  [ORDER_STATUS.COMPLETED]: '#6B7280', // 灰色
  [ORDER_STATUS.CANCELLED]: '#EF4444', // 红色
};

// 打卡类型
export const CHECKIN_TYPE = {
  ARRIVED: 'arrived', // 到达打卡
  START_SERVICE: 'start_service', // 开始服务
  END_SERVICE: 'end_service', // 结束服务
} as const;

export type CheckinType = typeof CHECKIN_TYPE[keyof typeof CHECKIN_TYPE];

// GPS 打卡距离限制 (米)
export const GPS_CHECKIN_DISTANCE = 100;

// 接单倒计时 (秒)
export const ORDER_ACCEPT_TIMEOUT = 300; // 5分钟

// 收入统计周期
export const INCOME_PERIOD = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  ALL: 'all',
} as const;

export type IncomePeriod = typeof INCOME_PERIOD[keyof typeof INCOME_PERIOD];

// 提现状态
export const WITHDRAWAL_STATUS = {
  PENDING: 'pending', // 处理中
  COMPLETED: 'completed', // 已到账
  FAILED: 'failed', // 失败
} as const;

export type WithdrawalStatus = typeof WITHDRAWAL_STATUS[keyof typeof WITHDRAWAL_STATUS];

// 提现规则
export const WITHDRAWAL_CONFIG = {
  MIN_AMOUNT: 100, // 最低提现金额
  FEE_RATE: 0.02, // 手续费率 2%
  ESTIMATED_DAYS: '1-3', // 预计到账天数
};

// 技师在线状态
export const THERAPIST_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
} as const;

export type TherapistStatus = typeof THERAPIST_STATUS[keyof typeof THERAPIST_STATUS];

// 消息类型
export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  ORDER: 'order',
  SYSTEM: 'system',
} as const;

export type MessageType = typeof MESSAGE_TYPE[keyof typeof MESSAGE_TYPE];

// 通知类型
export const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  ORDER_REMINDER: 'order_reminder',
  ORDER_CANCELLED: 'order_cancelled',
  INCOME: 'income',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

// 拒绝订单原因
export const REJECT_REASONS = [
  '时间冲突',
  '距离太远',
  '服务类型不匹配',
  '个人原因',
  '其他',
];

// 评价等级
export const RATING_LEVELS = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  POOR: 2,
  VERY_POOR: 1,
} as const;

// 日期格式
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm',
  FULL: 'YYYY-MM-DD HH:mm:ss',
};

// 分页配置
export const PAGINATION = {
  PAGE_SIZE: 20,
  INITIAL_PAGE: 1,
};

// 图片配置
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  QUALITY: 0.8,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
};

// 地图导航应用
export const MAP_APPS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  GAODE: 'gaode', // 高德地图
  BAIDU: 'baidu', // 百度地图
} as const;

export type MapApp = typeof MAP_APPS[keyof typeof MAP_APPS];

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请重试',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '没有权限执行此操作',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
};

