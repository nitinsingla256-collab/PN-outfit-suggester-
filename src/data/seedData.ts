/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, AdminUser, ActivityLog, SystemHealthStatus } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_pn_client',
  name: 'Client',
  email: 'client@pn.outfit',
  pronouns: 'they/them',
  bio: 'Personal digital wardrobe and luxury styling studio.',
  location: '',
  joinedDate: new Date().toISOString().split('T')[0],
  lastActive: new Date().toISOString(),
  role: 'user',
  status: 'Active',
  measurements: {
    heightCm: 178,
    heightUnit: 'cm',
    weightKg: 70,
    weightUnit: 'kg',
    hasCompletedFirstLoginMeasurements: false,
  },
  profile: {
    preferredFit: 'Tailored',
    preferredColors: ['Navy', 'Black', 'White', 'Charcoal'],
    dislikedColors: [],
    preferredStyles: ['Smart Casual', 'Minimal'],
    defaultFormality: 'Smart Casual',
    lifestyleOccasions: ['Casual day', 'Dinner', 'Work'],
    isCompleted: false,
    hasPhotoAnalyzed: false,
  },
  preferences: {
    styleVibes: ['Minimal', 'Classic'],
    favoriteColors: ['Black', 'Ivory', 'Navy', 'Camel'],
    dislikedColors: [],
    preferredFits: ['Tailored', 'Relaxed'],
    temperatureUnit: 'Celsius',
    theme: 'Dark',
    notifications: {
      dailySuggestions: true,
      plannerReminders: true,
      weatherAlerts: true,
      productUpdates: false,
    },
    privacy: {
      improveRecommendations: true,
      publicProfile: false,
      shareOutfits: false,
    },
    security: {
      twoFactorEnabled: false,
      activeSessionsCount: 1,
    },
    stylistRules: {
      onlyUseOwnedItems: true,
      explainSuggestions: true,
      autoTagNewItems: true,
    },
  },
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_pn_client',
    name: 'Client',
    email: 'client@pn.outfit',
    role: 'user',
    wardrobeCount: 0,
    outfitsCount: 0,
    aiRequestsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
    status: 'Active',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const INITIAL_SYSTEM_HEALTH: SystemHealthStatus = {
  status: 'Operational',
  uptimePercentage: 99.98,
  aiServiceLatencyMs: 240,
  storageUsageMb: 0.1,
  storageLimitMb: 1000,
  totalActiveUsers: 1,
  totalWardrobeItems: 0,
  totalOutfitsComposed: 0,
  totalAiGenerations: 0,
  databaseStatus: 'Local Storage / Connected to Gemini Engine',
  lastBackupTimestamp: new Date().toISOString(),
};
