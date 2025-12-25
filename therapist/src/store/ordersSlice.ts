/**
 * 订单状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TherapistOrder, TherapistOrderDetail, BookingStatus, OrderStats } from '../types/order';

interface OrdersState {
  orders: TherapistOrder[];
  currentOrder: TherapistOrderDetail | null;
  pendingOrders: TherapistOrder[];    // 待接单
  inProgressOrders: TherapistOrder[]; // 进行中（已接单+前往中+服务中）
  completedOrders: TherapistOrder[];  // 已完成
  stats: OrderStats | null;           // 订单统计
  isLoading: boolean;
  error: string | null;
  filter: BookingStatus | 'all';
  hasNewOrder: boolean; // 是否有新订单通知
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  pendingOrders: [],
  inProgressOrders: [],
  completedOrders: [],
  stats: null,
  isLoading: false,
  error: null,
  filter: 'all',
  hasNewOrder: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setOrders: (state, action: PayloadAction<TherapistOrder[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
      
      // 分类订单
      state.pendingOrders = action.payload.filter(o => o.status === BookingStatus.PENDING);
      state.inProgressOrders = action.payload.filter(o => 
        [BookingStatus.CONFIRMED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS].includes(o.status)
      );
      state.completedOrders = action.payload.filter(o => o.status === BookingStatus.COMPLETED);
    },
    addOrder: (state, action: PayloadAction<TherapistOrder>) => {
      state.orders.unshift(action.payload);
      if (action.payload.status === BookingStatus.PENDING) {
        state.pendingOrders.unshift(action.payload);
        state.hasNewOrder = true;
      }
    },
    updateOrder: (state, action: PayloadAction<{ id: number; updates: Partial<TherapistOrder> }>) => {
      const { id, updates } = action.payload;
      
      // 更新所有订单列表
      const index = state.orders.findIndex(o => o.id === id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updates };
      }
      
      // 重新分类
      if (updates.status) {
        state.pendingOrders = state.orders.filter(o => o.status === BookingStatus.PENDING);
        state.inProgressOrders = state.orders.filter(o => 
          [BookingStatus.CONFIRMED, BookingStatus.EN_ROUTE, BookingStatus.IN_PROGRESS].includes(o.status)
        );
        state.completedOrders = state.orders.filter(o => o.status === BookingStatus.COMPLETED);
      }
      
      // 更新当前订单
      if (state.currentOrder && state.currentOrder.id === id) {
        state.currentOrder = { ...state.currentOrder, ...updates };
      }
    },
    setCurrentOrder: (state, action: PayloadAction<TherapistOrderDetail | null>) => {
      state.currentOrder = action.payload;
    },
    setStats: (state, action: PayloadAction<OrderStats>) => {
      state.stats = action.payload;
    },
    setFilter: (state, action: PayloadAction<BookingStatus | 'all'>) => {
      state.filter = action.payload;
    },
    clearNewOrderFlag: (state) => {
      state.hasNewOrder = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setOrders,
  addOrder,
  updateOrder,
  setCurrentOrder,
  setStats,
  setFilter,
  clearNewOrderFlag,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;

