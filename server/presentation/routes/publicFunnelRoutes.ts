import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { db } from '../../infrastructure/database/index.js';
import { users, contactSubmissions } from '../../../shared/schema.js';
import { emailScheduler } from '../../infrastructure/email/emailScheduler.js';

export const publicFunnelRouter = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

const registerSubscriberSchema = z.object({
  email: z.string().email(),
  displayName: z.string().max(100).optional(),
  chatName: z.string().max(50).optional(),
  funnelType: z.enum(['waitlist', 'direct']).optional().default('direct'),
  persona: z.enum(['lonely', 'curious', 'privacy']).optional(),
  entrySource: z.enum(['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic', 'landing']).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

publicFunnelRouter.post('/register-subscriber', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const userAgent = req.headers['user-agent'] || null;
    
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const body = registerSubscriberSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email.toLowerCase()),
    });

    // Determine source channel based on entry source or default to waitlist
    const sourceChannel = body.entrySource === 'landing' ? 'access_anplexa' : 'waitlist';

    // Log contact submission FIRST (append-only audit log - captures all attempts including duplicates)
    const submissionId = uuidv4();
    await db.insert(contactSubmissions).values({
      id: submissionId,
      email: body.email.toLowerCase(),
      displayName: body.displayName || null,
      chatName: body.chatName || null,
      sourceChannel,
      sourceDetail: body.entrySource || 'landing',
      funnelType: body.funnelType,
      persona: body.persona || null,
      entrySource: body.entrySource || 'landing',
      ipAddress: clientIp,
      userAgent,
      utmSource: body.utm_source || null,
      utmMedium: body.utm_medium || null,
      utmCampaign: body.utm_campaign || null,
      rawPayload: JSON.stringify(req.body),
      isNewUser: !existingUser,
      existingUserId: existingUser?.id || null,
      createdUserId: null,
      createdAt: new Date().toISOString(),
    });

    if (existingUser) {
      if (existingUser.subscriptionStatus === 'subscribed') {
        return res.status(200).json({ 
          message: 'You already have an active subscription!',
          status: 'existing_subscriber'
        });
      }
      return res.status(200).json({ 
        message: 'Thanks! You\'re already on our list.',
        status: 'existing_lead'
      });
    }

    const userId = uuidv4();
    const tempPassword = uuidv4();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const now = new Date().toISOString();

    await db.insert(users).values({
      id: userId,
      email: body.email.toLowerCase(),
      passwordHash,
      displayName: body.displayName || null,
      chatName: body.chatName || null,
      accountSource: 'anplexa',
      sourceChannel, // Unified source channel tracking
      funnelType: body.funnelType,
      persona: body.persona || null,
      entrySource: body.entrySource || 'landing',
      stage: body.funnelType === 'waitlist' ? 'waitlist' : 'new',
      subscriptionStatus: 'not_subscribed',
      credits: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Update contact submission with created user ID
    await db.update(contactSubmissions)
      .set({ createdUserId: userId })
      .where(eq(contactSubmissions.id, submissionId));

    try {
      if (body.funnelType === 'waitlist') {
        await emailScheduler.scheduleWaitlistSequence(userId);
      } else {
        await emailScheduler.scheduleDirectSequence(userId);
      }
    } catch (scheduleError) {
      console.error('Failed to schedule email sequence:', scheduleError);
    }

    res.status(201).json({
      message: 'Thanks for signing up! Check your email for next steps.',
      status: 'success',
      leadId: userId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Please provide a valid email address.',
        details: error.errors 
      });
    }
    console.error('Register subscriber error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

publicFunnelRouter.options('/register-subscriber', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});
