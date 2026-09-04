/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { db, StoredUser } from './server/db';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Extend express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: StoredUser;
    }
  }
}

// Authentication middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  req.user = user;
  next();
}

// Supervisor / Admin Role Guard middleware
function supervisorMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Forbidden: Administrator or Supervisor credentials required.',
    });
  }

  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // ==========================================
  // 1. SYSTEM HEALTH & API STATUS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      brand: 'PAURVI',
      engine: 'Gemini 2.5 Flash',
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // ==========================================
  // 2. AUTHENTICATION ENDPOINTS
  // ==========================================

  // Sign Up
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Full name is required.' });
      }

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const user = db.createUser(name, email, password, 'user');
      const { token } = db.authenticate(email, password);

      // Return clean user profile (no passwordHash/salt)
      const { passwordHash, salt, ...safeUser } = user;
      return res.status(201).json({
        success: true,
        user: safeUser,
        token,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Sign In
  app.post('/api/auth/signin', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const { user, token } = db.authenticate(email, password);
      const { passwordHash, salt, ...safeUser } = user;

      return res.json({
        success: true,
        user: safeUser,
        token,
      });
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Authentication failed.' });
    }
  });

  // Get Current Authenticated Session Profile
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const { passwordHash, salt, ...safeUser } = req.user!;
    return res.json({
      success: true,
      user: safeUser,
    });
  });

  // Sign Out
  app.post('/api/auth/signout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      db.invalidateSession(token);
    }
    return res.json({ success: true, message: 'Signed out safely.' });
  });

  // Request Password Reset
  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const { resetToken } = db.requestPasswordReset(email);
      return res.json({
        success: true,
        message: 'Password reset code generated and sent to your email.',
        resetCode: resetToken, // Provided in development response for easy recovery testing
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Password reset request failed.' });
    }
  });

  // Reset Password with code
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      db.resetPassword(email, resetCode, newPassword);
      return res.json({
        success: true,
        message: 'Password has been successfully updated. You may now sign in.',
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Password reset failed.' });
    }
  });

  // Update Profile
  app.put('/api/auth/profile', authMiddleware, (req, res) => {
    try {
      const updated = db.updateUserProfile(req.user!.id, req.body);
      const { passwordHash, salt, ...safeUser } = updated;
      return res.json({ success: true, user: safeUser });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // ==========================================
  // 3. USER-SCOPED WARDROBE ENDPOINTS
  // ==========================================

  app.get('/api/user/wardrobe', authMiddleware, (req, res) => {
    const items = db.getWardrobe(req.user!.id);
    return res.json({ success: true, items });
  });

  app.post('/api/user/wardrobe', authMiddleware, (req, res) => {
    try {
      const newItem = db.addWardrobeItem(req.user!.id, req.body);
      return res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to add item.' });
    }
  });

  app.put('/api/user/wardrobe/:id', authMiddleware, (req, res) => {
    try {
      const updated = db.updateWardrobeItem(req.user!.id, req.params.id, req.body);
      return res.json({ success: true, item: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update item.' });
    }
  });

  app.delete('/api/user/wardrobe/:id', authMiddleware, (req, res) => {
    try {
      db.deleteWardrobeItem(req.user!.id, req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete item.' });
    }
  });

  app.post('/api/user/wardrobe/batch-delete', authMiddleware, (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array of string item IDs.' });
      }
      const result = db.deleteWardrobeItems(req.user!.id, ids);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete items in batch.' });
    }
  });

  app.post('/api/user/wardrobe/clear', authMiddleware, (req, res) => {
    try {
      db.clearWardrobe(req.user!.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to clear wardrobe.' });
    }
  });

  app.post('/api/user/wardrobe/:id/favorite', authMiddleware, (req, res) => {
    try {
      const updated = db.toggleWardrobeFavorite(req.user!.id, req.params.id);
      return res.json({ success: true, item: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/user/wardrobe/:id/wear', authMiddleware, (req, res) => {
    try {
      const updated = db.recordWearItem(req.user!.id, req.params.id);
      return res.json({ success: true, item: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // 4. USER-SCOPED OUTFITS / LOOKS ENDPOINTS
  // ==========================================

  app.get('/api/user/outfits', authMiddleware, (req, res) => {
    const outfits = db.getOutfits(req.user!.id);
    return res.json({ success: true, outfits });
  });

  app.post('/api/user/outfits', authMiddleware, (req, res) => {
    try {
      const newOutfit = db.addOutfit(req.user!.id, req.body);
      return res.status(201).json({ success: true, outfit: newOutfit });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to save look.' });
    }
  });

  app.put('/api/user/outfits/:id', authMiddleware, (req, res) => {
    try {
      const updated = db.updateOutfit(req.user!.id, req.params.id, req.body);
      return res.json({ success: true, outfit: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/user/outfits/:id', authMiddleware, (req, res) => {
    try {
      db.deleteOutfit(req.user!.id, req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/user/outfits/batch-delete', authMiddleware, (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array of string outfit IDs.' });
      }
      const result = db.deleteOutfits(req.user!.id, ids);
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to delete outfits in batch.' });
    }
  });

  app.post('/api/user/outfits/clear', authMiddleware, (req, res) => {
    try {
      db.clearOutfits(req.user!.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to clear outfits.' });
    }
  });

  app.post('/api/user/outfits/:id/favorite', authMiddleware, (req, res) => {
    try {
      const updated = db.toggleOutfitFavorite(req.user!.id, req.params.id);
      return res.json({ success: true, outfit: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/user/outfits/:id/wear', authMiddleware, (req, res) => {
    try {
      const updated = db.recordWearOutfit(req.user!.id, req.params.id);
      return res.json({ success: true, outfit: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // 5. USER-SCOPED PLANS ENDPOINTS
  // ==========================================

  app.get('/api/user/plans', authMiddleware, (req, res) => {
    const plans = db.getPlans(req.user!.id);
    return res.json({ success: true, plans });
  });

  app.post('/api/user/plans', authMiddleware, (req, res) => {
    try {
      const newPlan = db.addPlan(req.user!.id, req.body);
      return res.status(201).json({ success: true, plan: newPlan });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/user/plans/:id', authMiddleware, (req, res) => {
    try {
      const updated = db.updatePlan(req.user!.id, req.params.id, req.body);
      return res.json({ success: true, plan: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/user/plans/:id', authMiddleware, (req, res) => {
    try {
      db.deletePlan(req.user!.id, req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // User Stats
  app.get('/api/user/stats', authMiddleware, (req, res) => {
    const stats = db.getUserStats(req.user!.id);
    return res.json({ success: true, stats });
  });

  // ==========================================
  // 6. ADMINISTRATOR / SUPERVISOR ENDPOINTS
  // ==========================================

  // Admin Overview
  app.get('/api/admin/overview', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const overview = db.getAdminOverview();
      return res.json({ success: true, overview });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Admin Registered Users
  app.get('/api/admin/users', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const users = db.getAdminUsersList();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Admin User Detail Inspector
  app.get('/api/admin/users/:userId', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const details = db.getAdminUserDetails(req.params.userId);
      return res.json({ success: true, details });
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Admin Update User Status/Role
  app.put('/api/admin/users/:userId/status', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const updated = db.updateUserStatusOrRole(req.user!.id, req.params.userId, req.body);
      return res.json({ success: true, user: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Admin Activity Log Feed
  app.get('/api/admin/activity', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const logs = db.getActivityLogs(150);
      return res.json({ success: true, logs });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Admin System Health & Diagnostic Telemetry
  app.get('/api/admin/system', authMiddleware, supervisorMiddleware, (req, res) => {
    try {
      const health = db.getSystemHealth();
      return res.json({ success: true, health });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // ==========================================
  // 7. GEMINI AI VISION GARMENT AUTO-CATALOGUING
  // ==========================================
  app.post('/api/gemini/analyze-garment', authMiddleware, async (req, res) => {
    try {
      const { imageUrl, imageBase64, mimeType, hint } = req.body;

      if (!imageUrl && !imageBase64 && !hint) {
        return res.status(400).json({ error: 'Please provide an image or garment description to analyze.' });
      }

      const ai = getAIClient();

      const prompt = `You are the lead fashion archivist and luxury garment cataloguer at PAURVI Atelier.
Analyze this garment image or description carefully and extract accurate, luxury-grade fashion attributes.
Do NOT invent unrealistic details. If a detail is uncertain, provide the most refined realistic assessment.

Extract the following JSON attributes:
- name: Refined editorial garment title (e.g. "Classic Denim Shirt", "Double-Breasted Wool Trench", "Silk Georgette Button-Down", "Pleated High-Rise Chinos", "Leather Chelsea Boots")
- category: One of ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Footwear', 'Bags', 'Accessories', 'Jewelry', 'Activewear', 'Formalwear']
- type: Specific clothing subcategory/type (e.g. 'Shirt', 'T-shirt', 'Polo', 'Sweater', 'Hoodie', 'Jacket', 'Blazer', 'Coat', 'Trousers', 'Jeans', 'Chinos', 'Shorts', 'Shoes', 'Boots', 'Sneakers', 'Loafers', 'Watch', 'Belt', 'Scarf', 'Bag')
- subcategory: Detailed subcategory descriptor (e.g. 'Button-Down Shirt', 'Tailored Blazer', 'Penny Loafers')
- color: Best matching primary color (e.g. 'Blue', 'Black', 'White', 'Charcoal', 'Navy', 'Beige', 'Camel', 'Brown', 'Grey', 'Olive', 'Burgundy', 'Emerald', 'Sage', 'Terracotta')
- secondaryColor: Optional secondary color if present, or null
- pattern: One of ['Solid', 'Striped', 'Plaid', 'Floral', 'Houndstooth', 'Textured', 'Graphic', 'Checked', 'Polka Dot']
- material: Probable textile composition with honest certainty qualifier (e.g. 'Denim (Likely)', '100% Cotton', 'Wool Blend', 'Silk Crepe', 'Calfskin Leather', 'Cashmere Knit', 'Linen')
- style: One of ['Casual', 'Smart Casual', 'Formal', 'Minimal', 'Classic', 'Streetwear', 'Old money', 'Edgy', 'Romantic']
- formality: One of ['Casual', 'Smart Casual', 'Business Casual', 'Formal', 'Black Tie']
- season: Array of applicable seasons from ['Spring', 'Summer', 'Autumn', 'Winter', 'All-Season']
- occasion: Array of applicable occasions from ['Work', 'Casual', 'Dinner', 'Date', 'Party', 'Formal', 'Wedding', 'Travel']
- fit: One of ['Tailored', 'Slim', 'Regular', 'Relaxed', 'Oversized']
- tags: Array of 3-5 luxury editorial tags (e.g. ['Denim Essentials', 'Capsule Core', 'Smart Casual', 'Layering Piece'])
- careInstructions: Professional garment care guideline (e.g. 'Machine wash cold, gentle cycle. Hang dry or steam.')
- stylingNote: Brief one-sentence note on how to pair this piece.
- confidence: Confidence score between 80 and 99.

${hint ? `User context/hint: "${hint}"` : ''}
`;

      const contents: any[] = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        });
      }

      contents.push(prompt);

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              type: { type: Type.STRING },
              subcategory: { type: Type.STRING },
              color: { type: Type.STRING },
              secondaryColor: { type: Type.STRING, nullable: true },
              pattern: { type: Type.STRING },
              material: { type: Type.STRING },
              style: { type: Type.STRING },
              formality: { type: Type.STRING },
              fit: { type: Type.STRING },
              season: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              occasion: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              careInstructions: { type: Type.STRING },
              stylingNote: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
            },
            required: ['name', 'category', 'type', 'color', 'pattern', 'material', 'style', 'formality', 'season', 'tags'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, analysis: parsed });
    } catch (_error: any) {
      // Graceful fallback for garment analysis when offline or rate-limited
      const hint = req.body?.hint || '';
      const fallbackAnalysis = {
        name: hint ? hint.replace(/[_-]/g, ' ') : 'Tailored Capsule Garment',
        category: /shirt|top|sweater|t-shirt|polo|blouse|hoodie|turtleneck/i.test(hint) ? 'Tops' :
                  /trouser|jean|pant|chino|short|skirt/i.test(hint) ? 'Bottoms' :
                  /coat|jacket|blazer|trench|parka|outerwear/i.test(hint) ? 'Outerwear' :
                  /shoe|boot|sneaker|loafer|sandal|footwear/i.test(hint) ? 'Footwear' :
                  /bag|tote|backpack|clutch/i.test(hint) ? 'Bags' :
                  /watch|belt|scarf|hat|sunglass/i.test(hint) ? 'Accessories' : 'Tops',
        type: 'Piece',
        subcategory: 'Classic',
        color: /blue|navy/i.test(hint) ? 'Navy' : /black/i.test(hint) ? 'Black' : /white/i.test(hint) ? 'White' : /beige|camel|tan/i.test(hint) ? 'Beige' : /grey|gray/i.test(hint) ? 'Charcoal' : 'Black',
        pattern: /stripe/i.test(hint) ? 'Striped' : /plaid|check/i.test(hint) ? 'Plaid' : 'Solid',
        material: 'Premium Fabric',
        style: 'Smart Casual',
        formality: 'Smart Casual',
        fit: 'Regular',
        season: ['All-Season'],
        occasion: ['Casual', 'Work'],
        tags: ['Wardrobe Core', 'Smart Casual'],
        careInstructions: 'Machine wash cold on gentle cycle or professional dry clean.',
        stylingNote: 'Versatile foundation piece that coordinates effortlessly across your capsule.',
        confidence: 88,
      };
      return res.json({
        success: true,
        isQuotaFallback: true,
        analysis: fallbackAnalysis,
      });
    }
  });

  // ==========================================
  // 8. REAL AI STYLIST ENGINE (SCOPED TO CURRENT USER & ADVANCED OUTFIT STUDIO)
  // ==========================================
  app.post('/api/gemini/stylist', authMiddleware, async (req, res) => {
    const {
      naturalQuery,
      occasion = 'Dinner',
      location = 'City Central',
      date = 'Today',
      time = '7:00 PM',
      dressCode = 'Smart Casual',
      stylePreference = 'Smart Casual',
      colorPreference,
      weatherDescription = '18°C, Clear',
      temperatureCelsius = 18,
      additionalNotes,
      mustIncludeItemIds = [],
      excludeItemIds = [],
      generateMultipleLooks = true,
    } = req.body || {};

    const userId = req.user!.id;
    const userWardrobe = db.getWardrobe(userId);
    const userOutfits = db.getOutfits(userId);
    const userWearHistory = (db as any).data.wearHistory[userId] || [];

    const availableItems = userWardrobe.filter(
      (item: any) => !excludeItemIds.includes(item.id)
    );

    try {

      const itemsSummary = availableItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        type: item.type || item.subcategory,
        color: item.color,
        pattern: item.pattern || 'Solid',
        material: item.material || 'Standard Fabric',
        style: item.style || 'Casual',
        formality: item.formality || 'Smart Casual',
        fit: item.fit || 'Regular',
        season: item.season || ['All-Season'],
        imageUrl: item.imageUrl,
        timesWorn: item.timesWorn || 0,
        isFavorite: !!item.isFavorite,
        isMustInclude: mustIncludeItemIds.includes(item.id),
      }));

      const ai = getAIClient();

      const prompt = `You are PAURVI's Head of Haute Couture & Elite AI Stylist.
You compose sophisticated, tailored outfit looks for client ${req.user!.name}.

CRITICAL MANDATORY RULES:
1. STRICT WARDROBE BOUNDARY:
${
  availableItems.length === 0
    ? `The client currently owns 0 items in their PAURVI digital wardrobe.
Inform the client honestly that their digital wardrobe is currently empty.
Provide an exquisite capsule foundation blueprint outlining the essential pieces they should catalogue first, tailored to their request: "${naturalQuery || occasion}".`
    : `You MUST select pieces STRICTLY from the client's actual owned wardrobe items listed below.
NEVER invent, hallucinate, or claim the client owns pieces that are not in this inventory list.
Use the exact piece IDs provided in the inventory list.

Owned Wardrobe Inventory (${availableItems.length} items):
${JSON.stringify(itemsSummary, null, 2)}`
}

2. HONEST GAP ANALYSIS:
If the user's wardrobe has items, but lacks a suitable piece for a complete ensemble (for example: lacks suitable Footwear, or Outerwear, or Bottoms for this occasion):
State clearly in gapAnalysis: "Your wardrobe doesn't currently contain a suitable [Category/Piece]." Then provide the best possible alternative using available items.

3. CONTEXT & PREFERENCES:
- Natural Query: ${naturalQuery ? `"${naturalQuery}"` : 'None'}
- Occasion: ${occasion}
- Style Aesthetic: ${stylePreference}
- Color Preference: ${colorPreference || 'Complementary natural harmony'}
- Location / Venue: ${location}
- Date & Time: ${date} at ${time}
- Dress Code: ${dressCode}
- Weather & Climate: ${weatherDescription} (${temperatureCelsius}°C)
- Client Body Proportions: ${
  req.user?.measurements?.heightCm
    ? `Height: ${req.user.measurements.heightCm} cm, Weight: ${req.user.measurements.weightKg || 'Not specified'} kg. Harmonize garment drape, hemlines, and vertical silhouette balance for this stature.`
    : 'Standard proportions'
}
- Must-Include Items: ${mustIncludeItemIds.join(', ') || 'None'}
- Special Notes: ${additionalNotes || 'None'}

4. OUTPUT REQUIREMENTS:
Provide:
- Primary Look:
  - outfitName: Refined name (e.g. "Smart Casual Dinner Look", "Midnight Evening", "Refined Cashmere & Chinos Ensemble")
  - summary: High-level overview of the look.
  - pieces: Array of slots (Top, Bottom, Outerwear, Footwear, Accessories). Each item MUST reference an owned item by itemId if available.
  - whyItWorks: Detailed, thoughtful explanation of color coordination, silhouette balance, and occasion suitability.
  - bestFor: Object with occasion (e.g. "Dinner"), time (e.g. "7:00 PM"), weather (e.g. "18°C, Clear").
  - styleNotes: Array of 2-3 practical styling suggestions (e.g. "Roll the sleeves slightly for a relaxed vibe", "Add a leather belt to match the loafers").
  - alternativeLookSuggestion: Detailed alternative combination using different items from user's wardrobe.
  - gapAnalysis: Any missing category disclosure or empty string.
  - score: Overall styling score (integer between 88 and 99).
  - scoreBreakdown: Object with { colorHarmony: number, occasionFit: number, weatherMatch: number, coherence: number }.

- Multiple Looks (generate 3 options when possible using user's wardrobe pieces):
  - LOOK 01: "SAFE & REFINED" (Timeless, foolproof harmony)
  - LOOK 02: "MODERN" (Contemporary proportions, trending textures)
  - LOOK 03: "STATEMENT" (High-impact focal point, bold pairing)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              outfitName: { type: Type.STRING },
              summary: { type: Type.STRING },
              pieces: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    itemId: { type: Type.STRING, nullable: true },
                    role: { type: Type.STRING },
                    suggestedDescription: { type: Type.STRING },
                    isOwned: { type: Type.BOOLEAN },
                  },
                  required: ['category', 'role', 'suggestedDescription', 'isOwned'],
                },
              },
              whyItWorks: { type: Type.STRING },
              bestFor: {
                type: Type.OBJECT,
                properties: {
                  occasion: { type: Type.STRING },
                  time: { type: Type.STRING },
                  weather: { type: Type.STRING },
                },
                required: ['occasion', 'time', 'weather'],
              },
              styleNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              alternativeLookSuggestion: { type: Type.STRING },
              gapAnalysis: { type: Type.STRING },
              score: { type: Type.INTEGER },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  colorHarmony: { type: Type.INTEGER },
                  occasionFit: { type: Type.INTEGER },
                  weatherMatch: { type: Type.INTEGER },
                  coherence: { type: Type.INTEGER },
                },
                required: ['colorHarmony', 'occasionFit', 'weatherMatch', 'coherence'],
              },
              looks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    lookType: { type: Type.STRING },
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    pieces: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          category: { type: Type.STRING },
                          itemId: { type: Type.STRING, nullable: true },
                          role: { type: Type.STRING },
                          suggestedDescription: { type: Type.STRING },
                          isOwned: { type: Type.BOOLEAN },
                        },
                        required: ['category', 'role', 'suggestedDescription', 'isOwned'],
                      },
                    },
                    whyItWorks: { type: Type.STRING },
                    bestFor: {
                      type: Type.OBJECT,
                      properties: {
                        occasion: { type: Type.STRING },
                        time: { type: Type.STRING },
                        weather: { type: Type.STRING },
                      },
                      required: ['occasion', 'time', 'weather'],
                    },
                    styleNotes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    score: { type: Type.INTEGER },
                    scoreBreakdown: {
                      type: Type.OBJECT,
                      properties: {
                        colorHarmony: { type: Type.INTEGER },
                        occasionFit: { type: Type.INTEGER },
                        weatherMatch: { type: Type.INTEGER },
                        coherence: { type: Type.INTEGER },
                      },
                      required: ['colorHarmony', 'occasionFit', 'weatherMatch', 'coherence'],
                    },
                  },
                  required: ['id', 'lookType', 'title', 'subtitle', 'pieces', 'whyItWorks', 'bestFor', 'styleNotes', 'score', 'scoreBreakdown'],
                },
              },
            },
            required: [
              'outfitName',
              'summary',
              'pieces',
              'whyItWorks',
              'bestFor',
              'styleNotes',
              'score',
              'scoreBreakdown',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      // Hydrate primary pieces with full item objects from user's wardrobe
      const hydratePieces = (pieceList: any[]) => {
        return (pieceList || []).map((p: any) => {
          const matchedItem = availableItems.find((w: any) => w.id === p.itemId);
          return {
            category: p.category,
            item: matchedItem || undefined,
            suggestedDescription: p.suggestedDescription || (matchedItem ? matchedItem.name : ''),
            role: p.role,
            isOwned: !!matchedItem,
          };
        });
      };

      const primaryPieces = hydratePieces(parsed.pieces);

      // Hydrate multiple looks
      const hydratedLooks = (parsed.looks || []).map((look: any) => ({
        ...look,
        pieces: hydratePieces(look.pieces),
      }));

      const result = {
        id: `ai_rec_${Date.now()}`,
        requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
        outfitName: parsed.outfitName || 'Smart Casual Dinner Look',
        summary: parsed.summary || 'A bespoke styling composition calibrated for your engagement.',
        pieces: primaryPieces,
        whyItWorks: parsed.whyItWorks || 'Harmonious color palette and balanced silhouette proportions.',
        weatherReasoning: `${temperatureCelsius}°C climate match: breathable layering calibrated for atmospheric comfort.`,
        occasionReasoning: `Tailored specifically for ${occasion} with ${dressCode} dress code.`,
        bestFor: parsed.bestFor || {
          occasion: occasion,
          time: time,
          weather: `${temperatureCelsius}°C, Clear`,
        },
        stylingTips: parsed.styleNotes || [
          'Roll the sleeves slightly for a relaxed vibe.',
          'Add a leather belt to match footwear tones.',
          'This look transitions seamlessly from daylight to evening.',
        ],
        suggestedAccessories: [
          'Minimalist dress watch',
          'Supple leather belt',
          'Matte silver cufflinks or sunglasses',
        ],
        alternativeLookSuggestion: parsed.alternativeLookSuggestion || 'Pair with neutral trousers and clean white sneakers for an understated alternative.',
        gapAnalysis: parsed.gapAnalysis || undefined,
        confidenceScore: parsed.score || 96,
        scoreBreakdown: parsed.scoreBreakdown || {
          colorHarmony: 98,
          occasionFit: 96,
          weatherMatch: 95,
          coherence: 97,
        },
        looks: hydratedLooks.length > 0 ? hydratedLooks : undefined,
        generatedAt: new Date().toISOString(),
      };

      // Record AI request telemetry for the user in database
      db.incrementAIRequestCount(userId, 'Outfit Synthesis', parsed.outfitName || 'Outfit Studio Generation');

      return res.json({ success: true, recommendation: result });
    } catch (_error: any) {
      markQuotaCooldown();
      
      const topItem = availableItems.find((i: any) => i.category === 'Tops') || availableItems[0];
      const bottomItem = availableItems.find((i: any) => i.category === 'Bottoms') || availableItems[1];
      const outerwearItem = availableItems.find((i: any) => i.category === 'Outerwear') || availableItems[2];
      const footwearItem = availableItems.find((i: any) => i.category === 'Footwear') || availableItems[3];

      const fallbackPieces = [
        {
          category: 'Tops',
          item: topItem,
          suggestedDescription: topItem ? topItem.name : 'Fine-gauge knit or crisp tailored button-down',
          role: 'Foundational silhouette piece establishing neckline and tonal palette.',
          isOwned: !!topItem,
        },
        {
          category: 'Bottoms',
          item: bottomItem,
          suggestedDescription: bottomItem ? bottomItem.name : 'Pleated straight-leg tailored trousers',
          role: 'Elongating base providing proportional balance and comfort.',
          isOwned: !!bottomItem,
        },
        {
          category: 'Outerwear',
          item: outerwearItem,
          suggestedDescription: outerwearItem ? outerwearItem.name : 'Structured tailored blazer or minimalist coat',
          role: 'Architectural framing layer tailored for atmospheric temperature.',
          isOwned: !!outerwearItem,
        },
        {
          category: 'Footwear',
          item: footwearItem,
          suggestedDescription: footwearItem ? footwearItem.name : 'Polished leather loafers or clean Chelsea boots',
          role: 'Grounding footwear completing the ensemble silhouette.',
          isOwned: !!footwearItem,
        },
      ];

      const fallbackRec = {
        id: `ai_rec_${Date.now()}`,
        requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
        outfitName: `Curated ${stylePreference || 'Smart Casual'} Look for ${occasion || 'Your Engagement'}`,
        summary: `A composed styling ensemble built around tonal harmony, tactile depth, and quiet luxury proportions.`,
        pieces: fallbackPieces,
        whyItWorks: `Harmonious color contrast between the upper silhouette and grounding trousers creates clean visual lines suitable for ${occasion}.`,
        weatherReasoning: `Calibrated for ${weatherDescription || 'mild conditions'}: comfortable modular layering.`,
        occasionReasoning: `Tailored specifically for ${occasion} with ${dressCode} dress code standard.`,
        bestFor: {
          occasion: occasion,
          time: time,
          weather: weatherDescription || `${temperatureCelsius}°C, Clear`,
        },
        stylingTips: [
          'Half-tuck the top slightly at the front to emphasize the waistline.',
          'Coordinate leather tones between footwear and accessories.',
          'Keep accents minimal and refined.'
        ],
        suggestedAccessories: [
          'Brushed metal dress watch',
          'Supple leather belt',
          'Classic sunglasses'
        ],
        alternativeLookSuggestion: 'Swap in dark trousers or a fine-knit sweater for an effortless tonal alternative.',
        confidenceScore: 95,
        scoreBreakdown: {
          colorHarmony: 97,
          occasionFit: 95,
          weatherMatch: 94,
          coherence: 96,
        },
        generatedAt: new Date().toISOString(),
      };

      db.incrementAIRequestCount(userId, 'Outfit Synthesis', fallbackRec.outfitName);

      return res.json({
        success: true,
        isQuotaFallback: true,
        recommendation: fallbackRec,
      });
    }
  });

  // ==========================================
  // 8B. AI WARDROBE AUTO-ORGANIZE BY COLOR & STYLE
  // ==========================================
  app.post('/api/gemini/organize-wardrobe', authMiddleware, async (req, res) => {
    const userId = req.user!.id;
    const userWardrobe = db.getWardrobe(userId);

    if (!userWardrobe || userWardrobe.length === 0) {
      return res.status(400).json({ error: 'Your wardrobe is empty. Please add items before auto-organizing.' });
    }

    try {
      const ai = getAIClient();

      const itemsSummary = userWardrobe.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        type: item.type || item.subcategory || 'Garment',
        color: item.color || 'Neutral',
        secondaryColor: item.secondaryColor || null,
        pattern: item.pattern || 'Solid',
        material: item.material || 'Fabric',
        style: item.style || 'Smart Casual',
        formality: item.formality || 'Smart Casual',
        fit: item.fit || 'Regular',
      }));

      const prompt = `You are PAURVI's Head of Haute Couture Wardrobe Curation & Aesthetic Color Theory.
Analyze this user's wardrobe inventory (${userWardrobe.length} pieces) and organize them into 3 to 6 cohesive, visually stunning aesthetic clusters based on harmonious color palettes, garment styles, and silhouette vibes.

User's Wardrobe Inventory:
${JSON.stringify(itemsSummary, null, 2)}

TASK REQUIREMENTS:
1. Create 3 to 6 distinct aesthetic cluster groupings.
2. Every item in the wardrobe MUST be assigned to exactly one most suitable cluster group based on its color and style harmony.
3. For each cluster group, provide:
   - id: unique string identifier (e.g. "cluster_monochrome", "cluster_warm_earth")
   - name: refined, luxurious curation title (e.g. "Monochrome & Slate Tailoring", "Warm Earth Tones & Cashmere Neutrals", "Indigo Denim & Weekend Casuals", "Luminous Alabaster & Minimal Essentials", "Jewel Tones & Evening Statement")
   - themeType: one of ['color', 'style', 'aesthetic_harmony']
   - primaryColorPalette: array of 2-4 primary hex codes or color names in this cluster (e.g. ["#0F172A", "#334155", "#E2E8F0"])
   - styleVibe: high-fashion style aesthetic descriptor (e.g. "Quiet Luxury Minimalist", "Warm Relaxed Elegance", "Contemporary Urban Sartorial")
   - itemIds: array of exact garment IDs from the inventory assigned to this cluster
   - aestheticDescription: 1-2 sentence description explaining the visual synergy of this color and style group
   - stylingTip: 1 actionable haute-couture styling guideline for wearing pieces from this group
4. Provide a color palette breakdown summary with approximate distribution.
5. Provide a style distribution breakdown.
6. Provide an overall capsule harmony score (integer between 88 and 99) and executive aesthetic summary.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveAestheticSummary: { type: Type.STRING },
              capsuleHarmonyScore: { type: Type.INTEGER },
              clusters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    themeType: { type: Type.STRING },
                    primaryColorPalette: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    styleVibe: { type: Type.STRING },
                    itemIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    aestheticDescription: { type: Type.STRING },
                    stylingTip: { type: Type.STRING },
                  },
                  required: ['id', 'name', 'themeType', 'primaryColorPalette', 'styleVibe', 'itemIds', 'aestheticDescription', 'stylingTip'],
                },
              },
              paletteBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    colorName: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    itemCount: { type: Type.INTEGER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['colorName', 'hex', 'itemCount', 'percentage'],
                },
              },
              styleDistribution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    styleName: { type: Type.STRING },
                    itemCount: { type: Type.INTEGER },
                    percentage: { type: Type.NUMBER },
                  },
                  required: ['styleName', 'itemCount', 'percentage'],
                },
              },
            },
            required: ['executiveAestheticSummary', 'capsuleHarmonyScore', 'clusters', 'paletteBreakdown', 'styleDistribution'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      
      // Ensure all items are accounted for in clusters
      const assignedItemIds = new Set<string>();
      (parsed.clusters || []).forEach((c: any) => {
        (c.itemIds || []).forEach((id: string) => assignedItemIds.add(id));
      });

      const unassignedItems = userWardrobe.filter((w: any) => !assignedItemIds.has(w.id));
      if (unassignedItems.length > 0 && parsed.clusters && parsed.clusters.length > 0) {
        // Append unassigned items to the first or most appropriate cluster
        parsed.clusters[0].itemIds.push(...unassignedItems.map((w: any) => w.id));
      }

      const result = {
        organizedAt: new Date().toISOString(),
        ...parsed,
      };

      db.incrementAIRequestCount(userId, 'Wardrobe Auto-Organize', `${parsed.clusters?.length || 0} Aesthetic Clusters`);

      return res.json({ success: true, organization: result });
    } catch (_err) {
      // Deterministic color & style clustering fallback
      const colorMap: Record<string, string[]> = {
        'Neutrals & Monochromes': [],
        'Warm Earth & Amber Tones': [],
        'Cool Blues & Denim': [],
        'Rich Jewels & Evening Accents': [],
      };

      userWardrobe.forEach((item: any) => {
        const c = (item.color || '').toLowerCase();
        if (c.includes('black') || c.includes('charcoal') || c.includes('white') || c.includes('grey') || c.includes('gray') || c.includes('silver')) {
          colorMap['Neutrals & Monochromes'].push(item.id);
        } else if (c.includes('beige') || c.includes('camel') || c.includes('brown') || c.includes('khaki') || c.includes('terracotta') || c.includes('gold')) {
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
            id: `cluster_fallback_${idx}`,
            name,
            themeType: 'color' as const,
            primaryColorPalette: palette,
            styleVibe,
            itemIds: ids,
            aestheticDescription: `Curated grouping of ${ids.length} pieces sharing tonal balance and compatible silhouette textures.`,
            stylingTip: tip,
          };
        });

      const fallbackResult = {
        organizedAt: new Date().toISOString(),
        executiveAestheticSummary: `Your wardrobe showcases strong capsule synergy with high-density ${clusters.length} tonal categories that streamline daily styling.`,
        capsuleHarmonyScore: 94,
        clusters,
        paletteBreakdown: [
          { colorName: 'Neutral & Dark Monochromes', hex: '#0F172A', itemCount: Math.ceil(userWardrobe.length * 0.45), percentage: 45 },
          { colorName: 'Indigo & Blues', hex: '#1E40AF', itemCount: Math.ceil(userWardrobe.length * 0.3), percentage: 30 },
          { colorName: 'Warm Earth & Accents', hex: '#B45309', itemCount: Math.max(1, userWardrobe.length - Math.ceil(userWardrobe.length * 0.75)), percentage: 25 },
        ],
        styleDistribution: [
          { styleName: 'Smart Casual', itemCount: Math.ceil(userWardrobe.length * 0.5), percentage: 50 },
          { styleName: 'Tailored Minimal', itemCount: Math.ceil(userWardrobe.length * 0.3), percentage: 30 },
          { styleName: 'Relaxed Weekend', itemCount: Math.max(1, userWardrobe.length - Math.ceil(userWardrobe.length * 0.8)), percentage: 20 },
        ],
      };

      db.incrementAIRequestCount(userId, 'Wardrobe Auto-Organize', `${clusters.length} Aesthetic Clusters (Deterministic)`);

      return res.json({
        success: true,
        isQuotaFallback: true,
        organization: fallbackResult,
      });
    }
  });


  // ==========================================
  // 9. CONVERSATIONAL CONCIERGE CHAT
  // ==========================================
  app.post('/api/gemini/chat', authMiddleware, async (req, res) => {
    try {
      const { message, conversationHistory = [], weather, location, time, date } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      const userId = req.user!.id;
      const userWardrobe = db.getWardrobe(userId);
      const userOutfits = db.getOutfits(userId);

      const ai = getAIClient();

      const systemPrompt = `You are PN Outfit Suggester — an elite personal fashion stylist and wardrobe archivist for client ${req.user!.name}.
You speak with quiet luxury sophistication: authoritative, discerning, warm, articulate, and precise in tailoring terminology.

You support TWO MODES. Intelligently determine which mode to use:

MODE 1: GENERAL STYLE ADVISOR
Answer general fashion/styling questions using your vast styling knowledge. (e.g., "What colour shirt goes with navy trousers?", "How do I style Chelsea boots?", "What should I wear to a wedding?")

MODE 2: PERSONAL WARDROBE STYLIST & OUTFIT GENERATOR
Use the user's actual uploaded wardrobe to make personalized recommendations and handle interactive outfit refinement.

ENVIRONMENTAL CONTEXT (Use when styling depends on weather/location/time):
Location: ${location || 'Unknown'}
Weather: ${weather || 'Unknown'}
Time: ${time || 'Unknown'}
Date: ${date || 'Unknown'}

CLIENT WARDROBE CONTEXT:
${
  userWardrobe.length === 0
    ? 'Wardrobe is currently empty (0 items). Encourage the client to catalogue their pieces by uploading photos or adding garments. When asked for advice, suggest timeless capsule essentials.'
    : `Total catalogued pieces: ${userWardrobe.length}. Available Items: ` +
      userWardrobe.map((i) => `"${i.name}" (${i.category}, ${i.color}, ${i.fit || 'Tailored'})`).join('; ')
}

STRICT INSTRUCTIONS FOR WARDROBE-BASED RECOMMENDATIONS (MODE 2):
1. ACCURACY: ONLY recommend items that actually exist in the client's wardrobe when constructing specific outfits. Never invent shirts, trousers, shoes, outerwear, or accessories.
2. MISSING ITEMS: If the user doesn't own something necessary, say so clearly (e.g., "You don't currently have a formal blazer in your wardrobe...").
3. NO FAKE CERTAINTY: If you cannot determine something, say you are uncertain. Do not pretend an item exists if it doesn't.
4. STRUCTURED FORMAT: When proposing an outfit recommendation from the wardrobe, you MUST use EXACTLY this clean structured visual format:

LOOK NAME: [Name of the look]

TOP
[Exact name of item from wardrobe]

BOTTOM
[Exact name of item from wardrobe]

FOOTWEAR
[Exact name of item from wardrobe]

OUTERWEAR
[Exact name of item from wardrobe, or "None needed" / "Omit for warm climate"]

ACCESSORIES
[Exact name of item from wardrobe if appropriate, or "Minimalist accents"]

WHY IT WORKS
[Clear explanation of color harmony, silhouette balance, and fabric texture]

BEST FOR
[Occasion, time of day, and weather suitability]

STYLE TIP
[Specific sartorial advice on cuffing, tucking, or layering]

ALTERNATIVE
[Second configuration or piece substitution from available wardrobe]

FOLLOW-UP REFINEMENT REQUESTS:
Maintain complete continuity across conversation turns. When the user sends follow-up requests such as:
- "Make it less formal / more formal"
- "I don't want to wear jeans" / "Swap the trousers for something darker"
- "Use my black boots instead"
- "Add a layer for cooler evening weather"
- "Give me another alternative"
Directly reference the previously proposed outfit from the conversation history, adjust the specified items while keeping the harmonious pieces intact, and re-output the refined outfit using the exact structured format above.

GENERAL RULES:
- Do NOT use repetitive generic phrases like "This outfit is perfect for you." Explain WHY it works.
- If a question requires missing information (such as destination occasion), ask a brief, focused follow-up. Do not ask for weather/location/time if already provided in the context.`;

      const contents = [];
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: `Understood. I am PN Outfit Suggester, ready to advise ${req.user!.name} with precise context awareness, strict wardrobe grounding, and interactive refinement.` }] });

      // Pass up to 20 conversation turns to maintain a comprehensive context buffer
      for (const msg of conversationHistory.slice(-20)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
      });

      db.incrementAIRequestCount(userId, 'Concierge Conversation', message.substring(0, 40));

      return res.json({
        reply: response.text || 'I have analyzed your request and look forward to refining your style.',
      });
    } catch (_error: any) {
      markQuotaCooldown();
      
      const userId = req.user!.id;
      const userWardrobe = db.getWardrobe(userId);
      const top = userWardrobe.find((i: any) => i.category === 'Tops');
      const bottom = userWardrobe.find((i: any) => i.category === 'Bottoms');
      const footwear = userWardrobe.find((i: any) => i.category === 'Footwear');
      const outerwear = userWardrobe.find((i: any) => i.category === 'Outerwear');

      let replyText = '';
      if (userWardrobe.length > 0 && (top || bottom)) {
        replyText = `LOOK NAME: The Refined Tailored Capsule\n\nTOP\n${top ? top.name : 'Tailored Cotton Shirt'}\n\nBOTTOM\n${bottom ? bottom.name : 'Pleated Trousers'}\n\nFOOTWEAR\n${footwear ? footwear.name : 'Classic Leather Loafers'}\n\nOUTERWEAR\n${outerwear ? outerwear.name : 'Omit for current temperature'}\n\nACCESSORIES\nMinimalist leather watch and silver accents\n\nWHY IT WORKS\nThis pairing balances crisp linear proportions with comfortable drape, creating an effortless transition from day to evening.\n\nBEST FOR\nSmart Casual engagements, dinner, and professional settings.\n\nSTYLE TIP\nTuck the shirt cleanly into the waistband to accentuate the rise of the trousers.\n\nALTERNATIVE\nPair with neutral footwear or swap in a fine-gauge sweater for cooler temperatures.`;
      } else {
        replyText = `I have received your styling request. For timeless sartorial elegance, pairing neutral earthy tones (espresso, navy, charcoal, and ecru) with clean silhouettes creates an effortlessly polished look. Once you catalogue items in your PAURVI digital wardrobe, I will assemble tailored outfit formulas using your exact pieces.`;
      }

      db.incrementAIRequestCount(userId, 'Concierge Conversation', req.body?.message?.substring(0, 40) || 'Query');

      return res.json({
        reply: replyText,
        isQuotaFallback: true,
      });
    }
  });

  // ==========================================
  // 10. GOOGLE SEARCH-GROUNDED FASHION TRENDS REPORT
  // ==========================================
  const trendCache = new Map<string, { report: any; timestamp: number }>();
  const TREND_CACHE_TTL = 1000 * 60 * 60; // 60 minutes cache
  let quotaCooldownUntil = 0;

  function markQuotaCooldown() {
    quotaCooldownUntil = Date.now() + 1000 * 60 * 5; // 5-minute quiet cooldown
  }

  function isQuotaCoolingDown(): boolean {
    return Date.now() < quotaCooldownUntil;
  }

  function getSeasonalCuratedTrends(season: string) {
    const isSpringSummer = /spring|summer/i.test(season);
    const isResort = /resort|cruise/i.test(season);

    if (isSpringSummer) {
      return {
        season: season || "Spring / Summer 2026",
        lastUpdated: new Date().toISOString(),
        headlineSummary: "Fluid tailoring in breathable linen and crinkled silk, softened sorbet accents, and deconstructed blazers redefine warm-weather luxury with breezy lightness.",
        keyTakeaways: [
          "Relaxed unstructured tailoring in lightweight natural silks and open-weave linens",
          "Sun-bleached limoncello, pale pistache, and seafoam pastels grounded by crisp ecru",
          "Woven raffia carryalls and ergonomic minimalist leather slides"
        ],
        searchQueries: [
          `Spring Summer 2026 fashion runway trends Vogue GQ`,
          `Warm weather luxury tailoring color trends 2026`,
          `Ready to wear spring summer fashion week reports`
        ],
        sources: [
          { title: "Vogue: Spring/Summer Runway Analysis & Key Trends", uri: "https://www.vogue.com/fashion/trends" },
          { title: "GQ: Warm Weather Tailoring & Modern Menswear", uri: "https://www.gq.com/style" },
          { title: "WWD: Spring Ready-to-Wear Collection Highlights", uri: "https://wwd.com/fashion-news/fashion-features/" },
          { title: "Harper's Bazaar: Essential Summer Silhouettes", uri: "https://www.harpersbazaar.com/fashion/trends/" }
        ],
        trends: [
          {
            id: "trend_ss_1",
            title: "Deconstructed Linen & Silk Suiting",
            category: "Key Silhouettes",
            season: season || "Spring / Summer 2026",
            headline: "Unlined, soft-shouldered tailoring in open-weave breathable fabrics.",
            summary: "Runways across Milan embraced unlined blazers with draped lapels and fluid, wide-leg trousers that keep tailoring crisp yet entirely effortless in warmer climates.",
            keyElements: [
              "Unlined interior construction for maximum airflow",
              "Subtle slub texture in pure Italian linen and silk blends",
              "Soft natural shoulders without stiff padding"
            ],
            colorPalette: [
              { name: "Crisp Ecru", hex: "#F5F2EB" },
              { name: "Warm Sand", hex: "#D6C7B2" },
              { name: "Pale Sage", hex: "#9EADA0" }
            ],
            howToStyle: "Wear an unlined linen jacket over a fine supima cotton tank or open-collar knit polo with pleated linen trousers.",
            matchingCategories: ["Outerwear", "Tops", "Bottoms"],
            tag: "Runway Focus",
            popularityScore: 97
          },
          {
            id: "trend_ss_2",
            title: "Sorbet & Citron Sun-Bleached Palettes",
            category: "Color Palettes",
            season: season || "Spring / Summer 2026",
            headline: "Limoncello yellow, washed pistache, and dusty sky blue anchor warm-weather palettes.",
            summary: "Designers infused breezy collections with optimistic, soft pastels that blend smoothly with warm stone neutrals and crisp optic whites.",
            keyElements: [
              "Tonal pastel pairing with matte ivory and bone",
              "Garment-dyed washed finishes for lived-in character",
              "Translucent silk georgette in sunny hues"
            ],
            colorPalette: [
              { name: "Limoncello", hex: "#FFF275" },
              { name: "Pistachio Gelato", hex: "#A8D5BA" },
              { name: "Dusty Azure", hex: "#7EA8BE" }
            ],
            howToStyle: "Incorporate a pale citron silk shirt or pastel knit tucked into bone-white trousers with neutral suede footwear.",
            matchingCategories: ["Tops", "Dresses", "Accessories"],
            tag: "Color Trend",
            popularityScore: 94
          },
          {
            id: "trend_ss_3",
            title: "Textural Open Knits & Crochet Gauze",
            category: "Fabrics & Textures",
            season: season || "Spring / Summer 2026",
            headline: "Tactile mesh knits and airy open-weave cotton providing dimensional breathability.",
            summary: "Textured summer knitwear took center stage, providing a three-dimensional visual rhythm while remaining exceptionally light.",
            keyElements: [
              "Open cellular knit structures",
              "Mercerized cotton with a subtle natural sheen",
              "Contrast ribbing along collar and hem"
            ],
            colorPalette: [
              { name: "Raw Cotton", hex: "#EBE3D5" },
              { name: "Deep Terracotta", hex: "#C86D51" },
              { name: "Espresso", hex: "#382923" }
            ],
            howToStyle: "Layer an open-knit short-sleeve polo over an airy ribbed tank and tailored Bermuda shorts or lightweight chinos.",
            matchingCategories: ["Tops", "Outerwear"],
            tag: "Tactile Detail",
            popularityScore: 93
          },
          {
            id: "trend_ss_4",
            title: "Sculpted Woven Slides & Fisherman Sandals",
            category: "Accessories & Footwear",
            season: season || "Spring / Summer 2026",
            headline: "Polished calfskin fisherman sandals and woven leather slides grounding summer ensembles.",
            summary: "Footwear balances artisanal craftsmanship and architectural ergonomics with clean cage straps and beveled leather soles.",
            keyElements: [
              "Interlocking smooth calfskin straps",
              "Brushed metal micro-buckles",
              "Ergonomic molded footbed in tonal leather"
            ],
            colorPalette: [
              { name: "Burnished Tan", hex: "#A76D38" },
              { name: "Rich Cognac", hex: "#7B3F00" },
              { name: "Midnight Noir", hex: "#18181B" }
            ],
            howToStyle: "Pair woven leather slides with cropped trousers or linen shorts for an effortless Mediterranean resort vibe.",
            matchingCategories: ["Footwear", "Accessories"],
            tag: "Footwear Essential",
            popularityScore: 91
          },
          {
            id: "trend_ss_5",
            title: "Slouchy Raffia & Canvas Shoppers",
            category: "Accessories & Footwear",
            season: season || "Spring / Summer 2026",
            headline: "Oversized natural fiber totes with rich leather trim and clean geometric lines.",
            summary: "Bags focus on organic tactile luxury, blending durable Madagascar raffia with bridle leather handles and brass studs.",
            keyElements: [
              "Hand-braided natural raffia weaves",
              "Cognac saddle-leather top handles",
              "Spacious, unconstructed volume"
            ],
            colorPalette: [
              { name: "Natural Raffia", hex: "#D8C3A5" },
              { name: "Saddle Tan", hex: "#8E5B3E" },
              { name: "Chalk White", hex: "#F3F4F6" }
            ],
            howToStyle: "Carry a large raffia shopper under the arm with monochrome linen tailoring for a balanced contrast of textures.",
            matchingCategories: ["Bags", "Accessories"],
            tag: "Bags Trend",
            popularityScore: 90
          },
          {
            id: "trend_ss_6",
            title: "Pleated Linen Bermudas & Wide Shorts",
            category: "Key Silhouettes",
            season: season || "Spring / Summer 2026",
            headline: "Tailored knee-length shorts with sharp front pleats and refined dress-trouser details.",
            summary: "Shorts step into formal territory with trouser-like waistbands, double pleats, and extended hems that hit just at the knee.",
            keyElements: [
              "Double forward pleats and extended tab closure",
              "Generous leg opening with clean tailored cuffs",
              "Heavyweight Irish linen drape"
            ],
            colorPalette: [
              { name: "Navy Serge", hex: "#1E293B" },
              { name: "Stone Khaki", hex: "#C5BAAF" },
              { name: "Olive Drape", hex: "#556B2F" }
            ],
            howToStyle: "Pair with an oversized poplin button-down shirt tucked in at the front, styled with leather loafers.",
            matchingCategories: ["Bottoms"],
            tag: "Silhouette Staple",
            popularityScore: 92
          }
        ]
      };
    }

    if (isResort) {
      return {
        season: season || "Resort & High Summer",
        lastUpdated: new Date().toISOString(),
        headlineSummary: "The resort season exudes barefoot opulence through billowing silk habotai, sunset ombré gradients, and artisanal woven embellishments designed for effortless global travel.",
        keyTakeaways: [
          "Draped kaftan silhouettes, flowing maxi dresses, and fluid poplin matching sets",
          "Rich sunset terracotta, golden saffron, and deep cerulean blue harmonies",
          "Artisanal macramé cords, polished horn buttons, and sculpted statement cuffs"
        ],
        searchQueries: [
          `Resort Cruise fashion runway trends Vogue GQ`,
          `Luxury resortwear vacation capsule trends 2026`,
          `High summer designer collections Harper's Bazaar`
        ],
        sources: [
          { title: "Vogue: Resort & Cruise Runway Collections", uri: "https://www.vogue.com/fashion/trends" },
          { title: "WWD: Luxury Resortwear Market Forecast", uri: "https://wwd.com/fashion-news/fashion-features/" },
          { title: "Harper's Bazaar: The Ultimate Vacation Capsule Edit", uri: "https://www.harpersbazaar.com/fashion/trends/" },
          { title: "GQ: Riviera & Resort Style Guide", uri: "https://www.gq.com/style" }
        ],
        trends: [
          {
            id: "trend_resort_1",
            title: "Sunset Ombré & Saffron Silk Separates",
            category: "Color Palettes",
            season: season || "Resort & High Summer",
            headline: "Graduated warm sunset washes and rich golden spice tones.",
            summary: "Cruise collections captured the warmth of Mediterranean evenings with flowing silks dyed in harmonious gradients of saffron, peach, and burnt terracotta.",
            keyElements: [
              "Fluid silk twill with subtle luminous reflection",
              "Dip-dyed ombré transitions",
              "Minimalist clean stitching"
            ],
            colorPalette: [
              { name: "Golden Saffron", hex: "#F4A261" },
              { name: "Burnt Terracotta", hex: "#E76F51" },
              { name: "Rose Sunset", hex: "#E9967A" }
            ],
            howToStyle: "Wear a fluid silk button-down over ecru wide-leg linen trousers, unbuttoned at the neckline with gold jewelry.",
            matchingCategories: ["Tops", "Dresses", "Accessories"],
            tag: "Resort Focus",
            popularityScore: 96
          },
          {
            id: "trend_resort_2",
            title: "Draped Kaftans & Relaxed Camp Shirts",
            category: "Key Silhouettes",
            season: season || "Resort & High Summer",
            headline: "Generous airy cuts with open convertible collars and breezy side slits.",
            summary: "Effortless resort silhouettes that transition from private coastal cabanas to evening terrace dinners with pure sartorial nonchalance.",
            keyElements: [
              "Wide Cuban/camp collars with relaxed drape",
              "Deep side-seam vents for movement",
              "Mother-of-pearl buttons"
            ],
            colorPalette: [
              { name: "Pure Chalk", hex: "#FAFAF9" },
              { name: "Aegean Azure", hex: "#2A9D8F" },
              { name: "Warm Almond", hex: "#D4A373" }
            ],
            howToStyle: "Pair a boxy camp-collar shirt with fluid drawstring trousers and leather sandals for a relaxed evening look.",
            matchingCategories: ["Tops", "Bottoms", "Dresses"],
            tag: "Vacation Core",
            popularityScore: 94
          },
          {
            id: "trend_resort_3",
            title: "Modernist Sculpted Metals & Organic Horn",
            category: "Accessories & Footwear",
            season: season || "Resort & High Summer",
            headline: "Chunky molten gold cuffs, hammered silver, and polished natural horn accents.",
            summary: "Jewelry draws inspiration from brutalist coastal architecture and natural beach glass, delivering sculptural focal points.",
            keyElements: [
              "Hammered high-polish 18k gold finishes",
              "Organic asymmetrical silhouettes",
              "Heavyweight feel with ergonomic balance"
            ],
            colorPalette: [
              { name: "Brushed 18k Gold", hex: "#E5C158" },
              { name: "Molten Silver", hex: "#CBD5E1" },
              { name: "Dark Buffalo Horn", hex: "#3E2723" }
            ],
            howToStyle: "Wear a single oversized gold cuff on the bare forearm with a minimalist monochrome linen dress or shirt.",
            matchingCategories: ["Jewelry", "Accessories"],
            tag: "Jewelry Statement",
            popularityScore: 92
          },
          {
            id: "trend_resort_4",
            title: "Artisanal Crochet Gauze & Macramé Accents",
            category: "Fabrics & Textures",
            season: season || "Resort & High Summer",
            headline: "Hand-knotted cords and geometric openwork textures.",
            summary: "Artisanal techniques lend tactile soul to modern vacation dressing, creating airy textures that layer over clean swim and evening base pieces.",
            keyElements: [
              "Hand-crafted open gauge macramé fringe",
              "Organic unbleached cotton yarns",
              "Subtle wood and shell beading details"
            ],
            colorPalette: [
              { name: "Unbleached Cotton", hex: "#F7F4EB" },
              { name: "Deep Indigo", hex: "#1D3557" },
              { name: "Clay Brown", hex: "#8B5E3C" }
            ],
            howToStyle: "Layer a crochet vest or gauze overshirt over a simple silk slip dress or tailored trousers.",
            matchingCategories: ["Tops", "Outerwear", "Accessories"],
            tag: "Tactile Resort",
            popularityScore: 89
          }
        ]
      };
    }

    // Default: Autumn / Winter / Current Season
    return {
      season: season || "Autumn / Winter 2026",
      lastUpdated: new Date().toISOString(),
      headlineSummary: "The season pivots toward architectural tailoring, tactile earthy richness, and effortless drape, defined by quiet luxury subtleties and elevated utilitarian proportions.",
      keyTakeaways: [
        "Architectural outerwear with hourglass cinching and strong structured shoulders",
        "Rich espresso, oxblood, and warm terracotta replacing monochrome black",
        "Wide-leg puddle trousers paired with sharply pointed-toe footwear"
      ],
      searchQueries: [
        `Autumn Winter 2026 fashion runway trends Vogue GQ`,
        `Key fashion color palettes and silhouettes 2026`,
        `Ready to wear trend report WWD Harper's Bazaar`
      ],
      sources: [
        { title: "Vogue: The Top Seasonal Runway & Style Trends", uri: "https://www.vogue.com/fashion/trends" },
        { title: "GQ: Essential Menswear & Tailoring Directions", uri: "https://www.gq.com/style" },
        { title: "WWD: Ready-to-Wear Fashion Week Analysis", uri: "https://wwd.com/fashion-news/fashion-features/" },
        { title: "Harper's Bazaar: The Defining Silhouettes & Colors", uri: "https://www.harpersbazaar.com/fashion/trends/" }
      ],
      trends: [
        {
          id: "trend_1",
          title: "Architectural Tailoring & Hourglass Coats",
          category: "Key Silhouettes",
          season: season || "Autumn / Winter 2026",
          headline: "Strong structured shoulders balanced by sculpted waists and double-breasted closures.",
          summary: "Runways across Milan and Paris emphasized powerful, statuesque outerwear that reclaims the authority of classic tailoring without feeling rigid. Think double-faced wool, extended lapels, and sharp waist cinching.",
          keyElements: [
            "Structured shoulder pads with clean linear drape",
            "Double-breasted fastening with horn or matte metal buttons",
            "Floor-grazing hemline with deep center vent"
          ],
          colorPalette: [
            { name: "Charcoal Slate", hex: "#2E3842" },
            { name: "Deep Camel", hex: "#B8860B" },
            { name: "Obsidian", hex: "#1A1D20" }
          ],
          howToStyle: "Pair an oversized tailored coat with slim-cut knitwear and straight-leg trousers to let the outerwear silhouette remain the commanding focal point.",
          matchingCategories: ["Outerwear", "Tops", "Bottoms"],
          tag: "Runway Focus",
          popularityScore: 98
        },
        {
          id: "trend_2",
          title: "Espresso & Oxblood Monochromatic Layers",
          category: "Color Palettes",
          season: season || "Autumn / Winter 2026",
          headline: "Deep chocolate brown, rich espresso, and dark burgundy surpass traditional black.",
          summary: "Designers shifted away from stark black in favor of deep roasted coffee tones, bitter chocolate leather, and wine-tinted burgundy, creating warm, rich textural depth in monochrome styling.",
          keyElements: [
            "Tonal layering across varying fabric textures",
            "Supple calfskin in burnished dark cognac and espresso",
            "Burgundy knitwear anchoring neutral outerwear"
          ],
          colorPalette: [
            { name: "Espresso Brown", hex: "#3B2219" },
            { name: "Oxblood Burgundy", hex: "#581825" },
            { name: "Warm Almond", hex: "#D2B48C" }
          ],
          howToStyle: "Wear a dark brown wool sweater with camel or dark chocolate trousers, adding oxblood leather loafers or boots for a refined tonal contrast.",
          matchingCategories: ["Tops", "Bottoms", "Footwear", "Outerwear"],
          tag: "Color Trend",
          popularityScore: 95
        },
        {
          id: "trend_3",
          title: "Tactile Luxury: Brushed Cashmere & Raw Denim",
          category: "Fabrics & Textures",
          season: season || "Autumn / Winter 2026",
          headline: "The tension between rugged unwashed denim and ultra-soft fine gauge knitwear.",
          summary: "A standout styling formula pairing stiff, deep indigo Japanese selvedge denim with cloud-soft brushed mohair or high-gauge cashmere turtlenecks, striking an effortless balance between casual and opulent.",
          keyElements: [
            "Clean dark-rinse selvedge denim with no distressing",
            "Chunky ribbed collar and cuffs",
            "Minimalist hardware and contrast stitching"
          ],
          colorPalette: [
            { name: "Raw Indigo", hex: "#1F2937" },
            { name: "Oatmeal Heather", hex: "#E5E0D8" },
            { name: "Terracotta", hex: "#C25E3E" }
          ],
          howToStyle: "Tuck a fine knit into high-rise raw denim jeans and layer with an unbuttoned denim overshirt or lightweight trench.",
          matchingCategories: ["Tops", "Bottoms", "Outerwear"],
          tag: "Tactile Contrast",
          popularityScore: 92
        },
        {
          id: "trend_4",
          title: "Sleek Elongated Point-Toe & Chelsea Hybrid",
          category: "Accessories & Footwear",
          season: season || "Autumn / Winter 2026",
          headline: "Sharp angular toes and slim shaft Chelsea boots grounding fluid trousers.",
          summary: "Footwear takes an architectural turn with elongated chiselled or pointed toes that peek out effortlessly beneath wide-leg pants and maxi outerwear.",
          keyElements: [
            "Slightly chiseled almond or pointed toe profile",
            "Beveled block heel (3-4 cm)",
            "Polished box-calf leather with high-shine luster"
          ],
          colorPalette: [
            { name: "Patent Black", hex: "#111827" },
            { name: "Burnished Cherry", hex: "#4A0E17" },
            { name: "Dark Taupe", hex: "#4B443B" }
          ],
          howToStyle: "Let fluid, wide-leg trousers drape over the boot with just the clean, pointed toe exposed for a continuous elongating leg line.",
          matchingCategories: ["Footwear", "Accessories"],
          tag: "Footwear Statement",
          popularityScore: 91
        },
        {
          id: "trend_5",
          title: "Fluid Pleated Trousers with Puddle Drapes",
          category: "Key Silhouettes",
          season: season || "Autumn / Winter 2026",
          headline: "Relaxed high-waisted tailoring with generous leg volume and natural break.",
          summary: "Rigid skinny cuts continue their retreat as designers double down on voluminous, fluid double-pleat trousers that move gracefully with every step.",
          keyElements: [
            "Double forward pleats for room through the hips",
            "High natural waistline with internal tab closures",
            "Extended leg length with a gentle puddle over footwear"
          ],
          colorPalette: [
            { name: "Heather Slate", hex: "#64748B" },
            { name: "Ecru Wool", hex: "#F1EBE1" },
            { name: "Deep Navy", hex: "#0F172A" }
          ],
          howToStyle: "Pair with a cropped jacket or firmly tucked-in shirt to highlight the high-rise silhouette and accentuate waist proportions.",
          matchingCategories: ["Bottoms"],
          tag: "Silhouette Staple",
          popularityScore: 96
        },
        {
          id: "trend_6",
          title: "Subtle Sculptural Metals & Suede Totes",
          category: "Accessories & Footwear",
          season: season || "Autumn / Winter 2026",
          headline: "Brushed matte hardware and oversized slouchy suede carryalls.",
          summary: "Accessories emphasize sensory materials: unlined velvety suede totes in warm tobacco hues paired with modernist, organic curved jewelry in brushed brass and chrome.",
          keyElements: [
            "Supple unstructured suede shoulder bags",
            "Brushed matte gold and sculpted silver jewelry",
            "Clean buckle-less belts with tab closures"
          ],
          colorPalette: [
            { name: "Tobacco Suede", hex: "#8B5A2B" },
            { name: "Brushed Gold", hex: "#D4AF37" },
            { name: "Olive Moss", hex: "#4A5D4E" }
          ],
          howToStyle: "Carry a large suede tote in the crook of your arm or tucked under the shoulder to introduce organic texture to structured coats.",
          matchingCategories: ["Bags", "Accessories", "Jewelry"],
          tag: "Accessories Essential",
          popularityScore: 89
        }
      ]
    };
  }

  app.all('/api/gemini/fashion-trends', async (req: Request, res: Response) => {
    const season = req.body?.season || req.query?.season || 'Current Season';
    const category = req.body?.category || req.query?.category || 'All';
    const forceRefresh = req.body?.forceRefresh === true || req.query?.forceRefresh === 'true';

    const cacheKey = `${season}_${category}`.toLowerCase();
    const cached = trendCache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < TREND_CACHE_TTL) {
      return res.json({
        success: true,
        cached: true,
        report: cached.report,
      });
    }

    // If quota is currently in cooldown, serve curated editorial report immediately
    if (isQuotaCoolingDown()) {
      const fallbackReport = getSeasonalCuratedTrends(season);
      return res.json({
        success: true,
        isQuotaFallback: true,
        report: fallbackReport,
      });
    }

    try {
      const ai = getAIClient();

      const searchQuery = `Latest fashion runway and ready-to-wear seasonal trends ${season} Vogue GQ Harper's Bazaar WWD key silhouettes color palettes styling`;

      const prompt = `You are PAURVI Atelier's Global Haute Couture Director & Fashion Trend Forecaster.
Perform a live search on current seasonal fashion trends (${season}) from global fashion capitals, runways (Milan, Paris, London, New York), top fashion journals (Vogue, GQ, Harper's Bazaar, Business of Fashion, WWD, Elle, Highsnobiety), and contemporary high-end street style.

Search specifically for:
"${searchQuery}"

Provide an authoritative, editorial analysis of the top seasonal fashion movements. Return your response formatted strictly as a single, valid JSON object enclosed in a \`\`\`json ... \`\`\` code block with EXACTLY this structure:

\`\`\`json
{
  "season": "${season}",
  "headlineSummary": "A concise 2-sentence editorial synthesis of the overarching seasonal mood, silhouette shifts, and aesthetic direction.",
  "keyTakeaways": [
    "Key takeaway 1 (e.g. Sculpted tailoring and relaxed shoulder pads)",
    "Key takeaway 2 (e.g. Earthy tonal palettes and espresso hues)",
    "Key takeaway 3 (e.g. Fluid puddle trousers with pointed boots)"
  ],
  "trends": [
    {
      "id": "trend_1",
      "title": "Editorial Trend Title (e.g. Architectural Hourglass Tailoring)",
      "category": "One of: Key Silhouettes, Color Palettes, Fabrics & Textures, Accessories & Footwear, Occasion & Vibe, Trending Now",
      "season": "${season}",
      "headline": "Punchy 1-line summary of this specific trend",
      "summary": "2-3 sentences detailing how this trend appeared on recent runways and why it is defining modern dressing.",
      "keyElements": [
        "Signature detail 1",
        "Signature detail 2",
        "Signature detail 3"
      ],
      "colorPalette": [
        { "name": "Color Name (e.g. Espresso)", "hex": "#3B2219" },
        { "name": "Color Name (e.g. Charcoal Slate)", "hex": "#2E3842" },
        { "name": "Color Name (e.g. Deep Ochre)", "hex": "#CC7A00" }
      ],
      "howToStyle": "Practical, elegant styling advice on how an individual can style this trend using pieces from their personal wardrobe.",
      "matchingCategories": ["Outerwear", "Tops", "Bottoms"],
      "tag": "e.g. Runway Focus, Quiet Luxury, Essential Core, Footwear Statement",
      "popularityScore": 96
    }
  ]
}
\`\`\`

Generate 6 high-fashion trends covering diverse categories (Key Silhouettes, Color Palettes, Fabrics & Textures, Accessories & Footwear, Occasion & Vibe). Ensure hex colors match high-fashion palettes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const rawText = response.text || '';
      
      // Extract JSON from markdown or raw text
      let parsedReport: any = null;
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsedReport = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.warn('Failed to parse JSON directly, cleaning text:', e);
        }
      }

      if (!parsedReport && rawText.trim().startsWith('{')) {
        try {
          parsedReport = JSON.parse(rawText);
        } catch (e) {
          console.error('JSON parse fallback failed:', e);
        }
      }

      // Extract Google Search grounding citations
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      const extractedSources: { title: string; uri: string }[] = [];
      for (const chunk of groundingChunks) {
        if ((chunk as any)?.web?.uri) {
          const uri = (chunk as any).web.uri;
          const title = (chunk as any).web.title || 'Fashion Reference Source';
          if (!extractedSources.some((s) => s.uri === uri)) {
            extractedSources.push({ title, uri });
          }
        }
      }

      const defaultTrendsData = getSeasonalCuratedTrends(season);

      if (extractedSources.length === 0) {
        extractedSources.push(...defaultTrendsData.sources);
      }

      const finalReport = {
        season: parsedReport?.season || defaultTrendsData.season,
        lastUpdated: new Date().toISOString(),
        headlineSummary: parsedReport?.headlineSummary || defaultTrendsData.headlineSummary,
        keyTakeaways: parsedReport?.keyTakeaways || defaultTrendsData.keyTakeaways,
        trends: (parsedReport?.trends && Array.isArray(parsedReport.trends) && parsedReport.trends.length > 0)
          ? parsedReport.trends.map((t: any, index: number) => ({
              id: t.id || `trend_${index + 1}`,
              title: t.title || 'Curated Runway Trend',
              category: t.category || 'Trending Now',
              season: t.season || season,
              headline: t.headline || 'Elevated styling direction',
              summary: t.summary || 'A defining seasonal movement celebrating refined craftsmanship and contemporary tailoring.',
              keyElements: t.keyElements || ['Clean linear proportions', 'Tactile textures', 'Sophisticated finishes'],
              colorPalette: t.colorPalette || [{ name: 'Neutral Tone', hex: '#334155' }],
              howToStyle: t.howToStyle || 'Integrate with clean wardrobe staples for an effortless sartorial statement.',
              matchingCategories: t.matchingCategories || ['Tops', 'Bottoms', 'Outerwear'],
              tag: t.tag || 'Runway Direction',
              popularityScore: t.popularityScore || 94,
              sources: extractedSources.slice(0, 2),
            }))
          : defaultTrendsData.trends,
        searchQueries: webSearchQueries.length > 0 ? webSearchQueries : defaultTrendsData.searchQueries,
        sources: extractedSources,
      };

      // Save to cache
      trendCache.set(cacheKey, {
        report: finalReport,
        timestamp: Date.now(),
      });

      return res.json({
        success: true,
        report: finalReport,
      });
    } catch (_error: any) {
      markQuotaCooldown();
      
      // Serve rich, high-fashion curated seasonal forecast without failing
      const fallbackReport = getSeasonalCuratedTrends(season);
      
      trendCache.set(cacheKey, {
        report: fallbackReport,
        timestamp: Date.now(),
      });

      return res.json({
        success: true,
        isQuotaFallback: true,
        report: fallbackReport,
      });
    }
  });

  const httpServer = http.createServer(app);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PAURVI Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
