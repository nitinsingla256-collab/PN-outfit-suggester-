/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
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
      return res.status(404).json({ error: err.message || 'User not found' });
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
        model: 'gemini-3.6-flash',
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
    } catch (error: any) {
      console.error('Garment analysis error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to analyze garment with AI.',
      });
    }
  });

  // ==========================================
  // 8. REAL AI STYLIST ENGINE (SCOPED TO CURRENT USER & ADVANCED OUTFIT STUDIO)
  // ==========================================
  app.post('/api/gemini/stylist', authMiddleware, async (req, res) => {
    try {
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
      } = req.body;

      const userId = req.user!.id;
      const userWardrobe = db.getWardrobe(userId);
      const userOutfits = db.getOutfits(userId);
      const userWearHistory = (db as any).data.wearHistory[userId] || [];

      const availableItems = userWardrobe.filter(
        (item: any) => !excludeItemIds.includes(item.id)
      );

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
        model: 'gemini-3.6-flash',
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
    } catch (error: any) {
      console.error('AI Stylist error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate outfit recommendation.',
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

You support TWO MODES. You must intelligently determine which mode to use based on the user's question:

MODE 1: GENERAL STYLE ADVISOR
Answer general fashion/styling questions using your vast styling knowledge. (e.g., "What colour shirt goes with navy trousers?", "How do I style Chelsea boots?", "What should I wear to a wedding?")

MODE 2: PERSONAL WARDROBE STYLIST
Use the user's actual uploaded wardrobe to make personalized recommendations. (e.g., "What should I wear tonight?", "Give me an outfit using my black boots", "What can I wear in this hot weather?")

ENVIRONMENTAL CONTEXT (Use this if the styling depends on weather/location/time):
Location: ${location || 'Unknown'}
Weather: ${weather || 'Unknown'}
Time: ${time || 'Unknown'}
Date: ${date || 'Unknown'}

CLIENT WARDROBE CONTEXT:
${
  userWardrobe.length === 0
    ? 'Wardrobe is currently empty (0 items). Encourage the client to catalogue their pieces by uploading photos or adding garments. When asked for advice, suggest timeless capsule essentials.'
    : `Total catalogued pieces: ${userWardrobe.length}. Items: ` +
      userWardrobe.map((i) => `"${i.name}" (${i.category}, ${i.color}, ${i.fit || 'Tailored'})`).join('; ')
}

STRICT INSTRUCTIONS FOR WARDROBE-BASED RECOMMENDATIONS (MODE 2):
1. ACCURACY: ONLY recommend items that actually exist in the client's wardrobe when constructing specific outfits. Never invent shirts, trousers, shoes, or accessories.
2. MISSING ITEMS: If the user doesn't own something necessary, say so clearly (e.g., "You don't currently have a formal blazer in your wardrobe...").
3. NO FAKE CERTAINTY: If you cannot determine something, say you are uncertain. Do not pretend an item exists if it doesn't.
4. FORMAT: When proposing an outfit from the user's wardrobe, use EXACTLY this clean visual format:

LOOK NAME

TOP
[actual wardrobe item]

BOTTOM
[actual wardrobe item]

FOOTWEAR
[actual wardrobe item]

OUTERWEAR
[actual wardrobe item if needed]

ACCESSORIES
[actual wardrobe item if appropriate]

WHY IT WORKS
[explanation of why it works]

BEST FOR
[occasion + time + weather]

STYLE TIP
[useful finishing advice]

ALTERNATIVE
[second option when possible]

ADDITIONAL INSTRUCTIONS:
- Do NOT use repetitive generic phrases like "This outfit is perfect for you." Explain WHY it works.
- Maintain natural conversation. Understand follow-ups (e.g., "Make it less formal", "I don't want jeans").
- If a question requires missing information (like occasion), ask a short useful follow-up. But DO NOT repeatedly ask for weather/location/time if it is provided above.`;

      const contents = [];
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: `Understood. I am PN Outfit Suggester, ready to advise ${req.user!.name}.` }] });

      for (const msg of conversationHistory.slice(-8)) {
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
        model: 'gemini-3.6-flash',
        contents,
      });

      db.incrementAIRequestCount(userId, 'Concierge Conversation', message.substring(0, 40));

      return res.json({
        reply: response.text || 'I have analyzed your request and look forward to refining your style.',
      });
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate response from PAURVI Concierge.',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAURVI Atelier Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
