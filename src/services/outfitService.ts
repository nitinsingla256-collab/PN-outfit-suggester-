import { Outfit } from '../types';
import { authService } from './authService';

const getLocalKey = () => {
  const user = authService.getCurrentUser();
  return user ? `pn_outfits_${user.id}` : 'pn_outfits_guest';
};

const getLocalOutfits = (): Outfit[] => {
  try {
    const raw = localStorage.getItem(getLocalKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const setLocalOutfits = (items: Outfit[]) => {
  try {
    localStorage.setItem(getLocalKey(), JSON.stringify(items));
  } catch {}
};

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
    try {
      const res = await fetch('/api/user/outfits', {
        headers: this.getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        const serverOutfits: Outfit[] = data.outfits || [];
        const localOutfits = getLocalOutfits();
        
        const merged = [...serverOutfits];
        for (const loc of localOutfits) {
          if (!merged.some(m => m.id === loc.id)) {
            merged.push(loc);
          }
        }
        setLocalOutfits(merged);
        return merged;
      }
    } catch (_err) {}
    return getLocalOutfits();
  }

  async getById(id: string): Promise<Outfit | null> {
    const items = await this.getAll();
    return items.find(i => i.id === id) || null;
  }

  async create(data: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'timesWorn'>): Promise<Outfit> {
    let createdOutfit: Outfit | null = null;
    try {
      const res = await fetch('/api/user/outfits', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        createdOutfit = json.outfit;
      }
    } catch (_err) {}

    if (!createdOutfit) {
      createdOutfit = {
        id: `outfit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        timesWorn: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Outfit;
    }

    const current = getLocalOutfits();
    setLocalOutfits([createdOutfit, ...current.filter(c => c.id !== createdOutfit!.id)]);
    return createdOutfit;
  }

  async update(id: string, updates: Partial<Outfit>): Promise<Outfit> {
    let updatedOutfit: Outfit | null = null;
    try {
      const res = await fetch(`/api/user/outfits/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const json = await res.json();
        updatedOutfit = json.outfit;
      }
    } catch (_err) {}

    const current = getLocalOutfits();
    const existing = current.find(c => c.id === id);
    if (!updatedOutfit && existing) {
      updatedOutfit = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    }

    if (updatedOutfit) {
      setLocalOutfits(current.map(c => c.id === id ? updatedOutfit! : c));
      return updatedOutfit;
    }

    throw new Error('Failed to update outfit');
  }

  async delete(id: string): Promise<void> {
    try {
      await fetch(`/api/user/outfits/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (_err) {}
    const current = getLocalOutfits();
    setLocalOutfits(current.filter(c => c.id !== id));
  }
  
  async deleteMany(ids: string[]): Promise<void> {
    try {
      await fetch(`/api/user/outfits/batch-delete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ids })
      });
    } catch (_err) {}
    const current = getLocalOutfits();
    setLocalOutfits(current.filter(c => !ids.includes(c.id)));
  }

  async clearAll(): Promise<void> {
    try {
      await fetch('/api/user/outfits/clear', {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch (_err) {}
    setLocalOutfits([]);
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<Outfit> {
    return this.update(id, { isFavorite });
  }

  async logWear(id: string): Promise<Outfit> {
    try {
      const res = await fetch(`/api/user/outfits/${id}/wear`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.outfit) {
          const current = getLocalOutfits();
          setLocalOutfits(current.map(c => c.id === id ? json.outfit : c));
          return json.outfit;
        }
      }
    } catch (_err) {}

    const current = getLocalOutfits();
    const existing = current.find(c => c.id === id);
    if (existing) {
      const updated = {
        ...existing,
        timesWorn: (existing.timesWorn || 0) + 1,
        lastWorn: new Date().toISOString(),
      };
      setLocalOutfits(current.map(c => c.id === id ? updated : c));
      return updated;
    }
    throw new Error('Failed to log wear');
  }
}

export const outfitService = new OutfitService();
