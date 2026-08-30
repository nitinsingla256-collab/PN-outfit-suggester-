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

export class WardrobeService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async getAll(): Promise<WardrobeItem[]> {
    const token = authService.getToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/user/wardrobe', {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
        return data.items || [];
      }
    } catch (err) {
      console.error('Failed to load wardrobe from server:', err);
    }
    return [];
  }

  async getById(id: string): Promise<WardrobeItem | undefined> {
    const items = await this.getAll();
    return items.find(i => i.id === id);
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    const res = await fetch('/api/user/wardrobe', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save wardrobe piece.');
    }
    return data.item;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update wardrobe piece.');
    }
    return data.item;
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/user/wardrobe/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to remove piece.');
    }
    return true;
  }

  async toggleFavorite(id: string): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to toggle favorite.');
    }
    return data.item;
  }

  async recordWear(id: string): Promise<WardrobeItem> {
    const res = await fetch(`/api/user/wardrobe/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    let data;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      if (!res.ok) {
        throw new Error('Server returned an error: ' + res.status + ' ' + res.statusText);
      }
      throw new Error('Received unexpected response format from server (possibly 502/503 from the platform proxy).');
    }
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to record wear.');
    }
    return data.item;
  }

  filter(items: WardrobeItem[], options: WardrobeFilterOptions): WardrobeItem[] {
    let result = [...items];

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q)) ||
        item.color.toLowerCase().includes(q) ||
        item.material?.toLowerCase().includes(q) ||
        item.style?.toLowerCase().includes(q) ||
        item.pattern?.toLowerCase().includes(q)
      );
    }

    if (options.category && options.category !== 'All') {
      result = result.filter(item => item.category === options.category);
    }

    if (options.color && options.color !== 'All') {
      result = result.filter(item => item.color.toLowerCase() === options.color!.toLowerCase());
    }

    if (options.style && options.style !== 'All') {
      result = result.filter(item => item.style?.toLowerCase() === options.style!.toLowerCase());
    }

    if (options.formality && options.formality !== 'All') {
      result = result.filter(item => item.formality?.toLowerCase() === options.formality!.toLowerCase());
    }

    if (options.season && options.season !== 'All') {
      result = result.filter(item => 
        item.season?.includes('All-Season') || 
        item.season?.includes('All Season') || 
        item.season?.includes(options.season!)
      );
    }

    if (options.occasion && options.occasion !== 'All') {
      result = result.filter(item => 
        item.occasion?.includes(options.occasion!)
      );
    }

    if (options.onlyFavorites) {
      result = result.filter(item => item.isFavorite);
    }

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'category':
          result.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
          break;
        case 'favoritesFirst':
          result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'mostWorn':
          result.sort((a, b) => b.timesWorn - a.timesWorn);
          break;
        case 'leastWorn':
          result.sort((a, b) => a.timesWorn - b.timesWorn);
          break;
        case 'nameAsc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'highestValue':
          result.sort((a, b) => (b.cost || 0) - (a.cost || 0));
          break;
      }
    }

    return result;
  }
}

export const wardrobeService = new WardrobeService();
