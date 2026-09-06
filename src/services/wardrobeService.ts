import { WardrobeItem } from '../types';
import { INITIAL_WARDROBE_ITEMS } from '../data/seedData';

export interface WardrobeFilterOptions {
  category?: string;
  season?: string | string[];
  sortBy?: 'newest' | 'oldest' | 'category' | 'favoritesFirst' | 'mostWorn' | 'leastWorn';
  searchQuery?: string;
  color?: string;
  style?: string;
  occasion?: string;
  formality?: string;
  onlyFavorites?: boolean;
}

const STORAGE_KEY = 'pn_local_wardrobe_dev';

class WardrobeService {
  private getLocal(): WardrobeItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) {
        // First time initialization: populate with curated luxury capsule
        this.setLocal(INITIAL_WARDROBE_ITEMS);
        return [...INITIAL_WARDROBE_ITEMS];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  private setLocal(items: WardrobeItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err: any) {
      const isQuota =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014;

      if (isQuota) {
        console.error('LocalStorage QuotaExceededError in WardrobeService:', err);
        throw new Error(
          'Browser storage limit reached. Please optimize images or remove older pieces before saving new items.'
        );
      }
      throw err;
    }
  }

  async getAll(): Promise<WardrobeItem[]> {
    return this.getLocal();
  }

  async resetToSample(): Promise<WardrobeItem[]> {
    this.setLocal(INITIAL_WARDROBE_ITEMS);
    return [...INITIAL_WARDROBE_ITEMS];
  }

  async getById(id: string): Promise<WardrobeItem | null> {
    const items = this.getLocal();
    return items.find(i => i.id === id) || null;
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    const items = this.getLocal();
    const newItem: WardrobeItem = {
      ...itemData,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timesWorn: 0,
      isFavorite: false,
    };
    const updated = [newItem, ...items];
    // Persist first before returning
    this.setLocal(updated);
    return newItem;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const items = this.getLocal();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    const updatedItem = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    const updatedItems = [...items];
    updatedItems[idx] = updatedItem;
    this.setLocal(updatedItems);
    return updatedItem;
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

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WardrobeItem> {
    return this.update(id, { isFavorite });
  }

  async logWear(id: string): Promise<WardrobeItem> {
    const item = await this.getById(id);
    if (!item) throw new Error('Item not found');
    return this.update(id, { timesWorn: (item.timesWorn || 0) + 1 });
  }
  
  // Minimal filter implementation since filtering is typically handled client-side anyway
  // Some parts of the app might call this for server-side search emulation
  filter(items: WardrobeItem[], options: WardrobeFilterOptions): WardrobeItem[] {
    let result = [...items];
    
    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.brand?.toLowerCase().includes(q) ||
        i.color?.toLowerCase().includes(q)
      );
    }
    
    if (options.category && options.category !== 'All') {
      result = result.filter(i => i.category === options.category);
    }
    
    if (options.season && options.season.length > 0) {
      const seasonFilters = Array.isArray(options.season) ? options.season : [options.season];
      if (seasonFilters[0] !== 'All' && seasonFilters[0] !== '') {
        result = result.filter(i => i.season.some(s => seasonFilters.includes(s)));
      }
    }
    
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'category':
          result.sort((a, b) => a.category.localeCompare(b.category));
          break;
        case 'favoritesFirst':
          result.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
          break;
        case 'mostWorn':
          result.sort((a, b) => b.timesWorn - a.timesWorn);
          break;
        case 'leastWorn':
          result.sort((a, b) => a.timesWorn - b.timesWorn);
          break;
        case 'newest':
        default:
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    
    return result;
  }
}

export const wardrobeService = new WardrobeService();
