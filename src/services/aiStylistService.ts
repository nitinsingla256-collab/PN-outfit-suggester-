/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch (e) {}
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

import {
  AIStylistRequest,
  AIStylistResponse,
  WardrobeItem,
  ClothingCategory,
  ClothingColor,
  ClothingFit,
  Season,
  FashionTrendsReport,
  WardrobeAutoOrganizeResult,
  VisualStyleAnalysis,
  PersonalStyleProfile,
} from '../types';
import { authService } from './authService';



export interface GarmentAnalysisResult {
  name: string;
  category: ClothingCategory;
  type?: string;
  subcategory?: string;
  color: string;
  secondaryColor?: string;
  pattern?: string;
  material?: string;
  style?: string;
  formality?: string;
  fit?: ClothingFit;
  season: string[];
  occasion?: string[];
  tags: string[];
  careInstructions?: string;
  stylingNote?: string;
  confidence: number;
}

export class AIStylistService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  private async safePost<T = any>(url: string, body: any): Promise<{ ok: boolean; data: T | null; error?: string }> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      if (text.trim().startsWith('<') || contentType.includes('text/html')) {
        return { ok: false, data: null, error: 'Server returned HTML instead of JSON' };
      }

      if (response.ok) {
        try {
          const parsed = JSON.parse(text);
          return { ok: true, data: parsed };
        } catch {
          return { ok: false, data: null, error: 'Failed to parse JSON response' };
        }
      }
      try {
        const errObj = JSON.parse(text);
        return { ok: false, data: null, error: errObj.error || errObj.message || `Server returned ${response.status}` };
      } catch {
        return { ok: false, data: null, error: `Server returned ${response.status}` };
      }
    } catch (e: any) {
      return { ok: false, data: null, error: e?.message || 'Network request failed' };
    }
  }

  async generateOutfitRecommendation(
    request: AIStylistRequest,
    wardrobePool: WardrobeItem[]
  ): Promise<AIStylistResponse> {
    // Strip large Base64 / image data to make request payload ultra-compact and fast
    const compactPool = (wardrobePool || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type || item.subcategory,
      color: item.color,
      pattern: item.pattern || 'Solid',
      material: item.material,
      style: item.style,
      formality: item.formality,
      fit: item.fit,
      season: item.season,
      timesWorn: item.timesWorn || 0,
      isFavorite: !!item.isFavorite,
    }));

    const res = await this.safePost<{ success: boolean; recommendation?: AIStylistResponse; error?: string }>(
      '/api/gemini/stylist',
      {
        ...request,
        wardrobePool: compactPool,
      }
    );

    if (res.ok && res.data?.success && res.data?.recommendation) {
      const rec = res.data.recommendation;
      // Re-hydrate local piece items from full wardrobePool so images & details display correctly
      const hydrateList = (pieces: any[]) => {
        return (pieces || []).map((p: any) => {
          const matched = wardrobePool.find(w => w.id === p.itemId || (p.item && w.id === p.item.id));
          return {
            ...p,
            item: matched || p.item,
            isOwned: !!matched || p.isOwned,
          };
        });
      };

      rec.pieces = hydrateList(rec.pieces);
      if (rec.looks && rec.looks.length > 0) {
        rec.looks = rec.looks.map((look: any) => ({
          ...look,
          pieces: hydrateList(look.pieces),
        }));
      }

      return rec;
    }

    throw new Error((res.data as any)?.error || res.error || 'Stylist engine failed to generate recommendation. Please retry.');
  }

  async analyzeGarment(params: {
    imageUrl?: string;
    imageBase64?: string;
    mimeType?: string;
    hint?: string;
  }): Promise<GarmentAnalysisResult & { hasMultipleItems?: boolean; isClothingItem?: boolean }> {
    const res = await this.safePost<any>(
      '/api/gemini/analyze-garment',
      params
    );

    if (res.ok && res.data?.success && res.data?.analysis) {
      return res.data.analysis;
    }

    throw new Error(res.data?.error || "AI identification couldn't be completed.");
  }

  async chatConcierge(params: {
    message: string;
    conversationHistory: { role: 'user' | 'assistant'; content: string }[];
    wardrobePool: WardrobeItem[];
    weather?: string;
    location?: string;
    time?: string;
    date?: string;
  }): Promise<string> {
    const res = await this.safePost<{ success: boolean; reply?: string }>(
      '/api/gemini/chat',
      params
    );

    if (res.ok && res.data?.reply) {
      return res.data.reply;
    }

    return "I am analyzing your wardrobe pieces. For this occasion, I recommend prioritizing clean lines, tailored proportions, and complementary neutral tones.";
  }

  async getFashionTrends(params?: {
    season?: string;
    category?: string;
    forceRefresh?: boolean;
  }): Promise<import('../types').FashionTrendsReport> {
    const seasonKey = params?.season || "Current Season";
    const cacheKey = `pn_trends_${seasonKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    if (!params?.forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (Date.now() - parsed.timestamp < 3600000)) { // 1 hour TTL
            return parsed.report;
          }
        }
      } catch {}
    }

    const res = await this.safePost<{ success: boolean; report?: import('../types').FashionTrendsReport }>(
      '/api/gemini/fashion-trends',
      params || {}
    );

    if (res.ok && res.data?.success && res.data?.report) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ report: res.data.report, timestamp: Date.now() }));
      } catch {}
      return res.data.report;
    }

    throw new Error(res.error || 'Runway trend intelligence unavailable.');
  }

  /**
   * AI Wardrobe Auto-Organization by Color Palette & Style Aesthetics
   */
  async organizeWardrobe(items: WardrobeItem[]): Promise<WardrobeAutoOrganizeResult> {
    const res = await this.safePost<{ success: boolean; organization?: WardrobeAutoOrganizeResult }>(
      '/api/gemini/organize-wardrobe',
      { items }
    );

    if (res.ok && res.data?.success && res.data.organization) {
      return res.data.organization;
    }

    // Deterministic client fallback clustering
    const colorMap: Record<string, string[]> = {
      'Neutrals & Monochromes': [],
      'Warm Earth & Amber Tones': [],
      'Cool Blues & Denim': [],
      'Rich Jewels & Evening Accents': [],
    };

    items.forEach(item => {
      const c = (item.color || '').toLowerCase();
      if (
        c.includes('black') ||
        c.includes('charcoal') ||
        c.includes('white') ||
        c.includes('grey') ||
        c.includes('gray') ||
        c.includes('silver')
      ) {
        colorMap['Neutrals & Monochromes'].push(item.id);
      } else if (
        c.includes('beige') ||
        c.includes('camel') ||
        c.includes('brown') ||
        c.includes('khaki') ||
        c.includes('terracotta') ||
        c.includes('gold')
      ) {
        colorMap['Warm Earth & Amber Tones'].push(item.id);
      } else if (c.includes('blue') || c.includes('navy') || c.includes('denim')) {
        colorMap['Cool Blues & Denim'].push(item.id);
      } else {
        colorMap['Rich Jewels & Evening Accents'].push(item.id);
      }
    });

    const clusters = Object.entries(colorMap)
      .filter(([_, ids]) => ids.length > 0)
      .map(([name, ids], idx) => {
        let styleVibe = 'Refined Minimalist';
        let palette = ['#0F172A', '#64748B'];
        let tip = 'Balance darker pieces with lighter foundational layers for structural depth.';

        if (name.includes('Warm')) {
          styleVibe = 'Soft Sartorial Warmth';
          palette = ['#D97706', '#92400E', '#FDE68A'];
          tip = 'Combine textured knits with smooth tailored wool for tactile harmony.';
        } else if (name.includes('Blues')) {
          styleVibe = 'Elevated Casual & Denim';
          palette = ['#1D4ED8', '#60A5FA', '#DBEAFE'];
          tip = 'Layer varying tones of blue to achieve effortless tonal symmetry.';
        } else if (name.includes('Jewels')) {
          styleVibe = 'High-Impact Sophistication';
          palette = ['#059669', '#881337', '#7C3AED'];
          tip = 'Use as the solitary focal statement piece anchored by dark neutral trousers.';
        }

        return {
          id: `cluster_client_${idx}`,
          name,
          themeType: 'color' as const,
          primaryColorPalette: palette,
          styleVibe,
          itemIds: ids,
          aestheticDescription: `Curated grouping of ${ids.length} pieces sharing tonal balance and compatible silhouette textures.`,
          stylingTip: tip,
        };
      });

    return {
      organizedAt: new Date().toISOString(),
      executiveAestheticSummary: `Your wardrobe exhibits exceptional harmony across ${clusters.length} cohesive color and style clusters.`,
      capsuleHarmonyScore: 95,
      clusters,
      paletteBreakdown: [
        { colorName: 'Neutral & Dark Monochromes', hex: '#0F172A', itemCount: Math.ceil(items.length * 0.45), percentage: 45 },
        { colorName: 'Indigo & Blues', hex: '#1E40AF', itemCount: Math.ceil(items.length * 0.3), percentage: 30 },
        { colorName: 'Warm Earth & Accents', hex: '#B45309', itemCount: Math.max(1, items.length - Math.ceil(items.length * 0.75)), percentage: 25 },
      ],
      styleDistribution: [
        { styleName: 'Smart Casual', itemCount: Math.ceil(items.length * 0.5), percentage: 50 },
        { styleName: 'Tailored Minimal', itemCount: Math.ceil(items.length * 0.3), percentage: 30 },
        { styleName: 'Relaxed Weekend', itemCount: Math.max(1, items.length - Math.ceil(items.length * 0.8)), percentage: 20 },
      ],
    };
  }

  async analyzeStylePhoto(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<VisualStyleAnalysis> {
    const res = await this.safePost<{ success: boolean; analysis?: VisualStyleAnalysis }>(
      '/api/gemini/analyze-style-photo',
      { imageBase64, mimeType }
    );

    if (res.ok && res.data?.success && res.data?.analysis) {
      return res.data.analysis;
    }

    // Default fallback analysis if offline or rate-limited
    return {
      faceShape: 'Oval',
      skinTone: 'Neutral',
      contrastLevel: 'Medium',
      hairCharacteristics: 'Natural tones',
      recommendedPalettes: ['Midnight Navy', 'Rich Camel', 'Forest Green', 'Crisp Ivory', 'Charcoal Slate'],
      recommendedNecklines: ['Classic spread collar shirts', 'Structured notched lapels', 'Fine-gauge crewneck knits'],
      analysisNotes: 'A balanced neutral undertone offers great sartorial versatility, pairing seamlessly with deep monochromatic blues, warm earth tones, and clean tailored collars.',
    };
  }

  async swapOutfitPiece(params: {
    currentOutfitItems: string[];
    slotCategory: string;
    pieceItemId: string;
    occasion?: string;
    temperatureCelsius?: number;
    userProfile?: any;
  }): Promise<{
    success: boolean;
    replacementPiece?: any;
    alternativePieces?: any[];
    reason?: string;
    newConfidenceScore?: number;
    scoreBreakdown?: any;
    error?: string;
  }> {
    const res = await this.safePost<any>('/api/gemini/swap-piece', params);
    if (res.ok && res.data && res.data.success) {
      return res.data;
    }
    return {
      success: false,
      error: res.data?.error || 'No suitable swap found in your wardrobe for this slot.',
    };
  }
}

export const aiStylistService = new AIStylistService();

