export type UserRole = 'viewer' | 'user' | 'admin';

export interface User {
  role: UserRole;
}

export interface RolePermissions {
  canViewTransactions: boolean;
  canCreateTransactions: boolean;
  canEditTransactions: boolean;
  canDeleteTransactions: boolean;
  canManageCategories: boolean;
  canManageBudgets: boolean;
  canViewReports: boolean;
  canAccessAdmin: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: {
    canViewTransactions: true,
    canCreateTransactions: false,
    canEditTransactions: false,
    canDeleteTransactions: false,
    canManageCategories: false,
    canManageBudgets: false,
    canViewReports: true,
    canAccessAdmin: false,
  },
  user: {
    canViewTransactions: true,
    canCreateTransactions: true,
    canEditTransactions: true,
    canDeleteTransactions: true,
    canManageCategories: true,
    canManageBudgets: true,
    canViewReports: true,
    canAccessAdmin: false,
  },
  admin: {
    canViewTransactions: true,
    canCreateTransactions: true,
    canEditTransactions: true,
    canDeleteTransactions: true,
    canManageCategories: true,
    canManageBudgets: true,
    canViewReports: true,
    canAccessAdmin: true,
  },
};
