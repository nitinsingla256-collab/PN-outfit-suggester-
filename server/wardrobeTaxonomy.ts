export const WARDROBE_TAXONOMY: Record<string, string[]> = {
  'Tops': ['Shirt', 'T-shirt', 'Polo', 'Blouse', 'Sweater', 'Cardigan', 'Hoodie', 'Tank Top', 'Turtleneck', 'Button-Down Shirt', 'Overshirt'],
  'Bottoms': ['Trousers', 'Chinos', 'Jeans', 'Shorts', 'Skirt', 'Dress Pants', 'Linen Trousers'],
  'Dresses': ['Dress', 'Midi Dress', 'Maxi Dress', 'Shirt Dress', 'Slip Dress'],
  'Outerwear': ['Blazer', 'Suit Jacket', 'Jacket', 'Coat', 'Trench Coat', 'Overcoat', 'Puffer', 'Bomber', 'Leather Jacket', 'Cardigan Coat'],
  'Footwear': ['Sneakers', 'Loafers', 'Derby Shoes', 'Oxford Shoes', 'Boots', 'Chelsea Boots', 'Sandals', 'Slides', 'Formal Shoes', 'Monkstrap'],
  'Bags': ['Backpack', 'Tote', 'Briefcase', 'Crossbody', 'Shoulder Bag', 'Clutch', 'Duffle'],
  'Accessories': ['Sunglasses', 'Belt', 'Watch', 'Scarf', 'Hat', 'Cap', 'Tie', 'Pocket Square', 'Gloves', 'Other Accessory'],
  'Jewelry': ['Ring', 'Bracelet', 'Necklace', 'Earrings', 'Cufflinks'],
  'Activewear': ['Sports Top', 'Sports Bottom', 'Track Pants', 'Training Shorts', 'Sports Shoes'],
  'Formalwear': ['Suit', 'Tuxedo', 'Formal Shirt', 'Waistcoat', 'Formal Trousers'],
};

export function validateAndFixCategory(type: string, category: string): string {
  if (!type && !category) return 'Tops';
  const t = (type || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // Explicit priority rules for accessories
  if (t.includes('sunglass') || t.includes('glasses') || t.includes('watch') || t.includes('belt') || t.includes('scarf') || t.includes('tie') || t.includes('cap') || t.includes('hat') || t.includes('glove')) {
    return 'Accessories';
  }
  // Footwear
  if (t.includes('shoe') || t.includes('boot') || t.includes('sneaker') || t.includes('loafer') || t.includes('derby') || t.includes('oxford') || t.includes('sandal') || t.includes('slide') || t.includes('heel') || t.includes('flat')) {
    return 'Footwear';
  }
  // Bags
  if (t.includes('bag') || t.includes('backpack') || t.includes('tote') || t.includes('briefcase') || t.includes('clutch') || t.includes('duffle')) {
    return 'Bags';
  }
  // Outerwear
  if (t.includes('coat') || t.includes('jacket') || t.includes('blazer') || t.includes('parka') || t.includes('trench') || t.includes('puffer') || t.includes('bomber') || t.includes('cardigan coat')) {
    return 'Outerwear';
  }
  // Dresses
  if (t.includes('dress') || t.includes('gown')) {
    return 'Dresses';
  }
  // Formalwear
  if (t.includes('tuxedo') || (t.includes('suit') && !t.includes('swim'))) {
    return 'Formalwear';
  }
  // Bottoms
  if (t.includes('pant') || t.includes('jean') || t.includes('trouser') || t.includes('chino') || t.includes('short') || t.includes('skirt') || t.includes('legging')) {
    return 'Bottoms';
  }
  // Tops
  if (t.includes('shirt') || t.includes('tee') || t.includes('polo') || t.includes('sweater') || t.includes('hoodie') || t.includes('top') || t.includes('blouse') || t.includes('turtleneck') || t.includes('knit')) {
    return 'Tops';
  }

  // Check against taxonomy map
  for (const [cat, types] of Object.entries(WARDROBE_TAXONOMY)) {
    if (types.some(typeName => typeName.toLowerCase() === t)) {
      return cat;
    }
  }

  // Validate existing category string if recognizable
  const validCategory = Object.keys(WARDROBE_TAXONOMY).find(cat => cat.toLowerCase() === c);
  if (validCategory) return validCategory;

  return 'Tops';
}

// ==========================================
// COLOR INTELLIGENCE & NORMALIZATION SYSTEM
// ==========================================

export type ColorFamily =
  | 'BLUE'
  | 'RED'
  | 'GREY'
  | 'WHITE'
  | 'BROWN'
  | 'GREEN'
  | 'BLACK'
  | 'YELLOW'
  | 'PURPLE'
  | 'ORANGE'
  | 'PINK'
  | 'UNKNOWN';

export interface NormalizedColorInfo {
  originalColor: string;
  family: ColorFamily;
  isNeutral: boolean;
  isDark: boolean;
  isLight: boolean;
  temperature: 'WARM' | 'COOL' | 'NEUTRAL';
  displayName: string;
}

export function normalizeColor(rawColor?: string): NormalizedColorInfo {
  const c = (rawColor || '').toLowerCase().trim();
  if (!c || c === 'unknown' || c === 'none') {
    return {
      originalColor: rawColor || 'Unknown',
      family: 'UNKNOWN',
      isNeutral: true,
      isDark: false,
      isLight: false,
      temperature: 'NEUTRAL',
      displayName: 'Neutral',
    };
  }

  // NAVY / BLUE
  if (c.includes('navy') || c.includes('midnight') || c.includes('dark blue')) {
    return { originalColor: rawColor!, family: 'BLUE', isNeutral: true, isDark: true, isLight: false, temperature: 'COOL', displayName: 'Navy' };
  }
  if (c.includes('cobalt') || c.includes('royal blue') || c.includes('denim') || c.includes('indigo') || c.includes('blue') || c.includes('sky blue') || c.includes('teal') || c.includes('cyan')) {
    return { originalColor: rawColor!, family: 'BLUE', isNeutral: false, isDark: c.includes('indigo') || c.includes('denim'), isLight: c.includes('sky'), temperature: 'COOL', displayName: 'Blue' };
  }

  // BURGUNDY / RED
  if (c.includes('burgundy') || c.includes('wine') || c.includes('maroon') || c.includes('oxblood')) {
    return { originalColor: rawColor!, family: 'RED', isNeutral: false, isDark: true, isLight: false, temperature: 'WARM', displayName: 'Burgundy' };
  }
  if (c.includes('red') || c.includes('crimson') || c.includes('scarlet') || c.includes('cherry')) {
    return { originalColor: rawColor!, family: 'RED', isNeutral: false, isDark: false, isLight: false, temperature: 'WARM', displayName: 'Red' };
  }

  // CHARCOAL / GREY
  if (c.includes('charcoal') || c.includes('dark grey') || c.includes('dark gray') || c.includes('anthracite') || c.includes('gunmetal')) {
    return { originalColor: rawColor!, family: 'GREY', isNeutral: true, isDark: true, isLight: false, temperature: 'NEUTRAL', displayName: 'Charcoal' };
  }
  if (c.includes('grey') || c.includes('gray') || c.includes('slate') || c.includes('silver') || c.includes('ash') || c.includes('heather')) {
    return { originalColor: rawColor!, family: 'GREY', isNeutral: true, isDark: false, isLight: c.includes('light') || c.includes('silver'), temperature: 'NEUTRAL', displayName: 'Grey' };
  }

  // IVORY / OFF-WHITE / WHITE
  if (c.includes('ivory') || c.includes('off-white') || c.includes('off white') || c.includes('cream') || c.includes('bone') || c.includes('alabaster') || c.includes('ecru') || c.includes('eggshell')) {
    return { originalColor: rawColor!, family: 'WHITE', isNeutral: true, isDark: false, isLight: true, temperature: 'WARM', displayName: 'Ivory / Off-White' };
  }
  if (c.includes('white') || c.includes('crisp white') || c.includes('pure white') || c.includes('snow')) {
    return { originalColor: rawColor!, family: 'WHITE', isNeutral: true, isDark: false, isLight: true, temperature: 'NEUTRAL', displayName: 'White' };
  }

  // CAMEL / BROWN
  if (c.includes('camel') || c.includes('tan') || c.includes('cognac') || c.includes('caramel')) {
    return { originalColor: rawColor!, family: 'BROWN', isNeutral: true, isDark: false, isLight: true, temperature: 'WARM', displayName: 'Camel' };
  }
  if (c.includes('beige') || c.includes('sand') || c.includes('taupe') || c.includes('khaki') || c.includes('nude')) {
    return { originalColor: rawColor!, family: 'BROWN', isNeutral: true, isDark: false, isLight: true, temperature: 'WARM', displayName: 'Beige' };
  }
  if (c.includes('brown') || c.includes('chocolate') || c.includes('espresso') || c.includes('coffee') || c.includes('mocha') || c.includes('chestnut')) {
    return { originalColor: rawColor!, family: 'BROWN', isNeutral: true, isDark: true, isLight: false, temperature: 'WARM', displayName: 'Brown' };
  }

  // OLIVE / GREEN
  if (c.includes('olive') || c.includes('army green') || c.includes('military green') || c.includes('khaki green')) {
    return { originalColor: rawColor!, family: 'GREEN', isNeutral: true, isDark: false, isLight: false, temperature: 'WARM', displayName: 'Olive' };
  }
  if (c.includes('sage') || c.includes('mint') || c.includes('pistachio')) {
    return { originalColor: rawColor!, family: 'GREEN', isNeutral: false, isDark: false, isLight: true, temperature: 'COOL', displayName: 'Sage / Mint' };
  }
  if (c.includes('green') || c.includes('forest') || c.includes('emerald') || c.includes('bottle green') || c.includes('pine')) {
    return { originalColor: rawColor!, family: 'GREEN', isNeutral: false, isDark: c.includes('forest') || c.includes('bottle'), isLight: false, temperature: 'COOL', displayName: 'Green' };
  }

  // BLACK
  if (c.includes('black') || c.includes('jet') || c.includes('onyx') || c.includes('pitch')) {
    return { originalColor: rawColor!, family: 'BLACK', isNeutral: true, isDark: true, isLight: false, temperature: 'NEUTRAL', displayName: 'Black' };
  }

  // YELLOW / MUSTARD / GOLD
  if (c.includes('mustard') || c.includes('ochre') || c.includes('gold') || c.includes('yellow') || c.includes('amber')) {
    return { originalColor: rawColor!, family: 'YELLOW', isNeutral: false, isDark: false, isLight: !c.includes('mustard'), temperature: 'WARM', displayName: 'Mustard / Yellow' };
  }

  // ORANGE / TERRACOTTA / RUST
  if (c.includes('terracotta') || c.includes('rust') || c.includes('burnt orange') || c.includes('copper') || c.includes('orange') || c.includes('peach') || c.includes('coral')) {
    return { originalColor: rawColor!, family: 'ORANGE', isNeutral: false, isDark: c.includes('terracotta') || c.includes('rust'), isLight: c.includes('peach'), temperature: 'WARM', displayName: 'Terracotta' };
  }

  // PURPLE / PLUM
  if (c.includes('plum') || c.includes('lavender') || c.includes('violet') || c.includes('purple') || c.includes('lilac') || c.includes('mauve') || c.includes('aubergine')) {
    return { originalColor: rawColor!, family: 'PURPLE', isNeutral: false, isDark: c.includes('plum') || c.includes('aubergine'), isLight: c.includes('lavender'), temperature: 'COOL', displayName: 'Purple' };
  }

  // PINK / BLUSH
  if (c.includes('pink') || c.includes('blush') || c.includes('rose') || c.includes('salmon') || c.includes('magenta')) {
    return { originalColor: rawColor!, family: 'PINK', isNeutral: false, isDark: false, isLight: true, temperature: 'WARM', displayName: 'Pink' };
  }

  return {
    originalColor: rawColor!,
    family: 'UNKNOWN',
    isNeutral: true,
    isDark: false,
    isLight: false,
    temperature: 'NEUTRAL',
    displayName: rawColor!,
  };
}

/**
 * Deterministic color compatibility scoring (0 - 100)
 */
export function evaluateColorCompatibility(colors: string[]): {
  score: number;
  reason: string;
  isClash: boolean;
} {
  const normalized = colors.map(normalizeColor).filter(c => c.family !== 'UNKNOWN');
  if (normalized.length <= 1) {
    return { score: 85, reason: 'Cohesive single-color baseline', isClash: false };
  }

  const families = normalized.map(c => c.family);
  const uniqueFamilies = Array.from(new Set(families));

  // Monochromatic check (same family)
  if (uniqueFamilies.length === 1) {
    const hasLight = normalized.some(c => c.isLight);
    const hasDark = normalized.some(c => c.isDark);
    if (hasLight && hasDark) {
      return { score: 95, reason: 'Refined tonal monochrome with balanced dark/light contrast', isClash: false };
    }
    return { score: 88, reason: 'Clean monochromatic alignment', isClash: false };
  }

  // Check neutral anchor
  const neutralCount = normalized.filter(c => c.isNeutral).length;
  const nonNeutralFamilies = uniqueFamilies.filter(f => f !== 'BLACK' && f !== 'WHITE' && f !== 'GREY' && f !== 'BROWN');

  // Severe color clash: more than 2 distinct vibrant non-neutral families
  if (nonNeutralFamilies.length > 2) {
    return {
      score: 35,
      reason: 'Too many competing non-neutral color families create visual chaos',
      isClash: true,
    };
  }

  // Classic high-harmony pairs
  const pairStrings = new Set<string>();
  for (let i = 0; i < families.length; i++) {
    for (let j = i + 1; j < families.length; j++) {
      const p1 = families[i];
      const p2 = families[j];
      pairStrings.add([p1, p2].sort().join('+'));
    }
  }

  // Recognized timeless harmonious color-family pairings
  const HARMONIOUS_FAMILY_PAIRS = new Set([
    'BLUE+WHITE',
    'BLACK+WHITE',
    'GREY+WHITE',
    'BLUE+BROWN',      // Navy + Camel / Brown
    'BLACK+GREY',
    'BLACK+BROWN',     // Black + Camel / Tan
    'BROWN+WHITE',     // Camel + Ivory / White
    'BLUE+GREY',       // Navy + Charcoal / Grey
    'GREEN+WHITE',     // Olive + Cream / White
    'BROWN+GREEN',     // Olive + Camel / Tan
    'BLUE+GREEN',      // Navy + Olive / Sage
    'GREY+RED',        // Charcoal + Burgundy
    'BLUE+RED',        // Navy + Burgundy
    'BROWN+ORANGE',    // Tan + Terracotta
    'BLUE+ORANGE',     // Navy + Terracotta (complementary)
    'BLACK+RED',       // Black + Burgundy
    'GREEN+GREY',      // Olive + Grey
  ]);

  let harmonyBonuses = 0;
  pairStrings.forEach(pair => {
    if (HARMONIOUS_FAMILY_PAIRS.has(pair)) {
      harmonyBonuses += 1;
    }
  });

  // Balanced dark/light check
  const hasDarkAnchor = normalized.some(c => c.isDark);
  const hasLightPiece = normalized.some(c => c.isLight);

  let calculatedScore = 70;
  if (neutralCount >= 1) calculatedScore += 10; // Neutral anchoring provides grounding
  if (neutralCount >= 2) calculatedScore += 5;
  if (hasDarkAnchor && hasLightPiece) calculatedScore += 8; // Optical contrast balance
  calculatedScore += Math.min(15, harmonyBonuses * 6);

  // Check temperature balance (clashing warm neon with cool pastel)
  const warmCount = normalized.filter(c => c.temperature === 'WARM' && !c.isNeutral).length;
  const coolCount = normalized.filter(c => c.temperature === 'COOL' && !c.isNeutral).length;
  if (warmCount > 0 && coolCount > 0 && neutralCount === 0) {
    calculatedScore -= 15; // Clashing without neutral bridge
  }

  const finalScore = Math.max(30, Math.min(98, calculatedScore));
  return {
    score: finalScore,
    reason: neutralCount > 0
      ? 'Grounded by clean neutral anchoring with compatible tonal balance'
      : 'Harmonious palette contrast across selected pieces',
    isClash: finalScore < 50,
  };
}

// ==========================================
// PATTERN INTELLIGENCE SYSTEM
// ==========================================

export type PatternType =
  | 'Solid'
  | 'Striped'
  | 'Plaid'
  | 'Checked'
  | 'Houndstooth'
  | 'Floral'
  | 'Graphic'
  | 'Textured'
  | 'Polka Dot'
  | 'Abstract'
  | 'Loud Pattern'
  | 'Unknown';

export function normalizePattern(rawPattern?: string): PatternType {
  const p = (rawPattern || '').toLowerCase().trim();
  if (!p || p === 'solid' || p === 'plain') return 'Solid';
  if (p.includes('stripe')) return 'Striped';
  if (p.includes('plaid') || p.includes('tartan')) return 'Plaid';
  if (p.includes('check') || p.includes('gingham') || p.includes('windowpane')) return 'Checked';
  if (p.includes('houndstooth')) return 'Houndstooth';
  if (p.includes('floral') || p.includes('botanical')) return 'Floral';
  if (p.includes('graphic') || p.includes('logo') || p.includes('print')) return 'Graphic';
  if (p.includes('texture') || p.includes('waffle') || p.includes('ribbed') || p.includes('knit') || p.includes('cable') || p.includes('herringbone')) return 'Textured';
  if (p.includes('dot')) return 'Polka Dot';
  if (p.includes('abstract') || p.includes('camo') || p.includes('animal') || p.includes('tie-dye')) return 'Loud Pattern';
  return 'Solid';
}

/**
 * Evaluates pattern compatibility among multiple items (0 - 100).
 * Rejects or heavily penalizes clashing patterns.
 */
export function evaluatePatternCompatibility(patterns: string[]): {
  score: number;
  reason: string;
  isClash: boolean;
} {
  const normalized = patterns.map(normalizePattern);
  const nonSolid = normalized.filter(p => p !== 'Solid' && p !== 'Textured');

  // Solid + Solid or Subtle Textured
  if (nonSolid.length === 0) {
    return { score: 95, reason: 'Clean solid and textured foundation creates timeless minimalism', isClash: false };
  }

  // Exactly one statement pattern anchored by solids
  if (nonSolid.length === 1) {
    return {
      score: 92,
      reason: `The ${nonSolid[0].toLowerCase()} piece acts as a clear focal statement balanced by solid grounding`,
      isClash: false,
    };
  }

  // Two or more patterns: check clash combinations
  const p1 = nonSolid[0];
  const p2 = nonSolid[1];

  // SEVERE CLASHES to reject:
  // Plaid + Graphic
  if ((p1 === 'Plaid' && p2 === 'Graphic') || (p1 === 'Graphic' && p2 === 'Plaid')) {
    return { score: 20, reason: 'Plaid and loud graphic prints compete aggressively', isClash: true };
  }
  // Plaid + Floral
  if ((p1 === 'Plaid' && p2 === 'Floral') || (p1 === 'Floral' && p2 === 'Plaid')) {
    return { score: 20, reason: 'Plaid and floral prints create severe visual discord', isClash: true };
  }
  // Graphic + Graphic
  if (p1 === 'Graphic' && p2 === 'Graphic') {
    return { score: 25, reason: 'Multiple bold graphic prints conflict visually', isClash: true };
  }
  // Loud + Loud or Loud + Floral/Plaid
  if (p1 === 'Loud Pattern' || p2 === 'Loud Pattern') {
    return { score: 25, reason: 'High-contrast loud prints overwhelm the silhouette', isClash: true };
  }
  // Stripe + Stripe (only valid with scale difference, otherwise penalized)
  if (p1 === 'Striped' && p2 === 'Striped') {
    return { score: 55, reason: 'Dual stripes require precise scale variance to avoid visual vibration', isClash: false };
  }

  // Stripe + Subtle Plaid or Check: acceptable with caution
  if ((p1 === 'Striped' && (p2 === 'Checked' || p2 === 'Houndstooth')) || (p2 === 'Striped' && (p1 === 'Checked' || p1 === 'Houndstooth'))) {
    return { score: 65, reason: 'Stripes and micro-checks can work when one pattern is micro-scale', isClash: false };
  }

  return { score: 50, reason: 'Multiple distinct patterns introduce visual tension', isClash: false };
}

// ==========================================
// FORMALITY ENGINE
// ==========================================

export const FORMALITY_LEVELS = {
  'Casual': 1,
  'Smart Casual': 2,
  'Business Casual': 3,
  'Formal': 4,
  'Black Tie': 5,
} as const;

export type FormalityString = keyof typeof FORMALITY_LEVELS;

export function normalizeFormality(item: {
  category?: string;
  type?: string;
  subcategory?: string;
  name?: string;
  formality?: string;
  material?: string;
}): number {
  const text = `${item.name || ''} ${item.type || ''} ${item.subcategory || ''} ${item.formality || ''} ${item.material || ''}`.toLowerCase();

  // 5: Black Tie
  if (text.includes('tuxedo') || text.includes('black tie') || text.includes('evening gown') || text.includes('patent leather')) {
    return 5;
  }

  // 4: Formal
  if (text.includes('suit') || text.includes('dress shirt') || text.includes('oxford shoes') || text.includes('formal trousers') || text.includes('derby shoes') || text.includes('overcoat')) {
    return 4;
  }

  // 3: Business Casual / Smart Tailored
  if (text.includes('blazer') || text.includes('sport coat') || text.includes('dress chinos') || text.includes('tailored') || text.includes('monkstrap') || text.includes('loafers') || text.includes('chelsea boot')) {
    return 3;
  }

  // 2: Smart Casual
  if (text.includes('polo') || text.includes('oxford shirt') || text.includes('button-down') || text.includes('chinos') || text.includes('dark jeans') || text.includes('clean sneakers') || text.includes('sweater') || text.includes('cardigan') || text.includes('bomber')) {
    return 2;
  }

  // 1: Casual
  if (text.includes('t-shirt') || text.includes('tank top') || text.includes('hoodie') || text.includes('sweatpants') || text.includes('joggers') || text.includes('shorts') || text.includes('sandals') || text.includes('slides') || text.includes('running') || text.includes('gym')) {
    return 1;
  }

  // Fallback on item.formality string if present
  if (item.formality && FORMALITY_LEVELS[item.formality as FormalityString]) {
    return FORMALITY_LEVELS[item.formality as FormalityString];
  }

  return 2; // Default smart casual
}

export const OCCASION_FORMALITY_REQUIREMENTS: Record<string, { min: number; max: number; target: number }> = {
  'Casual': { min: 1, max: 2, target: 1 },
  'Casual day': { min: 1, max: 2, target: 1 },
  'Casual outing': { min: 1, max: 2, target: 1 },
  'Outdoor': { min: 1, max: 2, target: 1 },
  'Travel': { min: 1, max: 2, target: 1 },
  'College': { min: 1, max: 2, target: 1 },
  'Athletic': { min: 1, max: 2, target: 1 },
  'Brunch': { min: 1, max: 3, target: 2 },
  'Weekend': { min: 1, max: 2, target: 1.5 },
  'Date': { min: 2, max: 3, target: 2 },
  'Dinner': { min: 2, max: 4, target: 2.5 },
  'Party': { min: 2, max: 4, target: 3 },
  'Work': { min: 2, max: 4, target: 3 },
  'Business Casual': { min: 2, max: 4, target: 3 },
  'Presentation': { min: 3, max: 5, target: 4 },
  'Interview': { min: 3, max: 5, target: 4 },
  'Formal': { min: 4, max: 5, target: 4 },
  'Wedding': { min: 4, max: 5, target: 4.5 },
  'Black Tie': { min: 5, max: 5, target: 5 },
};

// ==========================================
// WEATHER & THERMAL INTELLIGENCE
// ==========================================

export type ThermalCondition = 'Very Cold' | 'Cold' | 'Mild' | 'Warm' | 'Hot' | 'Unavailable';

export function normalizeTemperatureCondition(tempC?: number): ThermalCondition {
  if (tempC === undefined || isNaN(tempC)) return 'Unavailable';
  if (tempC < 5) return 'Very Cold';
  if (tempC < 14) return 'Cold';
  if (tempC < 22) return 'Mild';
  if (tempC < 28) return 'Warm';
  return 'Hot';
}

export function evaluateThermalSuitability(
  items: Array<{ category?: string; name?: string; type?: string; material?: string }>,
  tempC?: number
): {
  isCompatible: boolean;
  score: number;
  reason: string;
} {
  if (tempC === undefined) {
    return { isCompatible: true, score: 85, reason: 'Adaptive all-season layering' };
  }

  const condition = normalizeTemperatureCondition(tempC);
  const text = items.map(i => `${i.name || ''} ${i.type || ''} ${i.material || ''}`).join(' ').toLowerCase();

  const hasHeavyOuterwear = items.some(i => i.category === 'Outerwear' && /coat|parka|down|puffer|shearling|heavy wool/i.test(i.name + ' ' + (i.material || '')));
  const hasShortsOrSandals = /short|sandal|slide|flip flop|tank top|sleeveless/i.test(text);

  if (condition === 'Hot' || condition === 'Warm') {
    // Heavy coats are strongly incompatible with hot weather
    if (hasHeavyOuterwear) {
      return { isCompatible: false, score: 20, reason: `Heavy outerwear is uncomfortably hot for ${tempC}°C weather` };
    }
    return { isCompatible: true, score: 95, reason: `Breathable silhouette suited for ${tempC}°C conditions` };
  }

  if (condition === 'Cold' || condition === 'Very Cold') {
    // Shorts/sandals in cold weather
    if (hasShortsOrSandals) {
      return { isCompatible: false, score: 15, reason: `Shorts or open footwear are unsuitable for ${tempC}°C cold weather` };
    }
    const hasOuterwear = items.some(i => i.category === 'Outerwear');
    if (!hasOuterwear && condition === 'Very Cold') {
      return { isCompatible: true, score: 60, reason: `Warm outerwear recommended for ${tempC}°C conditions` };
    }
    return { isCompatible: true, score: 92, reason: `Insulating layers calibrated for ${tempC}°C cold conditions` };
  }

  // Mild
  return { isCompatible: true, score: 90, reason: `Comfortable fabric weights for mild ${tempC}°C weather` };
}

