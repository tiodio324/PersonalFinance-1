export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
}
