/**
 * 收入相关 API
 */

import { request } from './client';
import {
  IncomeSummary,
  IncomeDetail,
  IncomeStatistics,
  IncomeDetailsResponse,
  WithdrawalRequest,
  WithdrawalRecord,
  WithdrawalRecordsResponse,
} from '../types/income';
import { IncomePeriod } from '../utils/constants';

/**
 * 获取收入汇总
 */
export const getIncomeSummary = async (): Promise<IncomeSummary> => {
  return request.get<IncomeSummary>('/therapist/income/summary');
};

/**
 * 获取收入明细
 */
export const getIncomeDetails = async (params?: {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  settled?: boolean;
}): Promise<IncomeDetailsResponse> => {
  return request.get<IncomeDetailsResponse>('/therapist/income/details', { params });
};

/**
 * 获取收入统计
 */
export const getIncomeStatistics = async (params: {
  period: IncomePeriod;
  start_date?: string;
  end_date?: string;
}): Promise<IncomeStatistics> => {
  return request.get<IncomeStatistics>('/therapist/income/statistics', { params });
};

/**
 * 申请提现
 */
export const requestWithdrawal = async (data: WithdrawalRequest): Promise<{
  message: string;
  withdrawal: WithdrawalRecord;
}> => {
  return request.post('/therapist/income/withdraw', data);
};

/**
 * 获取提现记录
 */
export const getWithdrawalRecords = async (params?: {
  page?: number;
  page_size?: number;
  status?: 'pending' | 'completed' | 'failed';
}): Promise<WithdrawalRecordsResponse> => {
  return request.get<WithdrawalRecordsResponse>('/therapist/income/withdraw-history', { params });
};

/**
 * 获取提现详情
 */
export const getWithdrawalDetail = async (withdrawalId: string): Promise<WithdrawalRecord> => {
  return request.get<WithdrawalRecord>(`/therapist/income/withdraw/${withdrawalId}`);
};

const incomeApi = {
  getIncomeSummary,
  getIncomeDetails,
  getIncomeStatistics,
  requestWithdrawal,
  getWithdrawalRecords,
  getWithdrawalDetail,
};

export default incomeApi;

