import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number; message?: string }) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const entry = rateLimitStore.get(ip);
    
    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: message });
    }
    
    entry.count++;
    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many registration attempts. Please try again later.'
});
