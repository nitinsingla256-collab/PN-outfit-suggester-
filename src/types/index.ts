/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationRoute = 
  | '/' 
  | '/home'
  | '/wardrobe' 
  | '/stylist' 
  | '/outfits' 
  | '/planner' 
  | '/favorites' 
  | '/profile' 
  | '/settings' 
  | '/admin'
  | '/auth'
  | '/login';

export type ClothingCategory = 
  | 'Tops' 
  | 'Bottoms' 
  | 'Outerwear' 
  | 'Dresses' 
  | 'Footwear' 
  | 'Accessories' 
  | 'Bags' 
  | 'Jewelry' 
  | 'Activewear' 
  | 'Formalwear';

export type ClothingColor = 
  | 'Black' 
  | 'Charcoal' 
  | 'White' 
  | 'Ivory' 
  | 'Beige' 
  | 'Camel' 
  | 'Navy' 
  | 'Blue'
  | 'Olive' 
  | 'Burgundy' 
  | 'Chocolate' 
  | 'Brown'
  | 'Grey'
  | 'Silver' 
  | 'Gold' 
  | 'Emerald' 
  | 'Sage' 
  | 'Terracotta'
  | 'Pastel Pink'
  | 'Khaki';

export type ClothingFit = 'Slim' | 'Regular' | 'Relaxed' | 'Oversized' | 'Tailored';

export type ClothingFormality = 'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal' | 'Black Tie';

export type StyleVibe = 
  | 'Casual'
  | 'Minimal' 
  | 'Classic' 
  | 'Smart Casual'
  | 'Streetwear' 
  | 'Old money' 
  | 'Edgy' 
  | 'Romantic' 
  | 'Sporty' 
  | 'Avant-garde';

export type OccasionType = 
  | 'Dinner'
  | 'Work' 
  | 'Casual' 
  | 'Party' 
  | 'Date' 
  | 'Formal' 
  | 'Wedding'
  | 'School' 
  | 'Travel' 
  | 'Athletic';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All-Season';

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  type?: string; // e.g. Shirt, T-shirt, Polo, Sweater, Blazer, Chinos, Boots, etc.
  subcategory?: string;
  color: string;
  secondaryColor?: string;
  pattern?: string; // Solid, Striped, Plaid, Floral, Houndstooth, Textured, Graphic, Checked
  material?: string; // Cotton, Denim (Likely), Linen, Wool, Silk, Leather, Cashmere, Knit
  style?: string; // Casual, Smart Casual, Formal, Minimal, Streetwear, Old Money
  formality?: ClothingFormality;
  brand?: string;
  size?: string;
  fit?: ClothingFit;
  season: string[];
  occasion?: string[];
  tags: string[];
  imageUrl: string;
  isFavorite: boolean;
  timesWorn: number;
  lastWornDate?: string;
  purchaseDate?: string;
  cost?: number;
  careInstructions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitPiece {
  category: string;
  itemId?: string;
  item?: WardrobeItem;
  role: string;
  suggestedDescription: string;
  isOwned: boolean;
}

export interface OutfitScoreBreakdown {
  colorHarmony: number;
  occasionFit: number;
  weatherMatch: number;
  coherence: number;
}

export interface GeneratedLookOption {
  id: string;
  lookType: 'SAFE & REFINED' | 'MODERN' | 'STATEMENT';
  title: string;
  subtitle: string;
  pieces: OutfitPiece[];
  whyItWorks: string;
  bestFor: {
    occasion: string;
    time: string;
    weather: string;
  };
  styleNotes: string[];
  alternativeLookSuggestion?: string;
  gapAnalysis?: string;
  score: number;
  scoreBreakdown: OutfitScoreBreakdown;
}

export interface OutfitItemReference {
  itemId: string;
  slotName: 'Top' | 'Bottom' | 'Outerwear' | 'Footwear' | 'Bag' | 'Accessory' | 'Jewelry' | 'Main';
  notes?: string;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  occasion: string;
  styleVibe?: string;
  items: OutfitItemReference[];
  itemDetails?: WardrobeItem[];
  imageUrl?: string;
  isFavorite: boolean;
  stylingNotes?: string;
  weatherSuitability?: string;
  score?: number;
  scoreBreakdown?: OutfitScoreBreakdown;
  bestFor?: {
    occasion: string;
    time: string;
    weather: string;
  };
  season?: string[];
  timesWorn: number;
  lastWornDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedOutfit {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  outfitId?: string;
  outfit?: Outfit;
  occasion: OccasionType;
  title: string;
  location?: string;
  notes?: string;
  weatherForecast?: {
    tempCelsius: number;
    condition: string;
    icon: string;
  };
  isCompleted: boolean;
  createdAt: string;
}

export type ThemeMode = 'Light Atelier' | 'Midnight Luxury';

export interface UserPreferences {
  styleVibes: StyleVibe[];
  favoriteColors: ClothingColor[];
  dislikedColors: ClothingColor[];
  preferredFits: ClothingFit[];
  temperatureUnit: 'Celsius' | 'Fahrenheit';
  currency?: string;
  measurementSystem?: string;
  stylingRisk?: string;
  theme: 'Dark' | 'Light' | 'System' | ThemeMode;
  notifications: {
    dailySuggestions: boolean;
    plannerReminders: boolean;
    weatherAlerts: boolean;
    productUpdates: boolean;
  };
  privacy: {
    improveRecommendations: boolean;
    publicProfile: boolean;
    shareOutfits: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    activeSessionsCount: number;
  };
  stylistRules: {
    onlyUseOwnedItems: boolean;
    explainSuggestions: boolean;
    autoTagNewItems: boolean;
  };
}

export type HeightUnit = 'cm' | 'm' | 'ft_in' | 'in';
export type WeightUnit = 'kg' | 'lbs';

export type FaceShape = 'Oval' | 'Square' | 'Round' | 'Heart' | 'Oblong' | 'Diamond';
export type SkinToneUndertone = 'Warm' | 'Cool' | 'Neutral' | 'Olive' | 'Deep Warm' | 'Fair Cool';

export interface VisualStyleAnalysis {
  faceShape: FaceShape;
  skinTone: SkinToneUndertone;
  contrastLevel: 'High' | 'Medium' | 'Low' | 'Soft';
  hairCharacteristics?: string;
  recommendedPalettes: string[];
  recommendedNecklines: string[];
  analysisNotes: string;
  photoUploadedAt?: string;
  photoThumbnail?: string;
}

export interface PersonalStyleProfile {
  // A. Visual Style Analysis (from photo or manual selection)
  visualAnalysis?: VisualStyleAnalysis;
  hasPhotoAnalyzed: boolean;
  
  gender?: 'Men' | 'Women' | 'Non-binary' | 'Prefer not to say';
  age?: number;

  // B. Body & Fit Dimensions
  heightCm?: number;
  heightUnit?: HeightUnit;
  weightKg?: number;
  weightUnit?: WeightUnit;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: string;
  preferredFit: 'Relaxed' | 'Tailored' | 'Oversized' | 'Slim' | 'Classic';
  
  // C. Color Preferences
  preferredColors: string[];
  dislikedColors: string[];
  
  // D. Style & Formality Aesthetics
  preferredStyles: string[];
  defaultFormality: 'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal';
  lifestyleOccasions: string[];
  
  // Status
  isCompleted: boolean;
  lastConfirmedAt?: string;
}

export interface UserMeasurements {
  heightCm?: number;
  heightUnit?: HeightUnit;
  weightKg?: number;
  weightUnit?: WeightUnit;
  hasCompletedFirstLoginMeasurements?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pronouns: string;
  bio: string;
  location: string;
  avatarUrl?: string;
  joinedDate: string;
  lastActive: string;
  status: 'Active' | 'Suspended' | 'Pending';
  preferences: UserPreferences;
  role: 'user' | 'admin' | 'supervisor';
  measurements?: UserMeasurements;
  profile?: PersonalStyleProfile;
}

export interface AIStylistRequest {
  naturalQuery?: string;
  occasion?: string;
  date?: string;
  time?: string;
  location?: string;
  dressCode?: string;
  stylePreference?: string;
  colorPreference?: string;
  weatherDescription?: string;
  temperatureCelsius?: number;
  additionalNotes?: string;
  mustIncludeItemIds?: string[];
  excludeItemIds?: string[];
  generateMultipleLooks?: boolean;
  userProfile?: PersonalStyleProfile;
}

export interface AIStylistResponse {
  id: string;
  requestId: string;
  outfitName: string;
  summary: string;
  pieces: OutfitPiece[];
  whyItWorks: string;
  weatherReasoning: string;
  occasionReasoning: string;
  bestFor?: {
    occasion: string;
    time: string;
    weather: string;
  };
  stylingTips: string[];
  suggestedAccessories: string[];
  alternativeLookSuggestion?: string;
  gapAnalysis?: string;
  confidenceScore: number; // 0-100
  scoreBreakdown?: OutfitScoreBreakdown;
  looks?: GeneratedLookOption[];
  generatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'supervisor';
  wardrobeCount: number;
  outfitsCount: number;
  aiRequestsCount: number;
  createdAt: string;
  lastActive: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'WARDROBE' | 'AI_STYLIST' | 'AUTH' | 'PLANNER' | 'SETTINGS' | 'SYSTEM';
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
  ipAddress?: string;
}

export interface SystemHealthStatus {
  status: 'Operational' | 'Degraded' | 'Maintenance';
  uptimePercentage: number;
  aiServiceLatencyMs: number;
  storageUsageMb: number;
  storageLimitMb: number;
  totalActiveUsers: number;
  totalWardrobeItems: number;
  totalOutfitsComposed: number;
  totalAiGenerations: number;
  databaseStatus: string;
  lastBackupTimestamp: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  durationMs?: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface WardrobeClusterGroup {
  id: string;
  name: string; // e.g. "Monochrome Tailoring", "Warm Earth Tones & Neutrals", "Indigo Denim & Casual Staples", "Luminous Whites & Minimal Silhouettes"
  themeType: 'color' | 'style' | 'aesthetic_harmony';
  primaryColorPalette: string[];
  styleVibe: string;
  itemIds: string[];
  aestheticDescription: string;
  stylingTip: string;
}

export interface WardrobeAutoOrganizeResult {
  organizedAt: string;
  clusters: WardrobeClusterGroup[];
  paletteBreakdown: {
    colorName: string;
    hex: string;
    itemCount: number;
    percentage: number;
  }[];
  styleDistribution: {
    styleName: string;
    itemCount: number;
    percentage: number;
  }[];
  capsuleHarmonyScore: number;
  executiveAestheticSummary: string;
}

export interface FashionTrendColor {
  name: string;
  hex: string;
}

export interface FashionTrend {
  id: string;
  title: string;
  category: 'Key Silhouettes' | 'Color Palettes' | 'Fabrics & Textures' | 'Accessories & Footwear' | 'Occasion & Vibe' | 'Trending Now';
  season: string;
  headline: string;
  summary: string;
  keyElements: string[];
  colorPalette: FashionTrendColor[];
  howToStyle: string;
  matchingCategories: ClothingCategory[];
  sources?: GroundingSource[];
  imageUrl?: string;
  tag: string;
  popularityScore?: number;
}

export interface FashionTrendsReport {
  season: string;
  lastUpdated: string;
  headlineSummary: string;
  keyTakeaways: string[];
  trends: FashionTrend[];
  searchQueries?: string[];
  sources: GroundingSource[];
}
