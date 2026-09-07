import { Outfit } from '../types';
import { authService } from './authService';

class OutfitService {
  private getHeaders() {
    const token = authService.getToken();
    if (!token) throw new Error('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(): Promise<Outfit[]> {
    const res = await fetch('/api/user/outfits', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch outfits');
    const data = await res.json();
    return data.outfits || [];
  }

  async getById(id: string): Promise<Outfit | null> {
    const items = await this.getAll();
    return items.find(i => i.id === id) || null;
  }

  async create(data: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    const res = await fetch('/api/user/outfits', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create outfit');
    const json = await res.json();
    return json.outfit;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update outfit');
    const json = await res.json();
    return json.outfit;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/user/outfits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete outfit');
  }
  
  async deleteMany(ids: string[]): Promise<void> {
    const res = await fetch(`/api/user/outfits/batch-delete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Failed to delete outfits');
  }

  async clearAll(): Promise<void> {
    const res = await fetch('/api/user/outfits/clear', {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to clear outfits');
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/favorite`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ isFavorite })
    });
    if (!res.ok) throw new Error('Failed to update favorite status');
    const json = await res.json();
    return json.outfit;
  }

  async logWear(id: string): Promise<Outfit> {
    const res = await fetch(`/api/user/outfits/${id}/wear`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to log wear');
    const json = await res.json();
    return json.outfit;
  }
}

export const outfitService = new OutfitService();
