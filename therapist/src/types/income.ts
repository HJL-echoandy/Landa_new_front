/**
 * 收入相关类型定义
 */

import { IncomePeriod, WithdrawalStatus } from '../utils/constants';

export interface IncomeSummary {
  today: number;
  this_week: number;
  this_month: number;
  total: number;
  available_balance: number; // 可提现余额
  frozen_balance: number; // 冻结金额
  total_withdrawn: number; // 累计提现
}

export interface IncomeDetail {
  id: string;
  order_id: string;
  order_no: string;
  service_name: string;
  customer_name: string;
  amount: number; // 收入金额
  service_price: number; // 服务原价
  commission_rate: number; // 分成比例
  settled: boolean; // 是否已结算
  settled_at?: string;
  created_at: string;
}

export interface IncomeStatistics {
  period: IncomePeriod;
  total_income: number;
  total_orders: number;
  average_income: number;
  income_by_service: {
    service_name: string;
    count: number;
    total_amount: number;
  }[];
  daily_income: {
    date: string;
    amount: number;
  }[];
}

export interface WithdrawalRequest {
  amount: number;
  account_type: 'bank' | 'alipay' | 'wechat';
  account_info: {
    account_number?: string; // 银行卡号或账号
    account_name?: string; // 开户名
    bank_name?: string; // 银行名称
  };
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  fee: number; // 手续费
  actual_amount: number; // 实际到账
  account_type: 'bank' | 'alipay' | 'wechat';
  status: WithdrawalStatus;
  applied_at: string;
  processed_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface IncomeDetailsResponse {
  records: IncomeDetail[];
  total: number;
  page: number;
  page_size: number;
}

export interface WithdrawalRecordsResponse {
  records: WithdrawalRecord[];
  total: number;
  page: number;
  page_size: number;
}

