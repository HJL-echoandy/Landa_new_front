/**
 * 收入状态管理
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IncomeSummary, IncomeDetail, IncomeStatistics, WithdrawalRecord } from '../types/income';
import { IncomePeriod } from '../utils/constants';

interface IncomeState {
  summary: IncomeSummary | null;
  details: IncomeDetail[];
  statistics: IncomeStatistics | null;
  withdrawalRecords: WithdrawalRecord[];
  isLoading: boolean;
  error: string | null;
  selectedPeriod: IncomePeriod;
}

const initialState: IncomeState = {
  summary: null,
  details: [],
  statistics: null,
  withdrawalRecords: [],
  isLoading: false,
  error: null,
  selectedPeriod: 'this_month',
};

const incomeSlice = createSlice({
  name: 'income',
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
    setSummary: (state, action: PayloadAction<IncomeSummary>) => {
      state.summary = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setDetails: (state, action: PayloadAction<IncomeDetail[]>) => {
      state.details = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addDetail: (state, action: PayloadAction<IncomeDetail>) => {
      state.details.unshift(action.payload);
      
      // 更新汇总数据
      if (state.summary) {
        state.summary.total += action.payload.amount;
        state.summary.available_balance += action.payload.amount;
      }
    },
    setStatistics: (state, action: PayloadAction<IncomeStatistics>) => {
      state.statistics = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setWithdrawalRecords: (state, action: PayloadAction<WithdrawalRecord[]>) => {
      state.withdrawalRecords = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addWithdrawalRecord: (state, action: PayloadAction<WithdrawalRecord>) => {
      state.withdrawalRecords.unshift(action.payload);
      
      // 更新余额
      if (state.summary) {
        state.summary.available_balance -= action.payload.amount;
        state.summary.frozen_balance += action.payload.amount;
      }
    },
    updateWithdrawalRecord: (state, action: PayloadAction<{ id: string; updates: Partial<WithdrawalRecord> }>) => {
      const { id, updates } = action.payload;
      const index = state.withdrawalRecords.findIndex(r => r.id === id);
      if (index !== -1) {
        state.withdrawalRecords[index] = { ...state.withdrawalRecords[index], ...updates };
        
        // 更新余额状态
        if (updates.status && state.summary) {
          const record = state.withdrawalRecords[index];
          if (updates.status === 'completed') {
            state.summary.frozen_balance -= record.amount;
            state.summary.total_withdrawn += record.actual_amount;
          } else if (updates.status === 'failed') {
            state.summary.frozen_balance -= record.amount;
            state.summary.available_balance += record.amount;
          }
        }
      }
    },
    setSelectedPeriod: (state, action: PayloadAction<IncomePeriod>) => {
      state.selectedPeriod = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setSummary,
  setDetails,
  addDetail,
  setStatistics,
  setWithdrawalRecords,
  addWithdrawalRecord,
  updateWithdrawalRecord,
  setSelectedPeriod,
  clearError,
} = incomeSlice.actions;

export default incomeSlice.reducer;

