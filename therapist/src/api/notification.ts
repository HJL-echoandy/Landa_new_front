/**
 * 通知相关 API
 */

import { request } from './client';
import {
  Notification,
  NotificationListResponse,
  NotificationSettings,
  UpdateNotificationSettingsRequest,
  PushTokenRequest,
} from '../types/notification';

/**
 * 更新 Push Token
 */
export const updatePushToken = async (data: PushTokenRequest): Promise<{ message: string }> => {
  return request.post('/therapist/notifications/push-token', data);
};

/**
 * 获取通知列表
 */
export const getNotifications = async (params?: {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
  notification_type?: string;
}): Promise<NotificationListResponse> => {
  return request.get('/therapist/notifications/notifications', { params });
};

/**
 * 标记通知为已读
 */
export const markNotificationRead = async (notificationId: number): Promise<{ message: string }> => {
  return request.put(`/therapist/notifications/notifications/${notificationId}/read`);
};

/**
 * 全部标记为已读
 */
export const markAllNotificationsRead = async (): Promise<{ message: string }> => {
  return request.put('/therapist/notifications/read-all');
};

/**
 * 获取通知设置
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  return request.get('/therapist/notifications/settings');
};

/**
 * 更新通知设置
 */
export const updateNotificationSettings = async (
  data: UpdateNotificationSettingsRequest
): Promise<{ message: string }> => {
  return request.put('/therapist/notifications/settings', data);
};

const notificationApi = {
  updatePushToken,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationSettings,
  updateNotificationSettings,
};

export default notificationApi;


