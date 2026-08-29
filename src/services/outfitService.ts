/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outfit, WardrobeItem, OccasionType, StyleVibe } from '../types';
import { authService } from './authService';

export interface OutfitFilterOptions {
  searchQuery?: string;
  occasion?: OccasionType | 'All';
  styleVibe?: StyleVibe | 'All';
  onlyFavorites?: boolean;
  sortBy?: 'newest' | 'mostWorn' | 'nameAsc';
}

export class OutfitService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async getAll(): Promise<Outfit[]> {
    const token = authService.getToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/user/outfits', {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.outfits || [];
      }
    } catch (err) {
      console.error('Failed to load outfits:', err);
    }
    return [];
  }

  async getById(id: string): Promise<Outfit | undefined> {
    const outfits = await this.getAll();
    return outfits.find(o => o.id === id);
  }

  async create(outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    const res = await fetch('/api/user/outfits', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(outfitData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save look.');
    }
    return data.outfit;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update look.');
    }
    return data.outfit;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete look.');
    }
    return true;
  }

  async toggleFavorite(id: string): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to toggle favorite.');
    }
    return data.outfit;
  }

  async recordWear(id: string): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record wear for look.');
    }
    return data.outfit;
  }

  enrichWithWardrobeItems(outfits: Outfit[], wardrobe: WardrobeItem[]): Outfit[] {
    const itemMap = new Map(wardrobe.map(i => [i.id, i]));
    return outfits.map(outfit => {
      const itemDetails = (outfit.items || [])
        .map(ref => itemMap.get(ref.itemId))
        .filter((item): item is WardrobeItem => Boolean(item));
      return {
        ...outfit,
        itemDetails,
      };
    });
  }

  filter(outfits: Outfit[], options: OutfitFilterOptions): Outfit[] {
    let result = [...outfits];

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.occasion.toLowerCase().includes(q) ||
        o.styleVibe.toLowerCase().includes(q)
      );
    }

    if (options.occasion && options.occasion !== 'All') {
      result = result.filter(o => o.occasion === options.occasion);
    }

    if (options.styleVibe && options.styleVibe !== 'All') {
      result = result.filter(o => o.styleVibe === options.styleVibe);
    }

    if (options.onlyFavorites) {
      result = result.filter(o => o.isFavorite);
    }

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'mostWorn':
          result.sort((a, b) => b.timesWorn - a.timesWorn);
          break;
        case 'nameAsc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }
}

export const outfitService = new OutfitService();
