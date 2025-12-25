/**
 * 全局导航引用
 * 用于在 React 组件外部访问导航，以及在 Console 中调试
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * 获取当前路由信息
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * 获取当前路由名称
 */
export function getCurrentRouteName() {
  const route = getCurrentRoute();
  return route?.name || null;
}

/**
 * 获取导航状态
 */
export function getNavigationState() {
  if (navigationRef.isReady()) {
    return navigationRef.getState();
  }
  return null;
}

/**
 * 开发环境：将导航工具挂载到全局，方便在 Console 中调试
 */
if (__DEV__) {
  // 挂载 navigation ref 到全局
  (global as any).navigation = navigationRef;
  
  // 挂载便捷调试函数
  (global as any).getCurrentPage = () => {
    if (navigationRef.isReady()) {
      const route = navigationRef.getCurrentRoute();
      console.log('📍 当前页面:', route?.name);
      console.log('📦 页面参数:', route?.params);
      console.log('🔗 完整路由:', route);
      return route;
    }
    console.log('❌ Navigation 未就绪');
    return null;
  };

  (global as any).getNavStack = () => {
    if (navigationRef.isReady()) {
      const state = navigationRef.getState();
      const routeNames = state.routes.map(r => r.name);
      console.log('📚 导航栈:', routeNames);
      console.log('📍 当前索引:', state.index);
      console.log('🔍 完整状态:', state);
      return state;
    }
    console.log('❌ Navigation 未就绪');
    return null;
  };

  // 创建全局调试对象
  (global as any).__NAV__ = {
    get current() {
      return navigationRef.getCurrentRoute()?.name;
    },
    get route() {
      return navigationRef.getCurrentRoute();
    },
    get state() {
      return navigationRef.getState();
    },
    get stack() {
      const state = navigationRef.getState();
      return state?.routes?.map(r => r.name) || [];
    },
    get params() {
      return navigationRef.getCurrentRoute()?.params;
    }
  };

  console.log('🔧 调试工具已加载！在 Console 中输入以下命令：');
  console.log('  getCurrentPage()     - 查看当前页面');
  console.log('  getNavStack()        - 查看导航栈');
  console.log('  __NAV__.current      - 当前页面名称');
  console.log('  __NAV__.stack        - 导航栈数组');
  console.log('  __NAV__.params       - 当前页面参数');
  console.log('  navigation.getCurrentRoute() - 获取当前路由');
}

