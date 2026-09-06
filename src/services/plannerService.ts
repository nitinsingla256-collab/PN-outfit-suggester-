import { PlannedOutfit } from '../types';
import { INITIAL_PLANNED_OUTFITS } from '../data/seedData';

const STORAGE_KEY = 'pn_local_planner_dev';

class PlannerService {
  private getLocal(): PlannedOutfit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) {
        this.setLocal(INITIAL_PLANNED_OUTFITS);
        return [...INITIAL_PLANNED_OUTFITS];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  private setLocal(items: PlannedOutfit[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }

  async getAll(): Promise<PlannedOutfit[]> {
    return this.getLocal();
  }

  async resetToSample(): Promise<PlannedOutfit[]> {
    this.setLocal(INITIAL_PLANNED_OUTFITS);
    return [...INITIAL_PLANNED_OUTFITS];
  }

  async create(data: Omit<PlannedOutfit, 'id' | 'createdAt' | 'isCompleted'>): Promise<PlannedOutfit> {
    const items = this.getLocal();
    const newItem: PlannedOutfit = {
      ...data,
      id: 'plan_' + Date.now(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    items.unshift(newItem);
    this.setLocal(items);
    return newItem;
  }

  async update(id: string, updates: Partial<PlannedOutfit>): Promise<PlannedOutfit> {
    const items = this.getLocal();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Plan not found');
    items[idx] = { ...items[idx], ...updates };
    this.setLocal(items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getLocal();
    this.setLocal(items.filter(i => i.id !== id));
  }

  async clearAll(): Promise<void> {
    this.setLocal([]);
  }
}

export const plannerService = new PlannerService();
