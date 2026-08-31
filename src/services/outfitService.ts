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

const LOCAL_OUTFITS_KEY = 'pn_local_outfits_v1';

const DEFAULT_SAMPLE_OUTFITS: Outfit[] = [
  {
    id: 'sample_look_1',
    name: 'Metropolitan Tailored Architecture',
    description: 'Crisp silk shirting framed by heavy wool pleats and clean box-calf boots.',
    items: [
      { itemId: 'sample_item_5', slotName: 'Top' },
      { itemId: 'sample_item_2', slotName: 'Bottom' },
      { itemId: 'sample_item_3', slotName: 'Outerwear' },
      { itemId: 'sample_item_4', slotName: 'Footwear' },
    ],
    occasion: 'Work',
    styleVibe: 'Minimal',
    season: ['Winter', 'Spring'],
    isFavorite: true,
    timesWorn: 8,
    lastWornDate: '2026-08-22',
    stylingNotes: 'Leave the blazer unbuttoned while seated to preserve natural drape lines.',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-08-22T10:00:00.000Z',
  },
  {
    id: 'sample_look_2',
    name: 'Weekend Tactile Cashmere Ensemble',
    description: 'Soft cloud cashmere paired with heritage cotton gabardine for timeless comfort.',
    items: [
      { itemId: 'sample_item_1', slotName: 'Top' },
      { itemId: 'sample_item_2', slotName: 'Bottom' },
      { itemId: 'sample_item_6', slotName: 'Outerwear' },
      { itemId: 'sample_item_4', slotName: 'Footwear' },
    ],
    occasion: 'Casual',
    styleVibe: 'Classic',
    season: ['Spring', 'All-Season'],
    isFavorite: true,
    timesWorn: 12,
    lastWornDate: '2026-08-26',
    stylingNotes: 'Cuff the sleeves of the trench slightly to reveal the ivory knit cuff.',
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-08-26T10:00:00.000Z',
  }
];

export class OutfitService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  private getLocalOutfits(): Outfit[] {
    try {
      const raw = localStorage.getItem(LOCAL_OUTFITS_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    } catch {}
    localStorage.setItem(LOCAL_OUTFITS_KEY, JSON.stringify(DEFAULT_SAMPLE_OUTFITS));
    return DEFAULT_SAMPLE_OUTFITS;
  }

  private saveLocalOutfits(outfits: Outfit[]) {
    try {
      localStorage.setItem(LOCAL_OUTFITS_KEY, JSON.stringify(outfits));
    } catch (err) {
      console.warn('Failed to save outfits to localStorage:', err);
    }
  }

  async clearAll(): Promise<void> {
    this.saveLocalOutfits([]);
    const token = authService.getToken();
    if (token && !token.startsWith('local_tok_')) {
      try {
        await fetch('/api/user/outfits/clear', {
          method: 'POST',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Server outfits clear fallback:', err);
      }
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    const token = authService.getToken();
    if (token && !token.startsWith('local_tok_')) {
      for (const id of ids) {
        try {
          await fetch(`/api/user/outfits/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
          });
        } catch (err) {
          console.warn('Server outfit delete fallback:', err);
        }
      }
    }

    const outfits = this.getLocalOutfits();
    const idSet = new Set(ids);
    const updated = outfits.filter(o => !idSet.has(o.id));
    this.saveLocalOutfits(updated);
    return true;
  }

  async getAll(): Promise<Outfit[]> {
    const token = authService.getToken();
    if (!token) return this.getLocalOutfits();

    if (token.startsWith('local_tok_')) {
      return this.getLocalOutfits();
    }

    try {
      const res = await fetch('/api/user/outfits', {
        headers: this.getHeaders(),
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (text.trim().startsWith('<') || contentType.includes('text/html')) {
        return this.getLocalOutfits();
      }

      if (res.ok) {
        try {
          const data = JSON.parse(text);
          if (data.outfits && Array.isArray(data.outfits)) {
            if (data.outfits.length > 0) {
              this.saveLocalOutfits(data.outfits);
              return data.outfits;
            }
            return this.getLocalOutfits();
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to load outfits from server, using local fallback:', err);
    }
    return this.getLocalOutfits();
  }

  async getById(id: string): Promise<Outfit | undefined> {
    const outfits = await this.getAll();
    return outfits.find(o => o.id === id);
  }

  async create(outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch('/api/user/outfits', {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(outfitData),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.outfit) {
            const local = this.getLocalOutfits();
            this.saveLocalOutfits([data.outfit, ...local]);
            return data.outfit;
          }
        }
      } catch (err) {
        console.warn('Server outfit creation fallback to local:', err);
      }
    }

    const newOutfit: Outfit = {
      ...outfitData,
      id: `outfit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const outfits = this.getLocalOutfits();
    const updated = [newOutfit, ...outfits];
    this.saveLocalOutfits(updated);
    return newOutfit;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        const res = await fetch(`/api/user/outfits/${id}`, {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        });

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        if (!text.trim().startsWith('<') && !contentType.includes('text/html') && res.ok) {
          const data = JSON.parse(text);
          if (data.success && data.outfit) {
            const local = this.getLocalOutfits();
            const idx = local.findIndex(o => o.id === id);
            if (idx >= 0) local[idx] = data.outfit;
            this.saveLocalOutfits(local);
            return data.outfit;
          }
        }
      } catch (err) {
        console.warn('Server outfit update fallback to local:', err);
      }
    }

    const outfits = this.getLocalOutfits();
    const idx = outfits.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Look not found');

    const updatedOutfit: Outfit = {
      ...outfits[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    outfits[idx] = updatedOutfit;
    this.saveLocalOutfits(outfits);
    return updatedOutfit;
  }

  async delete(id: string): Promise<boolean> {
    const token = authService.getToken();

    if (token && !token.startsWith('local_tok_')) {
      try {
        await fetch(`/api/user/outfits/${id}`, {
          method: 'DELETE',
          headers: this.getHeaders(),
        });
      } catch (err) {
        console.warn('Server outfit delete fallback to local:', err);
      }
    }

    const outfits = this.getLocalOutfits();
    const updated = outfits.filter(o => o.id !== id);
    this.saveLocalOutfits(updated);
    return true;
  }

  async toggleFavorite(id: string): Promise<Outfit> {
    const outfits = this.getLocalOutfits();
    const outfit = outfits.find(o => o.id === id);
    if (!outfit) throw new Error('Look not found');
    const newFavorite = !outfit.isFavorite;
    return this.update(id, { isFavorite: newFavorite });
  }

  async recordWear(id: string): Promise<Outfit> {
    const outfits = this.getLocalOutfits();
    const outfit = outfits.find(o => o.id === id);
    if (!outfit) throw new Error('Look not found');
    const newTimesWorn = (outfit.timesWorn || 0) + 1;
    return this.update(id, {
      timesWorn: newTimesWorn,
      lastWornDate: new Date().toISOString().split('T')[0],
    });
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
        (o.styleVibe && o.styleVibe.toLowerCase().includes(q))
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
