/**
 * Integration Tests
 * Tests for integrated system components
 * Following Clean Architecture: testing how layers work together
 */

import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, createTestCompanionConfig, createTestUser } from '../../utils/testDatabase';
import { createTestApp } from '../../utils/testServer';

describe('Integration Tests', () => {
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

  describe('Authentication + Database Integration', () => {
    it('should persist user data correctly through registration', async () => {
      const { users } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const userEmail = 'integration@example.com';
      
      // Register via API
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: userEmail,
          password: 'password123',
          displayName: 'Integration Test',
        });

      expect(response.status).toBe(201);

      // Verify in database
      const dbUser = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
      });

      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(userEmail);
      expect(dbUser.displayName).toBe('Integration Test');
      expect(dbUser.passwordHash).toBeDefined();
      expect(dbUser.passwordHash).not.toBe('password123');
    });

    it('should create user preferences on registration', async () => {
      const { userPreferences } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'prefs-test@example.com',
          password: 'password123',
        });

      const userId = response.body.user.id;

      // Verify preferences exist
      const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      expect(prefs).toBeDefined();
      expect(prefs.userId).toBe(userId);
    });

    it('should create session on login', async () => {
      const { sessions } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'session-test@example.com',
          password: 'password123',
        });

      const userId = registerResponse.body.user.id;

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'password123',
        });

      // Verify session exists
      const userSessions = await db.query.sessions.findMany({
        where: eq(sessions.userId, userId),
      });

      expect(userSessions.length).toBeGreaterThan(0);
      expect(userSessions[0].refreshToken).toBeDefined();
    });
  });

  describe('JWT + Database Integration', () => {
    it('should validate tokens match database records', async () => {
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { sessions } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'password123',
        });

      const { refreshToken } = loginResponse.body;

      // Verify token in database
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.refreshToken, refreshToken),
      });

      expect(session).toBeDefined();
      expect(session.refreshToken).toBe(refreshToken);

      // Verify token is valid
      const payload = jwtAdapter.verifyRefreshToken(refreshToken);
      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(session.userId);
    });

    it('should invalidate tokens on logout', async () => {
      const { sessions } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'password123',
        });

      const { accessToken, refreshToken } = loginResponse.body;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      // Verify session removed from database
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.refreshToken, refreshToken),
      });

      expect(session).toBeUndefined();
    });
  });

  describe('User Preferences Integration', () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'preferences-integration@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should update and retrieve chat name', async () => {
      const { users } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Update via API
      await request(app)
        .put('/api/auth/chat-name')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ chatName: 'TestName' });

      // Verify in database
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      expect((user as any).chatName).toBe('TestName');

      // Verify via API
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meResponse.body.user.chatName).toBe('TestName');
    });

    it('should update and retrieve personality mode', async () => {
      const { users } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Update via API
      await request(app)
        .put('/api/auth/personality-mode')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ mode: 'dominant' });

      // Verify in database
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      expect((user as any).personalityMode).toBe('dominant');

      // Verify via API
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(meResponse.body.user.personalityMode).toBe('dominant');
    });
  });

  describe('Conversation + Messages Integration', () => {
    let userId: string;
    let conversationId: string;

    beforeAll(async () => {
      const testUser = await createTestUser(db, {
        email: 'conversation-integration@example.com',
        password: 'password123',
      });
      userId = testUser.userId;
    });

    it('should create conversation with messages', async () => {
      const { conversations, messages } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { eq } = await import('drizzle-orm');
      
      // Create conversation
      conversationId = jwtAdapter.generateId();
      await db.insert(conversations).values({
        id: conversationId,
        userId,
        title: 'Integration Test Conversation',
      });

      // Add messages
      const messageIds = [];
      for (let i = 0; i < 3; i++) {
        const messageId = jwtAdapter.generateId();
        messageIds.push(messageId);
        await db.insert(messages).values({
          id: messageId,
          conversationId,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`,
        });
      }

      // Verify conversation
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });

      expect(conversation).toBeDefined();
      expect(conversation.userId).toBe(userId);

      // Verify messages
      const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
      });

      expect(conversationMessages).toHaveLength(3);
      expect(conversationMessages[0].role).toBe('user');
      expect(conversationMessages[1].role).toBe('assistant');
    });

    it('should maintain referential integrity', async () => {
      const { conversations, messages } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Verify messages reference conversation
      const conversationMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
      });

      expect(conversationMessages.every(m => m.conversationId === conversationId)).toBe(true);

      // Verify conversation references user
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });

      expect(conversation?.userId).toBe(userId);
    });
  });

  describe('Multi-User Isolation', () => {
    it('should isolate conversations between users', async () => {
      const { conversations } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { eq } = await import('drizzle-orm');
      
      // Create two users
      const user1 = await createTestUser(db, {
        email: 'user1-isolation@example.com',
      });
      const user2 = await createTestUser(db, {
        email: 'user2-isolation@example.com',
      });

      // Create conversations for each user
      const conv1Id = jwtAdapter.generateId();
      await db.insert(conversations).values({
        id: conv1Id,
        userId: user1.userId,
        title: 'User 1 Conversation',
      });

      const conv2Id = jwtAdapter.generateId();
      await db.insert(conversations).values({
        id: conv2Id,
        userId: user2.userId,
        title: 'User 2 Conversation',
      });

      // Verify user 1 can only see their conversations
      const user1Conversations = await db.query.conversations.findMany({
        where: eq(conversations.userId, user1.userId),
      });

      expect(user1Conversations).toHaveLength(1);
      expect(user1Conversations[0].id).toBe(conv1Id);

      // Verify user 2 can only see their conversations
      const user2Conversations = await db.query.conversations.findMany({
        where: eq(conversations.userId, user2.userId),
      });

      expect(user2Conversations).toHaveLength(1);
      expect(user2Conversations[0].id).toBe(conv2Id);
    });

    it('should isolate sessions between users', async () => {
      const { sessions } = await import('../../../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Login as user1
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user1-isolation@example.com',
          password: 'password123',
        });

      // Login as user2
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user2-isolation@example.com',
          password: 'password123',
        });

      // Verify different refresh tokens
      expect(login1.body.refreshToken).not.toBe(login2.body.refreshToken);

      // Verify tokens belong to correct users
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const payload1 = jwtAdapter.verifyRefreshToken(login1.body.refreshToken);
      const payload2 = jwtAdapter.verifyRefreshToken(login2.body.refreshToken);

      expect(payload1?.sub).not.toBe(payload2?.sub);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database constraint violations', async () => {
      const { users } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      
      const email = 'constraint-test@example.com';
      
      // Create first user directly in DB
      await db.insert(users).values({
        id: jwtAdapter.generateId(),
        email,
        passwordHash: await jwtAdapter.hashPassword('password123'),
        displayName: 'First User',
      });

      // Try to register with same email via API
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'password456',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should handle invalid foreign key references', async () => {
      const { messages } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      
      const invalidConversationId = 'nonexistent-conversation-id';
      
      // Try to create message with invalid conversation ID
      await expect(
        db.insert(messages).values({
          id: jwtAdapter.generateId(),
          conversationId: invalidConversationId,
          role: 'user',
          content: 'Test message',
        })
      ).rejects.toThrow();
    });
  });
});
