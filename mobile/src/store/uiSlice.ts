import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  isFirstLaunch: boolean;
}

const initialState: UiState = {
  isFirstLaunch: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFirstLaunch(state, action: PayloadAction<boolean>) {
      state.isFirstLaunch = action.payload;
    },
  },
});

export const { setFirstLaunch } = uiSlice.actions;
export default uiSlice.reducer;
