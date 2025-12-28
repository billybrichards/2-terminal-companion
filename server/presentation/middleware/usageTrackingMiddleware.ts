import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../infrastructure/database/index.js';
import { apiUsage } from '../../../shared/schema.js';

export function usageTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const originalEnd = res.end;
  const originalJson = res.json;

  let statusCode: number | undefined;
  let tokensUsed = 0;

  res.json = function(body?: any) {
    statusCode = res.statusCode;
    if (body && typeof body === 'object') {
      if (body.usage?.total_tokens) {
        tokensUsed = body.usage.total_tokens;
      } else if (body.usage?.prompt_tokens && body.usage?.completion_tokens) {
        tokensUsed = body.usage.prompt_tokens + body.usage.completion_tokens;
      } else if (typeof body.tokens === 'number') {
        tokensUsed = body.tokens;
      }
    }
    return originalJson.call(this, body);
  };

  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    const latencyMs = Date.now() - startTime;
    const finalStatusCode = statusCode ?? res.statusCode;

    const apiKeyId = req.apiKey?.id || null;
    const userId = req.user?.sub || null;
    const endpoint = req.originalUrl || req.url;
    const method = req.method;

    setImmediate(async () => {
      try {
        await db.insert(apiUsage).values({
          id: uuidv4(),
          apiKeyId,
          userId,
          endpoint,
          method,
          tokensUsed,
          latencyMs,
          statusCode: finalStatusCode,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to track API usage:', error);
      }
    });

    return originalEnd.call(res, chunk, encoding, callback);
  } as typeof res.end;

  next();
}
