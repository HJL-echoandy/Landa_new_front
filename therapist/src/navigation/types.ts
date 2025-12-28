/**
 * 导航类型定义
 */

import { OrderDetail } from '../types/order';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  
  // 订单相关
  OrderDetails: { orderId: string };
  Navigation: { orderId: string };
  CheckIn: { orderId: string; type: 'arrived' | 'start' | 'complete' };
  ServiceInProgress: { orderId: string };
  CustomerFeedback: { 
    orderId: string; 
    customerName: string; 
    customerAvatar?: string;
    serviceName: string;
    serviceTime: string;
  };
  
  // 收入相关
  IncomeDetails: undefined;
  Withdraw: undefined;
  WithdrawHistory: undefined;
  
  // 个人中心相关
  EditProfile: undefined;
  Schedule: undefined;
  Settings: undefined;
  Reviews: undefined;
  Statistics: undefined;
  
  // 消息相关
  Chat: { 
    customerId: string;
    customerName: string;
    orderId?: string;
  };
};

export type MainTabParamList = {
  Orders: undefined; // 订单首页
  Income: undefined; // 收入
  Messages: undefined; // 消息
  Profile: undefined; // 我的
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

