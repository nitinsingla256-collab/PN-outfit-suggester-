/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlannedOutfit, Outfit } from '../types';
import { authService } from './authService';

export class PlannerService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async getAll(): Promise<PlannedOutfit[]> {
    const token = authService.getToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/user/plans', {
        headers: this.getHeaders(),
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
        return data.plans || [];
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
    return [];
  }

  async create(planData: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    const res = await fetch('/api/user/plans', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(planData),
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
      throw new Error(data.error || 'Failed to schedule look.');
    }
    return data.plan;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    const res = await fetch(`/api/user/plans/${id}`, {
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
      throw new Error(data.error || 'Failed to update plan.');
    }
    return data.plan;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/plans/${id}`, {
      method: 'DELETE',
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
      throw new Error(data.error || 'Failed to delete plan.');
    }
    return true;
  }

  enrichWithOutfits(plans: PlannedOutfit[], outfits: Outfit[]): PlannedOutfit[] {
    const outfitMap = new Map(outfits.map(o => [o.id, o]));
    return plans.map(plan => ({
      ...plan,
      outfit: plan.outfitId ? outfitMap.get(plan.outfitId) : undefined,
    }));
  }
}

export const plannerService = new PlannerService();
