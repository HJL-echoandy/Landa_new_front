/**
 * 认证状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TherapistProfile } from '../types/user';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: TherapistProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
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
    loginSuccess: (state, action: PayloadAction<{ token: string; refreshToken?: string; user: TherapistProfile }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.user = action.payload.user;
      state.isLoading = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<TherapistProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  loginSuccess, 
  updateUser, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer;

