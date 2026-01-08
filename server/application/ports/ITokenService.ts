/**
 * Token Service Port
 *
 * Interface for JWT token operations.
 * Infrastructure layer provides concrete implementation.
 */
export interface TokenPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  /**
   * Generates a pair of access and refresh tokens.
   */
  generateTokenPair(userId: string, email: string, isAdmin: boolean): TokenPair;

  /**
   * Verifies an access token and returns the payload.
   */
  verifyAccessToken(token: string): TokenPayload | null;

  /**
   * Verifies a refresh token and returns the payload.
   */
  verifyRefreshToken(token: string): TokenPayload | null;

  /**
   * Generates a unique ID.
   */
  generateId(): string;

  /**
   * Gets the expiry date for refresh tokens.
   */
  getRefreshExpiryDate(): Date;

  /**
   * Hashes a password.
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verifies a password against a hash.
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
