/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationRoute = 
  | '/' 
  | '/wardrobe' 
  | '/stylist' 
  | '/outfits' 
  | '/planner' 
  | '/favorites' 
  | '/profile' 
  | '/settings' 
  | '/admin';

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

export interface UserPreferences {
  styleVibes: StyleVibe[];
  favoriteColors: ClothingColor[];
  dislikedColors: ClothingColor[];
  preferredFits: ClothingFit[];
  temperatureUnit: 'Celsius' | 'Fahrenheit';
  theme: 'Dark' | 'Light' | 'System';
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
