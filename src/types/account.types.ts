export type AccountType = 'cash' | 'card' | 'savings' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
}
