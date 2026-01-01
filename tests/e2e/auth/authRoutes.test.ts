/**
 * Auth Routes E2E Tests
 * End-to-end tests for authentication endpoints
 * Following Clean Architecture: testing interface adapters (routes)
 */

import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../../utils/testDatabase';
import { createTestApp } from '../../utils/testServer';

describe('Auth Routes E2E', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = await setupTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          displayName: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).toHaveProperty('displayName', 'New User');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should make first user an admin', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'firstuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.isAdmin).toBe(true);
    });

    it('should reject duplicate email', async () => {
      const email = 'duplicate@example.com';
      
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
        });

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'password456',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should use email as displayName if not provided', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noname@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.displayName).toBe('noname');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await createTestUser(db, {
        email: 'logintest@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('logintest@example.com');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token refreshed');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Refresh token required');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('logintest@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should invalidate refresh token after logout', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe('GET endpoints (should return helpful messages)', () => {
    it('GET /api/auth/register should return method not allowed', async () => {
      const response = await request(app)
        .get('/api/auth/register');

      expect(response.status).toBe(405);
      expect(response.body).toHaveProperty('error', 'Method Not Allowed');
      expect(response.body.method).toBe('POST');
    });

    it('GET /api/auth/login should return method not allowed', async () => {
      const response = await request(app)
        .get('/api/auth/login');

      expect(response.status).toBe(405);
      expect(response.body.method).toBe('POST');
    });
  });

  describe('Password Reset Flow', () => {
    beforeAll(async () => {
      await createTestUser(db, {
        email: 'resettest@example.com',
        password: 'oldpassword123',
      });
    });

    it('POST /api/auth/forgot-password should accept valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'resettest@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('reset link');
    });

    it('POST /api/auth/forgot-password should not reveal if email exists', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      // Should return success to prevent email enumeration
      expect(response.status).toBe(200);
    });
  });

  describe('User Preference Updates', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
    });

    it('PUT /api/auth/chat-name should update chat name', async () => {
      const response = await request(app)
        .put('/api/auth/chat-name')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          chatName: 'TestChatName',
        });

      expect(response.status).toBe(200);
      expect(response.body.chatName).toBe('TestChatName');
    });

    it('PUT /api/auth/personality-mode should update personality mode', async () => {
      const response = await request(app)
        .put('/api/auth/personality-mode')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          mode: 'playful',
        });

      expect(response.status).toBe(200);
      expect(response.body.personalityMode).toBe('playful');
    });

    it('PUT /api/auth/gender should update gender preference', async () => {
      const response = await request(app)
        .put('/api/auth/gender')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          gender: 'male',
        });

      expect(response.status).toBe(200);
      expect(response.body.gender).toBe('male');
    });

    it('GET /api/auth/personality-modes should return available modes', async () => {
      const response = await request(app)
        .get('/api/auth/personality-modes');

      expect(response.status).toBe(200);
      expect(response.body.modes).toBeInstanceOf(Array);
      expect(response.body.modes.length).toBeGreaterThan(0);
    });

    it('GET /api/auth/genders should return available genders', async () => {
      const response = await request(app)
        .get('/api/auth/genders');

      expect(response.status).toBe(200);
      expect(response.body.genders).toBeInstanceOf(Array);
      expect(response.body.genders.length).toBeGreaterThan(0);
    });
  });
});
