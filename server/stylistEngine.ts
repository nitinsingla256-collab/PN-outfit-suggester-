import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiModel } from './geminiConfig';
import {
  WardrobeItem,
  PersonalStyleProfile,
  AIStylistRequest,
  AIStylistResponse,
  OutfitPiece,
  OutfitScoreBreakdown,
  GeneratedLookOption,
} from '../src/types';
import {
  evaluateColorCompatibility,
  evaluatePatternCompatibility,
  normalizeFormality,
  OCCASION_FORMALITY_REQUIREMENTS,
  evaluateThermalSuitability,
  normalizeTemperatureCondition,
} from './wardrobeTaxonomy';

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export interface CandidatePieces {
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  dress?: WardrobeItem;
  footwear: WardrobeItem;
  outerwear?: WardrobeItem;
  accessory?: WardrobeItem;
}

export interface ScoredCandidate {
  candidateId: string;
  pieces: CandidatePieces;
  totalScore: number;
  breakdown: OutfitScoreBreakdown;
  matchLabel: 'Strong match' | 'Good match' | 'Limited wardrobe match' | 'Profile incomplete';
  missingLayerWarning?: string;
}

/**
 * Stage 1: Hard Filters
 * Filters out items that are strictly incompatible before candidate combination
 */
export function applyHardFilters(
  items: WardrobeItem[],
  request: AIStylistRequest,
  userProfile?: PersonalStyleProfile
): WardrobeItem[] {
  const {
    excludeItemIds = [],
    temperatureCelsius,
    weatherDescription = '',
    occasion = 'Dinner',
    dressCode = 'Smart Casual',
  } = request;

  const occasionLower = occasion.toLowerCase();
  const dressCodeLower = dressCode.toLowerCase();
  const isFormalEvent = ['formal', 'wedding', 'interview', 'presentation', 'black tie'].some(
    o => occasionLower.includes(o) || dressCodeLower.includes(o)
  );
  const isRain = /rain|shower|drizzle/i.test(weatherDescription);

  return items.filter(item => {
    // 1. User explicit exclusions
    if (excludeItemIds.includes(item.id)) return false;

    // 2. Disliked colors filter
    if (userProfile?.dislikedColors && userProfile.dislikedColors.length > 0) {
      const itemColor = (item.color || '').toLowerCase().trim();
      const isDisliked = userProfile.dislikedColors.some(
        dc => dc.toLowerCase().trim() === itemColor || itemColor.includes(dc.toLowerCase().trim())
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
      const isHeavyWinterMaterial = /heavy wool|boiled wool|fleece|down|shearling|thick knit/i.test((item.material || '') + ' ' + item.name);

      // Warm conditions (> 25°C / 77°F): eliminate heavy wool, fleece, down, and heavy layering
      if (temperatureCelsius > 25) {
        if (isHeavyOuterwear || isHeavySweater || isHeavyWinterMaterial) return false;
      }

      // Cold (< 13°C): eliminate shorts, tank tops, sandals, slides
      if (temperatureCelsius < 13) {
        if (/short|tank top|sleeveless|swim/i.test(item.name + ' ' + (item.type || ''))) return false;
        if (item.category === 'Footwear' && /sandal|flip flop|slide/i.test(item.name + ' ' + (item.type || ''))) return false;
      }
    }

    // 4. Occasion formality hard limits
    if (isFormalEvent) {
      // Exclude gym clothes, distressed casual shorts, flip-flops, graphic tees
      if (/sweatpants|jogger|gym|athletic|distressed|graphic tee|tank top/i.test(item.name + ' ' + (item.tags || []).join(' '))) {
        return false;
      }
      if (item.category === 'Footwear' && /running|sneaker|trainer|slide|sandal|flip flop/i.test(item.name + ' ' + (item.type || ''))) {
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
 * Generates 10-30+ candidate outfits and scores them deterministically
 */
export function generateScoredCandidates(
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

  const targetOccasion = OCCASION_FORMALITY_REQUIREMENTS[occasion] || { min: 2, max: 3, target: 2 };
  const candidates: ScoredCandidate[] = [];

  // Helper to score a candidate combination deterministically
  function scoreCombination(comboItems: WardrobeItem[], pieces: CandidatePieces): ScoredCandidate | null {
    // 1. Hard Filter: Formality coherence check
    const formalities = comboItems.map(i => normalizeFormality(i));
    const minFormality = Math.min(...formalities);
    const maxFormality = Math.max(...formalities);
    const spread = maxFormality - minFormality;

    // Reject extreme clash (e.g. Black Tie piece with gym casual piece)
    if (spread >= 3) return null;

    // Reject combination if completely outside occasion formality bounds
    const avgFormality = formalities.reduce((a, b) => a + b, 0) / formalities.length;
    if (avgFormality < targetOccasion.min - 0.7 || avgFormality > targetOccasion.max + 0.7) {
      return null;
    }

    // 2. Pattern compatibility check & clash rejection
    const patterns = comboItems.map(i => i.pattern || 'Solid');
    const patternEval = evaluatePatternCompatibility(patterns);
    if (patternEval.isClash) return null; // Reject clashing patterns

    // 3. Color compatibility check & clash rejection
    const colors = comboItems.map(i => i.color || 'Neutral');
    const colorEval = evaluateColorCompatibility(colors);
    if (colorEval.isClash) return null; // Reject clashing color families

    // 4. Thermal compatibility check
    const thermalEval = evaluateThermalSuitability(comboItems, temperatureCelsius);
    if (!thermalEval.isCompatible) return null; // Reject thermal mismatch

    // ==========================================
    // DETERMINISTIC WEIGHTED SCORING ENGINE
    // Color harmony (20%)
    // Formality coherence (15%)
    // Occasion suitability (15%)
    // Weather suitability (10%)
    // Pattern compatibility (10%)
    // Silhouette & fit (10%)
    // Style preference (10%)
    // Footwear compatibility (5%)
    // Novelty / wear balance (5%)
    // ==========================================

    // Color harmony (0 - 20)
    let colorPoints = (colorEval.score / 100) * 20;
    if (userProfile?.preferredColors && userProfile.preferredColors.length > 0) {
      const matchesPref = colors.some(c =>
        userProfile.preferredColors.some(pc => c.toLowerCase().includes(pc.toLowerCase()))
      );
      if (matchesPref) colorPoints = Math.min(20, colorPoints + 2);
    }
    if (colorPreference && colors.some(c => c.toLowerCase().includes(colorPreference.toLowerCase()))) {
      colorPoints = Math.min(20, colorPoints + 2);
    }

    // Formality coherence (0 - 15)
    let formalityPoints = spread <= 1 ? 15 : 10;

    // Occasion suitability (0 - 15)
    const formalityDist = Math.abs(avgFormality - targetOccasion.target);
    let occasionPoints = Math.max(5, 15 - formalityDist * 5);

    // Weather suitability (0 - 10)
    let weatherPoints = (thermalEval.score / 100) * 10;

    // Pattern compatibility (0 - 10)
    let patternPoints = (patternEval.score / 100) * 10;

    // Silhouette & fit (0 - 10)
    let fitPoints = 7;
    if (userProfile?.preferredFit) {
      const fitMatches = comboItems.filter(i => i.fit === userProfile.preferredFit).length;
      if (fitMatches > 0) fitPoints = 10;
    }

    // Style preference (0 - 10)
    let stylePoints = 6;
    const matchesStyle = comboItems.some(i =>
      (i.style || '').toLowerCase().includes(stylePreference.toLowerCase()) ||
      (i.occasion || []).some(o => o.toLowerCase().includes(occasion.toLowerCase()))
    );
    if (matchesStyle) stylePoints = 10;

    // Footwear compatibility (0 - 5)
    let footwearPoints = 4;
    const footwearFormality = normalizeFormality(pieces.footwear);
    if (Math.abs(footwearFormality - avgFormality) <= 1) {
      footwearPoints = 5;
    }

    // Novelty / wear history balance (0 - 5)
    let noveltyPoints = 5;
    const itemIds = new Set(comboItems.map(i => i.id));
    const heavyWearCount = comboItems.filter(i => (i.timesWorn || 0) > 8).length;
    noveltyPoints -= heavyWearCount * 1;
    const recentlyWorn = wearHistory.slice(0, 4).some(entry =>
      (entry.itemIds || []).some((id: string) => itemIds.has(id))
    );
    if (recentlyWorn) noveltyPoints -= 1.5;
    noveltyPoints = Math.max(1, noveltyPoints);

    // TOTAL CALCULATED SCORE (0 - 100)
    const totalScore = Math.round(
      colorPoints +
      formalityPoints +
      occasionPoints +
      weatherPoints +
      patternPoints +
      fitPoints +
      stylePoints +
      footwearPoints +
      noveltyPoints
    );

    // Breakdown percentages (0 - 100)
    const breakdown: OutfitScoreBreakdown = {
      colorHarmony: Math.round((colorPoints / 20) * 100),
      occasionFit: Math.round((occasionPoints / 15) * 100),
      weatherMatch: Math.round((weatherPoints / 10) * 100),
      coherence: Math.round((formalityPoints / 15) * 100),
    };

    let matchLabel: ScoredCandidate['matchLabel'] = 'Limited wardrobe match';
    if (!userProfile || !userProfile.isCompleted) {
      matchLabel = 'Profile incomplete';
    } else if (totalScore >= 80) {
      matchLabel = 'Strong match';
    } else if (totalScore >= 65) {
      matchLabel = 'Good match';
    }

    let missingLayerWarning: string | undefined;
    if (temperatureCelsius !== undefined && temperatureCelsius < 14 && !pieces.outerwear) {
      missingLayerWarning = `Ambient temperature is ${temperatureCelsius}°C. Consider layering a tailored coat or jacket.`;
    }

    return {
      candidateId: `cand_${candidates.length + 1}`,
      pieces,
      totalScore,
      breakdown,
      matchLabel,
      missingLayerWarning,
    };
  }

  // Top + Bottom combinations
  const topPool = tops.slice(0, 12);
  const bottomPool = bottoms.slice(0, 10);
  const footPool = footwears.slice(0, 8);
  const outerPool = outerwears.slice(0, 6);
  const accPool = accessories.slice(0, 4);

  const needsOuterwear = temperatureCelsius !== undefined ? temperatureCelsius < 18 : outerPool.length > 0;

  for (const top of topPool) {
    for (const bottom of bottomPool) {
      for (const footwear of footPool) {
        const baseItems = [top, bottom, footwear];

        // Must-include check
        if (mustIncludeItemIds.length > 0) {
          const comboIds = baseItems.map(i => i.id);
          const hasAllMust = mustIncludeItemIds.every(id =>
            comboIds.includes(id) || outerPool.some(o => o.id === id)
          );
          if (!hasAllMust) continue;
        }

        const outerOptions = needsOuterwear && outerPool.length > 0 ? outerPool : [undefined];

        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;
          const candidate = scoreCombination(comboItems, {
            top,
            bottom,
            footwear,
            outerwear,
            accessory: accPool[0],
          });
          if (candidate) {
            candidates.push(candidate);
          }
        }
      }
    }
  }

  // Dress combinations
  if (dresses.length > 0) {
    for (const dress of dresses.slice(0, 8)) {
      for (const footwear of footPool) {
        const baseItems = [dress, footwear];
        const outerOptions = outerPool.length > 0 ? outerPool : [undefined];

        for (const outerwear of outerOptions) {
          const comboItems = outerwear ? [...baseItems, outerwear] : baseItems;
          const candidate = scoreCombination(comboItems, {
            dress,
            footwear,
            outerwear,
            accessory: accPool[0],
          });
          if (candidate) {
            candidates.push(candidate);
          }
        }
      }
    }
  }

  // Sort candidates by total calculated score descending
  candidates.sort((a, b) => b.totalScore - a.totalScore);

  // Return top 10-30 candidate combinations
  return candidates.slice(0, 25);
}

/**
 * Stage 3: Gemini Reasoning & Ranking
 * Gemini receives top candidates, ranks them, selects the best candidate, and provides styling reasoning
 */
export async function rankAndReasonWithGemini(
  candidates: ScoredCandidate[],
  request: AIStylistRequest,
  userWardrobe: WardrobeItem[],
  userProfile?: PersonalStyleProfile,
  userName: string = 'Client'
): Promise<{
  selectedCandidateId: string;
  rankedCandidateIds: string[];
  outfitName: string;
  whyThisWorks: string;
  colorHarmonyReasoning: string;
  weatherFitReasoning: string;
  occasionFitReasoning: string;
  profileMatchReasoning: string;
  stylingTips: string[];
  optionalAccessoryItemIds: string[];
  warnings: string[];
  gapAnalysis?: string;
  lookEditorial?: {
    safeAndRefined?: { title?: string; whyItWorks?: string; gapAnalysis?: string; stylingTips?: string[] };
    modern?: { title?: string; whyItWorks?: string; gapAnalysis?: string; stylingTips?: string[] };
    statement?: { title?: string; whyItWorks?: string; gapAnalysis?: string; stylingTips?: string[] };
  };
}> {
  const topCandidates = candidates.slice(0, 5);
  const primaryFallback = candidates[0];

  // Map accessories that actually exist in user's wardrobe
  const availableAccessories = userWardrobe.filter(i => i.category === 'Accessories' || i.category === 'Jewelry');

  const defaultDeterministicResult = {
    selectedCandidateId: primaryFallback.candidateId,
    rankedCandidateIds: topCandidates.map(c => c.candidateId),
    outfitName: `${primaryFallback.pieces.top?.color || primaryFallback.pieces.dress?.color || 'Curated'} ${request.occasion || 'Dinner'} Ensemble`,
    whyThisWorks: `The ${primaryFallback.pieces.top?.name || primaryFallback.pieces.dress?.name} pairs with the ${primaryFallback.pieces.bottom?.name || 'ensemble'}, grounded by ${primaryFallback.pieces.footwear.name} for balanced proportion following the 60-30-10 color rule.`,
    colorHarmonyReasoning: `Tonal balance between ${primaryFallback.pieces.top?.color || 'top'} (dominant 60%) and ${primaryFallback.pieces.bottom?.color || 'bottom'} (secondary 30%) with footwear accents (10%) provides visual grounding.`,
    weatherFitReasoning: request.temperatureCelsius !== undefined
      ? `Calibrated for ${request.temperatureCelsius}°C conditions with comfortable thermal drape.`
      : 'Breathable fabric drape suitable for all-day comfort.',
    occasionFitReasoning: `Aligns with the formality of ${request.occasion || 'Dinner'} under a ${request.dressCode || 'Smart Casual'} dress code.`,
    profileMatchReasoning: userProfile?.visualAnalysis
      ? `Silhouette and neckline harmonize with ${userProfile.visualAnalysis.faceShape} framing and ${userProfile.visualAnalysis.skinTone} undertone.`
      : 'Clean lines provide versatile personal framing.',
    stylingTips: [
      'Tuck or half-tuck the top cleanly to define waistline proportions.',
      'Coordinate leather and hardware finishes across your belt and footwear.',
    ],
    optionalAccessoryItemIds: availableAccessories.slice(0, 2).map(a => a.id),
    warnings: primaryFallback.missingLayerWarning ? [primaryFallback.missingLayerWarning] : [],
    gapAnalysis: primaryFallback.missingLayerWarning || (request.temperatureCelsius !== undefined && request.temperatureCelsius < 15 ? 'Consider layering a fine-knit merino sweater or structured overcoat for thermal comfort.' : undefined),
  };

  const ai = getAIClient();
  if (!ai || topCandidates.length === 0) {
    return defaultDeterministicResult;
  }

  // Format candidate data for Gemini
  const candidatesPayload = topCandidates.map(cand => {
    const piecesDesc: Record<string, string> = {};
    if (cand.pieces.top) piecesDesc.top = `"${cand.pieces.top.name}" (Color: ${cand.pieces.top.color}, Type: ${cand.pieces.top.type || cand.pieces.top.category}, Material: ${cand.pieces.top.material || 'standard'})`;
    if (cand.pieces.dress) piecesDesc.dress = `"${cand.pieces.dress.name}" (Color: ${cand.pieces.dress.color}, Type: ${cand.pieces.dress.type || 'Dress'}, Material: ${cand.pieces.dress.material || 'standard'})`;
    if (cand.pieces.bottom) piecesDesc.bottom = `"${cand.pieces.bottom.name}" (Color: ${cand.pieces.bottom.color}, Type: ${cand.pieces.bottom.type || 'Trousers'}, Material: ${cand.pieces.bottom.material || 'standard'})`;
    if (cand.pieces.outerwear) piecesDesc.outerwear = `"${cand.pieces.outerwear.name}" (Color: ${cand.pieces.outerwear.color}, Type: ${cand.pieces.outerwear.type || 'Outerwear'})`;
    piecesDesc.footwear = `"${cand.pieces.footwear.name}" (Color: ${cand.pieces.footwear.color}, Type: ${cand.pieces.footwear.type || 'Footwear'})`;

    return {
      candidateId: cand.candidateId,
      calculatedScore: cand.totalScore,
      pieces: piecesDesc,
      breakdown: cand.breakdown,
    };
  });

  const availableAccessoriesPayload = availableAccessories.map(a => ({
    itemId: a.id,
    name: a.name,
    color: a.color,
    type: a.type || 'Accessory',
  }));

  const prompt = `You are the Lead Stylist & Textile Analyst Engine for PN Outfit Suggester advising client ${userName}.

Core Directives:
1. Zero Hallucination: Recommend ONLY items present in the user's provided Wardrobe Inventory. NEVER invent garments or accessories.
2. Taxonomy Grounding: Parse and filter items strictly by Category, Subcategory, Formality, Pattern, Fit, Material, and Color.
3. Thermal & Weather Filtering: Exclude garments that violate current weather conditions (e.g., exclude heavy wool or heavy layering when temperatures exceed 25°C/77°F).

Output Rules:
Generate 3 distinct outfit options in structured JSON:
- LOOK 1 ('SAFE & REFINED'): Classic, balanced, low-risk harmony using neutral bases.
- LOOK 2 ('MODERN'): Trending silhouettes, relaxed draping, and contemporary proportion pairing.
- LOOK 3 ('STATEMENT'): High-contrast pairing with an intentional 10% color accent pop.

Styling Mechanics to Enforce:
- Color Strategy: Apply the 60-30-10 distribution rule (60% dominant base garment, 30% neutral/secondary piece, 10% accent or pop).
- Thermal Comfort: Ground evaluations in temperature (${request.temperatureCelsius !== undefined ? `${request.temperatureCelsius}°C` : 'mild'}) and weather conditions (${request.weatherDescription || 'fair'}).
- Rationale: Provide a concise "whyItWorks" visual balance justification detailing silhouette balance, texture contrast, and proportions.
- Gap Analysis: List 1-2 missing wardrobe pieces ("gapAnalysis") that would complete or elevate each look.

CANDIDATES TO EVALUATE:
${JSON.stringify(candidatesPayload, null, 2)}

AVAILABLE ACCESSORIES IN USER WARDROBE:
${JSON.stringify(availableAccessoriesPayload, null, 2)}

CLIENT CONTEXT & ENVIRONMENT:
- Occasion: ${request.occasion || 'Dinner'}
- Dress Code: ${request.dressCode || 'Smart Casual'}
- Location: ${request.location || 'Venue'}
- Weather: ${request.weatherDescription || 'Not specified'} (${request.temperatureCelsius !== undefined ? `${request.temperatureCelsius}°C` : 'temperature not provided'})
- USER PROFILE: ${userProfile?.gender ? `Gender: ${userProfile.gender}, ` : ''}${userProfile?.visualAnalysis ? `Face Shape: ${userProfile.visualAnalysis.faceShape}, Skin Tone: ${userProfile.visualAnalysis.skinTone}, Contrast Level: ${userProfile.visualAnalysis.contrastLevel}, Preferred Fit: ${userProfile.preferredFit}` : 'Not provided'}

TASK:
1. Select the winning primary recommendation by candidateId.
2. Provide precise editorial justifications for the winning look and the 3 stylistic directions.
3. Reference ACTUAL garment titles, specific colors, and materials.
4. Select optional accessory itemIds ONLY from the provided AVAILABLE ACCESSORIES list. NEVER invent items.

Return valid JSON:
{
  "selectedCandidateId": "${topCandidates[0].candidateId}",
  "rankedCandidateIds": ["${topCandidates.map(c => c.candidateId).join('", "')}"],
  "outfitName": "Concise editorial title referencing pieces",
  "whyThisWorks": "2-3 precise sentences detailing visual balance, 60-30-10 color rule distribution, and texture contrast",
  "colorHarmonyReasoning": "Specific breakdown of how dominant (60%), secondary (30%), and accent (10%) colors interact",
  "weatherFitReasoning": "Thermal comfort assessment relative to current temperature and weather conditions",
  "occasionFitReasoning": "Why formality and silhouette suit the requested event and dress code",
  "profileMatchReasoning": "How the look complements personal undertone, contrast level, and proportions",
  "stylingTips": ["Practical styling tip 1", "Practical styling tip 2"],
  "gapAnalysis": "Identifies an essential piece or layer that would complete or elevate this look, or null if fully cohesive",
  "lookEditorial": {
    "safeAndRefined": {
      "title": "Editorial title for classic balanced look",
      "whyItWorks": "Visual balance and 60-30-10 distribution for Safe & Refined",
      "gapAnalysis": "Missing foundational or layering staple, if any"
    },
    "modern": {
      "title": "Editorial title for modern trend look",
      "whyItWorks": "Elevated proportions, texture mix, and 60-30-10 distribution for Modern",
      "gapAnalysis": "Missing contemporary accent piece, if any"
    },
    "statement": {
      "title": "Editorial title for bold statement look",
      "whyItWorks": "High fashion color contrast and 60-30-10 distribution for Statement",
      "gapAnalysis": "Missing directional accessory or piece, if any"
    }
  },
  "optionalAccessoryItemIds": ["valid_accessory_item_id_if_applicable"],
  "warnings": []
}`;

  try {
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: [prompt],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validCandidateIds = new Set(topCandidates.map(c => c.candidateId));

    // Validate that selectedCandidateId is one of our verified candidates
    const selectedId = validCandidateIds.has(parsed.selectedCandidateId)
      ? parsed.selectedCandidateId
      : topCandidates[0].candidateId;

    // Validate optional accessory IDs against actual available accessories
    const validAccessoryIds = new Set(availableAccessories.map(a => a.id));
    const validatedAccessories = (Array.isArray(parsed.optionalAccessoryItemIds) ? parsed.optionalAccessoryItemIds : [])
      .filter((id: string) => validAccessoryIds.has(id));

    return {
      selectedCandidateId: selectedId,
      rankedCandidateIds: Array.isArray(parsed.rankedCandidateIds) ? parsed.rankedCandidateIds : topCandidates.map(c => c.candidateId),
      outfitName: parsed.outfitName || defaultDeterministicResult.outfitName,
      whyThisWorks: parsed.whyThisWorks || defaultDeterministicResult.whyThisWorks,
      colorHarmonyReasoning: parsed.colorHarmonyReasoning || defaultDeterministicResult.colorHarmonyReasoning,
      weatherFitReasoning: parsed.weatherFitReasoning || defaultDeterministicResult.weatherFitReasoning,
      occasionFitReasoning: parsed.occasionFitReasoning || defaultDeterministicResult.occasionFitReasoning,
      profileMatchReasoning: parsed.profileMatchReasoning || defaultDeterministicResult.profileMatchReasoning,
      stylingTips: Array.isArray(parsed.stylingTips) && parsed.stylingTips.length > 0 ? parsed.stylingTips : defaultDeterministicResult.stylingTips,
      optionalAccessoryItemIds: validatedAccessories,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      gapAnalysis: typeof parsed.gapAnalysis === 'string' && parsed.gapAnalysis.trim().length > 0 ? parsed.gapAnalysis : defaultDeterministicResult.gapAnalysis,
      lookEditorial: parsed.lookEditorial && typeof parsed.lookEditorial === 'object' ? parsed.lookEditorial : undefined,
    };
  } catch (err) {
    console.warn('Gemini reasoning fallback to deterministic stylist logic:', err);
    return defaultDeterministicResult;
  }
}

/**
 * Stage 4: Strict Outfit Validator
 * Verifies every item exists, belongs to the user, matches category, no duplicate, and fulfills requirements
 */
export function validateGeneratedOutfit(
  candidate: ScoredCandidate,
  userWardrobe: WardrobeItem[],
  userId: string,
  request: AIStylistRequest
): {
  isValid: boolean;
  pieces: OutfitPiece[];
  errors: string[];
} {
  const errors: string[] = [];
  const validUserItemsMap = new Map(userWardrobe.map(i => [i.id, i]));
  const seenItemIds = new Set<string>();
  const verifiedPieces: OutfitPiece[] = [];

  const checkPiece = (item: WardrobeItem | undefined, expectedCategory: string, role: string) => {
    if (!item) return;
    if (!validUserItemsMap.has(item.id)) {
      errors.push(`Item ${item.id} does not exist in user wardrobe.`);
      return;
    }
    if (seenItemIds.has(item.id)) {
      errors.push(`Duplicate item ${item.id} found in outfit.`);
      return;
    }
    seenItemIds.add(item.id);

    const actualItem = validUserItemsMap.get(item.id)!;
    verifiedPieces.push({
      category: expectedCategory as any,
      itemId: actualItem.id,
      item: actualItem,
      role,
      suggestedDescription: actualItem.name,
      isOwned: true,
    });
  };

  // Top or Dress
  if (candidate.pieces.dress) {
    checkPiece(candidate.pieces.dress, 'Dresses', 'Single-piece foundational silhouette.');
  } else {
    checkPiece(candidate.pieces.top, 'Tops', 'Upper foundational piece establishing neckline and color.');
    checkPiece(candidate.pieces.bottom, 'Bottoms', 'Grounding bottom silhouette establishing proportion.');
  }

  // Outerwear
  if (candidate.pieces.outerwear) {
    checkPiece(candidate.pieces.outerwear, 'Outerwear', 'Framing architectural layer for weather and formality.');
  }

  // Footwear
  checkPiece(candidate.pieces.footwear, 'Footwear', 'Grounding footwear setting the final formality tone.');

  // Accessory
  if (candidate.pieces.accessory) {
    checkPiece(candidate.pieces.accessory, 'Accessories', 'Complementary accent.');
  }

  // Verification checks
  const hasFoundational = verifiedPieces.some(p => p.category === 'Tops' || p.category === 'Dresses');
  const hasBottomIfTop = !verifiedPieces.some(p => p.category === 'Dresses')
    ? verifiedPieces.some(p => p.category === 'Bottoms')
    : true;
  const hasFootwear = verifiedPieces.some(p => p.category === 'Footwear');

  if (!hasFoundational) errors.push('Missing foundational top or dress.');
  if (!hasBottomIfTop) errors.push('Top present without matching bottom.');
  if (!hasFootwear) errors.push('Missing footwear.');

  return {
    isValid: errors.length === 0,
    pieces: verifiedPieces,
    errors,
  };
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
  // Empty wardrobe check
  if (!userWardrobe || userWardrobe.length === 0) {
    return {
      id: `rec_${Date.now()}`,
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      outfitName: 'Empty Wardrobe',
      summary: 'Your digital wardrobe currently contains 0 catalogued pieces.',
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

  // Stage 2: Combinatorial Candidate Generator & Deterministic Scoring
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

  // Stage 3: Gemini Reasoning & Ranking
  const reasoning = await rankAndReasonWithGemini(candidates, request, userWardrobe, userProfile, userName);

  // Pick winning candidate
  const winningCandidate = candidates.find(c => c.candidateId === reasoning.selectedCandidateId) || candidates[0];

  // Stage 4: Strict Validation
  const validation = validateGeneratedOutfit(winningCandidate, userWardrobe, userId, request);
  const finalPieces = validation.isValid ? validation.pieces : [];

  // If validation failed, fallback to candidate[0] validated
  const effectivePieces = finalPieces.length > 0 ? finalPieces : validateGeneratedOutfit(candidates[0], userWardrobe, userId, request).pieces;

  // Build 3 distinct stylistic looks:
  // 1. SAFE & REFINED: Classic, balanced, low risk
  // 2. MODERN: Current trends, elevated proportions
  // 3. STATEMENT: Bold color pop, high fashion contrast
  const looks: GeneratedLookOption[] = [];

  // Pick candidates for each distinct style
  const candSafe = candidates.find(c => c.breakdown.coherence >= 80 && c.breakdown.colorHarmony >= 75) || candidates[0];
  const candModern = candidates.find(c =>
    c.candidateId !== candSafe.candidateId &&
    (c.pieces.top?.fit === 'Relaxed' || c.pieces.bottom?.fit === 'Relaxed' || c.pieces.top?.pattern === 'Textured' || Boolean(c.pieces.outerwear))
  ) || candidates.find(c => c.candidateId !== candSafe.candidateId) || candidates[1] || candidates[0];
  const candStatement = candidates.find(c =>
    c.candidateId !== candSafe.candidateId &&
    c.candidateId !== candModern.candidateId &&
    (c.pieces.top?.pattern !== 'Solid' || c.pieces.outerwear?.pattern !== 'Solid' || c.pieces.footwear.color !== c.pieces.bottom?.color)
  ) || candidates.find(c => c.candidateId !== candSafe.candidateId && c.candidateId !== candModern.candidateId) || candidates[2] || candidates[0];

  const lookConfigs: Array<{
    cand: ScoredCandidate;
    type: 'SAFE & REFINED' | 'MODERN' | 'STATEMENT';
    subtitle: string;
    editorialKey: 'safeAndRefined' | 'modern' | 'statement';
    defaultTitle: string;
    defaultWhyItWorks: string;
  }> = [
    {
      cand: candSafe,
      type: 'SAFE & REFINED',
      subtitle: 'Classic, balanced, low risk',
      editorialKey: 'safeAndRefined',
      defaultTitle: `${candSafe.pieces.top?.name || candSafe.pieces.dress?.name || 'Classic'} & ${candSafe.pieces.bottom?.name || 'Tailored Trousers'}`,
      defaultWhyItWorks: `Applies the 60-30-10 color rule with ${candSafe.pieces.bottom?.color || 'neutral'} as the 60% grounding base, ${candSafe.pieces.top?.color || 'tonal'} as the 30% secondary, and ${candSafe.pieces.footwear.color} (10%) as a restrained accent. Clean proportions ensure timeless balance.`,
    },
    {
      cand: candModern,
      type: 'MODERN',
      subtitle: 'Current trends, elevated proportions',
      editorialKey: 'modern',
      defaultTitle: `Contemporary ${candModern.pieces.outerwear?.name || candModern.pieces.top?.name || 'Layered'} Ensemble`,
      defaultWhyItWorks: `Balances contemporary relaxed and structured silhouettes with a modern 60-30-10 palette. Textural contrast between fabrics elevates the look while maintaining thermal ease.`,
    },
    {
      cand: candStatement,
      type: 'STATEMENT',
      subtitle: 'Bold color pop, high fashion contrast',
      editorialKey: 'statement',
      defaultTitle: `Directional ${candStatement.pieces.top?.color || candStatement.pieces.footwear.color} Contrast Look`,
      defaultWhyItWorks: `Features a high-fashion focal point utilizing an intentional 10% color pop against a 60-30 neutral foundation, creating sharp visual engagement without overwhelming harmony.`,
    },
  ];

  for (let i = 0; i < lookConfigs.length; i++) {
    const config = lookConfigs[i];
    const cand = config.cand;
    const candValidation = validateGeneratedOutfit(cand, userWardrobe, userId, request);
    if (!candValidation.isValid) continue;

    const editorial = reasoning.lookEditorial?.[config.editorialKey];
    const isWinner = cand.candidateId === winningCandidate.candidateId;

    looks.push({
      id: `look_${i + 1}`,
      lookType: config.type,
      title: isWinner ? reasoning.outfitName : (editorial?.title || config.defaultTitle),
      subtitle: config.subtitle,
      pieces: candValidation.pieces,
      whyItWorks: isWinner ? reasoning.whyThisWorks : (editorial?.whyItWorks || config.defaultWhyItWorks),
      bestFor: {
        occasion: request.occasion || 'Dinner',
        time: request.time || 'Evening',
        weather: request.weatherDescription || (request.temperatureCelsius !== undefined ? `${request.temperatureCelsius}°C` : 'Mild'),
      },
      styleNotes: isWinner ? reasoning.stylingTips : (editorial?.stylingTips || [
        'Ensure clean breaks on trouser cuffs for optimal shoe framing.',
        'Maintain balanced proportions across the upper and lower torso.',
      ]),
      gapAnalysis: editorial?.gapAnalysis || cand.missingLayerWarning || (request.temperatureCelsius !== undefined && request.temperatureCelsius < 15 && !cand.pieces.outerwear ? `Ambient temperature is ${request.temperatureCelsius}°C. A structured wool overcoat or tailored blazer would complete this look.` : undefined),
      score: cand.totalScore,
      scoreBreakdown: cand.breakdown,
    });
  }

  // Map suggested accessories strictly from user's verified items
  const validatedSuggestedAccessories = reasoning.optionalAccessoryItemIds
    .map(id => userWardrobe.find(w => w.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: `rec_${Date.now()}`,
    requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
    outfitName: reasoning.outfitName,
    summary: `${winningCandidate.matchLabel} (${winningCandidate.totalScore}/100) — Composed strictly from your verified wardrobe pieces.`,
    pieces: effectivePieces,
    whyItWorks: reasoning.whyThisWorks,
    weatherReasoning: reasoning.weatherFitReasoning,
    occasionReasoning: reasoning.occasionFitReasoning,
    bestFor: {
      occasion: request.occasion || 'Dinner',
      time: request.time || 'Evening',
      weather: request.weatherDescription || (request.temperatureCelsius !== undefined ? `${request.temperatureCelsius}°C` : 'Mild'),
    },
    stylingTips: reasoning.stylingTips,
    suggestedAccessories: validatedSuggestedAccessories,
    alternativeLookSuggestion: candidates.length > 1 ? `Alternative option available with ${candidates[1].pieces.top?.name || candidates[1].pieces.bottom?.name || 'alternative piece'}.` : undefined,
    gapAnalysis: reasoning.gapAnalysis || winningCandidate.missingLayerWarning,
    confidenceScore: winningCandidate.totalScore, // Calculated deterministic score
    scoreBreakdown: winningCandidate.breakdown,
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
    temperatureCelsius,
  } = payload;

  // Fixed pieces
  const fixedItems = userWardrobe.filter(
    i => currentPieceIds.includes(i.id) && i.id !== currentPieceIdToReplace
  );

  // Available alternatives in user wardrobe for swapCategory strictly
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
  const scored: Array<{ item: WardrobeItem; score: number; reason: string }> = [];

  for (const alt of alternatives) {
    const fullLook = [...fixedItems, alt];

    // Check pattern clash
    const patternEval = evaluatePatternCompatibility(fullLook.map(i => i.pattern || 'Solid'));
    if (patternEval.isClash) continue;

    // Check color clash
    const colorEval = evaluateColorCompatibility(fullLook.map(i => i.color || 'Neutral'));
    if (colorEval.isClash) continue;

    // Check thermal suitability
    const thermalEval = evaluateThermalSuitability(fullLook, temperatureCelsius);
    if (!thermalEval.isCompatible) continue;

    // Formality spread check
    const formalities = fullLook.map(i => normalizeFormality(i));
    const spread = Math.max(...formalities) - Math.min(...formalities);
    if (spread >= 3) continue;

    let score = Math.round((colorEval.score * 0.4) + (thermalEval.score * 0.3) + (patternEval.score * 0.3));

    // Profile color preferences
    if (userProfile?.preferredColors?.some(pc => (alt.color || '').toLowerCase().includes(pc.toLowerCase()))) {
      score += 4;
    }
    // Disliked colors penalty
    if (userProfile?.dislikedColors?.some(dc => (alt.color || '').toLowerCase().includes(dc.toLowerCase()))) {
      score -= 25;
    }

    score = Math.min(98, Math.max(35, score));

    scored.push({
      item: alt,
      score,
      reason: `The ${alt.color} ${alt.name} complements the ${fixedItems.map(f => f.name).join(' and ')} with ${colorEval.reason.toLowerCase()}.`,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    success: true,
    replacements: scored.slice(0, 4),
  };
}
