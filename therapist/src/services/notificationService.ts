/**
 * Expo 推送通知服务
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { navigationRef } from '../navigation/navigationRef';
import messaging from '@react-native-firebase/messaging';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // 显示 Alert
    shouldPlaySound: true,  // 播放声音
    shouldSetBadge: true,   // 显示角标
    shouldShowBanner: true, // 显示横幅（iOS）
    shouldShowList: true,   // 显示在通知列表
  }),
});

import firebase from '@react-native-firebase/app';

// ... 其他 import

/**
 * 请求通知权限并获取 FCM Push Token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  console.log('🚀 registerForPushNotifications 函数被调用');
  
  let token: string | null = null;

  // 1. 检查是否是真实设备
  console.log('📱 检查设备类型，Device.isDevice =', Device.isDevice);
  if (!Device.isDevice) {
    console.warn('⚠️ 推送通知需要在真实设备上使用');
    return null;
  }

  try {
    // 确保 Firebase 已初始化
    if (!firebase.apps.length) {
      console.log('🔥 Firebase 尚未初始化，正在尝试初始化...');
      const firebaseConfig = {
        apiKey: "AIzaSyD1tXcdnRFAX83EvWW8WxCV_Wqkn85kol8",
        appId: "1:600766517998:android:4aede6718156d4f6d719ff",
        projectId: "landa-486fe",
        messagingSenderId: "600766517998",
        storageBucket: "landa-486fe.firebasestorage.app",
        databaseURL: "https://landa-486fe.firebaseio.com",
      };
      await firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase 初始化完成');
    }

    console.log('🔔 开始请求 FCM 权限和 Token...');
    
    // 2. 请求 Firebase 通知权限
    if (Platform.OS === 'android') {
      try {
        const authStatus = await messaging().requestPermission();
        console.log('📋 权限状态:', authStatus);
        
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('⚠️ 未获得 Firebase 通知权限');
          return null;
        }
        
        console.log('✅ Firebase 通知权限已获得');
      } catch (permError) {
        console.error('❌ 请求权限时出错:', permError);
      }
    }

    // 3. 获取 FCM Token
    console.log('📲 正在获取 FCM Token...');
    token = await messaging().getToken();
    console.log('📱 FCM Push Token:', token);

    // ... 后续代码
    if (Platform.OS === 'android') {
      // 订单通知频道
      await Notifications.setNotificationChannelAsync('orders', {
        name: '订单通知',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        lightColor: '#FFD600',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // 系统消息频道
      await Notifications.setNotificationChannelAsync('system', {
        name: '系统消息',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        showBadge: true,
      });
      
      console.log('✅ Android 通知频道已配置');
    }

    // 5. 监听 Token 刷新
    messaging().onTokenRefresh(newToken => {
      console.log('🔄 FCM Token 已刷新:', newToken);
      // TODO: 可以在这里上传新 Token 到后端
    });

    return token;
  } catch (error: any) {
    console.error('❌ 获取 FCM Push Token 失败:', error);
    console.error('错误详情:', JSON.stringify(error));
    
    // Firebase 未配置的错误是预期的，不需要展示给用户
    if (error?.message?.includes('Firebase') || error?.message?.includes('google-services')) {
      console.warn('⚠️ Firebase 未配置，推送通知功能暂时不可用（这不影响应用的其他功能）');
    }
    return null;
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  return {
    device_id: Constants.sessionId || Device.deviceName || 'unknown',
    device_name: Device.deviceName || 'Unknown Device',
    platform: Platform.OS as 'ios' | 'android' | 'web',
    app_version: Constants.expoConfig?.version || '1.0.0',
  };
}

/**
 * 处理收到的通知（App 在前台）
 */
export function setupNotificationReceivedListener(
  onNewOrder?: (data: any) => void,
  onOrderCancelled?: (data: any) => void,
  onSystemMessage?: (data: any) => void
) {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📬 收到通知（前台）:', notification);

    const data = notification.request.content.data;
    const type = data.type as string;

    // 根据类型处理
    switch (type) {
      case 'new_order':
        console.log('🔔 新订单通知');
        if (onNewOrder) {
          onNewOrder(data);
        }
        break;

      case 'order_cancelled':
        console.log('❌ 订单取消通知');
        if (onOrderCancelled) {
          onOrderCancelled(data);
        }
        break;

      case 'system_message':
        console.log('📢 系统消息');
        if (onSystemMessage) {
          onSystemMessage(data);
        }
        break;

      default:
        console.log('📨 其他通知:', type);
    }
  });

  return subscription;
}

/**
 * 处理通知点击（用户点击通知）
 */
export function setupNotificationResponseListener(
  onNotificationClick?: (data: any) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 用户点击通知:', response);

    const data = response.notification.request.content.data;
    const type = data.type as string;
    const screen = data.screen as string;

    // 回调
    if (onNotificationClick) {
      onNotificationClick(data);
    }

    // 导航到相应页面
    if (navigationRef.isReady()) {
      switch (type) {
        case 'new_order':
        case 'order_cancelled':
          if (data.orderId && screen === 'OrderDetails') {
            (navigationRef.navigate as any)('OrderDetails', { id: data.orderId });
          } else {
            (navigationRef.navigate as any)('Orders');
          }
          break;

        case 'system_message':
          (navigationRef.navigate as any)('Notifications');
          break;

        default:
          console.log('📨 未知通知类型，不进行导航');
      }
    } else {
      console.warn('⚠️ 导航未就绪');
    }
  });

  return subscription;
}

/**
 * 发送本地通知（测试用）
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  delaySeconds: number = 0
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } as any : null,
    });
    
    console.log('✅ 本地通知已发送');
  } catch (error) {
    console.error('❌ 发送本地通知失败:', error);
  }
}

/**
 * 取消所有通知
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🗑️ 已取消所有通知');
}

/**
 * 获取未读通知数（角标）
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * 设置未读通知数（角标）
 */
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * 清除角标
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * 设置 Firebase 前台和通知交互处理
 * 注意：后台消息处理器必须在 index.ts 中设置
 */
export function setupFirebaseNotificationHandlers() {
  try {
    // 处理用户点击通知打开应用的情况（后台状态）
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📲 用户点击通知打开应用:', remoteMessage);
      
      // 根据通知类型导航到相应页面
      if (remoteMessage.data?.screen) {
        const screen = remoteMessage.data.screen as string;
        const params = remoteMessage.data;
        
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(screen as any, params as any);
          }
        }, 1000);
      }
    });

    // 检查应用是否是通过通知启动的（完全退出状态）
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📲 应用由通知启动:', remoteMessage);
          
          // 根据通知类型导航到相应页面
          if (remoteMessage.data?.screen) {
            const screen = remoteMessage.data.screen as string;
            const params = remoteMessage.data;
            
            setTimeout(() => {
              if (navigationRef.isReady()) {
                navigationRef.navigate(screen as any, params as any);
              }
            }, 2000);
          }
        }
      });

    console.log('✅ Firebase 通知交互处理器已设置');
  } catch (error) {
    console.warn('⚠️ 设置 Firebase 通知处理器失败:', error);
  }
}

