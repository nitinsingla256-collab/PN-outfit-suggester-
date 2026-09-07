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
    const res = await fetch('/api/user/wardrobe', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch wardrobe');
    const data = await res.json();
    return data.items || [];
  }

  async getById(id: string): Promise<WardrobeItem | null> {
    const items = await this.getAll();
    return items.find(i => i.id === id) || null;
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    const res = await fetch('/api/user/wardrobe', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData)
    });
    if (!res.ok) throw new Error('Failed to create item');
    const data = await res.json();
    return data.item;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update item');
    const data = await res.json();
    return data.item;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete item');
  }

  async deleteMany(ids: string[]): Promise<void> {
    const res = await fetch(`/api/user/wardrobe/batch-delete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Failed to delete items');
  }

  async clearAll(): Promise<void> {
    const res = await fetch('/api/user/wardrobe/clear', {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear wardrobe');
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ isFavorite })
    });
    if (!res.ok) throw new Error('Failed to update favorite status');
    const data = await res.json();
    return data.item;
  }

  async logWear(id: string): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to log wear');
    const data = await res.json();
    return data.item;
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
