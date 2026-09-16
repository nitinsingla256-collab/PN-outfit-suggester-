// src/services/capsuleEngine.ts
import { ExtractedGarment } from '../schemas/garmentSchema';

export interface CapsuleGroup {
  id: string;
  title: string;
  aesthetic: string;
  dominantColor: string;  // 60% base tone
  secondaryColor: string; // 30% secondary tone
  accentColor: string;    // 10% pop tone
  items: ExtractedGarment[];
  harmonyScore: number;   // 0 - 100%
}

export function generateCapsules(wardrobe: ExtractedGarment[]): CapsuleGroup[] {
  if (!wardrobe.length) return [];

  const casualItems = wardrobe.filter(g => g.formality === 'Casual' || g.formality === 'Smart Casual');
  const formalItems = wardrobe.filter(g => g.formality === 'Formal' || g.formality === 'Business');

  const createGroup = (id: string, title: string, aesthetic: string, items: ExtractedGarment[]): CapsuleGroup => {
    const colorFrequency: Record<string, number> = {};
    items.forEach(item => {
      colorFrequency[item.color] = (colorFrequency[item.color] || 0) + 1;
    });

    const sorted = Object.keys(colorFrequency).sort((a, b) => colorFrequency[b] - colorFrequency[a]);

    return {
      id,
      title,
      aesthetic,
      dominantColor: sorted[0] || 'Neutral',
      secondaryColor: sorted[1] || 'Slate',
      accentColor: sorted[2] || 'Emerald Mint',
      items,
      harmonyScore: Math.min(100, Math.round((items.length / 4) * 80 + 20)),
    };
  };

  const capsules: CapsuleGroup[] = [];

  if (casualItems.length) {
    capsules.push(createGroup('capsule-urban', 'Atelier Everyday', 'Smart Minimalist', casualItems));
  }
  if (formalItems.length) {
    capsules.push(createGroup('capsule-executive', 'Executive Suite', 'Modern Formal', formalItems));
  }

  return capsules;
}
