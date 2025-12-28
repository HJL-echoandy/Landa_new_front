/**
 * 混合通知 Hook（WebSocket + Push）
 */

import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AppState, AppStateStatus } from 'react-native';
import wsService from '../services/websocketService';
import {
  registerForPushNotifications,
  getDeviceInfo,
  setupNotificationReceivedListener,
  setupNotificationResponseListener,
  setBadgeCount,
  scheduleLocalNotification,
  setupFirebaseNotificationHandlers,
} from '../services/notificationService';
import notificationApi from '../api/notification';
import { WebSocketMessage } from '../types/notification';

/**
 * 混合通知管理 Hook
 * 
 * 策略：
 * - App 在前台 → 优先使用 WebSocket
 * - App 在后台 → 使用 Push
 * - 自动管理连接和断开
 */
export const useNotifications = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  /**
   * 初始化推送通知
   */
  const initializePush = useCallback(async () => {
    if (!token || !user) return;

    console.log('📱 初始化推送通知...');

    try {
      // 1. 注册推送并获取 FCM token（这会初始化 Firebase）
      console.log('🔑 正在获取 FCM Token...');
      const pushToken = await registerForPushNotifications();
      console.log('🔑 registerForPushNotifications 返回:', pushToken);
      
      // 2. 设置 Firebase 通知交互处理器（在 Firebase 初始化之后）
      console.log('🔧 正在设置 Firebase 通知处理器...');
      setupFirebaseNotificationHandlers();
      console.log('✅ Firebase 通知处理器设置完成');
      
      if (pushToken) {
        // 3. 上传 token 到后端
        try {
          const deviceInfo = getDeviceInfo();
          await notificationApi.updatePushToken({
            token: pushToken,
            ...deviceInfo,
          });
          console.log('✅ FCM Push Token 已上传到后端');
        } catch (error) {
          console.error('❌ 上传 Push Token 失败:', error);
        }
      } else {
        console.warn('⚠️ 未获取到 FCM Token');
      }

      // 4. 设置前台通知监听器
      const receivedSubscription = setupNotificationReceivedListener(
        // 新订单
        (data) => {
          console.log('🔔 新订单通知（前台）:', data);
          // 可以在这里显示自定义 UI
        },
        // 订单取消
        (data) => {
          console.log('❌ 订单取消通知（前台）:', data);
        },
        // 系统消息
        (data) => {
          console.log('📢 系统消息（前台）:', data);
        }
      );

      // 5. 设置通知点击监听器
      const responseSubscription = setupNotificationResponseListener((data) => {
        console.log('👆 用户点击了通知:', data);
      });

      // 6. 清理
      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('❌ 初始化推送通知失败:', error);
      console.error('错误详情:', JSON.stringify(error));
    }
  }, [token, user]);

  /**
   * 初始化 WebSocket
   */
  const initializeWebSocket = useCallback(() => {
    if (!token) return;

    console.log('🌐 初始化 WebSocket...');

    // 连接 WebSocket
    wsService.connect(token);

    // 监听 WebSocket 消息
    const unsubscribeMessage = wsService.onMessage((message: WebSocketMessage) => {
      // 检查是否是通知类型的消息
      const notificationTypes = ['new_order', 'order_cancelled', 'order_completed', 'system_message'];
      
      if (notificationTypes.includes(message.type)) {
        // 直接从消息中获取通知信息（使用any断言因为WebSocket消息类型可能包含通知字段）
        const notifMessage = message as any;
        const { type, title, body, data } = notifMessage;
        
        console.log(`📨 WebSocket 通知 [${type}]:`, title, body);

        // 显示本地通知
        scheduleLocalNotification(title, body, data || {});

        // 根据类型处理
        switch (type) {
          case 'new_order':
            console.log('🔔 新订单（WebSocket）:', data);
            break;

          case 'order_cancelled':
            console.log('❌ 订单取消（WebSocket）:', data);
            break;

          case 'order_completed':
            console.log('✅ 订单完成（WebSocket）:', data);
            break;

          case 'system_message':
            console.log('📢 系统消息（WebSocket）:', data);
            break;

          default:
            console.log('📨 其他通知:', type);
        }
      } else if (message.type === 'notification' && message.notification) {
        // 兼容旧的消息格式
        const { type, title, body, data } = message.notification;
        
        console.log(`📨 WebSocket 通知 [${type}]:`, title, body);
        scheduleLocalNotification(title, body, data);
      }
    });

    const unsubscribeError = wsService.onError((error) => {
      console.error('❌ WebSocket 错误:', error);
    });

    const unsubscribeClose = wsService.onClose((event) => {
      console.log('🔌 WebSocket 关闭:', event.code, event.reason);
    });

    // 清理
    return () => {
      unsubscribeMessage();
      unsubscribeError();
      unsubscribeClose();
      wsService.disconnect();
    };
  }, [token]);

  /**
   * 处理 App 状态变化
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('📲 App 状态变化:', nextAppState);

      if (nextAppState === 'active') {
        // App 进入前台 → 连接 WebSocket
        console.log('✅ App 进入前台，连接 WebSocket');
        if (token) {
          wsService.connect(token);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App 进入后台 → 断开 WebSocket（节省资源，推送通知会接管）
        console.log('⏸️ App 进入后台，断开 WebSocket');
        wsService.disconnect();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [token]);

  /**
   * 初始化通知系统
   */
  useEffect(() => {
    if (!token || !user) {
      console.log('⏭️ 未登录，跳过通知初始化');
      return;
    }

    // 初始化 Push
    const cleanupPush = initializePush();

    // 初始化 WebSocket（仅在前台）
    let cleanupWs: (() => void) | undefined;
    if (AppState.currentState === 'active') {
      cleanupWs = initializeWebSocket();
    }

    // 清理
    return () => {
      if (cleanupPush) {
        cleanupPush.then(cleanup => cleanup && cleanup());
      }
      if (cleanupWs) {
        cleanupWs();
      }
    };
  }, [token, user, initializePush, initializeWebSocket]);

  /**
   * 更新角标
   */
  const updateBadge = useCallback(async (count: number) => {
    try {
      await setBadgeCount(count);
      console.log(`🔢 角标已更新: ${count}`);
    } catch (error) {
      console.error('❌ 更新角标失败:', error);
    }
  }, []);

  return {
    updateBadge,
    isWebSocketConnected: wsService.isConnected(),
  };
};


