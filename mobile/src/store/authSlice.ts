import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  phoneNumber: string | null;
  loginMethod: 'phone' | 'wechat' | null;
  tokenExpiry: number | null; // Unix timestamp
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  userId: null,
  phoneNumber: null,
  loginMethod: null,
  tokenExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string;
        userId: string;
        phoneNumber?: string;
        loginMethod: 'phone' | 'wechat';
        tokenExpiry?: number;
      }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.userId = action.payload.userId;
      state.phoneNumber = action.payload.phoneNumber || null;
      state.loginMethod = action.payload.loginMethod;
      state.tokenExpiry = action.payload.tokenExpiry || null;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.phoneNumber = null;
      state.loginMethod = null;
      state.tokenExpiry = null;
    },
    refreshTokenSuccess(
      state,
      action: PayloadAction<{ token: string; tokenExpiry?: number }>
    ) {
      state.token = action.payload.token;
      state.tokenExpiry = action.payload.tokenExpiry || null;
    },
  },
});

export const { loginSuccess, logout, refreshTokenSuccess } = authSlice.actions;
export default authSlice.reducer;

