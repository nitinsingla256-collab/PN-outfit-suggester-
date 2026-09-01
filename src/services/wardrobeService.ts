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

const LOCAL_WARDROBE_KEY = 'pn_local_wardrobe_items_v1';

const DEFAULT_SAMPLE_WARDROBE: WardrobeItem[] = [
  {
    id: 'sample_item_1',
    name: 'Cashmere Oversized Knit Sweater',
    category: 'Tops',
    subcategory: 'Knitwear',
    color: 'Ivory',
    secondaryColor: 'Beige',
    fit: 'Relaxed',
    material: '100% Mongolian Cashmere',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
    brand: 'Totême Atelier',
    size: 'M',
    season: ['Winter', 'Spring'],
    tags: ['Capsule Core', 'Minimalist', 'Cozy Luxury'],
    formality: 'Smart Casual',
    occasion: ['Casual', 'Work'],
    isFavorite: true,
    timesWorn: 14,
    lastWornDate: '2026-08-20',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
    cost: 420,
    careInstructions: 'Hand wash cold or dry clean only.',
    notes: 'Pairs seamlessly with high-waist pleated wool trousers or relaxed silk skirts.',
  },
  {
    id: 'sample_item_2',
    name: 'High-Waisted Pleated Wool Trousers',
    category: 'Bottoms',
    subcategory: 'Trousers',
    color: 'Black',
    fit: 'Tailored',
    material: 'Super 120s Virgin Wool',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    brand: 'The Row',
    size: '38',
    season: ['All-Season'],
    tags: ['Tailoring', 'Essential', 'Monochrome'],
    formality: 'Business Casual',
    occasion: ['Work', 'Formal'],
    isFavorite: true,
    timesWorn: 22,
    lastWornDate: '2026-08-27',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-08-27T10:00:00.000Z',
    cost: 590,
    careInstructions: 'Dry clean only.',
    notes: 'Anchor of modern capsule tailoring. Excellent drape with tailored blazers.',
  },
  {
    id: 'sample_item_3',
    name: 'Structured Double-Breasted Wool Blazer',
    category: 'Outerwear',
    subcategory: 'Blazer',
    color: 'Charcoal',
    fit: 'Tailored',
    material: 'Heavyweight Italian Wool Twill',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
    brand: 'Loro Piana',
    size: '40',
    season: ['Winter', 'Spring'],
    tags: ['Statement', 'Quiet Luxury', 'Power Dressing'],
    formality: 'Formal',
    occasion: ['Work', 'Formal', 'Dinner'],
    isFavorite: true,
    timesWorn: 9,
    lastWornDate: '2026-08-15',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
    cost: 1250,
    careInstructions: 'Specialist dry clean.',
    notes: 'Sharp shoulder line balances fluid silhouettes beneath.',
  },
  {
    id: 'sample_item_4',
    name: 'Handcrafted Chelsea Leather Boots',
    category: 'Footwear',
    subcategory: 'Boots',
    color: 'Black',
    fit: 'Regular',
    material: 'Full-Grain Box Calf Leather',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800',
    brand: 'J.M. Weston',
    size: '42',
    season: ['Winter', 'Spring'],
    tags: ['Leathercraft', 'Enduring', 'Daily Essential'],
    formality: 'Smart Casual',
    occasion: ['Casual', 'Work', 'Travel'],
    isFavorite: true,
    timesWorn: 35,
    lastWornDate: '2026-08-28',
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-08-28T10:00:00.000Z',
    cost: 780,
    careInstructions: 'Condition monthly with beeswax balm.',
    notes: 'Sleek toe profile elongates leg line with wide-leg trousers.',
  },
  {
    id: 'sample_item_5',
    name: 'Silk Crepe de Chine Button-Down Shirt',
    category: 'Tops',
    subcategory: 'Shirt',
    color: 'White',
    fit: 'Tailored',
    material: '100% Mulberry Silk',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
    brand: 'Khaite',
    size: 'S',
    season: ['All-Season'],
    tags: ['Silk', 'Elevated Basic', 'Lustrous'],
    formality: 'Smart Casual',
    occasion: ['Work', 'Date', 'Dinner'],
    isFavorite: false,
    timesWorn: 18,
    lastWornDate: '2026-08-24',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    cost: 380,
    careInstructions: 'Delicate silk wash.',
    notes: 'Wear unbuttoned slightly for relaxed elegance or buttoned high for architectural minimalism.',
  },
  {
    id: 'sample_item_6',
    name: 'Classic Trench Coat with Storm Flap',
    category: 'Outerwear',
    subcategory: 'Trench',
    color: 'Camel',
    secondaryColor: 'Beige',
    fit: 'Relaxed',
    material: 'Waterproof Cotton Gabardine',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    brand: 'Burberry Heritage',
    size: 'M',
    season: ['Spring', 'All-Season'],
    tags: ['Iconic', 'Weatherproof', 'Timeless'],
    formality: 'Smart Casual',
    occasion: ['Casual', 'Travel', 'Work'],
    isFavorite: true,
    timesWorn: 27,
    lastWornDate: '2026-08-18',
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-08-18T10:00:00.000Z',
    cost: 1450,
    careInstructions: 'Specialist clean.',
    notes: 'Belt firmly at the waist to emphasize silhouette over knitwear.',
  }
];

export class WardrobeService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  private getLocalItems(): WardrobeItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_WARDROBE_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    } catch {}
    localStorage.setItem(LOCAL_WARDROBE_KEY, JSON.stringify(DEFAULT_SAMPLE_WARDROBE));
    return DEFAULT_SAMPLE_WARDROBE;
  }

  private saveLocalItems(items: WardrobeItem[]) {
    try {
      localStorage.setItem(LOCAL_WARDROBE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }

  async clearAll(): Promise<void> {
    this.saveLocalItems([]);
    const token = authService.getToken();
    if (token && !token.startsWith('local_tok_')) {
      try {
        await fetch('/api/user/wardrobe/clear', {
          method: 'POST',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Server wardrobe clear fallback:', err);
      }
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) return true;
    const token = authService.getToken();
    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch('/api/user/wardrobe/batch-delete', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ ids }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.deletedIds && Array.isArray(data.deletedIds)) {
            const deletedSet = new Set(data.deletedIds);
            const items = this.getLocalItems();
            const updated = items.filter(i => !deletedSet.has(i.id));
            this.saveLocalItems(updated);
            return true;
          }
        }
      } catch (err) {
        console.warn('Server wardrobe batch delete fallback:', err);
      }
    }

    const items = this.getLocalItems();
    const idSet = new Set(ids);
    const updated = items.filter(i => !idSet.has(i.id));
    this.saveLocalItems(updated);
    return true;
  }

  async resetToDemoItems(): Promise<WardrobeItem[]> {
    this.saveLocalItems(DEFAULT_SAMPLE_WARDROBE);
    return DEFAULT_SAMPLE_WARDROBE;
  }

  async getAll(): Promise<WardrobeItem[]> {
    const token = authService.getToken();
    if (!token) return this.getLocalItems();

    if (token.startsWith('local_tok_')) {
      return this.getLocalItems();
    }

    try {
      const res = await fetch('/api/user/wardrobe', {
        headers: this.getHeaders(),
      });
      
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (text.trim().startsWith('<') || contentType.includes('text/html')) {
        return this.getLocalItems();
      }

      if (res.ok) {
        try {
          const data = JSON.parse(text);
          if (data.items && Array.isArray(data.items)) {
            this.saveLocalItems(data.items);
            return data.items;
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Using local wardrobe fallback:', err);
    }
    return this.getLocalItems();
  }

  async getById(id: string): Promise<WardrobeItem | undefined> {
    const items = await this.getAll();
    return items.find(i => i.id === id);
  }

  async create(itemData: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<WardrobeItem> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch('/api/user/wardrobe', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(itemData),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.item) {
            const local = this.getLocalItems();
            this.saveLocalItems([data.item, ...local]);
            return data.item;
          }
        }
      } catch (err) {
        console.warn('Server wardrobe create fallback to local:', err);
      }
    }

    // Local Storage Creation
    const newItem: WardrobeItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = this.getLocalItems();
    const updated = [newItem, ...items];
    this.saveLocalItems(updated);
    return newItem;
  }

  async update(id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch(`/api/user/wardrobe/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.item) {
            const local = this.getLocalItems();
            const idx = local.findIndex(i => i.id === id);
            if (idx >= 0) local[idx] = data.item;
            this.saveLocalItems(local);
            return data.item;
          }
        }
      } catch (err) {
        console.warn('Server wardrobe update fallback to local:', err);
      }
    }

    // Local Storage Update
    const items = this.getLocalItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');

    const updatedItem: WardrobeItem = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[idx] = updatedItem;
    this.saveLocalItems(items);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        await fetch(`/api/user/wardrobe/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Server wardrobe delete fallback to local:', err);
      }
    }

    const items = this.getLocalItems();
    const updated = items.filter(i => i.id !== id);
    this.saveLocalItems(updated);
    return true;
  }

  async toggleFavorite(id: string): Promise<WardrobeItem> {
    const items = this.getLocalItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Piece not found');
    const newFavorite = !item.isFavorite;
    return this.update(id, { isFavorite: newFavorite });
  }

  async recordWear(id: string): Promise<WardrobeItem> {
    const items = this.getLocalItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Piece not found');
    const newTimesWorn = (item.timesWorn || 0) + 1;
    return this.update(id, {
      timesWorn: newTimesWorn,
      lastWornDate: new Date().toISOString().split('T')[0],
    });
  }

  filter(items: WardrobeItem[], options: WardrobeFilterOptions): WardrobeItem[] {
    let result = [...items];

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
        (item.color && item.color.toLowerCase().includes(q)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q))
      );
    }

    if (options.category && options.category !== 'All') {
      result = result.filter(item => item.category === options.category);
    }

    if (options.color && options.color !== 'All') {
      result = result.filter(
        item => item.color === options.color || item.secondaryColor === options.color
      );
    }

    if (options.style && options.style !== 'All') {
      result = result.filter(item => item.tags && item.tags.includes(options.style!));
    }

    if (options.season && options.season !== 'All') {
      result = result.filter(
        item => item.season && (item.season.includes(options.season as any) || item.season.includes('All-Season'))
      );
    }

    if (options.occasion && options.occasion !== 'All') {
      result = result.filter(item => item.occasion && item.occasion.includes(options.occasion as any));
    }

    if (options.formality && options.formality !== 'All') {
      result = result.filter(item => item.formality === options.formality);
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
        case 'favoritesFirst':
          result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
          break;
        case 'mostWorn':
          result.sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
          break;
        case 'leastWorn':
          result.sort((a, b) => (a.timesWorn || 0) - (b.timesWorn || 0));
          break;
        case 'nameAsc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'highestValue':
          result.sort((a, b) => (b.cost || 0) - (a.cost || 0));
          break;
        default:
          break;
      }
    }

    return result;
  }
}

export const wardrobeService = new WardrobeService();
