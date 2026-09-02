
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { User } from '../types';

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'pn_auth_token_v1';
const CACHED_USER_KEY = 'pn_cached_user_v1';

const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key: string, value: string): void {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  },
  removeItem(key: string): void {
    try { window.localStorage.removeItem(key); } catch (e) {}
  }
};

interface SafeJsonResponse<T = any> {
  ok: boolean;
  status: number;
  isJson: boolean;
  data: T | null;
  error?: string;
}

async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<SafeJsonResponse<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('<') || contentType.includes('text/html')) {
      return {
        ok: false,
        status: res.status,
        isJson: false,
        data: null,
        error: 'Server returned HTML instead of JSON API response.',
      };
    }
    try {
      const data = JSON.parse(text);
      return {
        ok: res.ok,
        status: res.status,
        isJson: true,
        data,
      };
    } catch {
      return {
        ok: false,
        status: res.status,
        isJson: false,
        data: null,
        error: 'Failed to parse JSON response from server.',
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      isJson: false,
      data: null,
      error: err?.message || 'Network request failed',
    };
  }
}

export class AuthService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    try {
      this.token = safeLocalStorage.getItem(TOKEN_KEY);
      const storedUser = safeLocalStorage.getItem(CACHED_USER_KEY);
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch {
          this.currentUser = null;
        }
      }
    } catch (e) {
      this.token = null;
      this.currentUser = null;
    }
  }

  private setSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    safeLocalStorage.setItem(TOKEN_KEY, token);
    safeLocalStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
  }

  private clearSession() {
    this.token = null;
    this.currentUser = null;
    safeLocalStorage.removeItem(TOKEN_KEY);
    safeLocalStorage.removeItem(CACHED_USER_KEY);
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  async verifySession(): Promise<boolean> {
    if (!this.token) return false;
    
    const res = await safeFetchJson<{ success: boolean; user: User }>('/api/auth/me', {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (res.isJson && res.ok && res.data?.success && res.data?.user) {
      this.setSession(this.token, res.data.user);
      return true;
    }
    
    // Invalid token or network error means we should clear and force re-login for security
    this.clearSession();
    return false;
  }

  async signIn(email: string, passwordPlain: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const res = await safeFetchJson<{ success: boolean; user: User; token: string; error?: string }>(
      '/api/auth/signin',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: passwordPlain }),
      }
    );

    if (res.isJson && res.ok && res.data?.success && res.data?.user && res.data?.token) {
      this.setSession(res.data.token, res.data.user);
      return { user: res.data.user, token: res.data.token };
    }

    throw new Error(res.data?.error || 'Invalid email or password.');
  }

  async signUp(
    name: string,
    email: string,
    passwordPlain: string,
    confirmPassword?: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const res = await safeFetchJson<{ success: boolean; user: User; token: string; error?: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password: passwordPlain, confirmPassword }),
      }
    );

    if (res.isJson && res.ok && res.data?.success && res.data?.user && res.data?.token) {
      this.setSession(res.data.token, res.data.user);
      return { user: res.data.user, token: res.data.token };
    }

    throw new Error(res.data?.error || 'Registration failed.');
  }

  async signOut(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Signout request failed on server:', err);
      }
    }
    this.clearSession();
  }

  async requestPasswordReset(email: string): Promise<{ message: string; resetCode?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const res = await safeFetchJson<{ success: boolean; message: string; resetCode?: string; error?: string }>(
      '/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      }
    );

    if (res.isJson && res.ok && res.data?.success) {
      return {
        message: res.data.message,
        resetCode: res.data.resetCode,
      };
    }
    
    throw new Error(res.data?.error || 'Failed to request password reset.');
  }

  async resetPassword(email: string, resetCode: string, newPasswordPlain: string): Promise<string> {
    const cleanEmail = email.toLowerCase().trim();
    const res = await safeFetchJson<{ success: boolean; message: string; error?: string }>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, resetCode, newPassword: newPasswordPlain }),
      }
    );

    if (res.isJson && res.ok && res.data?.success) {
      return res.data.message;
    }
    
    throw new Error(res.data?.error || 'Failed to reset password.');
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await safeFetchJson<{ success: boolean; user: User; error?: string }>(
      '/api/auth/profile',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (res.isJson && res.ok && res.data?.success && res.data?.user) {
      this.currentUser = res.data.user;
      safeLocalStorage.setItem(CACHED_USER_KEY, JSON.stringify(res.data.user));
      return res.data.user;
    }

    throw new Error(res.data?.error || 'Failed to update profile');
  }
}

export const authService = new AuthService();
