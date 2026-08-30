/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { authService } from './authService';

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalWardrobeItems: number;
  totalOutfits: number;
  totalAiRequests: number;
  totalWearCycles: number;
  totalActivityLogs: number;
}

export interface AdminUserDetails {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'supervisor';
    status: 'Active' | 'Suspended';
    joinedDate: string;
    lastActive: string;
    location?: string;
    pronouns?: string;
    bio?: string;
    preferences: any;
  };
  stats: {
    wardrobeCount: number;
    outfitsCount: number;
    plansCount: number;
    favoritesCount: number;
    wearCyclesCount: number;
    aiRequestsCount: number;
  };
  recentWardrobePieces: any[];
  recentOutfits: any[];
  recentActivity: any[];
}

export class AdminService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async getOverview(): Promise<AdminOverviewStats> {
    const res = await fetch('/api/admin/overview', {
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to retrieve admin overview.');
    }
    return data.overview;
  }

  async getUsers(): Promise<any[]> {
    const res = await fetch('/api/admin/users', {
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to retrieve registered users.');
    }
    return data.users;
  }

  async getUserDetails(userId: string): Promise<AdminUserDetails> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to load user details.');
    }
    return data.details;
  }

  async updateUserStatus(
    userId: string,
    updates: { status?: 'Active' | 'Suspended'; role?: 'user' | 'admin' | 'supervisor' }
  ): Promise<any> {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to update user status.');
    }
    return data.user;
  }

  async getActivityLogs(): Promise<any[]> {
    const res = await fetch('/api/admin/activity', {
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to fetch activity logs.');
    }
    return data.logs;
  }

  async getSystemHealth(): Promise<any> {
    const res = await fetch('/api/admin/system', {
      headers: this.getHeaders(),
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
      throw new Error(data.error || 'Failed to fetch system telemetry.');
    }
    return data.health;
  }
}

export const adminService = new AdminService();
