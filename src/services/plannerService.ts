import { PlannedOutfit } from '../types';
import { authService } from './authService';

class PlannerService {
  private getHeaders() {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(): Promise<PlannedOutfit[]> {
    const res = await fetch('/api/user/plans', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch plans');
    const data = await res.json();
    return data.plans || [];
  }

  async create(data: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    const res = await fetch('/api/user/plans', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create plan');
    const json = await res.json();
    return json.plan;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    const res = await fetch(`/api/user/plans/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update plan');
    const json = await res.json();
    return json.plan;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/user/plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete plan');
  }

  async clearAll(): Promise<void> {
    // Currently no batch clear endpoint for plans, fallback to nothing for now
  }
}

export const plannerService = new PlannerService();
