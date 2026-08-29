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
        const data = await res.json();
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

    const data = await res.json();
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

    const data = await res.json();
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

    const data = await res.json();
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
