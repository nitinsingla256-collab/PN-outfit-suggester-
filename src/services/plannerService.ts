/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch (e) {}
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

import { PlannedOutfit, Outfit, OccasionType } from '../types';
import { authService } from './authService';



const get_LOCAL_PLANS_KEY = () => {
  const user = authService.getCurrentUser();
  return user ? `pn_local_plans_v1_${user.id}` : 'pn_local_plans_v1';
};

const DEFAULT_SAMPLE_PLANS: PlannedOutfit[] = [
  {
    id: 'sample_plan_1',
    date: new Date().toISOString().split('T')[0],
    outfitId: 'sample_look_1',
    occasion: 'Work',
    title: 'Capsule Consultation & Executive Review',
    notes: 'Executive presentation and client capsule review.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  }
];

export class PlannerService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  private getLocalPlans(): PlannedOutfit[] {
    try {
      const raw = localStorage.getItem(get_LOCAL_PLANS_KEY());
      if (raw !== null) {
        
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    
      }
    } catch {}
    localStorage.setItem(get_LOCAL_PLANS_KEY(), JSON.stringify([]));
    return [];
  }

  private saveLocalPlans(plans: PlannedOutfit[]) {
    try {
      localStorage.setItem(get_LOCAL_PLANS_KEY(), JSON.stringify(plans));
    } catch (err) {
      console.warn('Failed to save plans to localStorage:', err);
    }
  }

  async getAll(): Promise<PlannedOutfit[]> {
    const token = authService.getToken();
    if (!token) return this.getLocalPlans();

    if (token.startsWith('local_tok_')) {
      return this.getLocalPlans();
    }

    try {
      const res = await fetch('/api/user/plans', {
        headers: this.getHeaders(),
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (text.trim().startsWith('<') || contentType.includes('text/html')) {
        return this.getLocalPlans();
      }

      if (res.ok) {
        try {
          const data = JSON.parse(text);
          if (data.plans && Array.isArray(data.plans)) {
            this.saveLocalPlans(data.plans);
            return data.plans;
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to load plans from server, using local fallback:', err);
    }
    return this.getLocalPlans();
  }

  async create(planData: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch('/api/user/plans', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(planData),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.plan) {
            const local = this.getLocalPlans();
            this.saveLocalPlans([data.plan, ...local]);
            return data.plan;
          }
        }
      } catch (err) {
        console.warn('Server plan creation fallback to local:', err);
      }
    }

    const newPlan: PlannedOutfit = {
      ...planData,
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const plans = this.getLocalPlans();
    const updated = [newPlan, ...plans];
    this.saveLocalPlans(updated);
    return newPlan;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch(`/api/user/plans/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.plan) {
            const local = this.getLocalPlans();
            const idx = local.findIndex(p => p.id === id);
            if (idx >= 0) local[idx] = data.plan;
            this.saveLocalPlans(local);
            return data.plan;
          }
        }
      } catch (err) {
        console.warn('Server plan update fallback to local:', err);
      }
    }

    const plans = this.getLocalPlans();
    const idx = plans.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Plan not found');

    const updatedPlan: PlannedOutfit = {
      ...plans[idx],
      ...updates,
    };
    plans[idx] = updatedPlan;
    this.saveLocalPlans(plans);
    return updatedPlan;
  }

  async delete(id: string): Promise<boolean> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        await fetch(`/api/user/plans/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Server plan delete fallback to local:', err);
      }
    }

    const plans = this.getLocalPlans();
    const updated = plans.filter(p => p.id !== id);
    this.saveLocalPlans(updated);
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
