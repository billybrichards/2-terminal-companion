import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../../infrastructure/database/index.js';
import { apiKeys } from '../../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        name: string;
        keyPrefix: string;
      };
    }
  }
}

const apiKeyAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_API_KEY_ATTEMPTS = 10;
const API_KEY_LOCKOUT_DURATION = 5 * 60 * 1000;

function isApiKeyRateLimited(ip: string): boolean {
  const attempt = apiKeyAttempts.get(ip);
  if (!attempt) return false;
  if (Date.now() - attempt.lastAttempt > API_KEY_LOCKOUT_DURATION) {
    apiKeyAttempts.delete(ip);
    return false;
  }
  return attempt.count >= MAX_API_KEY_ATTEMPTS;
}

function recordApiKeyAttempt(ip: string, success: boolean) {
  if (success) {
    apiKeyAttempts.delete(ip);
    return;
  }
  const attempt = apiKeyAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempt.count++;
  attempt.lastAttempt = Date.now();
  apiKeyAttempts.set(ip, attempt);
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function validateApiKey(apiKey: string, clientIp: string): Promise<{ id: string; name: string; keyPrefix: string } | null> {
  try {
    if (isApiKeyRateLimited(clientIp)) {
      return null;
    }

    if (!apiKey.startsWith('tc_') || apiKey.length < 20) {
      recordApiKeyAttempt(clientIp, false);
      return null;
    }

    const prefix = apiKey.substring(0, 8);
    
    const keys = await db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.keyPrefix, prefix),
        eq(apiKeys.isActive, true)
      ),
    });

    if (keys.length === 0) {
      recordApiKeyAttempt(clientIp, false);
      return null;
    }

    for (const key of keys) {
      const isValid = await bcrypt.compare(apiKey, key.keyHash);
      if (isValid) {
        recordApiKeyAttempt(clientIp, true);
        await db.update(apiKeys)
          .set({ lastUsedAt: new Date().toISOString() })
          .where(eq(apiKeys.id, key.id));
        
        return {
          id: key.id,
          name: key.name,
          keyPrefix: key.keyPrefix,
        };
      }
    }
    
    recordApiKeyAttempt(clientIp, false);
    return null;
  } catch (error) {
    console.error('API key validation error:', error);
    return null;
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const clientIp = getClientIp(req);

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  if (isApiKeyRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many authentication attempts. Please try again later.' });
  }

  const validKey = await validateApiKey(apiKey, clientIp);

  if (!validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKey = validKey;
  next();
}

export async function optionalApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const clientIp = getClientIp(req);

  if (apiKey && !isApiKeyRateLimited(clientIp)) {
    const validKey = await validateApiKey(apiKey, clientIp);
    if (validKey) {
      req.apiKey = validKey;
    }
  }

  next();
}
