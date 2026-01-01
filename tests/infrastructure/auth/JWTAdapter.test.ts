/**
 * JWT Adapter Tests
 * Tests for the JWT authentication adapter (Infrastructure Layer)
 * Following Clean Architecture: testing the infrastructure implementation
 */

import { jwtAdapter } from '../../../server/infrastructure/auth/JWTAdapter';

describe('JWTAdapter (Infrastructure Layer)', () => {
  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = jwtAdapter.generateId();
      const id2 = jwtAdapter.generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'mySecurePassword123';
      const hash = await jwtAdapter.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(password.length);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await jwtAdapter.hashPassword(password);
      const hash2 = await jwtAdapter.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password', async () => {
      const password = 'mySecurePassword123';
      const hash = await jwtAdapter.hashPassword(password);
      
      const isValid = await jwtAdapter.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'mySecurePassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await jwtAdapter.hashPassword(password);
      
      const isValid = await jwtAdapter.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const isAdmin = false;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      
      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include correct payload in tokens', () => {
      const userId = 'user-456';
      const email = 'admin@example.com';
      const isAdmin = true;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      
      // Verify access token
      const accessPayload = jwtAdapter.verifyAccessToken(tokens.accessToken);
      expect(accessPayload).toBeDefined();
      expect(accessPayload?.sub).toBe(userId);
      expect(accessPayload?.email).toBe(email);
      expect(accessPayload?.isAdmin).toBe(isAdmin);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', () => {
      const userId = 'user-789';
      const email = 'user@example.com';
      const isAdmin = false;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      const payload = jwtAdapter.verifyAccessToken(tokens.accessToken);
      
      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(userId);
      expect(payload?.email).toBe(email);
      expect(payload?.isAdmin).toBe(isAdmin);
    });

    it('should verify valid refresh token', () => {
      const userId = 'user-789';
      const email = 'user@example.com';
      const isAdmin = false;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      const payload = jwtAdapter.verifyRefreshToken(tokens.refreshToken);
      
      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(userId);
    });

    it('should reject invalid access token', () => {
      const invalidToken = 'invalid.token.here';
      const payload = jwtAdapter.verifyAccessToken(invalidToken);
      
      expect(payload).toBeNull();
    });

    it('should reject invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';
      const payload = jwtAdapter.verifyRefreshToken(invalidToken);
      
      expect(payload).toBeNull();
    });

    it('should reject malformed tokens', () => {
      const malformedToken = 'not-a-jwt-token';
      const payload = jwtAdapter.verifyAccessToken(malformedToken);
      
      expect(payload).toBeNull();
    });
  });

  describe('Token Expiry', () => {
    it('should generate refresh token expiry date', () => {
      const refreshExpiry = jwtAdapter.getRefreshExpiryDate();
      
      expect(refreshExpiry).toBeInstanceOf(Date);
    });

    it('should set future expiry dates', () => {
      const now = new Date();
      const refreshExpiry = jwtAdapter.getRefreshExpiryDate();
      
      expect(refreshExpiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should include expiry information in token pair', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const isAdmin = false;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      
      expect(tokens.expiresIn).toBeGreaterThan(0);
      expect(tokens.refreshExpiresIn).toBeGreaterThan(0);
      expect(tokens.refreshExpiresIn).toBeGreaterThan(tokens.expiresIn);
    });
  });

  describe('Admin vs Regular Users', () => {
    it('should handle admin user tokens correctly', () => {
      const userId = 'admin-123';
      const email = 'admin@example.com';
      const isAdmin = true;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      const payload = jwtAdapter.verifyAccessToken(tokens.accessToken);
      
      expect(payload?.isAdmin).toBe(true);
    });

    it('should handle regular user tokens correctly', () => {
      const userId = 'user-123';
      const email = 'user@example.com';
      const isAdmin = false;
      
      const tokens = jwtAdapter.generateTokenPair(userId, email, isAdmin);
      const payload = jwtAdapter.verifyAccessToken(tokens.accessToken);
      
      expect(payload?.isAdmin).toBe(false);
    });
  });
});
