/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'paurvi_db.json');

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'admin' | 'supervisor';
  status: 'Active' | 'Suspended';
  joinedDate: string;
  lastActive: string;
  pronouns?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  resetToken?: string;
  resetExpires?: number;
  preferences: {
    styleVibes: string[];
    favoriteColors: string[];
    dislikedColors: string[];
    preferredFits: string[];
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
  };
  measurements?: {
    heightCm?: number;
    heightUnit?: 'cm' | 'm' | 'ft_in' | 'in';
    weightKg?: number;
    weightUnit?: 'kg' | 'lbs';
    hasCompletedFirstLoginMeasurements?: boolean;
  };
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface StoredActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: 'WARDROBE' | 'AI_STYLIST' | 'AUTH' | 'PLANNER' | 'SETTINGS' | 'SYSTEM';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StoredWearEvent {
  id: string;
  userId: string;
  outfitId?: string;
  itemIds: string[];
  date: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  wardrobes: Record<string, any[]>;
  outfits: Record<string, any[]>;
  plans: Record<string, any[]>;
  wearHistory: Record<string, StoredWearEvent[]>;
  stylistConversations: Record<string, any[]>;
  activityLogs: StoredActivityLog[];
  aiRequestsCount: Record<string, number>;
}

// Password hashing helpers using Node.js crypto
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

export function generateToken(): string {
  return 'paurvi_tok_' + crypto.randomBytes(32).toString('hex');
}

export function defaultPreferences() {
  return {
    styleVibes: ['Minimal', 'Classic'],
    favoriteColors: ['Black', 'Ivory', 'Navy', 'Camel'],
    dislikedColors: [],
    preferredFits: ['Tailored', 'Relaxed'],
    temperatureUnit: 'Celsius' as const,
    theme: 'Dark' as const,
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
  };
}

class PaurviDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.load();
    // Prevent uninitialized schema keys from crashing overview functions
    this.data.users = this.data.users || [];
    this.data.sessions = this.data.sessions || [];
    this.data.wardrobes = this.data.wardrobes || {};
    this.data.outfits = this.data.outfits || {};
    this.data.plans = this.data.plans || {};
    this.data.wearHistory = this.data.wearHistory || {};
    this.data.stylistConversations = this.data.stylistConversations || {};
    this.data.activityLogs = this.data.activityLogs || [];
    this.data.aiRequestsCount = this.data.aiRequestsCount || {};
    
    this.seedInitialSupervisorIfEmpty();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database file, initializing fresh store:', err);
    }

    return {
      users: [],
      sessions: [],
      wardrobes: {},
      outfits: {},
      plans: {},
      wearHistory: {},
      stylistConversations: {},
      activityLogs: [],
      aiRequestsCount: {},
    };
  }

  private save() {
    try {
      this.ensureDataDirectory();
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedInitialSupervisorIfEmpty() {
    // Check if any supervisor or admin exists
    const existingSupervisor = this.data.users.find(u => u.id === 'usr_supervisor_paurvi');
    if (existingSupervisor) {
      if (existingSupervisor.role !== 'supervisor' && existingSupervisor.role !== 'admin') {
         existingSupervisor.role = 'supervisor';
         this.save();
      }
    } else {
      const hasAdmin = this.data.users.some(u => u.role === 'supervisor' || u.role === 'admin');
      if (!hasAdmin) {
        const { hash, salt } = hashPassword((process.env.ADMIN_PASSWORD || '1211').trim());
        const supervisor: StoredUser = {
          id: 'usr_supervisor_paurvi',
          name: 'Nitin Singla (Admin)',
          email: 'nitinsingla256@gmail.com',
          passwordHash: hash,
          salt,
          role: 'supervisor',
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString(),
          pronouns: 'she/they',
          bio: 'Lead Atelier Supervisor & Haute Horlogerie Archivist.',
          location: 'Paris, France',
          preferences: defaultPreferences(),
        };

        this.data.users.push(supervisor);
        this.data.wardrobes[supervisor.id] = [];
        this.data.outfits[supervisor.id] = [];
        this.data.plans[supervisor.id] = [];
        this.data.wearHistory[supervisor.id] = [];
        this.data.stylistConversations[supervisor.id] = [];
        this.data.aiRequestsCount[supervisor.id] = 0;

        this.data.activityLogs.unshift({
          id: `log_init_${Date.now()}`,
          userId: supervisor.id,
          userName: supervisor.name,
          userEmail: supervisor.email,
          action: 'System initialized and supervisor account provisioned',
          category: 'SYSTEM',
          timestamp: new Date().toISOString(),
        });

        this.save();
      }
    }

    // Check if nitinsingla256@gmail.com account exists
    const hasMasterAdmin = this.data.users.some(u => u.email.toLowerCase() === 'nitinsingla256@gmail.com');
    if (!hasMasterAdmin) {
      const { hash, salt } = hashPassword((process.env.ADMIN_INITIAL_PASSWORD || '1211').trim());
      const masterAdmin: StoredUser = {
        id: 'usr_master_admin_paurvi',
        name: 'Master Administrator',
        email: 'nitinsingla256@gmail.com',
        passwordHash: hash,
        salt,
        role: 'admin',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        pronouns: 'they/them',
        bio: 'Master Administrator of PAURVI Atelier.',
        location: 'Global',
        preferences: defaultPreferences(),
      };

      this.data.users.push(masterAdmin);
      this.data.wardrobes[masterAdmin.id] = [];
      this.data.outfits[masterAdmin.id] = [];
      this.data.plans[masterAdmin.id] = [];
      this.data.wearHistory[masterAdmin.id] = [];
      this.data.stylistConversations[masterAdmin.id] = [];
      this.data.aiRequestsCount[masterAdmin.id] = 0;

      this.save();
    }
    const hasClient = this.data.users.some(u => u.email.toLowerCase() === 'client@paurvi.atelier');
    if (!hasClient) {
      const { hash, salt } = hashPassword('client123');
      const client: StoredUser = {
        id: 'usr_client_paurvi',
        name: 'Client',
        email: 'client@paurvi.atelier',
        passwordHash: hash,
        salt,
        role: 'user',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        pronouns: 'they/them',
        bio: 'Personal digital wardrobe and luxury styling studio.',
        location: 'Paris, France',
        preferences: defaultPreferences(),
      };

      this.data.users.push(client);
      this.data.wardrobes[client.id] = [];
      this.data.outfits[client.id] = [];
      this.data.plans[client.id] = [];
      this.data.wearHistory[client.id] = [];
      this.data.stylistConversations[client.id] = [];
      this.data.aiRequestsCount[client.id] = 0;

      this.save();
    }
  }

  // --- Auth Operations ---

  createUser(name: string, email: string, passwordPlain: string, role: 'user' | 'admin' | 'supervisor' = 'user'): StoredUser {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const { hash, salt } = hashPassword(passwordPlain);
    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const newUser: StoredUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hash,
      salt,
      role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      pronouns: 'they/them',
      bio: 'Member of the PAURVI Atelier private wardrobe capsule.',
      location: 'Delhi, India',
      preferences: defaultPreferences(),
    };

    this.data.users.push(newUser);
    this.data.wardrobes[userId] = [];
    this.data.outfits[userId] = [];
    this.data.plans[userId] = [];
    this.data.wearHistory[userId] = [];
    this.data.stylistConversations[userId] = [];
    this.data.aiRequestsCount[userId] = 0;

    this.logActivity(userId, newUser.name, newUser.email, 'User registered new PAURVI account', 'AUTH');
    this.save();
    return newUser;
  }

  authenticate(email: string, passwordPlain: string): { user: StoredUser; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email address or password.');
    }

    if (user.status === 'Suspended') {
      throw new Error('This account has been suspended. Please contact supervisor support.');
    }

    const isValid = verifyPassword(passwordPlain.trim(), user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Invalid email address or password.');
    }

    user.lastActive = new Date().toISOString();
    const token = generateToken();
    const session: StoredSession = {
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.data.sessions.push(session);
    this.logActivity(user.id, user.name, user.email, 'User signed into PAURVI', 'AUTH');
    this.save();
    return { user, token };
  }

  getUserByToken(token: string): StoredUser | null {
    if (!token) return null;
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      // Session expired
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.save();
      return null;
    }

    const user = this.data.users.find(u => u.id === session.userId);
    if (!user || user.status === 'Suspended') return null;

    user.lastActive = new Date().toISOString();
    return user;
  }

  getUserById(userId: string): StoredUser | null {
    if (!userId) return null;
    return this.data.users.find(u => u.id === userId && u.status !== 'Suspended') || null;
  }

  getOrCreateClientUser(): StoredUser {
    const existing = this.data.users.find(u => u.id === 'usr_client_paurvi' || u.role === 'user');
    if (existing) return existing;
    return this.data.users[0];
  }

  invalidateSession(token: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  requestPasswordReset(email: string): { resetToken: string; user: StoredUser } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('No account found with this email address.');
    }

    const resetToken = 'rst_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    user.resetToken = resetToken;
    user.resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    this.logActivity(user.id, user.name, user.email, 'User requested password reset code', 'AUTH', { resetCode: resetToken });
    this.save();
    return { resetToken, user };
  }

  resetPassword(email: string, resetToken: string, newPasswordPlain: string): boolean {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Account not found.');
    }

    if (!user.resetToken || user.resetToken !== resetToken.trim()) {
      throw new Error('Invalid or expired password reset code.');
    }

    if (!user.resetExpires || user.resetExpires < Date.now()) {
      throw new Error('Password reset code has expired. Please request a new code.');
    }

    const { hash, salt } = hashPassword(newPasswordPlain);
    user.passwordHash = hash;
    user.salt = salt;
    user.resetToken = undefined;
    user.resetExpires = undefined;

    // Invalidate all prior sessions for security
    this.data.sessions = this.data.sessions.filter(s => s.userId !== user.id);

    this.logActivity(user.id, user.name, user.email, 'User successfully reset password', 'AUTH');
    this.save();
    return true;
  }

  updateUserProfile(userId: string, updates: Partial<StoredUser>): StoredUser {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.pronouns) user.pronouns = updates.pronouns;
    if (updates.bio) user.bio = updates.bio;
    if (updates.location) user.location = updates.location;
    if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
    if (updates.measurements) {
      user.measurements = {
        ...user.measurements,
        ...updates.measurements,
      };
    }
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences,
        ...updates.preferences,
      };
    }

    this.logActivity(user.id, user.name, user.email, 'User updated style profile and preferences', 'SETTINGS');
    this.save();
    return user;
  }

  // --- Wardrobe Operations ---

  getWardrobe(userId: string): any[] {
    return this.data.wardrobes[userId] || [];
  }

  addWardrobeItem(userId: string, itemData: any): any {
    const items = this.data.wardrobes[userId] || [];
    const newItem = {
      ...itemData,
      id: `item_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.wardrobes[userId] = [newItem, ...items];
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Catalogued new piece: "${newItem.name}" (${newItem.category})`, 'WARDROBE');
    this.save();
    return newItem;
  }

  updateWardrobeItem(userId: string, itemId: string, updates: any): any {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error('Wardrobe item not found');

    const updated = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this.data.wardrobes[userId] = items;
    this.save();
    return updated;
  }

  deleteWardrobeItem(userId: string, itemId: string): boolean {
    const items = this.data.wardrobes[userId] || [];
    const item = items.find(i => i.id === itemId);
    this.data.wardrobes[userId] = items.filter(i => i.id !== itemId);
    const user = this.data.users.find(u => u.id === userId);
    if (item) {
      this.logActivity(userId, user?.name || 'User', user?.email || '', `Removed piece: "${item.name}" from wardrobe`, 'WARDROBE');
    }
    this.save();
    return true;
  }

  deleteWardrobeItems(userId: string, itemIds: string[]): { deletedIds: string[]; remainingCount: number } {
    if (!itemIds || itemIds.length === 0) {
      return { deletedIds: [], remainingCount: (this.data.wardrobes[userId] || []).length };
    }
    const idSet = new Set(itemIds);
    const current = this.data.wardrobes[userId] || [];
    const removed = current.filter(i => idSet.has(i.id));
    const remaining = current.filter(i => !idSet.has(i.id));
    this.data.wardrobes[userId] = remaining;

    const user = this.data.users.find(u => u.id === userId);
    if (removed.length > 0) {
      this.logActivity(
        userId,
        user?.name || 'User',
        user?.email || '',
        `Removed ${removed.length} pieces from wardrobe in batch`,
        'WARDROBE'
      );
    }
    this.save();
    return {
      deletedIds: removed.map(r => r.id),
      remainingCount: remaining.length,
    };
  }

  clearWardrobe(userId: string): boolean {
    const count = (this.data.wardrobes[userId] || []).length;
    this.data.wardrobes[userId] = [];
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Cleared all wardrobe items (${count} items removed)`, 'WARDROBE');
    this.save();
    return true;
  }

  toggleWardrobeFavorite(userId: string, itemId: string): any {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error('Item not found');

    items[index].isFavorite = !items[index].isFavorite;
    items[index].updatedAt = new Date().toISOString();
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `${items[index].isFavorite ? 'Favorited' : 'Unfavorited'} piece: "${items[index].name}"`, 'WARDROBE');
    this.save();
    return items[index];
  }

  recordWearItem(userId: string, itemId: string): any {
    const items = this.data.wardrobes[userId] || [];
    const index = items.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error('Item not found');

    items[index].timesWorn = (items[index].timesWorn || 0) + 1;
    items[index].lastWornDate = new Date().toISOString().split('T')[0];
    items[index].updatedAt = new Date().toISOString();

    const wearEvents = this.data.wearHistory[userId] || [];
    wearEvents.unshift({
      id: `wear_${Date.now()}`,
      userId,
      itemIds: [itemId],
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    });
    this.data.wearHistory[userId] = wearEvents;

    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Logged wear for piece: "${items[index].name}" (Cycle: ${items[index].timesWorn})`, 'WARDROBE');
    this.save();
    return items[index];
  }

  // --- Outfits Operations ---

  getOutfits(userId: string): any[] {
    return this.data.outfits[userId] || [];
  }

  addOutfit(userId: string, outfitData: any): any {
    const list = this.data.outfits[userId] || [];
    const newOutfit = {
      ...outfitData,
      id: `outfit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.outfits[userId] = [newOutfit, ...list];
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Saved look to Lookbook: "${newOutfit.name}"`, 'AI_STYLIST');
    this.save();
    return newOutfit;
  }

  updateOutfit(userId: string, outfitId: string, updates: any): any {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex(o => o.id === outfitId);
    if (index === -1) throw new Error('Outfit not found');

    const updated = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    this.data.outfits[userId] = list;
    this.save();
    return updated;
  }

  deleteOutfit(userId: string, outfitId: string): boolean {
    const list = this.data.outfits[userId] || [];
    const outfit = list.find(o => o.id === outfitId);
    this.data.outfits[userId] = list.filter(o => o.id !== outfitId);
    const user = this.data.users.find(u => u.id === userId);
    if (outfit) {
      this.logActivity(userId, user?.name || 'User', user?.email || '', `Removed look: "${outfit.name}" from Lookbook`, 'AI_STYLIST');
    }
    this.save();
    return true;
  }

  deleteOutfits(userId: string, outfitIds: string[]): { deletedIds: string[]; remainingCount: number } {
    if (!outfitIds || outfitIds.length === 0) {
      return { deletedIds: [], remainingCount: (this.data.outfits[userId] || []).length };
    }
    const idSet = new Set(outfitIds);
    const current = this.data.outfits[userId] || [];
    const removed = current.filter(o => idSet.has(o.id));
    const remaining = current.filter(o => !idSet.has(o.id));
    this.data.outfits[userId] = remaining;

    const user = this.data.users.find(u => u.id === userId);
    if (removed.length > 0) {
      this.logActivity(
        userId,
        user?.name || 'User',
        user?.email || '',
        `Removed ${removed.length} looks from Lookbook in batch`,
        'AI_STYLIST'
      );
    }
    this.save();
    return {
      deletedIds: removed.map(r => r.id),
      remainingCount: remaining.length,
    };
  }

  clearOutfits(userId: string): boolean {
    const count = (this.data.outfits[userId] || []).length;
    this.data.outfits[userId] = [];
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Cleared all saved looks (${count} looks removed)`, 'AI_STYLIST');
    this.save();
    return true;
  }

  toggleOutfitFavorite(userId: string, outfitId: string): any {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex(o => o.id === outfitId);
    if (index === -1) throw new Error('Outfit not found');

    list[index].isFavorite = !list[index].isFavorite;
    list[index].updatedAt = new Date().toISOString();
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `${list[index].isFavorite ? 'Favorited' : 'Unfavorited'} look: "${list[index].name}"`, 'AI_STYLIST');
    this.save();
    return list[index];
  }

  recordWearOutfit(userId: string, outfitId: string): any {
    const list = this.data.outfits[userId] || [];
    const index = list.findIndex(o => o.id === outfitId);
    if (index === -1) throw new Error('Outfit not found');

    list[index].timesWorn = (list[index].timesWorn || 0) + 1;
    list[index].updatedAt = new Date().toISOString();

    const items = this.data.wardrobes[userId] || [];
    const itemIds = (list[index].items || []).map((ref: any) => ref.itemId || ref.id).filter(Boolean);

    // Increment wear for each constituent piece
    items.forEach((item: any) => {
      if (itemIds.includes(item.id)) {
        item.timesWorn = (item.timesWorn || 0) + 1;
        item.lastWornDate = new Date().toISOString().split('T')[0];
        item.updatedAt = new Date().toISOString();
      }
    });

    const wearEvents = this.data.wearHistory[userId] || [];
    wearEvents.unshift({
      id: `wear_${Date.now()}`,
      userId,
      outfitId,
      itemIds,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    });
    this.data.wearHistory[userId] = wearEvents;

    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Wore outfit today: "${list[index].name}" (${itemIds.length} pieces incremented)`, 'AI_STYLIST');
    this.save();
    return list[index];
  }

  // --- Plans Operations ---

  getPlans(userId: string): any[] {
    return this.data.plans[userId] || [];
  }

  addPlan(userId: string, planData: any): any {
    const list = this.data.plans[userId] || [];
    const newPlan = {
      ...planData,
      id: `plan_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    this.data.plans[userId] = [newPlan, ...list];
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `Scheduled outfit for date: ${newPlan.date} ("${newPlan.title}")`, 'PLANNER');
    this.save();
    return newPlan;
  }

  updatePlan(userId: string, planId: string, updates: any): any {
    const list = this.data.plans[userId] || [];
    const index = list.findIndex(p => p.id === planId);
    if (index === -1) throw new Error('Plan not found');

    const updated = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    this.data.plans[userId] = list;
    this.save();
    return updated;
  }

  deletePlan(userId: string, planId: string): boolean {
    const list = this.data.plans[userId] || [];
    this.data.plans[userId] = list.filter(p => p.id !== planId);
    this.save();
    return true;
  }

  // --- AI Telemetry & Logs ---

  incrementAIRequestCount(userId: string, actionType: string, summary: string) {
    this.data.aiRequestsCount[userId] = (this.data.aiRequestsCount[userId] || 0) + 1;
    const user = this.data.users.find(u => u.id === userId);
    this.logActivity(userId, user?.name || 'User', user?.email || '', `AI Stylist request: ${actionType} ("${summary}")`, 'AI_STYLIST');
    this.save();
  }

  logActivity(
    userId: string,
    userName: string,
    userEmail: string,
    action: string,
    category: StoredActivityLog['category'],
    metadata?: Record<string, any>
  ) {
    const log: StoredActivityLog = {
      id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId,
      userName,
      userEmail,
      action,
      category,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.data.activityLogs.unshift(log);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
  }

  // --- Admin / Supervisor Metrics & Access ---

  getAdminOverview() {
    const totalUsers = this.data.users.length;
    const activeUsers = this.data.users.filter(u => u.status === 'Active').length;
    
    // New users in last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newUsers = this.data.users.filter(u => new Date(u.joinedDate).getTime() >= thirtyDaysAgo).length;

    let totalWardrobeItems = 0;
    let totalOutfits = 0;
    let totalWearCycles = 0;

    Object.values(this.data.wardrobes).forEach(items => {
      totalWardrobeItems += items.length;
      items.forEach((item: any) => {
        totalWearCycles += item.timesWorn || 0;
      });
    });

    Object.values(this.data.outfits).forEach(outfits => {
      totalOutfits += outfits.length;
    });

    let totalAiRequests = 0;
    Object.values(this.data.aiRequestsCount).forEach(count => {
      totalAiRequests += count;
    });

    return {
      totalUsers,
      activeUsers,
      newUsers,
      totalWardrobeItems,
      totalOutfits,
      totalAiRequests,
      totalWearCycles,
      totalActivityLogs: this.data.activityLogs.length,
    };
  }

  getAdminUsersList() {
    return this.data.users.map(u => {
      const wardrobeItems = this.data.wardrobes[u.id] || [];
      const outfits = this.data.outfits[u.id] || [];
      const favoritesCount = wardrobeItems.filter((i: any) => i.isFavorite).length + outfits.filter((o: any) => o.isFavorite).length;
      let totalWears = 0;
      wardrobeItems.forEach((i: any) => {
        totalWears += i.timesWorn || 0;
      });

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        joinedDate: u.joinedDate,
        lastActive: u.lastActive,
        wardrobeCount: wardrobeItems.length,
        outfitsCount: outfits.length,
        favoritesCount,
        wearCyclesCount: totalWears,
        aiRequestsCount: this.data.aiRequestsCount[u.id] || 0,
        location: u.location,
        pronouns: u.pronouns,
        bio: u.bio,
      };
    });
  }

  getAdminUserDetails(targetUserId: string) {
    const u = this.data.users.find(user => user.id === targetUserId);
    if (!u) throw new Error('User not found');

    const wardrobeItems = this.data.wardrobes[u.id] || [];
    const outfits = this.data.outfits[u.id] || [];
    const plans = this.data.plans[u.id] || [];
    const wearHistory = this.data.wearHistory[u.id] || [];
    const userLogs = this.data.activityLogs.filter(log => log.userId === u.id).slice(0, 20);

    const favoritesCount = wardrobeItems.filter((i: any) => i.isFavorite).length + outfits.filter((o: any) => o.isFavorite).length;
    let totalWears = 0;
    wardrobeItems.forEach((i: any) => {
      totalWears += i.timesWorn || 0;
    });

    return {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        joinedDate: u.joinedDate,
        lastActive: u.lastActive,
        location: u.location,
        pronouns: u.pronouns,
        bio: u.bio,
        preferences: u.preferences,
      },
      stats: {
        wardrobeCount: wardrobeItems.length,
        outfitsCount: outfits.length,
        plansCount: plans.length,
        favoritesCount,
        wearCyclesCount: totalWears,
        aiRequestsCount: this.data.aiRequestsCount[u.id] || 0,
      },
      recentWardrobePieces: wardrobeItems.slice(0, 6),
      recentOutfits: outfits.slice(0, 4),
      recentActivity: userLogs,
    };
  }

  updateUserStatusOrRole(adminUserId: string, targetUserId: string, updates: { status?: 'Active' | 'Suspended'; role?: 'user' | 'admin' | 'supervisor' }) {
    const target = this.data.users.find(u => u.id === targetUserId);
    if (!target) throw new Error('User not found');

    if (updates.status) target.status = updates.status;
    if (updates.role) target.role = updates.role;

    const admin = this.data.users.find(u => u.id === adminUserId);
    this.logActivity(
      adminUserId,
      admin?.name || 'Supervisor',
      admin?.email || '',
      `Supervisor modified account status/role for ${target.email}: status=${target.status}, role=${target.role}`,
      'SYSTEM'
    );
    this.save();
    return target;
  }

  getActivityLogs(limit = 100): StoredActivityLog[] {
    return this.data.activityLogs.slice(0, limit);
  }

  getSystemHealth() {
    let totalStorageBytes = 0;
    try {
      if (fs.existsSync(DB_FILE)) {
        const stats = fs.statSync(DB_FILE);
        totalStorageBytes = stats.size;
      }
    } catch {
      // fallback
    }

    return {
      status: 'Operational',
      uptimeSeconds: process.uptime(),
      aiModel: 'Gemini 3.6 Flash',
      databaseEngine: 'PAURVI JSON Core & Scoped Partitioning',
      totalUsers: this.data.users.length,
      activeSessions: this.data.sessions.length,
      totalActivityLogs: this.data.activityLogs.length,
      databaseSizeBytes: totalStorageBytes,
      serverMemoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  getUserStats(userId: string) {
    const wardrobeItems = this.data.wardrobes[userId] || [];
    const outfits = this.data.outfits[userId] || [];
    const plans = this.data.plans[userId] || [];
    
    let totalWearCycles = 0;
    wardrobeItems.forEach((i: any) => {
      totalWearCycles += i.timesWorn || 0;
    });

    const favoritesCount = 
      wardrobeItems.filter((i: any) => i.isFavorite).length + 
      outfits.filter((o: any) => o.isFavorite).length;

    return {
      piecesCount: wardrobeItems.length,
      outfitsCount: outfits.length,
      plansCount: plans.length,
      favoritesCount,
      wearCyclesCount: totalWearCycles,
      aiRequestsCount: this.data.aiRequestsCount[userId] || 0,
    };
  }
}

export const db = new PaurviDatabase();
