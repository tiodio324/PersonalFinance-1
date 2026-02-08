export type PageId = 'home' | 'transactions' | 'reports' | 'admin' | 'admin-categories' | 'admin-accounts' | 'admin-budgets';

export interface PageConfig {
  id: PageId;
  title: string;
  icon: string;
  requiresAuth: boolean;
  requiredRole?: 'user' | 'admin';
  showInNav: boolean;
  parentId?: PageId;
}

export const PAGES_CONFIG: Record<PageId, PageConfig> = {
  home: {
    id: 'home',
    title: 'Главная',
    icon: 'home',
    requiresAuth: false,
    showInNav: true,
  },
  transactions: {
    id: 'transactions',
    title: 'Транзакции',
    icon: 'credit-card',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: true,
  },
  reports: {
    id: 'reports',
    title: 'Отчёты',
    icon: 'bar-chart',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: true,
  },
  admin: {
    id: 'admin',
    title: 'Настройки',
    icon: 'settings',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: true,
  },
  'admin-categories': {
    id: 'admin-categories',
    title: 'Категории',
    icon: 'folder',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: false,
    parentId: 'admin',
  },
  'admin-accounts': {
    id: 'admin-accounts',
    title: 'Счета',
    icon: 'wallet',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: false,
    parentId: 'admin',
  },
  'admin-budgets': {
    id: 'admin-budgets',
    title: 'Бюджеты',
    icon: 'target',
    requiresAuth: true,
    requiredRole: 'user',
    showInNav: false,
    parentId: 'admin',
  },
};
