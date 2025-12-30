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
});

const checkoutSchema = z.object({
  userId: z.string(),
  plan: z.enum(['unlimited']).optional().default('unlimited'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

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
      accountSource: 'api',
      funnelType: body.funnelType,
      persona: body.persona || null,
      entrySource: body.entrySource || null,
      stage: body.funnelType === 'waitlist' ? 'waitlist' : 'new',
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

    if (body.funnelType === 'waitlist') {
      emailScheduler.scheduleWaitlistSequence(userId).catch(err => {
        console.error('Failed to schedule waitlist emails:', err);
      });
    } else {
      emailScheduler.scheduleDirectSequence(userId).catch(err => {
        console.error('Failed to schedule direct emails:', err);
      });
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

    const priceResult = await db.execute(
      sql`
        SELECT pr.id as price_id
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id
        WHERE p.name ILIKE '%Unlimited%' AND p.active = true AND pr.active = true
        LIMIT 1
      `
    );

    if (priceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Unlimited plan not found. Please run npm run stripe:seed first.' });
    }

    const priceId = priceResult.rows[0].price_id as string;

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
