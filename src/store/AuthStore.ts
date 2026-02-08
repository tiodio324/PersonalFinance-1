import { makeAutoObservable } from 'mobx';
import { User, UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/types';

// Storage keys for authentication persistence
const AUTH_STORAGE_KEY = 'personal_finance_auth';
const SESSION_EXPIRY_KEY = 'personal_finance_session_expiry';

// Session duration in milliseconds (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

const AUTH_CREDENTIALS: Record<Exclude<UserRole, 'viewer'>, string> = {
  user: 'user2026-finance',
  admin: 'admin2026-finance',
};

interface StoredAuthState {
  role: UserRole;
  expiry: number;
}

export class AuthStore {
  private _user: User = {
    role: 'viewer'
  };

  loginModalOpen = false;
  loginError: string | null = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadAuthState();
  }

  // Getters
  get user(): User {
    return this._user;
  }

  get isAuthenticated(): boolean {
    return this._user.role !== 'viewer';
  }

  get isUser(): boolean {
    return this._user.role === 'user' || this._user.role === 'admin';
  }

  get isAdmin(): boolean {
    return this._user.role === 'admin';
  }

  get permissions(): RolePermissions {
    return ROLE_PERMISSIONS[this._user.role];
  }

  get currentRole(): UserRole {
    return this._user.role;
  }

  // Permission checkers
  canViewTransactions = (): boolean => this.permissions.canViewTransactions;
  canCreateTransactions = (): boolean => this.permissions.canCreateTransactions;
  canEditTransactions = (): boolean => this.permissions.canEditTransactions;
  canDeleteTransactions = (): boolean => this.permissions.canDeleteTransactions;
  canManageCategories = (): boolean => this.permissions.canManageCategories;
  canManageBudgets = (): boolean => this.permissions.canManageBudgets;
  canViewReports = (): boolean => this.permissions.canViewReports;
  canAccessAdmin = (): boolean => this.permissions.canAccessAdmin;

  // Check if user has required role
  hasRole = (requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      viewer: 0,
      user: 1,
      admin: 2,
    };
    return roleHierarchy[this._user.role] >= roleHierarchy[requiredRole];
  };

  // Load auth state from storage
  private loadAuthState = (): void => {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      const expiryData = localStorage.getItem(SESSION_EXPIRY_KEY);

      if (storedData && expiryData) {
        const authState: StoredAuthState = JSON.parse(storedData);
        const expiry = parseInt(expiryData, 10);

        if (Date.now() < expiry && authState.role !== 'viewer') {
          this._user = { role: authState.role };
        } else {
          this.clearAuthStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      this.clearAuthStorage();
    }
  };

  // Save auth state to storage
  private saveAuthState = (): void => {
    try {
      if (this._user.role !== 'viewer') {
        const authState: StoredAuthState = {
          role: this._user.role,
          expiry: Date.now() + SESSION_DURATION,
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
        localStorage.setItem(SESSION_EXPIRY_KEY, String(authState.expiry));
      } else {
        this.clearAuthStorage();
      }
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  // Clear auth storage
  private clearAuthStorage = (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  };

  // Modal controls
  openLoginModal = (): void => {
    this.loginModalOpen = true;
    this.loginError = null;
  };

  closeLoginModal = (): void => {
    this.loginModalOpen = false;
    this.loginError = null;
    this.isLoading = false;
  };

  // Login with password
  login = async (role: Exclude<UserRole, 'viewer'>, password: string): Promise<boolean> => {
    this.isLoading = true;
    this.loginError = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (AUTH_CREDENTIALS[role] === password) {
        this._user = { role };
        this.saveAuthState();
        this.closeLoginModal();
        return true;
      } else {
        this.loginError = 'Неверный пароль';
        return false;
      }
    } catch (error) {
      this.loginError = 'Ошибка авторизации';
      console.error('Login error:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  };

  // Logout
  logout = (): void => {
    this._user = { role: 'viewer' };
    this.clearAuthStorage();
    this.loginError = null;
  };

  // Clear login error
  clearError = (): void => {
    this.loginError = null;
  };
}

// Singleton instance
export const authStore = new AuthStore();
