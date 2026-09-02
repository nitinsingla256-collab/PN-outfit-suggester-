
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { WardrobeItem, ClothingCategory, ClothingColor } from '../types';
import { authService } from './authService';

export interface WardrobeFilterOptions {
  searchQuery?: string;
  category?: ClothingCategory | 'All';
  color?: string | 'All';
  style?: string | 'All';
  season?: string | 'All';
  occasion?: string | 'All';
  formality?: string | 'All';
  onlyFavorites?: boolean;
  sortBy?: 'newest' | 'oldest' | 'category' | 'favoritesFirst' | 'mostWorn' | 'leastWorn' | 'nameAsc' | 'highestValue';
}

class WardrobeService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  }

  async getAll(): Promise<WardrobeItem[]> {
    try {
      const res = await fetch('/api/user/wardrobe', {
        headers: this.getHeaders(),
      });
      
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      
      if (!res.ok || text.trim().startsWith('<') || contentType.includes('text/html')) {
          return [];
      }
      
      const data = JSON.parse(text);
      if (data && data.success && Array.isArray(data.items)) {
        return data.items;
      }
      return [];
    } catch (err) {
      console.warn('Server wardrobe fetch failed:', err);
      return [];
    }
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    const res = await fetch('/api/user/wardrobe', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });
    
    if (!res.ok) throw new Error('Failed to create wardrobe item.');
    const data = await res.json();
    return data.item;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) throw new Error('Failed to update wardrobe item.');
    const data = await res.json();
    return data.item;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return res.ok;
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    const res = await fetch('/api/user/wardrobe/batch-delete', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids }),
    });
    
    return res.ok;
  }

  async clearAll(): Promise<void> {
    await fetch('/api/user/wardrobe/clear', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ isFavorite }),
    });
    
    if (!res.ok) throw new Error('Failed to toggle favorite.');
    const data = await res.json();
    return data.item;
  }

  async logWear(id: string): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to log wear.');
    const data = await res.json();
    return data.item;
  }

  filter(items: WardrobeItem[], options: WardrobeFilterOptions): WardrobeItem[] {
    let filtered = [...items];

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.color.toLowerCase().includes(q) ||
          (i.secondaryColor && i.secondaryColor.toLowerCase().includes(q)) ||
          i.brand?.toLowerCase().includes(q) ||
          i.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (options.category && options.category !== 'All') {
      filtered = filtered.filter(i => i.category === options.category);
    }

    if (options.color && options.color !== 'All') {
      filtered = filtered.filter(
        i => i.color === options.color || i.secondaryColor === options.color
      );
    }

    if (options.style && options.style !== 'All') {
      filtered = filtered.filter(i => i.style === options.style);
    }

    if (options.season && options.season !== 'All') {
      filtered = filtered.filter(i => i.season.includes(options.season as string));
    }

    if (options.occasion && options.occasion !== 'All') {
      filtered = filtered.filter(i => i.occasion?.includes(options.occasion as string));
    }

    if (options.formality && options.formality !== 'All') {
      filtered = filtered.filter(i => i.formality === options.formality);
    }

    if (options.onlyFavorites) {
      filtered = filtered.filter(i => i.isFavorite);
    }

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'mostWorn':
          filtered.sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
          break;
        case 'leastWorn':
          filtered.sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));
          break;
        case 'nameAsc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        
        case 'category':
          filtered.sort((a, b) => a.category.localeCompare(b.category));
          break;
        case 'favoritesFirst':
          filtered.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
          break;
      }
    }

    return filtered;
  }
}

export const wardrobeService = new WardrobeService();
