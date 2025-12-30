import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../infrastructure/database/index.js';
import { companionConfig, users, userFeedback, messages, conversations, systemPrompts } from '../../../shared/schema.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { getOllamaGateway } from '../../infrastructure/adapters/OllamaGateway.js';
import { eq, desc, count } from 'drizzle-orm';
import { ANPLEXA_DEFAULT_PROMPT } from '../../config/anplexaPrompt.js';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// Validation schemas
const identitySchema = z.object({
  name: z.string().min(1).max(100),
  defaultGender: z.enum(['male', 'female', 'non-binary', 'custom']),
  customGenderText: z.string().max(100).optional(),
});

const responsesSchema = z.object({
  defaultLength: z.enum(['brief', 'moderate', 'detailed']),
  defaultStyle: z.enum(['casual', 'thoughtful', 'creative']),
  briefTokens: z.number().min(100).max(5000).optional(),
  moderateTokens: z.number().min(100).max(5000).optional(),
  detailedTokens: z.number().min(100).max(10000).optional(),
  briefInstruction: z.string().max(1000).optional(),
  moderateInstruction: z.string().max(1000).optional(),
  detailedInstruction: z.string().max(1000).optional(),
  casualInstruction: z.string().max(1000).optional(),
  thoughtfulInstruction: z.string().max(1000).optional(),
  creativeInstruction: z.string().max(1000).optional(),
});

const modelSchema = z.object({
  generalModel: z.string().min(1).max(100),
  longFormModel: z.string().min(1).max(100),
  temperature: z.number().min(0).max(2),
  useLongFormForDetailed: z.boolean(),
});

const welcomeSchema = z.object({
  welcomeTitle: z.string().max(200),
  welcomeMessage: z.string().max(2000),
});

const promptSchema = z.object({
  systemPromptTemplate: z.string().min(1).max(10000),
});

// GET /api/admin/companion - Get full companion config
adminRouter.get('/companion', async (req, res) => {
  try {
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    if (!config) {
      return res.status(404).json({ error: 'Companion not configured' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get companion config error:', error);
    res.status(500).json({ error: 'Failed to get companion config' });
  }
});

// PUT /api/admin/companion - Update full companion config
adminRouter.put('/companion', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // Remove id field if present
    delete updateData.id;

    await db.update(companionConfig)
      .set(updateData)
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Companion config updated' });
  } catch (error) {
    console.error('Update companion config error:', error);
    res.status(500).json({ error: 'Failed to update companion config' });
  }
});

// PUT /api/admin/companion/identity - Update name, gender defaults
adminRouter.put('/companion/identity', async (req, res) => {
  try {
    const body = identitySchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        name: body.name,
        defaultGender: body.defaultGender,
        customGenderText: body.customGenderText || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Identity settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update identity error:', error);
    res.status(500).json({ error: 'Failed to update identity settings' });
  }
});

// PUT /api/admin/companion/responses - Update length/style settings & instructions
adminRouter.put('/companion/responses', async (req, res) => {
  try {
    const body = responsesSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Response settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update responses error:', error);
    res.status(500).json({ error: 'Failed to update response settings' });
  }
});

// PUT /api/admin/companion/model - Update Ollama model & temperature
adminRouter.put('/companion/model', async (req, res) => {
  try {
    const body = modelSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        generalModel: body.generalModel,
        longFormModel: body.longFormModel,
        temperature: body.temperature,
        useLongFormForDetailed: body.useLongFormForDetailed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Model settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Failed to update model settings' });
  }
});

// PUT /api/admin/companion/welcome - Update welcome message
adminRouter.put('/companion/welcome', async (req, res) => {
  try {
    const body = welcomeSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        welcomeTitle: body.welcomeTitle,
        welcomeMessage: body.welcomeMessage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Welcome message updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update welcome error:', error);
    res.status(500).json({ error: 'Failed to update welcome message' });
  }
});

// PUT /api/admin/companion/prompt - Update system prompt template
adminRouter.put('/companion/prompt', async (req, res) => {
  try {
    const body = promptSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        systemPromptTemplate: body.systemPromptTemplate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'System prompt updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update system prompt' });
  }
});

// GET /api/admin/users - List all users
adminRouter.get('/users', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    // Remove sensitive data
    const safeUsers = allUsers.map((user: typeof allUsers[number]) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      storagePreference: user.storagePreference,
      isAdmin: user.isAdmin,
      subscriptionStatus: (user as any).subscriptionStatus || 'not_subscribed',
      credits: (user as any).credits || 0,
      createdAt: user.createdAt,
    }));

    res.json({ users: safeUsers });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// GET /api/admin/users/:id - Get specific user details
adminRouter.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get conversation count
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, id),
    });

    // Get message count
    let messageCount = 0;
    for (const conv of userConversations) {
      const convMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conv.id),
      });
      messageCount += convMessages.length;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        storagePreference: user.storagePreference,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      stats: {
        conversationCount: userConversations.length,
        messageCount,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// DELETE /api/admin/users/:id - Delete user and their data
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.sub) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's messages (via conversations)
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, id),
    });

    for (const conv of userConversations) {
      await db.delete(messages).where(eq(messages.conversationId, conv.id));
    }

    // Delete conversations
    await db.delete(conversations).where(eq(conversations.userId, id));

    // Delete feedback
    await db.delete(userFeedback).where(eq(userFeedback.userId, id));

    // Delete user
    await db.delete(users).where(eq(users.id, id));

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/feedback - List all user feedback
adminRouter.get('/feedback', async (req, res) => {
  try {
    const allFeedback = await db.query.userFeedback.findMany({
      orderBy: [desc(userFeedback.createdAt)],
    });

    res.json({ feedback: allFeedback });
  } catch (error) {
    console.error('List feedback error:', error);
    res.status(500).json({ error: 'Failed to list feedback' });
  }
});

// GET /api/admin/stats - Usage statistics
adminRouter.get('/stats', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany();
    const allConversations = await db.query.conversations.findMany();
    const allMessages = await db.query.messages.findMany();
    const allFeedback = await db.query.userFeedback.findMany();

    res.json({
      stats: {
        totalUsers: allUsers.length,
        totalConversations: allConversations.length,
        totalMessages: allMessages.length,
        totalFeedback: allFeedback.length,
        feedbackByType: {
          feedback: allFeedback.filter((f: typeof allFeedback[number]) => f.type === 'feedback').length,
          feature: allFeedback.filter((f: typeof allFeedback[number]) => f.type === 'feature').length,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// POST /api/admin/test-ollama - Test Ollama connection
adminRouter.post('/test-ollama', async (req, res) => {
  try {
    const ollama = getOllamaGateway();
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    const generalModel = config?.generalModel || process.env.OLLAMA_GENERAL_MODEL || 'darkplanet';
    const longFormModel = config?.longFormModel || process.env.OLLAMA_LONGFORM_MODEL || 'darkplanet';

    // Test with a simple prompt
    const testPrompt = 'Say "Hello, I am working!" in exactly 5 words.';

    let generalResult = '';
    let longFormResult = '';
    let generalError = null;
    let longFormError = null;

    // Test general model
    try {
      generalResult = await ollama.generate({
        model: generalModel,
        messages: [{ role: 'user', content: testPrompt }],
        maxTokens: 50,
      });
    } catch (e) {
      generalError = e instanceof Error ? e.message : 'Unknown error';
    }

    // Test long-form model
    try {
      longFormResult = await ollama.generate({
        model: longFormModel,
        messages: [{ role: 'user', content: testPrompt }],
        maxTokens: 50,
      });
    } catch (e) {
      longFormError = e instanceof Error ? e.message : 'Unknown error';
    }

    res.json({
      success: !generalError && !longFormError,
      generalModel: {
        model: generalModel,
        success: !generalError,
        response: generalResult || undefined,
        error: generalError || undefined,
      },
      longFormModel: {
        model: longFormModel,
        success: !longFormError,
        response: longFormResult || undefined,
        error: longFormError || undefined,
      },
    });
  } catch (error) {
    console.error('Test Ollama error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/admin/models - List available Ollama models
adminRouter.get('/models', async (req, res) => {
  try {
    const ollama = getOllamaGateway();
    const models = await ollama.getModels();

    res.json({ models });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// Validation schemas for subscription and credits
const subscriptionSchema = z.object({
  subscriptionStatus: z.enum(['subscribed', 'not_subscribed']),
});

const creditsSchema = z.object({
  credits: z.number().int(),
  operation: z.enum(['set', 'add', 'subtract']).default('set'),
});

// PUT /api/admin/users/:id/subscription - Update user subscription status
adminRouter.put('/users/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const body = subscriptionSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users)
      .set({
        subscriptionStatus: body.subscriptionStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    res.json({
      message: 'Subscription status updated',
      userId: id,
      subscriptionStatus: body.subscriptionStatus,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

// PUT /api/admin/users/:id/credits - Update user credits
adminRouter.put('/users/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const body = creditsSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newCredits: number;
    const currentCredits = (user as any).credits || 0;

    switch (body.operation) {
      case 'add':
        newCredits = currentCredits + body.credits;
        break;
      case 'subtract':
        newCredits = Math.max(0, currentCredits - body.credits);
        break;
      case 'set':
      default:
        newCredits = body.credits;
        break;
    }

    await db.update(users)
      .set({
        credits: newCredits,
        updatedAt: new Date().toISOString(),
      } as any)
      .where(eq(users.id, id));

    res.json({
      message: 'Credits updated',
      userId: id,
      previousCredits: currentCredits,
      newCredits,
      operation: body.operation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// GET /api/admin/users/:id/billing - Get user billing info (subscription + credits)
adminRouter.get('/users/:id/billing', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: id,
      email: user.email,
      subscriptionStatus: (user as any).subscriptionStatus || 'not_subscribed',
      credits: (user as any).credits || 0,
    });
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ error: 'Failed to get billing info' });
  }
});

// ============== SYSTEM PROMPT MANAGEMENT ==============

const systemPromptSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  notes: z.string().max(500).optional(),
});

// GET /api/admin/system-prompts - List all system prompts with version history
adminRouter.get('/system-prompts', async (req, res) => {
  try {
    const prompts = await db.query.systemPrompts.findMany({
      orderBy: [desc(systemPrompts.createdAt)],
    });

    res.json({
      prompts,
      defaultPrompt: ANPLEXA_DEFAULT_PROMPT,
    });
  } catch (error) {
    console.error('List system prompts error:', error);
    res.status(500).json({ error: 'Failed to list system prompts' });
  }
});

// GET /api/admin/system-prompts/active - Get the currently active system prompt
adminRouter.get('/system-prompts/active', async (req, res) => {
  try {
    const activePrompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.isActive, true),
    });

    res.json({
      prompt: activePrompt || {
        content: ANPLEXA_DEFAULT_PROMPT,
        name: 'Anplexa Default (Built-in)',
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Get active system prompt error:', error);
    res.status(500).json({ error: 'Failed to get active system prompt' });
  }
});

// GET /api/admin/system-prompts/:id - Get a specific system prompt by ID
adminRouter.get('/system-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    res.json({ prompt });
  } catch (error) {
    console.error('Get system prompt error:', error);
    res.status(500).json({ error: 'Failed to get system prompt' });
  }
});

// POST /api/admin/system-prompts - Create a new system prompt version
adminRouter.post('/system-prompts', async (req, res) => {
  try {
    const body = systemPromptSchema.parse(req.body);
    const adminId = req.user!.sub;

    // Get the current highest version for this prompt name
    const existingPrompts = await db.query.systemPrompts.findMany({
      where: eq(systemPrompts.name, body.name),
      orderBy: [desc(systemPrompts.version)],
    });
    
    const nextVersion = existingPrompts.length > 0 ? (existingPrompts[0].version || 0) + 1 : 1;

    const newPromptId = `sp_${uuidv4().substring(0, 8)}`;

    await db.insert(systemPrompts).values({
      id: newPromptId,
      name: body.name,
      content: body.content,
      version: nextVersion,
      isActive: false,
      createdBy: adminId,
      createdAt: new Date().toISOString(),
      notes: body.notes || null,
    });

    res.status(201).json({
      message: 'System prompt created',
      promptId: newPromptId,
      version: nextVersion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create system prompt error:', error);
    res.status(500).json({ error: 'Failed to create system prompt' });
  }
});

// PUT /api/admin/system-prompts/:id/activate - Set a system prompt as the active one
adminRouter.put('/system-prompts/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the prompt exists
    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    // Deactivate all other prompts
    await db.update(systemPrompts)
      .set({ isActive: false })
      .where(eq(systemPrompts.isActive, true));

    // Activate the selected prompt
    await db.update(systemPrompts)
      .set({ isActive: true })
      .where(eq(systemPrompts.id, id));

    res.json({
      message: 'System prompt activated',
      promptId: id,
      promptName: prompt.name,
    });
  } catch (error) {
    console.error('Activate system prompt error:', error);
    res.status(500).json({ error: 'Failed to activate system prompt' });
  }
});

// DELETE /api/admin/system-prompts/:id - Delete a system prompt
adminRouter.delete('/system-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    if (prompt.isActive) {
      return res.status(400).json({ error: 'Cannot delete the active system prompt. Activate another prompt first.' });
    }

    await db.delete(systemPrompts).where(eq(systemPrompts.id, id));

    res.json({
      message: 'System prompt deleted',
      promptId: id,
    });
  } catch (error) {
    console.error('Delete system prompt error:', error);
    res.status(500).json({ error: 'Failed to delete system prompt' });
  }
});
