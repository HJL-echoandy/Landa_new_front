export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export enum TransactionType {
  INCOME = 'income',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export interface TherapistBalance {
  balance: number;
  total_income: number;
  frozen_amount: number;
  updated_at: string;
}

export interface WithdrawalRequest {
  amount: number;
  account_type: 'alipay' | 'wechat' | 'bank';
  account_name: string;
  account_no: string;
  bank_name?: string;
  remark?: string;
}

export interface WithdrawalRecord {
  id: number;
  therapist_id: number;
  amount: number;
  status: WithdrawalStatus;
  
  account_type: string;
  account_name: string;
  account_no: string;
  bank_name?: string;
  
  remark?: string;
  admin_note?: string;
  
  created_at: string;
  processed_at?: string;
}

export interface TransactionRecord {
  id: number;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

