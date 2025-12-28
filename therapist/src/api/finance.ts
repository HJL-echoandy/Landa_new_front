import client from './client';
import {
  TherapistBalance,
  WithdrawalRequest,
  WithdrawalRecord,
  TransactionRecord
} from '../types/finance';

const financeApi = {
  /**
   * 获取余额信息
   */
  getBalance: () => 
    client.get<TherapistBalance>('/therapist/finance/balance'),

  /**
   * 申请提现
   */
  createWithdrawal: (data: WithdrawalRequest) =>
    client.post<WithdrawalRecord>('/therapist/finance/withdrawals', data),

  /**
   * 获取提现记录
   */
  getWithdrawals: (params?: { skip?: number; limit?: number }) =>
    client.get<WithdrawalRecord[]>('/therapist/finance/withdrawals', { params }),

  /**
   * 获取资金流水
   */
  getTransactions: (params?: { skip?: number; limit?: number }) =>
    client.get<TransactionRecord[]>('/therapist/finance/transactions', { params }),
};

export default financeApi;

