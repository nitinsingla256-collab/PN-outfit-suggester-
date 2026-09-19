import { WardrobeItem } from '../types';
import { authService } from './authService';

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

const getLocalKey = () => {
  const user = authService.getCurrentUser();
  return user ? `pn_wardrobe_${user.id}` : 'pn_wardrobe_guest';
};

const getLocalWardrobe = (): WardrobeItem[] => {
  try {
    const raw = localStorage.getItem(getLocalKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const setLocalWardrobe = (items: WardrobeItem[]) => {
  try {
    localStorage.setItem(getLocalKey(), JSON.stringify(items));
  } catch {}
};

class WardrobeService {
  private getHeaders() {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(): Promise<WardrobeItem[]> {
    try {
      const res = await fetch('/api/user/wardrobe', {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const serverItems: WardrobeItem[] = data.items || [];
        const localItems = getLocalWardrobe();
        
        // Merge missing local items if any
        const merged = [...serverItems];
        for (const loc of localItems) {
          if (!merged.some(m => m.id === loc.id)) {
            merged.push(loc);
          }
        }
        setLocalWardrobe(merged);
        return merged;
      }
    } catch (_err) {
      // offline or network error
    }
    return getLocalWardrobe();
  }

  async getById(id: string): Promise<WardrobeItem | null> {
    const items = await this.getAll();
    return items.find(i => i.id === id) || null;
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    let createdItem: WardrobeItem | null = null;
    try {
      const res = await fetch('/api/user/wardrobe', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
        const data = await res.json();
        createdItem = data.item;
      }
    } catch (_err) {}

    if (!createdItem) {
      createdItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...itemData,
        timesWorn: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as WardrobeItem;
    }

    const current = getLocalWardrobe();
    setLocalWardrobe([createdItem, ...current.filter(c => c.id !== createdItem!.id)]);
    return createdItem;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    let updatedItem: WardrobeItem | null = null;
    try {
      const res = await fetch(`/api/user/wardrobe/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        updatedItem = data.item;
      }
    } catch (_err) {}

    const current = getLocalWardrobe();
    const existing = current.find(c => c.id === id);
    if (!updatedItem && existing) {
      updatedItem = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    }

    if (updatedItem) {
      setLocalWardrobe(current.map(c => c.id === id ? updatedItem! : c));
      return updatedItem;
    }

    throw new Error('Failed to update item');
  }

  async delete(id: string): Promise<void> {
    try {
      await fetch(`/api/user/wardrobe/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (_err) {}
    const current = getLocalWardrobe();
    setLocalWardrobe(current.filter(c => c.id !== id));
  }

  async deleteMany(ids: string[]): Promise<void> {
    try {
      await fetch(`/api/user/wardrobe/batch-delete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ids })
      });
    } catch (_err) {}
    const current = getLocalWardrobe();
    setLocalWardrobe(current.filter(c => !ids.includes(c.id)));
  }

  async clearAll(): Promise<void> {
    try {
      await fetch('/api/user/wardrobe/clear', {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (_err) {}
    setLocalWardrobe([]);
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WardrobeItem> {
    return this.update(id, { isFavorite });
  }

  async logWear(id: string): Promise<WardrobeItem> {
    try {
      const res = await fetch(`/api/user/wardrobe/${id}/wear`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          const current = getLocalWardrobe();
          setLocalWardrobe(current.map(c => c.id === id ? data.item : c));
          return data.item;
        }
      }
    } catch (_err) {}

    const current = getLocalWardrobe();
    const existing = current.find(c => c.id === id);
    if (existing) {
      const updated = {
        ...existing,
        timesWorn: (existing.timesWorn || 0) + 1,
        lastWorn: new Date().toISOString(),
      };
      setLocalWardrobe(current.map(c => c.id === id ? updated : c));
      return updated;
    }
    throw new Error('Failed to log wear');
  }
  
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
