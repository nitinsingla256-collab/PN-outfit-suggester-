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

const TOKEN_KEY = 'paurvi_auth_token_v3';

export class AuthService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  setSession(token: string, user: User) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearSession() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  async getCurrentSession(): Promise<AuthSession> {
    const token = this.getToken();
    if (!token) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
          if (data.success && data.user) {
            this.currentUser = data.user;
            return {
              user: data.user,
              token,
              isAuthenticated: true,
            };
          }
        }

        // If explicitly unauthorized or forbidden (token is invalid or expired)
        if (res.status === 401 || res.status === 403) {
          this.clearSession();
          return { user: null, token: null, isAuthenticated: false };
        }

        // Other non-ok response, return unauthenticated without spamming errors
        return { user: null, token: null, isAuthenticated: false };
      } catch (err) {
        // Network error (server cold starting / restarting)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
          continue;
        }
        // If still failing after retries (e.g. offline/cold start), gracefully fallback
        return { user: null, token: null, isAuthenticated: false };
      }
    }

    return { user: null, token: null, isAuthenticated: false };
  }

  async signIn(email: string, passwordPlain: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordPlain }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid credentials.');
    }

    this.setSession(data.token, data.user);
    return { user: data.user, token: data.token };
  }

  async signUp(name: string, email: string, passwordPlain: string, confirmPassword?: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: passwordPlain, confirmPassword }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Registration failed.');
    }

    this.setSession(data.token, data.user);
    return { user: data.user, token: data.token };
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
        console.warn('Signout request failed:', err);
      }
    }
    this.clearSession();
  }

  async requestPasswordReset(email: string): Promise<{ message: string; resetCode?: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to request password reset.');
    }

    return {
      message: data.message,
      resetCode: data.resetCode,
    };
  }

  async resetPassword(email: string, resetCode: string, newPasswordPlain: string): Promise<string> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetCode, newPassword: newPasswordPlain }),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to reset password.');
    }

    return data.message;
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update profile.');
    }

    this.currentUser = data.user;
    return data.user;
  }
}

export const authService = new AuthService();
