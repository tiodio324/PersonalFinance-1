export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  date: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  date: string;
}
