/**
 * Complete E2E Workflow Tests
 * Tests complete user journeys through the system
 * Following Clean Architecture: testing the complete flow from UI to database
 */

import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, createTestCompanionConfig } from '../../utils/testDatabase';
import { createTestApp } from '../../utils/testServer';

describe('Complete E2E Workflows', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = await setupTestDatabase();
    await createTestCompanionConfig(db);
    app = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('User Registration → Login → Chat Flow', () => {
    const userEmail = 'workflow@example.com';
    const userPassword = 'workflow123';
    let accessToken: string;
    let refreshToken: string;
    let userId: string;

    it('Step 1: User registers successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: userEmail,
          password: userPassword,
          displayName: 'Workflow Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(userEmail);
      
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
      userId = response.body.user.id;

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
    });

    it('Step 2: User can access their profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.email).toBe(userEmail);
    });

    it('Step 3: User logs out', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
    });

    it('Step 4: User logs back in', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: userPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(userEmail);
      
      // Get new tokens
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('Step 5: User updates preferences', async () => {
      const response = await request(app)
        .put('/api/auth/chat-name')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          chatName: 'WorkflowUser',
        });

      expect(response.status).toBe(200);
      expect(response.body.chatName).toBe('WorkflowUser');
    });

    it('Step 6: User accesses chat config', async () => {
      const response = await request(app)
        .get('/api/chat/config')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('welcomeMessage');
    });

    it('Step 7: User refreshes access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(accessToken);
    });
  });

  describe('Conversation Persistence Flow', () => {
    let accessToken: string;
    let conversationId: string;

    beforeAll(async () => {
      // Register and login
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'conversation-user@example.com',
          password: 'password123',
        });

      accessToken = registerResponse.body.accessToken;
    });

    it('Step 1: User creates a conversation', async () => {
      const { conversations } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      
      conversationId = jwtAdapter.generateId();
      
      // Get user ID from token
      const payload = jwtAdapter.verifyAccessToken(accessToken);
      const userId = payload?.sub;

      await db.insert(conversations).values({
        id: conversationId,
        userId,
        title: 'Test Conversation',
      });

      const result = await db.query.conversations.findFirst({
        where: (conversations: any, { eq }: any) => eq(conversations.id, conversationId),
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Conversation');
    });

    it('Step 2: User adds messages to conversation', async () => {
      const { messages } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { eq } = await import('drizzle-orm');

      // Add user message
      const userMessageId = jwtAdapter.generateId();
      await db.insert(messages).values({
        id: userMessageId,
        conversationId,
        role: 'user',
        content: 'Hello, this is a test message',
      });

      // Add assistant message
      const assistantMessageId = jwtAdapter.generateId();
      await db.insert(messages).values({
        id: assistantMessageId,
        conversationId,
        role: 'assistant',
        content: 'Hello! How can I help you today?',
      });

      // Verify messages
      const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
      });

      expect(conversationMessages).toHaveLength(2);
      expect(conversationMessages[0].role).toBe('user');
      expect(conversationMessages[1].role).toBe('assistant');
    });

    it('Step 3: User retrieves conversation with messages', async () => {
      const { conversations, messages } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');

      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });

      const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
      });

      expect(conversation).toBeDefined();
      expect(conversationMessages.length).toBeGreaterThan(0);
    });
  });

  describe('User Preferences Override Flow', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'preferences-user@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
    });

    it('Step 1: User updates chat name preference', async () => {
      const response = await request(app)
        .put('/api/auth/chat-name')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          chatName: 'PreferenceUser',
        });

      expect(response.status).toBe(200);
    });

    it('Step 2: User updates personality mode', async () => {
      const response = await request(app)
        .put('/api/auth/personality-mode')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          mode: 'playful',
        });

      expect(response.status).toBe(200);
      expect(response.body.personalityMode).toBe('playful');
    });

    it('Step 3: User updates gender preference', async () => {
      const response = await request(app)
        .put('/api/auth/gender')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          gender: 'non-binary',
        });

      expect(response.status).toBe(200);
      expect(response.body.gender).toBe('non-binary');
    });

    it('Step 4: User preferences are reflected in profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.chatName).toBe('PreferenceUser');
      expect(response.body.user.personalityMode).toBe('playful');
      expect(response.body.user.preferredGender).toBe('non-binary');
    });
  });

  describe('Authentication Flow Edge Cases', () => {
    it('Should handle multiple simultaneous logins', async () => {
      const user = {
        email: 'multilogin@example.com',
        password: 'password123',
      };

      // Register
      await request(app)
        .post('/api/auth/register')
        .send(user);

      // Login twice simultaneously
      const [login1, login2] = await Promise.all([
        request(app).post('/api/auth/login').send(user),
        request(app).post('/api/auth/login').send(user),
      ]);

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.accessToken).toBeDefined();
      expect(login2.body.accessToken).toBeDefined();
      
      // Tokens should be different
      expect(login1.body.accessToken).not.toBe(login2.body.accessToken);
    });

    it('Should handle logout of specific session', async () => {
      const user = {
        email: 'sessionlogout@example.com',
        password: 'password123',
      };

      // Register and login twice
      await request(app).post('/api/auth/register').send(user);
      const login1 = await request(app).post('/api/auth/login').send(user);
      const login2 = await request(app).post('/api/auth/login').send(user);

      // Logout first session
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${login1.body.accessToken}`)
        .send({ refreshToken: login1.body.refreshToken });

      // First refresh token should be invalid
      const refresh1 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: login1.body.refreshToken });

      expect(refresh1.status).toBe(401);

      // Second refresh token should still work
      const refresh2 = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: login2.body.refreshToken });

      expect(refresh2.status).toBe(200);
    });
  });

  describe('System Health During User Activity', () => {
    it('Should maintain healthy status during user operations', async () => {
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'health-test@example.com',
          password: 'password123',
        });

      const accessToken = registerResponse.body.accessToken;

      // Check health
      const healthResponse = await request(app)
        .get('/api/health');

      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.status).toBe('healthy');

      // Perform operations
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      // Health should still be good
      const healthResponse2 = await request(app)
        .get('/api/health');

      expect(healthResponse2.status).toBe(200);
      expect(healthResponse2.body.status).toBe('healthy');
    });
  });
});
