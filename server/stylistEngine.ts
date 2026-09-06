import { GoogleGenAI, Type } from '@google/genai';
import {
  WardrobeItem,
  PersonalStyleProfile,
  AIStylistRequest,
  AIStylistResponse,
  OutfitPiece,
  OutfitScoreBreakdown,
  GeneratedLookOption,
} from '../src/types';

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Formality mapping
const FORMALITY_SCORES: Record<string, number> = {
  'Casual': 1,
  'Smart Casual': 2,
  'Business Casual': 3,
  'Formal': 4,
  'Black Tie': 5,
};

// Target formality range for each occasion
const OCCASION_FORMALITY_MAP: Record<string, { min: number; max: number; target: number }> = {
  'College': { min: 1, max: 2, target: 1 },
  'Casual day': { min: 1, max: 2, target: 1 },
  'Casual': { min: 1, max: 2, target: 1 },
  'Casual outing': { min: 1, max: 2, target: 1 },
  'Outdoor': { min: 1, max: 2, target: 1 },
  'Travel': { min: 1, max: 2, target: 1 },
  'Festival': { min: 1, max: 2, target: 2 },
  'Brunch': { min: 1, max: 3, target: 2 },
  'Date': { min: 2, max: 3, target: 2 },
  'Dinner': { min: 2, max: 3, target: 2 },
  'Party': { min: 2, max: 4, target: 3 },
  'Business Casual': { min: 2, max: 4, target: 3 },
  'Work': { min: 2, max: 4, target: 3 },
  'Presentation': { min: 3, max: 5, target: 4 },
  'Interview': { min: 3, max: 5, target: 4 },
  'Formal': { min: 4, max: 5, target: 4 },
  'Wedding': { min: 4, max: 5, target: 5 },
  'Black Tie': { min: 5, max: 5, target: 5 },
};

// Classic harmonious color pairings
const HARMONIOUS_COLOR_PAIRS: [string, string][] = [
  ['navy', 'white'],
  ['navy', 'cream'],
  ['navy', 'beige'],
  ['navy', 'camel'],
  ['navy', 'grey'],
  ['navy', 'charcoal'],
  ['navy', 'brown'],
  ['black', 'white'],
  ['black', 'grey'],
  ['black', 'charcoal'],
  ['black', 'camel'],
  ['black', 'beige'],
  ['charcoal', 'white'],
  ['charcoal', 'blue'],
  ['charcoal', 'pink'],
  ['charcoal', 'burgundy'],
  ['olive', 'beige'],
  ['olive', 'cream'],
  ['olive', 'white'],
  ['olive', 'black'],
  ['olive', 'navy'],
  ['olive', 'camel'],
  ['brown', 'cream'],
  ['brown', 'blue'],
  ['brown', 'white'],
  ['brown', 'sage'],
  ['camel', 'white'],
  ['camel', 'black'],
  ['camel', 'navy'],
  ['burgundy', 'navy'],
  ['burgundy', 'grey'],
  ['burgundy', 'charcoal'],
  ['sage', 'white'],
  ['sage', 'beige'],
  ['sage', 'cream'],
  ['terracotta', 'cream'],
  ['terracotta', 'navy'],
  ['terracotta', 'white'],
];

interface ScoredCandidate {
  pieces: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    dress?: WardrobeItem;
    footwear: WardrobeItem;
    outerwear?: WardrobeItem;
    accessory?: WardrobeItem;
  };
  totalScore: number;
  breakdown: OutfitScoreBreakdown;
  matchLabel: 'Strong match' | 'Good match' | 'Limited wardrobe match' | 'Profile incomplete';
  missingLayerWarning?: string;
}

/**
 * Stage 1: Hard Filters
 */
function applyHardFilters(
  items: WardrobeItem[],
  request: AIStylistRequest,
  userProfile?: PersonalStyleProfile
): WardrobeItem[] {
  const {
    excludeItemIds = [],
    temperatureCelsius,
    weatherDescription = '',
    occasion = 'Dinner',
  } = request;

  const occasionLower = occasion.toLowerCase();
  const isFormalEvent = ['formal', 'wedding', 'interview', 'presentation', 'black tie'].some(o => occasionLower.includes(o));
  const isRain = /rain|shower|drizzle/i.test(weatherDescription);

  return items.filter(item => {
    // 1. User exclusions
    if (excludeItemIds.includes(item.id)) return false;

    // 2. Disliked colors filter
    if (userProfile?.dislikedColors && userProfile.dislikedColors.length > 0) {
      const itemColor = (item.color || '').toLowerCase();
      const isDisliked = userProfile.dislikedColors.some(
        dc => dc.toLowerCase() === itemColor
      );
      if (isDisliked) return false;
    }

    // 3. Thermal hard limits
    if (temperatureCelsius !== undefined) {
      const isHeavyOuterwear =
        item.category === 'Outerwear' &&
        /coat|parka|trench|down|puffer|heavy wool|shearling/i.test(item.name + ' ' + (item.material || ''));
      const isHeavySweater =
        item.category === 'Tops' &&
        /chunky|heavy knit|wool cable|fleece/i.test(item.name + ' ' + (item.material || ''));

      // Very hot (> 25°C): eliminate heavy coats & bulky winter knits
      if (temperatureCelsius > 25) {
        if (isHeavyOuterwear || isHeavySweater) return false;
      }

      // Very cold (< 12°C): eliminate shorts, tank tops, sandals
      if (temperatureCelsius < 12) {
        if (/short|tank top|sleeveless|swim/i.test(item.name + ' ' + (item.type || ''))) return false;
        if (item.category === 'Footwear' && /sandal|flip flop|slide/i.test(item.name + ' ' + (item.type || ''))) return false;
      }
    }

    // 4. Occasion formality hard limits
    if (isFormalEvent) {
      // Exclude gym clothes, distressed casual shorts, flip-flops
      if (/sweatpants|jogger|gym|athletic|distressed|graphic tee|tank top/i.test(item.name + ' ' + (item.tags || []).join(' '))) {
        return false;
      }
      if (item.category === 'Footwear' && /running|sneaker|trainer|slide|sandal/i.test(item.name + ' ' + (item.type || ''))) {
        return false;
      }
    }

    // 5. Wet weather limits
    if (isRain && item.category === 'Footwear') {
      if (/suede|canvas espadrille|mesh/i.test(item.material || '') && /sandal/i.test(item.name)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Stage 2: Combinatorial Candidate Generator & Compatibility Engine
 */
function generateScoredCandidates(
  filteredItems: WardrobeItem[],
  request: AIStylistRequest,
  userProfile?: PersonalStyleProfile,
  wearHistory: any[] = []
): ScoredCandidate[] {
  const tops = filteredItems.filter(i => i.category === 'Tops');
  const bottoms = filteredItems.filter(i => i.category === 'Bottoms');
  const dresses = filteredItems.filter(i => i.category === 'Dresses');
  const footwears = filteredItems.filter(i => i.category === 'Footwear');
  const outerwears = filteredItems.filter(i => i.category === 'Outerwear');
  const accessories = filteredItems.filter(i => i.category === 'Accessories');

  const {
    mustIncludeItemIds = [],
    occasion = 'Dinner',
    dressCode = 'Smart Casual',
    temperatureCelsius,
    stylePreference = 'Smart Casual',
    colorPreference,
  } = request;

  const candidates: ScoredCandidate[] = [];

  // Helper to test color harmony
  function evaluateColorHarmony(itemColors: string[]): number {
    const cleanColors = itemColors.map(c => (c || '').toLowerCase().trim()).filter(Boolean);
    if (cleanColors.length === 0) return 15;

    let harmonyScore = 18;

    // Monochromatic / single tone check
    const unique = new Set(cleanColors);
    if (unique.size === 1) {
      harmonyScore += 4; // Clean tonal look
    }

    // Pairwise harmony check
    let knownPairMatches = 0;
    for (let i = 0; i < cleanColors.length; i++) {
      for (let j = i + 1; j < cleanColors.length; j++) {
        const c1 = cleanColors[i];
        const c2 = cleanColors[j];
        if (c1 === c2) {
          knownPairMatches++;
          continue;
        }
        const hasHarmonious = HARMONIOUS_COLOR_PAIRS.some(
          ([p1, p2]) => (c1.includes(p1) && c2.includes(p2)) || (c1.includes(p2) && c2.includes(p1))
        );
        if (hasHarmonious) knownPairMatches++;
      }
    }

    if (knownPairMatches > 0) harmonyScore += Math.min(5, knownPairMatches * 2);

    // Profile preferred colors bonus
    if (userProfile?.preferredColors && userProfile.preferredColors.length > 0) {
      const prefMatches = cleanColors.filter(c =>
        userProfile.preferredColors.some(pc => c.includes(pc.toLowerCase()))
      ).length;
      if (prefMatches > 0) harmonyScore += 2;
    }

    // Request color preference match
    if (colorPreference && cleanColors.some(c => c.includes(colorPreference.toLowerCase()))) {
      harmonyScore += 2;
    }

    // Profile contrast calibration
    if (userProfile?.visualAnalysis?.contrastLevel === 'High' && cleanColors.length >= 2) {
      const hasDark = cleanColors.some(c => /black|navy|charcoal|dark/i.test(c));
      const hasLight = cleanColors.some(c => /white|cream|ivory|light|beige/i.test(c));
      if (hasDark && hasLight) harmonyScore += 2;
    }

    return Math.min(25, Math.max(5, harmonyScore));
  }

  // Helper to evaluate formality & silhouette balance
  function evaluateFormalityAndSilhouette(
    comboItems: WardrobeItem[]
  ): number {
    let score = 20;
    const targetOccasion = OCCASION_FORMALITY_MAP[occasion] || { min: 2, max: 3, target: 2 };
    
    // Check item formality variance
    const itemFormalities = comboItems.map(i => FORMALITY_SCORES[i.formality || 'Smart Casual'] || 2);
    const minFormality = Math.min(...itemFormalities);
    const maxFormality = Math.max(...itemFormalities);
    const spread = maxFormality - minFormality;

    if (spread <= 1) {
      score += 3; // Coherent formality across pieces
    } else if (spread >= 3) {
      score -= 8; // Clashing formality (e.g. tuxedo piece with gym shorts)
    }

    // Check fit preferences
    if (userProfile?.preferredFit) {
      const matchesPrefFit = comboItems.filter(i => i.fit === userProfile.preferredFit).length;
      if (matchesPrefFit > 0) score += 2;
    }

    return Math.min(25, Math.max(5, score));
  }

  // Helper for occasion suitability
  function evaluateOccasionSuitability(comboItems: WardrobeItem[]): number {
    const target = OCCASION_FORMALITY_MAP[occasion] || { min: 2, max: 3, target: 2 };
    const avgFormality =
      comboItems.reduce((acc, i) => acc + (FORMALITY_SCORES[i.formality || 'Smart Casual'] || 2), 0) /
      comboItems.length;

    let score = 22;
    const dist = Math.abs(avgFormality - target.target);
    score -= dist * 4;

    // Check style tag matches
    const hasStyleTag = comboItems.some(i =>
      (i.style || '').toLowerCase().includes(stylePreference.toLowerCase()) ||
      (i.occasion || []).some(o => o.toLowerCase().includes(occasion.toLowerCase()))
    );
    if (hasStyleTag) score += 3;

    return Math.min(25, Math.max(5, score));
  }

  // Helper for weather suitability
  function evaluateWeather(
    comboItems: WardrobeItem[],
    hasOuterwear: boolean
  ): { score: number; warning?: string } {
    if (temperatureCelsius === undefined) {
      return { score: 12 };
    }

    let score = 12;
    let warning: string | undefined;

    if (temperatureCelsius < 14) {
      if (hasOuterwear) {
        score += 3;
      } else {
        score -= 4;
        warning = 'Weather is cool. A warm jacket or tailored coat is recommended but not available in current selection.';
      }
    } else if (temperatureCelsius > 24) {
      if (hasOuterwear) {
        score -= 3; // Unnecessary heavy layer
      } else {
        score += 3;
      }
    } else {
      score += 3; // Temperate weather
    }

    return { score: Math.min(15, Math.max(4, score)), warning };
  }

  // Helper for novelty & wear history
  function evaluateNovelty(comboItems: WardrobeItem[]): number {
    let novelty = 8;
    const itemIds = new Set(comboItems.map(i => i.id));
    
    // Check times worn
    const highWearItems = comboItems.filter(i => (i.timesWorn || 0) > 6).length;
    novelty -= highWearItems * 1.5;

    // Check recent wear history
    const recentWorn = wearHistory.slice(0, 5).some(entry =>
      (entry.itemIds || []).some((id: string) => itemIds.has(id))
    );
    if (recentWorn) novelty -= 2;

    return Math.min(10, Math.max(2, novelty));
  }

  // Generate top+bottom combinations
  const topPool = tops.slice(0, 10);
  const bottomPool = bottoms.slice(0, 8);
  const footPool = footwears.slice(0, 6);
  const outerPool = outerwears.slice(0, 4);

  // Outerwear decision based on temperature & occasion
  const needsOuterwear = temperatureCelsius !== undefined ? temperatureCelsius < 18 : outerPool.length > 0;

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const footwear of footPool) {
        const baseItems = [top, bottom, footwear];

        // Check must-includes
        if (mustIncludeItemIds.length > 0) {
          const comboIds = baseItems.map(i => i.id);
          const containsMustInclude = mustIncludeItemIds.every(id =>
            comboIds.includes(id) || outerPool.some(o => o.id === id)
          );
          if (!containsMustInclude) continue;
        }

        // Test with and without outerwear
        const outerOptions = needsOuterwear && outerPool.length > 0 ? outerPool : [undefined];

        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;

          const colorScore = evaluateColorHarmony(comboItems.map(i => i.color));
          const formalityScore = evaluateFormalityAndSilhouette(comboItems);
          const occasionScore = evaluateOccasionSuitability(comboItems);
          const weatherEval = evaluateWeather(comboItems, !!outerwear);
          const noveltyScore = evaluateNovelty(comboItems);

          const total = Math.round(
            colorScore + formalityScore + occasionScore + weatherEval.score + noveltyScore
          );

          // Real, honest breakdown percentages (0-100)
          const breakdown: OutfitScoreBreakdown = {
            colorHarmony: Math.round((colorScore / 25) * 100),
            occasionFit: Math.round((occasionScore / 25) * 100),
            weatherMatch: Math.round((weatherEval.score / 15) * 100),
            coherence: Math.round((formalityScore / 25) * 100),
          };

          let matchLabel: ScoredCandidate['matchLabel'] = 'Limited wardrobe match';
          if (!userProfile || !userProfile.isCompleted) {
            matchLabel = 'Profile incomplete';
          } else if (total >= 80) {
            matchLabel = 'Strong match';
          } else if (total >= 65) {
            matchLabel = 'Good match';
          }

          candidates.push({
            pieces: {
              top,
              bottom,
              footwear,
              outerwear,
              accessory: accessories[0],
            },
            totalScore: total,
            breakdown,
            matchLabel,
            missingLayerWarning: weatherEval.warning,
          });
        }
      }
    }
  }

  // Generate dress combinations if available
  if (dresses.length > 0) {
    for (const dress of dresses.slice(0, 6)) {
      for (const footwear of footPool) {
        const baseItems = [dress, footwear];
        const outerOptions = outerPool.length > 0 ? outerPool : [undefined];

        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;
          const colorScore = evaluateColorHarmony(comboItems.map(i => i.color));
          const formalityScore = evaluateFormalityAndSilhouette(comboItems);
          const occasionScore = evaluateOccasionSuitability(comboItems);
          const weatherEval = evaluateWeather(comboItems, !!outerwear);
          const noveltyScore = evaluateNovelty(comboItems);

          const total = Math.round(
            colorScore + formalityScore + occasionScore + weatherEval.score + noveltyScore
          );

          const breakdown: OutfitScoreBreakdown = {
            colorHarmony: Math.round((colorScore / 25) * 100),
            occasionFit: Math.round((occasionScore / 25) * 100),
            weatherMatch: Math.round((weatherEval.score / 15) * 100),
            coherence: Math.round((formalityScore / 25) * 100),
          };

          let matchLabel: ScoredCandidate['matchLabel'] = 'Limited wardrobe match';
          if (!userProfile || !userProfile.isCompleted) {
            matchLabel = 'Profile incomplete';
          } else if (total >= 80) {
            matchLabel = 'Strong match';
          } else if (total >= 65) {
            matchLabel = 'Good match';
          }

          candidates.push({
            pieces: {
              dress,
              footwear,
              outerwear,
              accessory: accessories[0],
            },
            totalScore: total,
            breakdown,
            matchLabel,
            missingLayerWarning: weatherEval.warning,
          });
        }
      }
    }
  }

  // Sort by highest score first
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  return candidates;
}

/**
 * Stage 5: AI Reasoning over verified candidate pieces using Gemini 3.8 Flash
 */
async function generateAIReasoning(
  candidate: ScoredCandidate,
  request: AIStylistRequest,
  userProfile?: PersonalStyleProfile,
  userName: string = 'Client'
): Promise<{
  outfitName: string;
  whyThisWorks: string;
  colorHarmonyReasoning: string;
  weatherFitReasoning: string;
  occasionFitReasoning: string;
  profileMatchReasoning: string;
  stylingTips: string[];
  suggestedAccessories: string[];
  missingWardrobeItem?: string;
}> {
  const ai = getAIClient();
  const { occasion = 'Dinner', dressCode = 'Smart Casual', weatherDescription, temperatureCelsius, location } = request;

  const piecesList = Object.entries(candidate.pieces)
    .filter(([_, item]) => Boolean(item))
    .map(([slot, item]) => `${slot}: "${item!.name}" (${item!.color} ${item!.material || ''} ${item!.type || item!.category})`)
    .join('\n');

  if (!ai) {
    // Deterministic factual fallback if no API key
    const topOrDress = candidate.pieces.top?.name || candidate.pieces.dress?.name || 'garment';
    const bottom = candidate.pieces.bottom?.name || 'trousers';
    const foot = candidate.pieces.footwear.name;
    const topColor = candidate.pieces.top?.color || candidate.pieces.dress?.color || 'Neutral';
    const bottomColor = candidate.pieces.bottom?.color || 'Dark';

    return {
      outfitName: `${topColor} & ${bottomColor} ${occasion} Ensemble`,
      whyThisWorks: `The ${topOrDress} coordinates cleanly with the ${bottom}, grounded by ${foot} to balance proportion and formality.`,
      colorHarmonyReasoning: `The ${topColor} upper creates a controlled tonal dialogue with the ${bottomColor} base without competing color elements.`,
      weatherFitReasoning: weatherDescription
        ? `Calibrated for ${weatherDescription}: fabric weights and layering accommodate ambient conditions comfortably.`
        : 'Fabric drape and breathable structure provide adaptable all-day comfort.',
      occasionFitReasoning: `The balanced silhouette aligns precisely with the expectations of a ${occasion} setting under a ${dressCode} dress code.`,
      profileMatchReasoning: userProfile?.visualAnalysis
        ? `Tonal palette and collar lines complement ${userProfile.visualAnalysis.skinTone} undertones and ${userProfile.visualAnalysis.contrastLevel} contrast.`
        : 'Proportions and neutral tones provide versatile personal framing.',
      stylingTips: [
        'Tuck or half-tuck the top cleanly to define the natural waistline.',
        'Coordinate leather and hardware finishes across your belt and footwear.',
      ],
      suggestedAccessories: [
        candidate.pieces.accessory?.name || 'Minimalist leather belt',
        'Tailored timepiece',
      ],
      missingWardrobeItem: candidate.missingLayerWarning,
    };
  }

  const prompt = `You are a discerning, highly skilled personal wardrobe stylist for ${userName}.
You are reasoning about an actual candidate outfit composed strictly from their verified wardrobe items.

VERIFIED PIECES:
${piecesList}

CONTEXT:
- Occasion: ${occasion}
- Dress Code: ${dressCode}
- Location: ${location || 'Venue'}
- Weather: ${weatherDescription || 'Not specified'} (${temperatureCelsius !== undefined ? `${temperatureCelsius}°C` : 'temperature not provided'})
${userProfile?.visualAnalysis ? `- USER PROFILE: Face Shape: ${userProfile.visualAnalysis.faceShape}, Undertone: ${userProfile.visualAnalysis.skinTone}, Contrast Level: ${userProfile.visualAnalysis.contrastLevel}, Preferred Fit: ${userProfile.preferredFit}` : ''}
${candidate.missingLayerWarning ? `- WARDROBE LIMITATION: ${candidate.missingLayerWarning}` : ''}

DIRECTIVES:
- Provide specific, analytical reasoning referencing the ACTUAL selected items and their colors/materials.
- Avoid generic filler phrases like "These colors create a sophisticated aesthetic" or "exudes quiet luxury".
- Explain the visual contrast (e.g. "The navy shirt provides the darker anchor, while the lighter trousers create controlled contrast. The brown footwear stays within the warm accent family without introducing another competing color.").
- Mention thermal comfort honestly based on the temperature.
- Highlight how the look flatters their specific undertone or contrast level if profile is present.
- If a wardrobe gap was detected (e.g. cold weather with no outerwear), state it constructively.

Return JSON matching this schema:
{
  "outfitName": "Concise descriptive title (e.g. 'Navy Oxford & Olive Chinos Ensemble')",
  "whyThisWorks": "Clear 2-sentence explanation of why these specific pieces work together in silhouette, texture, and balance",
  "colorHarmonyReasoning": "Specific explanation of how the colors interact and balance each other",
  "weatherFitReasoning": "Specific explanation of thermal comfort and climate suitability",
  "occasionFitReasoning": "Why the formality matches the requested occasion and dress code",
  "profileMatchReasoning": "How the look honors their undertone, contrast level, or collar preferences",
  "stylingTips": ["Practical tip 1 (e.g. cuffing/tucking)", "Practical tip 2 (e.g. hardware/belt coordination)"],
  "suggestedAccessories": ["Accessory suggestion 1", "Accessory suggestion 2"],
  "missingWardrobeItem": "${candidate.missingLayerWarning || ''}"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      outfitName: parsed.outfitName || `${occasion} Ensemble`,
      whyThisWorks: parsed.whyThisWorks || 'Clean proportional balance across all pieces.',
      colorHarmonyReasoning: parsed.colorHarmonyReasoning || 'Tonal harmony between top and bottom anchors the look.',
      weatherFitReasoning: parsed.weatherFitReasoning || (weatherDescription ? `Appropriate for ${weatherDescription}.` : 'Comfortable year-round layering.'),
      occasionFitReasoning: parsed.occasionFitReasoning || `Tailored specifically for ${occasion}.`,
      profileMatchReasoning: parsed.profileMatchReasoning || 'Colors and cuts align with personal features.',
      stylingTips: Array.isArray(parsed.stylingTips) ? parsed.stylingTips : ['Ensure clean hems and balanced proportions.'],
      suggestedAccessories: Array.isArray(parsed.suggestedAccessories) ? parsed.suggestedAccessories : ['Classic leather belt', 'Minimal timepiece'],
      missingWardrobeItem: candidate.missingLayerWarning || parsed.missingWardrobeItem || undefined,
    };
  } catch (err) {
    console.warn('AI reasoning error, using deterministic styling rationale:', err);
    return {
      outfitName: `${occasion} Ensemble`,
      whyThisWorks: 'Pieces coordinate with balanced visual weight and clean separation between top and bottom.',
      colorHarmonyReasoning: 'Controlled color contrast anchors the outfit without conflicting saturation.',
      weatherFitReasoning: weatherDescription ? `Matches ${weatherDescription} conditions.` : 'Adaptive layering.',
      occasionFitReasoning: `Formality matches the expectations of a ${occasion} setting.`,
      profileMatchReasoning: 'Neutral tones provide versatile personal framing.',
      stylingTips: ['Tuck the top cleanly to accentuate waistline proportions.', 'Coordinate leather tones across belt and shoes.'],
      suggestedAccessories: ['Minimalist dress watch', 'Complementary leather belt'],
      missingWardrobeItem: candidate.missingLayerWarning,
    };
  }
}

/**
 * Main Entry Point: 5-Stage AI Stylist Engine
 */
export async function generateStylistRecommendations(
  userId: string,
  request: AIStylistRequest,
  userWardrobe: WardrobeItem[],
  userProfile?: PersonalStyleProfile,
  userWearHistory: any[] = [],
  userName: string = 'Client'
): Promise<AIStylistResponse & { canGenerate: boolean; missingCategories?: string[]; advice?: string }> {
  // Check empty wardrobe
  if (!userWardrobe || userWardrobe.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: 'Empty Wardrobe',
      summary: "Your digital wardrobe currently contains 0 catalogued pieces.",
      pieces: [],
      whyItWorks: '',
      weatherReasoning: '',
      occasionReasoning: '',
      stylingTips: ['Upload photos of tops, trousers, and footwear to unlock personalized outfit recommendations.'],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: new Date().toISOString(),
      canGenerate: false,
      missingCategories: ['Tops', 'Bottoms', 'Footwear'],
      advice: 'Your wardrobe is currently empty. Add foundational items like tops, trousers, and footwear to start generating complete outfits.',
    };
  }

  // Stage 1: Hard Filters
  const filtered = applyHardFilters(userWardrobe, request, userProfile);

  // Category inventory checks
  const hasTops = filtered.some(i => i.category === 'Tops');
  const hasBottoms = filtered.some(i => i.category === 'Bottoms');
  const hasDresses = filtered.some(i => i.category === 'Dresses');
  const hasFootwear = filtered.some(i => i.category === 'Footwear');

  const missingCategories: string[] = [];
  if (!hasTops && !hasDresses) missingCategories.push('Tops or Dresses');
  if (!hasBottoms && !hasDresses) missingCategories.push('Bottoms');
  if (!hasFootwear) missingCategories.push('Footwear');

  if (missingCategories.length > 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: 'Insufficient Wardrobe Pieces',
      summary: "Your wardrobe doesn't contain enough compatible pieces for this request.",
      pieces: [],
      whyItWorks: '',
      weatherReasoning: '',
      occasionReasoning: '',
      stylingTips: [`Catalogue items in missing categories: ${missingCategories.join(', ')}`],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: new Date().toISOString(),
      canGenerate: false,
      missingCategories,
      advice: `Your wardrobe doesn't contain enough compatible pieces for this request. Add ${missingCategories.join(' and ')} to complete combinations for this occasion.`,
    };
  }

  // Stage 2 & 3: Compatibility Engine & Personalization
  const candidates = generateScoredCandidates(filtered, request, userProfile, userWearHistory);

  if (candidates.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: 'No Compatible Combination',
      summary: "Your wardrobe doesn't contain enough compatible pieces matching the active filters and exclusions.",
      pieces: [],
      whyItWorks: '',
      weatherReasoning: '',
      occasionReasoning: '',
      stylingTips: ['Try loosening exclusions or adding complementary wardrobe staples.'],
      suggestedAccessories: [],
      confidenceScore: 0,
      generatedAt: new Date().toISOString(),
      canGenerate: false,
      missingCategories: ['Compatible pieces'],
      advice: "Your wardrobe pieces couldn't be assembled into a balanced outfit with current constraints. Try adjusting filters or adding more versatile pieces.",
    };
  }

  // Pick primary candidate look
  const primaryCandidate = candidates[0];

  // Stage 5: AI Reasoning
  const reasoning = await generateAIReasoning(primaryCandidate, request, userProfile, userName);

  // Server Validation: construct verified pieces strictly from user's inventory
  const verifiedPieces: OutfitPiece[] = [];
  const validUserItemIds = new Set(userWardrobe.map(i => i.id));

  if (primaryCandidate.pieces.top && validUserItemIds.has(primaryCandidate.pieces.top.id)) {
    verifiedPieces.push({
      category: 'Tops',
      itemId: primaryCandidate.pieces.top.id,
      item: primaryCandidate.pieces.top,
      role: 'Upper foundational piece establishing color and neckline.',
      suggestedDescription: primaryCandidate.pieces.top.name,
      isOwned: true,
    });
  } else if (primaryCandidate.pieces.dress && validUserItemIds.has(primaryCandidate.pieces.dress.id)) {
    verifiedPieces.push({
      category: 'Dresses',
      itemId: primaryCandidate.pieces.dress.id,
      item: primaryCandidate.pieces.dress,
      role: 'Single-piece foundational silhouette.',
      suggestedDescription: primaryCandidate.pieces.dress.name,
      isOwned: true,
    });
  }

  if (primaryCandidate.pieces.bottom && validUserItemIds.has(primaryCandidate.pieces.bottom.id)) {
    verifiedPieces.push({
      category: 'Bottoms',
      itemId: primaryCandidate.pieces.bottom.id,
      item: primaryCandidate.pieces.bottom,
      role: 'Grounding bottom silhouette establishing proportion.',
      suggestedDescription: primaryCandidate.pieces.bottom.name,
      isOwned: true,
    });
  }

  if (primaryCandidate.pieces.outerwear && validUserItemIds.has(primaryCandidate.pieces.outerwear.id)) {
    verifiedPieces.push({
      category: 'Outerwear',
      itemId: primaryCandidate.pieces.outerwear.id,
      item: primaryCandidate.pieces.outerwear,
      role: 'Framing architectural layer for weather and formality.',
      suggestedDescription: primaryCandidate.pieces.outerwear.name,
      isOwned: true,
    });
  }

  if (primaryCandidate.pieces.footwear && validUserItemIds.has(primaryCandidate.pieces.footwear.id)) {
    verifiedPieces.push({
      category: 'Footwear',
      itemId: primaryCandidate.pieces.footwear.id,
      item: primaryCandidate.pieces.footwear,
      role: 'Grounding footwear setting the final formality tone.',
      suggestedDescription: primaryCandidate.pieces.footwear.name,
      isOwned: true,
    });
  }

  if (primaryCandidate.pieces.accessory && validUserItemIds.has(primaryCandidate.pieces.accessory.id)) {
    verifiedPieces.push({
      category: 'Accessories',
      itemId: primaryCandidate.pieces.accessory.id,
      item: primaryCandidate.pieces.accessory,
      role: 'Complementary accent.',
      suggestedDescription: primaryCandidate.pieces.accessory.name,
      isOwned: true,
    });
  }

  // Format alternative looks (if available)
  const looks: GeneratedLookOption[] = [];
  const lookTypes: Array<'SAFE & REFINED' | 'MODERN' | 'STATEMENT'> = ['SAFE & REFINED', 'MODERN', 'STATEMENT'];

  for (let i = 0; i < Math.min(3, candidates.length); i++) {
    const cand = candidates[i];
    const candPieces: OutfitPiece[] = [];

    if (cand.pieces.top) candPieces.push({ category: 'Tops', itemId: cand.pieces.top.id, item: cand.pieces.top, role: 'Top', suggestedDescription: cand.pieces.top.name, isOwned: true });
    if (cand.pieces.dress) candPieces.push({ category: 'Dresses', itemId: cand.pieces.dress.id, item: cand.pieces.dress, role: 'Dress', suggestedDescription: cand.pieces.dress.name, isOwned: true });
    if (cand.pieces.bottom) candPieces.push({ category: 'Bottoms', itemId: cand.pieces.bottom.id, item: cand.pieces.bottom, role: 'Bottom', suggestedDescription: cand.pieces.bottom.name, isOwned: true });
    if (cand.pieces.outerwear) candPieces.push({ category: 'Outerwear', itemId: cand.pieces.outerwear.id, item: cand.pieces.outerwear, role: 'Outerwear', suggestedDescription: cand.pieces.outerwear.name, isOwned: true });
    if (cand.pieces.footwear) candPieces.push({ category: 'Footwear', itemId: cand.pieces.footwear.id, item: cand.pieces.footwear, role: 'Footwear', suggestedDescription: cand.pieces.footwear.name, isOwned: true });

    looks.push({
      id: `look_${i + 1}`,
      lookType: lookTypes[i] || 'SAFE & REFINED',
      title: i === 0 ? reasoning.outfitName : `${request.occasion || 'Curated'} Option ${i + 1}`,
      subtitle: cand.matchLabel,
      pieces: candPieces,
      whyItWorks: i === 0 ? reasoning.whyThisWorks : 'Alternative color and silhouette combination from your wardrobe.',
      bestFor: {
        occasion: request.occasion || 'Dinner',
        time: request.time || 'Evening',
        weather: request.weatherDescription || 'Mild',
      },
      styleNotes: i === 0 ? reasoning.stylingTips : ['Clean proportions and balanced color harmony.'],
      score: cand.totalScore,
      scoreBreakdown: cand.breakdown,
    });
  }

  return {
    id: `rec_${Date.now()}`,
    requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
    outfitName: reasoning.outfitName,
    summary: `${primaryCandidate.matchLabel} (${primaryCandidate.totalScore}/100) — Composed strictly from your verified wardrobe pieces.`,
    pieces: verifiedPieces,
    whyItWorks: reasoning.whyThisWorks,
    weatherReasoning: reasoning.weatherFitReasoning,
    occasionReasoning: reasoning.occasionFitReasoning,
    bestFor: {
      occasion: request.occasion || 'Dinner',
      time: request.time || 'Evening',
      weather: request.weatherDescription || (request.temperatureCelsius !== undefined ? `${request.temperatureCelsius}°C` : 'Mild'),
    },
    stylingTips: reasoning.stylingTips,
    suggestedAccessories: reasoning.suggestedAccessories,
    alternativeLookSuggestion: candidates.length > 1 ? `Alternative option available with ${candidates[1].pieces.top?.name || candidates[1].pieces.bottom?.name || 'alternative piece'}.` : undefined,
    gapAnalysis: reasoning.missingWardrobeItem,
    confidenceScore: primaryCandidate.totalScore, // Honest derived score, never hardcoded 96
    scoreBreakdown: primaryCandidate.breakdown,
    looks,
    generatedAt: new Date().toISOString(),
    canGenerate: true,
  };
}

/**
 * Intelligent Item Swap Engine
 * Swaps one piece while keeping other pieces fixed
 */
export async function swapOutfitPiece(
  userId: string,
  payload: {
    currentPieceIds: string[];
    swapCategory: 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'Accessories';
    currentPieceIdToReplace: string;
    occasion?: string;
    weatherDescription?: string;
    temperatureCelsius?: number;
  },
  userWardrobe: WardrobeItem[],
  userProfile?: PersonalStyleProfile
): Promise<{
  success: boolean;
  replacements: {
    item: WardrobeItem;
    score: number;
    reason: string;
  }[];
  message?: string;
}> {
  const {
    currentPieceIds = [],
    swapCategory,
    currentPieceIdToReplace,
    occasion = 'Dinner',
    weatherDescription,
    temperatureCelsius,
  } = payload;

  // Fixed pieces
  const fixedItems = userWardrobe.filter(
    i => currentPieceIds.includes(i.id) && i.id !== currentPieceIdToReplace
  );

  // Available alternatives in user wardrobe for swapCategory
  const alternatives = userWardrobe.filter(
    i => i.category === swapCategory && i.id !== currentPieceIdToReplace
  );

  if (alternatives.length === 0) {
    return {
      success: false,
      replacements: [],
      message: `No other ${swapCategory.toLowerCase()} found in your digital wardrobe to swap with.`,
    };
  }

  // Score each alternative with fixed pieces
  const scored = alternatives.map(alt => {
    const fullLook = [...fixedItems, alt];
    const colors = fullLook.map(i => i.color);

    // Simple compatibility calculation
    let score = 75;
    const cleanColors = colors.map(c => (c || '').toLowerCase().trim());
    for (const fixed of fixedItems) {
      const fixedColor = (fixed.color || '').toLowerCase();
      const altColor = (alt.color || '').toLowerCase();
      const isHarmonious = HARMONIOUS_COLOR_PAIRS.some(
        ([p1, p2]) => (fixedColor.includes(p1) && altColor.includes(p2)) || (fixedColor.includes(p2) && altColor.includes(p1))
      );
      if (isHarmonious) score += 8;
    }

    // Occasion match
    const target = OCCASION_FORMALITY_MAP[occasion] || { min: 2, max: 3, target: 2 };
    const altFormality = FORMALITY_SCORES[alt.formality || 'Smart Casual'] || 2;
    if (altFormality >= target.min && altFormality <= target.max) {
      score += 6;
    }

    // Profile match
    if (userProfile?.preferredColors?.some(pc => (alt.color || '').toLowerCase().includes(pc.toLowerCase()))) {
      score += 5;
    }

    // Disliked color penalty
    if (userProfile?.dislikedColors?.some(dc => (alt.color || '').toLowerCase().includes(dc.toLowerCase()))) {
      score -= 30;
    }

    score = Math.min(98, Math.max(40, score));

    return {
      item: alt,
      score,
      reason: `The ${alt.color} ${alt.name} pairs with the ${fixedItems.map(f => f.name).join(' and ')} while preserving the ${occasion} formality.`,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    success: true,
    replacements: scored.slice(0, 4),
  };
}
