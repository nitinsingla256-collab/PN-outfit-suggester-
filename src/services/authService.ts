/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../types';
import { INITIAL_USER } from '../data/seedData';

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'pn_auth_token_v1';
const LOCAL_USER_KEY = 'pn_local_current_user_v1';
const LOCAL_USERS_STORE_KEY = 'pn_local_users_store_v1';

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
      const storedUser = safeLocalStorage.getItem(LOCAL_USER_KEY);
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch {
          this.currentUser = null;
        }
      }
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
  }

  getCurrentUser(): User | null { return this.currentUser; }

  getToken(): string | null {
    if (!this.token) {
      try {
        this.token = safeLocalStorage.getItem(TOKEN_KEY);
      } catch (e) {
        console.warn('localStorage access denied', e);
      }
    }
    return this.token;
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    try {
      safeLocalStorage.setItem(TOKEN_KEY, token);
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
  }

  clearSession() {
    this.token = null;
    this.currentUser = null;
    try {
      safeLocalStorage.removeItem(TOKEN_KEY);
      safeLocalStorage.removeItem(LOCAL_USER_KEY);
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
  }

  // Fallback Local Storage Users Helper for static hosting (EdgeOne, Vercel, Netlify)
  private getLocalUsers(): Array<{ email: string; password?: string; user: User }> {
    try {
      const raw = safeLocalStorage.getItem(LOCAL_USERS_STORE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('localStorage access denied', e);
    }
    
    // Seed default offline users
    const defaultLocalUsers = [
      {
        email: 'nitinsingla256@gmail.com',
        password: '1211',
        user: {
          id: 'usr_master_admin_pn',
          name: 'Nitin Singla (Admin)',
          email: 'nitinsingla256@gmail.com',
          role: 'admin' as const,
          status: 'Active' as const,
          joinedDate: '2026-01-01',
          lastActive: new Date().toISOString(),
          pronouns: 'they/them',
          bio: 'Administrator of PN Outfit Suggester.',
          location: 'Global',
          preferences: INITIAL_USER.preferences,
        },
      },
      {
        email: 'client@pn.outfit',
        password: 'client123',
        user: INITIAL_USER,
      },
    ];
    safeLocalStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(defaultLocalUsers));
    return defaultLocalUsers;
  }

  private saveLocalUser(email: string, passwordPlain: string, user: User) {
    const users = this.getLocalUsers();
    const cleanEmail = email.toLowerCase().trim();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      users[existingIndex] = { email: cleanEmail, password: passwordPlain, user };
    } else {
      users.push({ email: cleanEmail, password: passwordPlain, user });
    }
    safeLocalStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(users));
  }

  async getCurrentSession(): Promise<AuthSession> {
    const token = this.getToken();
    if (!token) {
      return { user: null, token: null, isAuthenticated: false };
    }

    // Try server session verification
    const res = await safeFetchJson<{ success: boolean; user: User }>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok && res.data?.success && res.data?.user) {
      this.currentUser = res.data.user;
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.data.user));
      return {
        user: res.data.user,
        token,
        isAuthenticated: true,
      };
    }

    // If server returned 401 Unauthorized explicitly, session expired
    if (res.status === 401 || res.status === 403) {
      this.clearSession();
      return { user: null, token: null, isAuthenticated: false };
    }

    // If server is not responding with JSON (static host mode / offline), use local session
    if (this.currentUser) {
      return {
        user: this.currentUser,
        token,
        isAuthenticated: true,
      };
    }

    const storedUserRaw = safeLocalStorage.getItem(LOCAL_USER_KEY);
    if (storedUserRaw) {
      try {
        const parsed = JSON.parse(storedUserRaw);
        this.currentUser = parsed;
        return {
          user: parsed,
          token,
          isAuthenticated: true,
        };
      } catch {}
    }

    return { user: null, token: null, isAuthenticated: false };
  }

  async signIn(email: string, passwordPlain: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try server sign in first
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

    if (res.isJson && !res.ok) {
      throw new Error(res.data?.error || 'Invalid email or password.');
    }

    // 2. Client-side fallback for static host / offline deployment
    const localUsers = this.getLocalUsers();
    let matching = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (matching) {
      if (matching.password && matching.password !== passwordPlain) {
        throw new Error('Invalid email or password.');
      }
      const token = 'local_tok_' + Math.random().toString(36).substring(2);
      
      // Ensure admin role is preserved for designated admin email
      if (cleanEmail === 'nitinsingla256@gmail.com') {
         matching.user.role = 'admin';
      }
      
      this.setSession(token, matching.user);
      return { user: matching.user, token };
    }

    if (cleanEmail === 'nitinsingla256@gmail.com') {
       throw new Error('Administrator account requires a secure backend configuration. Please set up a proper database/auth provider to sign in securely as an administrator.');
    }

    // If new user signing in on static mode, auto-create local account for a frictionless experience
    const newUser: User = {
      id: `usr_local_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'user',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      pronouns: 'they/them',
      bio: 'Fashion enthusiast and capsule wardrobe creator.',
      location: 'Global',
      preferences: INITIAL_USER.preferences,
    };
    const token = 'local_tok_' + Math.random().toString(36).substring(2);
    this.saveLocalUser(cleanEmail, passwordPlain, newUser);
    this.setSession(token, newUser);
    return { user: newUser, token };
  }

  async signUp(
    name: string,
    email: string,
    passwordPlain: string,
    confirmPassword?: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try server signup first
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

    if (res.isJson && !res.ok) {
      throw new Error(res.data?.error || 'Registration failed.');
    }

    // 2. Client-side fallback for static host / offline deployment
    const localUsers = this.getLocalUsers();
    const existing = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    if (cleanEmail === 'nitinsingla256@gmail.com') {
      throw new Error('Administrator account cannot be created via local fallback. Please configure a secure authentication provider.');
    }

    const newUser: User = {
      id: `usr_local_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      pronouns: 'they/them',
      bio: 'Fashion enthusiast and capsule wardrobe creator.',
      location: 'Global',
      preferences: INITIAL_USER.preferences,
    };

    const token = 'local_tok_' + Math.random().toString(36).substring(2);
    this.saveLocalUser(cleanEmail, passwordPlain, newUser);
    this.setSession(token, newUser);
    return { user: newUser, token };
  }

  async signOut(): Promise<void> {
    const token = this.getToken();
    if (token && !token.startsWith('local_tok_')) {
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

    // Fallback for static mode
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      message: `Reset code generated: ${code}. Enter this code to set your new password.`,
      resetCode: code,
    };
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

    // Fallback for static mode
    const localUsers = this.getLocalUsers();
    const idx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      localUsers[idx].password = newPasswordPlain;
      safeLocalStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(localUsers));
    }

    return 'Your password has been successfully updated. You may now sign in.';
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
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.data.user));
      return res.data.user;
    }

    // Static / local fallback
    if (this.currentUser) {
      const updated: User = {
        ...this.currentUser,
        ...updates,
        preferences: {
          ...this.currentUser.preferences,
          ...(updates.preferences || {}),
        },
      };
      this.currentUser = updated;
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      
      // Update the user in LOCAL_USERS_STORE_KEY
      if (updated.email) {
          const localUsers = this.getLocalUsers();
          const existingIndex = localUsers.findIndex(u => u.email.toLowerCase() === updated.email.toLowerCase());
          if (existingIndex >= 0) {
              localUsers[existingIndex].user = updated;
              safeLocalStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(localUsers));
          }
      }
      return updated;
    }

    throw new Error('Failed to update profile');
  }
}

export const authService = new AuthService();

