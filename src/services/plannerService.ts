
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { PlannedOutfit } from '../types';
import { authService } from './authService';

class PlannerService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  }

  async getAll(): Promise<PlannedOutfit[]> {
    try {
      const res = await fetch('/api/user/plans', {
        headers: this.getHeaders(),
      });
      
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      
      if (!res.ok || text.trim().startsWith('<') || contentType.includes('text/html')) {
          return [];
      }
      
      const data = JSON.parse(text);
      if (data && data.success && Array.isArray(data.plans)) {
        return data.plans;
      }
      return [];
    } catch (err) {
      console.warn('Server planner fetch failed:', err);
      return [];
    }
  }

  async create(planData: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    const res = await fetch('/api/user/plans', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(planData),
    });
    
    if (!res.ok) throw new Error('Failed to create planned outfit.');
    const data = await res.json();
    return data.plan;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    const res = await fetch(`/api/user/plans/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) throw new Error('Failed to update planned outfit.');
    const data = await res.json();
    return data.plan;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return res.ok;
  }
}

export const plannerService = new PlannerService();
