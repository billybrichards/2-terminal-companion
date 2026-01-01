import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from '../../infrastructure/database/index.js';
import { users, apiKeys, sessions } from '../../../shared/schema.js';
import { jwtAdapter } from '../../infrastructure/auth/JWTAdapter.js';
import { generateApiKey } from '../../infrastructure/auth/ApiKeyGenerator.js';
import { stripeService } from '../../infrastructure/stripe/stripeService.js';
import { emailService } from '../../infrastructure/email/resendService.js';
import { emailScheduler } from '../../infrastructure/email/emailScheduler.js';

export const funnelRouter = Router();

const FUNNEL_API_SECRET = process.env.FUNNEL_API_SECRET;

function funnelAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!FUNNEL_API_SECRET) {
    console.error('FUNNEL_API_SECRET not configured');
    return res.status(500).json({ error: 'Funnel API not configured' });
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== FUNNEL_API_SECRET) {
    return res.status(403).json({ error: 'Invalid funnel API secret' });
  }
  
  next();
}

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  chatName: z.string().max(50).optional(),
  funnelType: z.enum(['waitlist', 'direct']).optional().default('direct'),
  persona: z.enum(['lonely', 'curious', 'privacy']).optional(),
  entrySource: z.enum(['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic']).optional(),
  subscriptionStatus: z.enum(['subscribed', 'not_subscribed']).optional().default('not_subscribed'),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

const amplexaFunnelProfileSchema = z.object({
  email: z.string().email(),
  funnel: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
  funnelName: z.string(),
  responses: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    answer: z.string(),
    answerIndex: z.number().min(0).max(3),
  })).optional(),
  profile: z.object({
    primaryNeed: z.string().optional(),
    communicationStyle: z.string().optional(),
    pace: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  timestamp: z.string().optional(),
});

const checkoutSchema = z.object({
  userId: z.string(),
  plan: z.enum(['yearly', 'monthly', 'early', 'standard', 'unlimited']).optional().default('monthly'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

const ANPLEXA_PRICES = {
  yearly: 'price_1SkkrmB6IBiJ6M2wj4cbn7Hq',   // £11.99/year (early adopter £0.99/mo)
  monthly: 'price_1SkkrmB6IBiJ6M2wKHKGA2WV',  // £2.99/month (standard)
};

const updateSubscriptionSchema = z.object({
  userId: z.string(),
  subscriptionStatus: z.enum(['subscribed', 'not_subscribed']),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

funnelRouter.post('/users', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const body = createUserSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await jwtAdapter.hashPassword(body.password);
    const userId = jwtAdapter.generateId();

    await db.insert(users).values({
      id: userId,
      email: body.email,
      passwordHash,
      displayName: body.displayName || body.email.split('@')[0],
      chatName: body.chatName || null,
      accountSource: 'anplexa', // Funnel users are Anplexa app users, NOT Abionti API users
      funnelType: body.funnelType,
      persona: body.persona || null,
      entrySource: body.entrySource || null,
      stage: body.subscriptionStatus === 'subscribed' ? 'converted' : (body.funnelType === 'waitlist' ? 'waitlist' : 'new'),
      subscriptionStatus: body.subscriptionStatus,
      stripeCustomerId: body.stripeCustomerId || null,
      stripeSubscriptionId: body.stripeSubscriptionId || null,
    });

    const apiKeyData = await generateApiKey();
    await db.insert(apiKeys).values({
      id: jwtAdapter.generateId(),
      userId,
      keyHash: apiKeyData.keyHash,
      keyPrefix: apiKeyData.keyPrefix,
      name: 'Funnel Generated Key',
    });

    const tokens = jwtAdapter.generateTokenPair(userId, body.email, false);

    await db.insert(sessions).values({
      id: jwtAdapter.generateId(),
      userId,
      refreshToken: tokens.refreshToken,
      expiresAt: jwtAdapter.getRefreshExpiryDate().toISOString(),
    });

    // Only schedule CRM emails for non-subscribed users
    if (body.subscriptionStatus !== 'subscribed') {
      if (body.funnelType === 'waitlist') {
        emailScheduler.scheduleWaitlistSequence(userId).catch(err => {
          console.error('Failed to schedule waitlist emails:', err);
        });
      } else {
        emailScheduler.scheduleDirectSequence(userId).catch(err => {
          console.error('Failed to schedule direct emails:', err);
        });
      }
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        email: body.email,
        displayName: body.displayName || body.email.split('@')[0],
      },
      apiKey: apiKeyData.key,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Funnel create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

funnelRouter.post('/checkout', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const body = checkoutSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = (user as any).stripeCustomerId;

    if (!customerId) {
      const customer = await stripeService.createCustomer(user.email, body.userId);
      customerId = customer.id;

      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, body.userId));
    }

    // Determine price based on plan
    let priceId: string;
    if (body.plan === 'yearly' || body.plan === 'early') {
      priceId = ANPLEXA_PRICES.yearly;  // £11.99/year
    } else {
      priceId = ANPLEXA_PRICES.monthly; // £2.99/month (default)
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const successUrl = body.successUrl || `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/subscription/cancel`;

    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        customerEmail: user.email,
        customerCreation: 'always',
        billingAddressCollection: 'required',
      }
    );

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Funnel checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

funnelRouter.get('/subscription/:userId', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptionStatus = (user as any).subscriptionStatus || 'not_subscribed';

    res.json({
      userId: user.id,
      email: user.email,
      subscriptionStatus: subscriptionStatus,
      isSubscribed: subscriptionStatus === 'subscribed',
      stripeCustomerId: (user as any).stripeCustomerId || null,
      stripeSubscriptionId: (user as any).stripeSubscriptionId || null,
    });
  } catch (error) {
    console.error('Funnel get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

funnelRouter.put('/subscription', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const body = updateSubscriptionSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: Record<string, any> = {
      subscriptionStatus: body.subscriptionStatus,
      updatedAt: new Date().toISOString(),
    };

    if (body.stripeCustomerId) {
      updateData.stripeCustomerId = body.stripeCustomerId;
    }
    if (body.stripeSubscriptionId) {
      updateData.stripeSubscriptionId = body.stripeSubscriptionId;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, body.userId));

    res.json({
      message: 'Subscription updated successfully',
      userId: body.userId,
      subscriptionStatus: body.subscriptionStatus,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Funnel update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

funnelRouter.get('/users/:userId', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        chatName: (user as any).chatName,
        personalityMode: (user as any).personalityMode,
        preferredGender: (user as any).preferredGender,
        subscriptionStatus: (user as any).subscriptionStatus || 'not_subscribed',
        isSubscribed: (user as any).subscriptionStatus === 'subscribed',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Funnel get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

funnelRouter.post('/users/:userId/api-key', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const apiKeyData = await generateApiKey();
    await db.insert(apiKeys).values({
      id: jwtAdapter.generateId(),
      userId,
      keyHash: apiKeyData.keyHash,
      keyPrefix: apiKeyData.keyPrefix,
      name: name || 'Funnel Generated Key',
    });

    res.status(201).json({
      message: 'API key created successfully',
      apiKey: apiKeyData.key,
      keyPrefix: apiKeyData.keyPrefix,
    });
  } catch (error) {
    console.error('Funnel create API key error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// POST /api/funnel/profile - Store Amplexa funnel profile for user
funnelRouter.post('/profile', funnelAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const body = amplexaFunnelProfileSchema.parse(req.body);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Update user with Amplexa funnel profile
    await db.update(users)
      .set({
        amplexaFunnel: body.funnel,
        amplexaFunnelName: body.funnelName,
        amplexaResponses: body.responses ? JSON.stringify(body.responses) : null,
        amplexaPrimaryNeed: body.profile?.primaryNeed || null,
        amplexaCommunicationStyle: body.profile?.communicationStyle || null,
        amplexaPace: body.profile?.pace || null,
        amplexaTags: body.profile?.tags ? JSON.stringify(body.profile.tags) : null,
        amplexaTimestamp: body.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, user.id));

    res.json({
      message: 'Amplexa funnel profile stored successfully',
      userId: user.id,
      email: user.email,
      funnel: body.funnel,
      funnelName: body.funnelName,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Funnel profile error:', error);
    res.status(500).json({ error: 'Failed to store funnel profile' });
  }
});
