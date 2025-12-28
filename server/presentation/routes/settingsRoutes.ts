import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../infrastructure/database/index.js';
import { users, userPreferences, userFeedback, apiKeys, apiUsage } from '../../../shared/schema.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import { jwtAdapter } from '../../infrastructure/auth/JWTAdapter.js';
import { generateApiKey } from '../../infrastructure/auth/ApiKeyGenerator.js';

export const settingsRouter = Router();

// All routes require authentication
settingsRouter.use(authMiddleware);

// Validation schemas
const storageSchema = z.object({
  storagePreference: z.enum(['local', 'cloud']),
});

const genderSchema = z.object({
  gender: z.enum(['male', 'female', 'non-binary', 'custom']),
  customGender: z.string().max(100).optional(),
});

const responsePrefsSchema = z.object({
  preferredLength: z.enum(['brief', 'moderate', 'detailed']),
  preferredStyle: z.enum(['casual', 'thoughtful', 'creative']),
});

const themeSchema = z.object({
  themeHue: z.number().min(0).max(360),
  useOrangeAccent: z.boolean(),
});

const feedbackSchema = z.object({
  type: z.enum(['feedback', 'feature']),
  content: z.string().min(1).max(5000),
});

// GET /api/settings - Get all user settings & preferences
settingsRouter.get('/', async (req, res) => {
  try {
    const userId = req.user!.sub;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get preferences
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        storagePreference: user.storagePreference,
      },
      preferences: prefs || {
        gender: null,
        customGender: null,
        preferredLength: 'moderate',
        preferredStyle: 'thoughtful',
        themeHue: 220,
        useOrangeAccent: false,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /api/settings - Update general settings (display name)
settingsRouter.put('/', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { displayName } = req.body;

    await db.update(users)
      .set({
        displayName,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Settings updated',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PUT /api/settings/storage - Toggle storage preference (local/cloud)
settingsRouter.put('/storage', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const body = storageSchema.parse(req.body);

    await db.update(users)
      .set({
        storagePreference: body.storagePreference,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Storage preference updated',
      storagePreference: body.storagePreference,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update storage error:', error);
    res.status(500).json({ error: 'Failed to update storage preference' });
  }
});

// PUT /api/settings/gender - Update gender preference
settingsRouter.put('/gender', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const body = genderSchema.parse(req.body);

    // Ensure preferences exist
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!existing) {
      await db.insert(userPreferences).values({
        id: jwtAdapter.generateId(),
        userId,
        gender: body.gender,
        customGender: body.customGender || null,
      });
    } else {
      await db.update(userPreferences)
        .set({
          gender: body.gender,
          customGender: body.customGender || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userPreferences.userId, userId));
    }

    res.json({
      message: 'Gender preference updated',
      gender: body.gender,
      customGender: body.customGender,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update gender error:', error);
    res.status(500).json({ error: 'Failed to update gender preference' });
  }
});

// PUT /api/settings/response - Update length/style preferences
settingsRouter.put('/response', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const body = responsePrefsSchema.parse(req.body);

    // Ensure preferences exist
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!existing) {
      await db.insert(userPreferences).values({
        id: jwtAdapter.generateId(),
        userId,
        preferredLength: body.preferredLength,
        preferredStyle: body.preferredStyle,
      });
    } else {
      await db.update(userPreferences)
        .set({
          preferredLength: body.preferredLength,
          preferredStyle: body.preferredStyle,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userPreferences.userId, userId));
    }

    res.json({
      message: 'Response preferences updated',
      preferredLength: body.preferredLength,
      preferredStyle: body.preferredStyle,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update response prefs error:', error);
    res.status(500).json({ error: 'Failed to update response preferences' });
  }
});

// PUT /api/settings/theme - Sync theme preferences
settingsRouter.put('/theme', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const body = themeSchema.parse(req.body);

    // Ensure preferences exist
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!existing) {
      await db.insert(userPreferences).values({
        id: jwtAdapter.generateId(),
        userId,
        themeHue: body.themeHue,
        useOrangeAccent: body.useOrangeAccent,
      });
    } else {
      await db.update(userPreferences)
        .set({
          themeHue: body.themeHue,
          useOrangeAccent: body.useOrangeAccent,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(userPreferences.userId, userId));
    }

    res.json({
      message: 'Theme preferences updated',
      themeHue: body.themeHue,
      useOrangeAccent: body.useOrangeAccent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Failed to update theme preferences' });
  }
});

// POST /api/settings/feedback - Submit feedback
settingsRouter.post('/feedback', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const body = feedbackSchema.parse(req.body);

    await db.insert(userFeedback).values({
      id: jwtAdapter.generateId(),
      userId,
      type: body.type,
      content: body.content,
    });

    res.status(201).json({
      message: 'Feedback submitted',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// GET /api/settings/api-key - Get user's API key (prefix only)
settingsRouter.get('/api-key', async (req, res) => {
  try {
    const userId = req.user!.sub;

    const existingKey = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.userId, userId),
        eq(apiKeys.isActive, true)
      ),
    });

    if (!existingKey) {
      return res.json({ apiKey: null });
    }

    res.json({
      apiKey: {
        id: existingKey.id,
        name: existingKey.name,
        keyPrefix: existingKey.keyPrefix,
        createdAt: existingKey.createdAt,
        lastUsedAt: existingKey.lastUsedAt,
      },
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

// POST /api/settings/api-key - Create or regenerate API key
settingsRouter.post('/api-key', async (req, res) => {
  try {
    const userId = req.user!.sub;

    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.userId, userId));

    const generated = await generateApiKey();

    await db.insert(apiKeys).values({
      id: jwtAdapter.generateId(),
      name: 'Default API Key',
      keyHash: generated.keyHash,
      keyPrefix: generated.keyPrefix,
      userId,
      createdBy: userId,
      isActive: true,
    });

    res.status(201).json({
      message: 'API key created',
      apiKey: {
        key: generated.key,
        keyPrefix: generated.keyPrefix,
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// DELETE /api/settings/api-key - Revoke API key
settingsRouter.delete('/api-key', async (req, res) => {
  try {
    const userId = req.user!.sub;

    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.userId, userId));

    res.json({ message: 'API key revoked' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// GET /api/settings/usage - Get API usage for current month
settingsRouter.get('/usage', async (req, res) => {
  try {
    const userId = req.user!.sub;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageResult = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(apiUsage)
      .where(
        and(
          eq(apiUsage.userId, userId),
          gte(apiUsage.createdAt, startOfMonth.toISOString())
        )
      );

    const callsThisMonth = usageResult[0]?.count || 0;

    res.json({
      callsThisMonth,
      monthStart: startOfMonth.toISOString(),
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage' });
  }
});
