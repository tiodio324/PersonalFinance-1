import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  TransactionFormData,
  Category, 
  CategoryFormData,
  Account, 
  AccountFormData,
  Budget, 
  BudgetFormData,
  FilterParams 
} from '@/types';
import FirebaseService from '@/firebase';
import { authStore } from './AuthStore';

export class DataStore {
  // Data collections
  transactions: Transaction[] = [];
  categories: Category[] = [];
  accounts: Account[] = [];
  budgets: Budget[] = [];

  // Loading states
  transactionsLoading = false;
  categoriesLoading = false;
  accountsLoading = false;
  budgetsLoading = false;

  // Error states
  error: string | null = null;

  // Filters
  filters: FilterParams = {};

  // Selected items
  selectedCategoryId: string | null = null;
  selectedAccountId: string | null = null;
  selectedPeriod: 'day' | 'week' | 'month' | 'year' = 'month';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ============================================
  // Computed values
  // ============================================

  get filteredTransactions(): Transaction[] {
    let result = this.transactions.filter(t => t.isActive);

    if (this.filters.categoryId) {
      result = result.filter(t => t.categoryId === this.filters.categoryId);
    }

    if (this.filters.accountId) {
      result = result.filter(t => t.accountId === this.filters.accountId);
    }

    if (this.filters.type) {
      result = result.filter(t => t.type === this.filters.type);
    }

    if (this.filters.startDate) {
      result = result.filter(t => t.date >= this.filters.startDate!);
    }

    if (this.filters.endDate) {
      result = result.filter(t => t.date <= this.filters.endDate!);
    }

    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  get activeCategories(): Category[] {
    return this.categories.filter(c => c.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  get incomeCategories(): Category[] {
    return this.activeCategories.filter(c => c.type === 'income');
  }

  get expenseCategories(): Category[] {
    return this.activeCategories.filter(c => c.type === 'expense');
  }

  get activeAccounts(): Account[] {
    return this.accounts.filter(a => a.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  get activeBudgets(): Budget[] {
    return this.budgets.filter(b => b.isActive);
  }

  get totalBalance(): number {
    return this.activeAccounts.reduce((sum, a) => sum + a.balance, 0);
  }

  get totalIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpense(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get transactionsByCategory(): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const transaction of this.filteredTransactions) {
      if (!grouped[transaction.categoryId]) {
        grouped[transaction.categoryId] = 0;
      }
      grouped[transaction.categoryId] += transaction.amount;
    }
    
    return grouped;
  }

  getCategoryById = (id: string): Category | undefined => {
    return this.categories.find(c => c.id === id);
  };

  getAccountById = (id: string): Account | undefined => {
    return this.accounts.find(a => a.id === id);
  };

  getBudgetById = (id: string): Budget | undefined => {
    return this.budgets.find(b => b.id === id);
  };

  getBudgetSpent = (budgetId: string): number => {
    const budget = this.getBudgetById(budgetId);
    if (!budget) return 0;

    return this.transactions
      .filter(t => t.categoryId === budget.categoryId && t.type === 'expense' && t.isActive)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // ============================================
  // Data loading methods
  // ============================================

  loadAllData = async (): Promise<void> => {
    await Promise.all([
      this.loadCategories(),
      this.loadAccounts(),
      this.loadTransactions(),
      this.loadBudgets(),
    ]);
  };

  loadTransactions = async (): Promise<void> => {
    this.transactionsLoading = true;
    this.error = null;
    
    try {
      const data = await FirebaseService.getData<Record<string, Transaction>>('transactions');
      runInAction(() => {
        this.transactions = data ? Object.values(data) : [];
        this.transactionsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки транзакций';
        this.transactionsLoading = false;
        console.error('Load transactions error:', error);
      });
    }
  };

  loadCategories = async (): Promise<void> => {
    this.categoriesLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Category>>('categories');
      runInAction(() => {
        this.categories = data ? Object.values(data) : [];
        this.categoriesLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки категорий';
        this.categoriesLoading = false;
        console.error('Load categories error:', error);
      });
    }
  };

  loadAccounts = async (): Promise<void> => {
    this.accountsLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Account>>('accounts');
      runInAction(() => {
        this.accounts = data ? Object.values(data) : [];
        this.accountsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки счетов';
        this.accountsLoading = false;
        console.error('Load accounts error:', error);
      });
    }
  };

  loadBudgets = async (): Promise<void> => {
    this.budgetsLoading = true;
    
    try {
      const data = await FirebaseService.getData<Record<string, Budget>>('budgets');
      runInAction(() => {
        this.budgets = data ? Object.values(data) : [];
        this.budgetsLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Ошибка загрузки бюджетов';
        this.budgetsLoading = false;
        console.error('Load budgets error:', error);
      });
    }
  };

  // ============================================
  // CRUD operations for Transactions
  // ============================================

  createTransaction = async (data: TransactionFormData): Promise<Transaction | null> => {
    if (!authStore.canCreateTransactions()) return null;

    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`transactions/${transaction.id}`, transaction);
      
      // Update account balance
      const account = this.getAccountById(data.accountId);
      if (account) {
        const balanceChange = data.type === 'income' ? data.amount : -data.amount;
        await this.updateAccountBalance(data.accountId, account.balance + balanceChange);
      }

      runInAction(() => {
        this.transactions.push(transaction);
      });
      return transaction;
    } catch (error) {
      console.error('Create transaction error:', error);
      return null;
    }
  };

  updateTransaction = async (id: string, data: Partial<TransactionFormData>): Promise<boolean> => {
    if (!authStore.canEditTransactions()) return false;

    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    const updated: Transaction = {
      ...this.transactions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`transactions/${id}`, updated);
      runInAction(() => {
        this.transactions[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update transaction error:', error);
      return false;
    }
  };

  deleteTransaction = async (id: string): Promise<boolean> => {
    if (!authStore.canDeleteTransactions()) return false;

    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;

    const transaction = this.transactions[index];

    try {
      await FirebaseService.updateData(`transactions/${id}`, { isActive: false });
      
      // Revert account balance
      const account = this.getAccountById(transaction.accountId);
      if (account) {
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        await this.updateAccountBalance(transaction.accountId, account.balance + balanceChange);
      }

      runInAction(() => {
        this.transactions[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete transaction error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Categories
  // ============================================

  createCategory = async (data: CategoryFormData): Promise<Category | null> => {
    if (!authStore.canManageCategories()) return null;

    const now = new Date().toISOString();
    const category: Category = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
    };

    try {
      await FirebaseService.setData(`categories/${category.id}`, category);
      runInAction(() => {
        this.categories.push(category);
      });
      return category;
    } catch (error) {
      console.error('Create category error:', error);
      return null;
    }
  };

  updateCategory = async (id: string, data: Partial<CategoryFormData>): Promise<boolean> => {
    if (!authStore.canManageCategories()) return false;

    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    const updated: Category = {
      ...this.categories[index],
      ...data,
    };

    try {
      await FirebaseService.setData(`categories/${id}`, updated);
      runInAction(() => {
        this.categories[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update category error:', error);
      return false;
    }
  };

  deleteCategory = async (id: string): Promise<boolean> => {
    if (!authStore.canManageCategories()) return false;

    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`categories/${id}`, { isActive: false });
      runInAction(() => {
        this.categories[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete category error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Accounts
  // ============================================

  createAccount = async (data: AccountFormData): Promise<Account | null> => {
    if (!authStore.canManageCategories()) return null;

    const now = new Date().toISOString();
    const account: Account = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`accounts/${account.id}`, account);
      runInAction(() => {
        this.accounts.push(account);
      });
      return account;
    } catch (error) {
      console.error('Create account error:', error);
      return null;
    }
  };

  updateAccount = async (id: string, data: Partial<AccountFormData>): Promise<boolean> => {
    if (!authStore.canManageCategories()) return false;

    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) return false;

    const updated: Account = {
      ...this.accounts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`accounts/${id}`, updated);
      runInAction(() => {
        this.accounts[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update account error:', error);
      return false;
    }
  };

  updateAccountBalance = async (id: string, newBalance: number): Promise<boolean> => {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`accounts/${id}`, { 
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });
      runInAction(() => {
        this.accounts[index].balance = newBalance;
      });
      return true;
    } catch (error) {
      console.error('Update account balance error:', error);
      return false;
    }
  };

  deleteAccount = async (id: string): Promise<boolean> => {
    if (!authStore.canManageCategories()) return false;

    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`accounts/${id}`, { isActive: false });
      runInAction(() => {
        this.accounts[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    }
  };

  // ============================================
  // CRUD operations for Budgets
  // ============================================

  createBudget = async (data: BudgetFormData): Promise<Budget | null> => {
    if (!authStore.canManageBudgets()) return null;

    const now = new Date().toISOString();
    const budget: Budget = {
      id: uuidv4(),
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await FirebaseService.setData(`budgets/${budget.id}`, budget);
      runInAction(() => {
        this.budgets.push(budget);
      });
      return budget;
    } catch (error) {
      console.error('Create budget error:', error);
      return null;
    }
  };

  updateBudget = async (id: string, data: Partial<BudgetFormData>): Promise<boolean> => {
    if (!authStore.canManageBudgets()) return false;

    const index = this.budgets.findIndex(b => b.id === id);
    if (index === -1) return false;

    const updated: Budget = {
      ...this.budgets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await FirebaseService.setData(`budgets/${id}`, updated);
      runInAction(() => {
        this.budgets[index] = updated;
      });
      return true;
    } catch (error) {
      console.error('Update budget error:', error);
      return false;
    }
  };

  deleteBudget = async (id: string): Promise<boolean> => {
    if (!authStore.canManageBudgets()) return false;

    const index = this.budgets.findIndex(b => b.id === id);
    if (index === -1) return false;

    try {
      await FirebaseService.updateData(`budgets/${id}`, { isActive: false });
      runInAction(() => {
        this.budgets[index].isActive = false;
      });
      return true;
    } catch (error) {
      console.error('Delete budget error:', error);
      return false;
    }
  };

  // ============================================
  // Filter and selection methods
  // ============================================

  setFilter = (key: keyof FilterParams, value: string | undefined): void => {
    this.filters = { ...this.filters, [key]: value };
  };

  clearFilters = (): void => {
    this.filters = {};
  };

  setSelectedCategory = (categoryId: string | null): void => {
    this.selectedCategoryId = categoryId;
    this.filters.categoryId = categoryId || undefined;
  };

  setSelectedAccount = (accountId: string | null): void => {
    this.selectedAccountId = accountId;
    this.filters.accountId = accountId || undefined;
  };

  setSelectedPeriod = (period: 'day' | 'week' | 'month' | 'year'): void => {
    this.selectedPeriod = period;
  };

  clearError = (): void => {
    this.error = null;
  };
}

// Singleton instance
export const dataStore = new DataStore();
