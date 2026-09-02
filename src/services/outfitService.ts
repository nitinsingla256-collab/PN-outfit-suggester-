
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Outfit, WardrobeItem } from '../types';
import { authService } from './authService';

export interface OutfitFilterOptions {
  searchQuery?: string;
  season?: string | 'All';
  occasion?: string | 'All';
  onlyFavorites?: boolean;
  sortBy?: 'newest' | 'oldest' | 'nameAsc' | 'mostWorn';
}

class OutfitService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`,
    };
  }

  async getAll(): Promise<Outfit[]> {
    try {
      const res = await fetch('/api/user/outfits', {
        headers: this.getHeaders(),
      });
      
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      
      if (!res.ok || text.trim().startsWith('<') || contentType.includes('text/html')) {
          return [];
      }
      
      const data = JSON.parse(text);
      if (data && data.success && Array.isArray(data.outfits)) {
        return data.outfits;
      }
      return [];
    } catch (err) {
      console.warn('Server outfit fetch failed:', err);
      return [];
    }
  }

  async create(outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    const res = await fetch('/api/user/outfits', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(outfitData),
    });
    
    if (!res.ok) throw new Error('Failed to create outfit.');
    const data = await res.json();
    return data.outfit;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) throw new Error('Failed to update outfit.');
    const data = await res.json();
    return data.outfit;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return res.ok;
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    const res = await fetch('/api/user/outfits/batch-delete', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids }),
    });
    
    return res.ok;
  }

  async clearAll(): Promise<void> {
    await fetch('/api/user/outfits/clear', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ isFavorite }),
    });
    
    if (!res.ok) throw new Error('Failed to toggle favorite.');
    const data = await res.json();
    return data.outfit;
  }

  async logWear(id: string): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    
    if (!res.ok) throw new Error('Failed to log wear.');
    const data = await res.json();
    return data.outfit;
  }

  filter(outfits: Outfit[], options: OutfitFilterOptions): Outfit[] {
    let filtered = [...outfits];

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      filtered = filtered.filter(
        o => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
      );
    }

    if (options.season && options.season !== 'All') {
      filtered = filtered.filter(o => o.season?.includes(options.season as string));
    }

    if (options.occasion && options.occasion !== 'All') {
      filtered = filtered.filter(o => o.occasion?.includes(options.occasion as string));
    }

    if (options.onlyFavorites) {
      filtered = filtered.filter(o => o.isFavorite);
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
        case 'nameAsc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return filtered;
  }
}

export const outfitService = new OutfitService();
