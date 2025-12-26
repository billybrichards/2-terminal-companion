import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  sub: string;      // User ID
  email: string;
  isAdmin: boolean;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;      // Access token expiry in seconds
  refreshExpiresIn: number; // Refresh token expiry in seconds
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}

export class JWTAdapter {
  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokenPair(userId: string, email: string, isAdmin: boolean): TokenPair {
    const accessExpiresIn = parseDuration(ACCESS_EXPIRES);
    const refreshExpiresIn = parseDuration(REFRESH_EXPIRES);

    const accessToken = jwt.sign(
      { sub: userId, email, isAdmin, type: 'access' } as TokenPayload,
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { sub: userId, email, isAdmin, type: 'refresh' } as TokenPayload,
      JWT_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: refreshExpiresIn,
    };
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (payload.type !== 'access') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (payload.type !== 'refresh') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Calculate refresh token expiry date
   */
  getRefreshExpiryDate(): Date {
    const expiresIn = parseDuration(REFRESH_EXPIRES);
    return new Date(Date.now() + expiresIn * 1000);
  }
}

// Singleton instance
export const jwtAdapter = new JWTAdapter();
