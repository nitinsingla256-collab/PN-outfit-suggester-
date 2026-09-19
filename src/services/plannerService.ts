import { PlannedOutfit } from '../types';
import { authService } from './authService';

const getLocalKey = () => {
  const user = authService.getCurrentUser();
  return user ? `pn_plans_${user.id}` : 'pn_plans_guest';
};

const getLocalPlans = (): PlannedOutfit[] => {
  try {
    const raw = localStorage.getItem(getLocalKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const setLocalPlans = (items: PlannedOutfit[]) => {
  try {
    localStorage.setItem(getLocalKey(), JSON.stringify(items));
  } catch {}
};

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
    try {
      const res = await fetch('/api/user/plans', {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const serverPlans: PlannedOutfit[] = data.plans || [];
        const localPlans = getLocalPlans();
        
        const merged = [...serverPlans];
        for (const loc of localPlans) {
          if (!merged.some(m => m.id === loc.id)) {
            merged.push(loc);
          }
        }
        setLocalPlans(merged);
        return merged;
      }
    } catch (_err) {}
    return getLocalPlans();
  }

  async create(data: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    let createdPlan: PlannedOutfit | null = null;
    try {
      const res = await fetch('/api/user/plans', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        createdPlan = json.plan;
      }
    } catch (_err) {}

    if (!createdPlan) {
      createdPlan = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      } as PlannedOutfit;
    }

    const current = getLocalPlans();
    setLocalPlans([createdPlan, ...current.filter(c => c.id !== createdPlan!.id)]);
    return createdPlan;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    let updatedPlan: PlannedOutfit | null = null;
    try {
      const res = await fetch(`/api/user/plans/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        updatedPlan = json.plan;
      }
    } catch (_err) {}

    const current = getLocalPlans();
    const existing = current.find(c => c.id === id);
    if (!updatedPlan && existing) {
      updatedPlan = { ...existing, ...updates };
    }

    if (updatedPlan) {
      setLocalPlans(current.map(c => c.id === id ? updatedPlan! : c));
      return updatedPlan;
    }

    throw new Error('Failed to update plan');
  }

  async delete(id: string): Promise<void> {
    try {
      await fetch(`/api/user/plans/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (_err) {}
    const current = getLocalPlans();
    setLocalPlans(current.filter(c => c.id !== id));
  }

  async clearAll(): Promise<void> {
    setLocalPlans([]);
  }
}

export const plannerService = new PlannerService();
