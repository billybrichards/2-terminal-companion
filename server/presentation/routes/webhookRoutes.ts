import express, { Router } from 'express';
import { z } from 'zod';
import { db } from '../../infrastructure/database/index.js';
import { users } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

export const webhookRouter: Router = express.Router();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const webhookMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const providedSecret = req.headers['x-webhook-secret'];
  
  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  
  if (!providedSecret || providedSecret !== WEBHOOK_SECRET) {
    console.warn('Invalid webhook secret attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

const subscriptionWebhookSchema = z.object({
  userId: z.string().uuid(),
  subscriptionStatus: z.enum(['subscribed', 'not_subscribed']),
  eventType: z.string().optional(),
});

const creditsWebhookSchema = z.object({
  userId: z.string().uuid(),
  credits: z.number().int(),
  operation: z.enum(['set', 'add', 'subtract']).default('set'),
  eventType: z.string().optional(),
});

webhookRouter.post('/subscription', webhookMiddleware, async (req, res) => {
  try {
    const body = subscriptionWebhookSchema.parse(req.body);
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.update(users)
      .set({
        subscriptionStatus: body.subscriptionStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, body.userId));

    console.log(`Webhook: Updated subscription for user ${body.userId} to ${body.subscriptionStatus}`);

    res.json({
      success: true,
      message: 'Subscription status updated',
      userId: body.userId,
      subscriptionStatus: body.subscriptionStatus,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Subscription webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

webhookRouter.post('/credits', webhookMiddleware, async (req, res) => {
  try {
    const body = creditsWebhookSchema.parse(req.body);
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
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
      .where(eq(users.id, body.userId));

    console.log(`Webhook: Updated credits for user ${body.userId}: ${currentCredits} -> ${newCredits} (${body.operation})`);

    res.json({
      success: true,
      message: 'Credits updated',
      userId: body.userId,
      previousCredits: currentCredits,
      newCredits,
      operation: body.operation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Credits webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

webhookRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    webhookConfigured: !!WEBHOOK_SECRET,
  });
});
