import { Request, Response, NextFunction } from 'express';
import { jwtAdapter, TokenPayload } from '../../infrastructure/auth/JWTAdapter.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const payload = jwtAdapter.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

/**
 * Admin middleware
 * Requires user to be an admin
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Optional auth middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = jwtAdapter.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
