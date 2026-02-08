export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}
