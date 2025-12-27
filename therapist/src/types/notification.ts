/**
 * 通知相关类型定义
 */

export enum NotificationType {
  NEW_ORDER = 'new_order',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_COMPLETED = 'order_completed',
  SYSTEM_MESSAGE = 'system_message',
  PAYMENT_SUCCESS = 'payment_success',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  data: Record<string, any>;
  status: NotificationStatus;
  sent_via: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export interface NotificationSettings {
  notifications_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  new_order_enabled: boolean;
  order_cancelled_enabled: boolean;
  order_completed_enabled: boolean;
  system_message_enabled: boolean;
  new_order_sound: string | null;
  new_order_vibration_pattern: string | null;
  do_not_disturb_periods: Record<string, any> | null;
}

export interface UpdateNotificationSettingsRequest {
  notifications_enabled?: boolean;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  new_order_enabled?: boolean;
  order_cancelled_enabled?: boolean;
  order_completed_enabled?: boolean;
  system_message_enabled?: boolean;
  new_order_sound?: string;
  new_order_vibration_pattern?: string;
  do_not_disturb_periods?: Record<string, any>;
}

export interface PushTokenRequest {
  token: string;
  device_id?: string;
  device_name?: string;
  platform: 'ios' | 'android' | 'web';
  app_version?: string;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: 'connected' | 'notification' | 'pong' | 'error';
  message?: string;
  notification?: {
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
    priority: string;
    timestamp: string;
  };
  therapist_id?: number;
  timestamp?: string;
}

