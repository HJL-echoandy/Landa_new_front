import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'therapist_assigned'
  | 'en_route'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  duration: number; // minutes
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  therapistId: string | null;
  therapistName: string | null;
  therapistAvatar: string | null;
  addressId: string;
  addressText: string;
  scheduledDate: string; // ISO string
  scheduledTime: string;
  subtotal: number;
  discount: number;
  pointsUsed: number;
  total: number;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderState {
  orders: Order[];
  currentOrderId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrderId: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addOrder(state, action: PayloadAction<Order>) {
      // Prepend new order (most recent first)
      state.orders.unshift(action.payload);
      state.currentOrderId = action.payload.id;
    },
    updateOrder(state, action: PayloadAction<Partial<Order> & { id: string }>) {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>
    ) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        order.updatedAt = new Date().toISOString();
      }
    },
    setCurrentOrder(state, action: PayloadAction<string | null>) {
      state.currentOrderId = action.payload;
    },
    setOrderError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearOrders(state) {
      state.orders = [];
      state.currentOrderId = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setOrderLoading,
  setOrders,
  addOrder,
  updateOrder,
  updateOrderStatus,
  setCurrentOrder,
  setOrderError,
  clearOrders,
} = orderSlice.actions;
export default orderSlice.reducer;

