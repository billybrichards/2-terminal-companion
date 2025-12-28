import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../../infrastructure/database/index.js';
import { users, sessions, userPreferences, passwordResetTokens } from '../../../shared/schema.js';
import { jwtAdapter } from '../../infrastructure/auth/JWTAdapter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authRateLimiter, registrationRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { eq, and, isNull, gt } from 'drizzle-orm';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

// POST /api/auth/register
authRouter.post('/register', registrationRateLimiter, async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const passwordHash = await jwtAdapter.hashPassword(body.password);
    const userId = jwtAdapter.generateId();

    // Check if this is the first user (make them admin)
    const userCount = await db.select().from(users);
    const isAdmin = userCount.length === 0;

    await db.insert(users).values({
      id: userId,
      email: body.email,
      passwordHash,
      displayName: body.displayName || body.email.split('@')[0],
      isAdmin,
    });

    // Create default preferences
    await db.insert(userPreferences).values({
      id: jwtAdapter.generateId(),
      userId,
    });

    // Generate tokens
    const tokens = jwtAdapter.generateTokenPair(userId, body.email, isAdmin);

    // Store refresh token
    await db.insert(sessions).values({
      id: jwtAdapter.generateId(),
      userId,
      refreshToken: tokens.refreshToken,
      expiresAt: jwtAdapter.getRefreshExpiryDate().toISOString(),
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userId,
        email: body.email,
        displayName: body.displayName || body.email.split('@')[0],
        isAdmin,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', authRateLimiter, async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await jwtAdapter.verifyPassword(body.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = jwtAdapter.generateTokenPair(user.id, user.email, user.isAdmin || false);

    // Store refresh token
    await db.insert(sessions).values({
      id: jwtAdapter.generateId(),
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: jwtAdapter.getRefreshExpiryDate().toISOString(),
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
      ...tokens,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = jwtAdapter.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.refreshToken, refreshToken),
    });

    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }

    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const tokens = jwtAdapter.generateTokenPair(user.id, user.email, user.isAdmin || false);

    // Update session with new refresh token
    await db.update(sessions)
      .set({
        refreshToken: tokens.refreshToken,
        expiresAt: jwtAdapter.getRefreshExpiryDate().toISOString(),
      })
      .where(eq(sessions.id, session.id));

    res.json({
      message: 'Token refreshed',
      ...tokens,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authMiddleware, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete specific session
      await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
    } else {
      // Delete all sessions for user
      await db.delete(sessions).where(eq(sessions.userId, req.user!.sub));
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.sub),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get preferences
    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        storagePreference: user.storagePreference,
      },
      preferences: prefs || null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', authRateLimiter, async (req, res) => {
  try {
    const body = forgotPasswordSchema.parse(req.body);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    // Always return success message to prevent email enumeration
    const successMessage = 'If an account exists with this email, a password reset link has been sent';

    if (!user) {
      return res.json({ message: successMessage });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing
    const tokenHash = await jwtAdapter.hashPassword(token);

    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store the token
    await db.insert(passwordResetTokens).values({
      id: jwtAdapter.generateId(),
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Return success with token (in production, this would be emailed)
    res.json({
      message: successMessage,
      token, // Only for development - remove in production
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', authRateLimiter, async (req, res) => {
  try {
    const body = resetPasswordSchema.parse(req.body);

    // Find all non-expired, unused tokens
    const now = new Date().toISOString();
    const resetTokens = await db.select()
      .from(passwordResetTokens)
      .where(
        and(
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
        )
      );

    // Find matching token by verifying hash
    let validToken = null;
    for (const resetToken of resetTokens) {
      const isMatch = await jwtAdapter.verifyPassword(body.token, resetToken.tokenHash);
      if (isMatch) {
        validToken = resetToken;
        break;
      }
    }

    if (!validToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const passwordHash = await jwtAdapter.hashPassword(body.newPassword);

    // Update user's password
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date().toISOString() })
      .where(eq(users.id, validToken.userId));

    // Mark token as used
    await db.update(passwordResetTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(passwordResetTokens.id, validToken.id));

    // Delete all user sessions (force re-login)
    await db.delete(sessions).where(eq(sessions.userId, validToken.userId));

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});
