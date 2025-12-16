import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  phone: string;
  email: string | null;
  membershipLevel: 'normal' | 'silver' | 'gold' | 'platinum';
  points: number;
  createdAt: string;
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setUserError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearUser(state) {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
    },
    addPoints(state, action: PayloadAction<number>) {
      if (state.profile) {
        state.profile.points += action.payload;
      }
    },
    deductPoints(state, action: PayloadAction<number>) {
      if (state.profile) {
        state.profile.points = Math.max(0, state.profile.points - action.payload);
      }
    },
  },
});

export const {
  setUserLoading,
  setUserProfile,
  updateUserProfile,
  setUserError,
  clearUser,
  addPoints,
  deductPoints,
} = userSlice.actions;
export default userSlice.reducer;

