import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
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

async function validateApiKey(apiKey: string): Promise<{ id: string; name: string; keyPrefix: string } | null> {
  try {
    const prefix = apiKey.substring(0, 8);
    
    const keys = await db.query.apiKeys.findMany({
      where: and(
        eq(apiKeys.keyPrefix, prefix),
        eq(apiKeys.isActive, true)
      ),
    });

    for (const key of keys) {
      const isValid = await bcrypt.compare(apiKey, key.keyHash);
      if (isValid) {
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
    
    return null;
  } catch (error) {
    console.error('API key validation error:', error);
    return null;
  }
}

export async function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const validKey = await validateApiKey(apiKey);

  if (!validKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKey = validKey;
  next();
}

export async function optionalApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey) {
    const validKey = await validateApiKey(apiKey);
    if (validKey) {
      req.apiKey = validKey;
    }
  }

  next();
}
