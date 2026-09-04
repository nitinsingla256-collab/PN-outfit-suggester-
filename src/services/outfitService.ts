import { Outfit } from '../types';

const STORAGE_KEY = 'pn_local_outfits_dev';

class OutfitService {
  private getLocal(): Outfit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  private setLocal(items: Outfit[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }

  async getAll(): Promise<Outfit[]> {
    return this.getLocal();
  }

  async getById(id: string): Promise<Outfit | null> {
    return this.getLocal().find(i => i.id === id) || null;
  }

  async create(data: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    const items = this.getLocal();
    const newItem: Outfit = {
      ...data,
      id: 'outfit_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timesWorn: 0,
      isFavorite: false,
    };
    items.unshift(newItem);
    this.setLocal(items);
    return newItem;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const items = this.getLocal();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Outfit not found');
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.setLocal(items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getLocal();
    this.setLocal(items.filter(i => i.id !== id));
  }
  
  async deleteMany(ids: string[]): Promise<void> {
    const items = this.getLocal();
    const idSet = new Set(ids);
    this.setLocal(items.filter(i => !idSet.has(i.id)));
  }

  async clearAll(): Promise<void> {
    this.setLocal([]);
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Outfit> {
    return this.update(id, { isFavorite });
  }

  async logWear(id: string): Promise<Outfit> {
    const item = await this.getById(id);
    if (!item) throw new Error('Outfit not found');
    return this.update(id, { timesWorn: (item.timesWorn || 0) + 1 });
  }
}

export const outfitService = new OutfitService();
