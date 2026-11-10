export type TransactionType = 'loan' | 'repayment';

export interface Worker {
  id: string;
  company_id: string;
  name: string;
  phone?: string;
  notes?: string;
  archived: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  worker_id: string;
  type: TransactionType;
  amount: number;
  tx_date: string;
  note?: string;
  created_by?: string;
  created_at: string;
  deleted_at?: string;
}

export interface Settings {
  company_id: string;
  company_name: string;
  currency: string;
  week_start: 'monday' | 'sunday';
  theme: 'dark' | 'light';
}

export interface AuditLog {
  id: string;
  company_id: string;
  entity: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  before?: any;
  after?: any;
  user_id?: string;
  created_at: string;
}

// Derived
export interface WorkerBalance {
  worker: Worker;
  total_loaned: number;
  total_repaid: number;
  outstanding: number;
  status: 'pending' | 'cleared' | 'overpaid';
  last_repayment_date?: string;
  last_loan_date?: string;
}
