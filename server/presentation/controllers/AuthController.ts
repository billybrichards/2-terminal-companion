import { Request, Response } from 'express';
import { z } from 'zod';
import { LoginUser, RegisterUser, RefreshToken } from '../../application/use-cases/auth/index.js';
import { ValidationError } from '../../domain/errors/ValidationError.js';
import { AuthenticationError } from '../../domain/errors/AuthenticationError.js';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

/**
 * AuthController
 *
 * Thin presentation layer controller that delegates to use cases.
 * Handles HTTP concerns only:
 * - Request parsing/validation
 * - Response formatting
 * - Error mapping to HTTP status codes
 */
export class AuthController {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly registerUser: RegisterUser,
    private readonly refreshTokenUseCase: RefreshToken
  ) {}

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const body = loginSchema.parse(req.body);

      const result = await this.loginUser.execute({
        email: body.email,
        password: body.password,
      });

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const body = registerSchema.parse(req.body);
      const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
      const userAgent = req.headers['user-agent'] || undefined;

      const result = await this.registerUser.execute({
        email: body.email,
        password: body.password,
        displayName: body.displayName,
        clientIp,
        userAgent,
      });

      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const body = refreshSchema.parse(req.body);

      const result = await this.refreshTokenUseCase.execute({
        refreshToken: body.refreshToken,
      });

      res.json({
        message: 'Token refreshed',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Maps domain errors to HTTP responses.
   */
  private handleError(res: Response, error: unknown): void {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: error.message,
        code: error.code,
        field: error.field,
      });
      return;
    }

    if (error instanceof AuthenticationError) {
      res.status(401).json({
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}
