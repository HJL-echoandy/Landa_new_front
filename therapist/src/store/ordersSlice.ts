/**
 * 订单状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderDetail } from '../types/order';
import { OrderStatus } from '../utils/constants';

interface OrdersState {
  orders: Order[];
  currentOrder: OrderDetail | null;
  pendingOrders: Order[]; // 待接单
  acceptedOrders: Order[]; // 进行中
  completedOrders: Order[]; // 已完成
  isLoading: boolean;
  error: string | null;
  filter: OrderStatus | 'all';
  hasNewOrder: boolean; // 是否有新订单
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  pendingOrders: [],
  acceptedOrders: [],
  completedOrders: [],
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
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
      
      // 分类订单
      state.pendingOrders = action.payload.filter(o => o.status === 'pending');
      state.acceptedOrders = action.payload.filter(o => 
        ['accepted', 'en_route', 'arrived', 'in_progress'].includes(o.status)
      );
      state.completedOrders = action.payload.filter(o => 
        ['completed', 'cancelled'].includes(o.status)
      );
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
      if (action.payload.status === 'pending') {
        state.pendingOrders.unshift(action.payload);
        state.hasNewOrder = true;
      }
    },
    updateOrder: (state, action: PayloadAction<{ id: string; updates: Partial<Order> }>) => {
      const { id, updates } = action.payload;
      
      // 更新所有订单列表
      const index = state.orders.findIndex(o => o.id === id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...updates };
      }
      
      // 重新分类
      if (updates.status) {
        state.pendingOrders = state.orders.filter(o => o.status === 'pending');
        state.acceptedOrders = state.orders.filter(o => 
          ['accepted', 'en_route', 'arrived', 'in_progress'].includes(o.status)
        );
        state.completedOrders = state.orders.filter(o => 
          ['completed', 'cancelled'].includes(o.status)
        );
      }
      
      // 更新当前订单
      if (state.currentOrder && state.currentOrder.id === id) {
        state.currentOrder = { ...state.currentOrder, ...updates };
      }
    },
    setCurrentOrder: (state, action: PayloadAction<OrderDetail | null>) => {
      state.currentOrder = action.payload;
    },
    setFilter: (state, action: PayloadAction<OrderStatus | 'all'>) => {
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
  setFilter,
  clearNewOrderFlag,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;

