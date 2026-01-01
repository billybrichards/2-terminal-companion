/**
 * Database Infrastructure Tests
 * Tests for database connection and initialization
 * Following Clean Architecture: testing infrastructure layer
 */

import { setupTestDatabase, teardownTestDatabase } from '../../utils/testDatabase';

describe('Database Infrastructure', () => {
  let db: any;

  beforeAll(async () => {
    db = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Database Connection', () => {
    it('should initialize database successfully', () => {
      expect(db).toBeDefined();
    });

    it('should allow queries to be executed', async () => {
      const { users } = await import('../../../shared/schema');
      const result = await db.select().from(users);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Database Schema', () => {
    it('should have users table', async () => {
      const { users } = await import('../../../shared/schema');
      const result = await db.select().from(users);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have companion_config table', async () => {
      const { companionConfig } = await import('../../../shared/schema');
      const result = await db.select().from(companionConfig);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have conversations table', async () => {
      const { conversations } = await import('../../../shared/schema');
      const result = await db.select().from(conversations);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have messages table', async () => {
      const { messages } = await import('../../../shared/schema');
      const result = await db.select().from(messages);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have sessions table', async () => {
      const { sessions } = await import('../../../shared/schema');
      const result = await db.select().from(sessions);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have user_preferences table', async () => {
      const { userPreferences } = await import('../../../shared/schema');
      const result = await db.select().from(userPreferences);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Database Operations', () => {
    it('should insert and retrieve user', async () => {
      const { users } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { eq } = await import('drizzle-orm');
      
      const userId = jwtAdapter.generateId();
      const testUser = {
        id: userId,
        email: 'dbtest@example.com',
        passwordHash: await jwtAdapter.hashPassword('password123'),
        displayName: 'DB Test User',
      };
      
      await db.insert(users).values(testUser);
      
      const retrieved = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      expect(retrieved).toBeDefined();
      expect(retrieved.email).toBe(testUser.email);
      expect(retrieved.displayName).toBe(testUser.displayName);
    });

    it('should enforce unique email constraint', async () => {
      const { users } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      
      const email = 'unique-test@example.com';
      const user1 = {
        id: jwtAdapter.generateId(),
        email,
        passwordHash: await jwtAdapter.hashPassword('password123'),
        displayName: 'User 1',
      };
      
      const user2 = {
        id: jwtAdapter.generateId(),
        email,
        passwordHash: await jwtAdapter.hashPassword('password456'),
        displayName: 'User 2',
      };
      
      await db.insert(users).values(user1);
      
      // Second insert should fail due to unique constraint
      await expect(db.insert(users).values(user2)).rejects.toThrow();
    });

    it('should handle foreign key relationships', async () => {
      const { users, conversations, messages } = await import('../../../shared/schema');
      const { jwtAdapter } = await import('../../../server/infrastructure/auth/JWTAdapter');
      const { eq } = await import('drizzle-orm');
      
      // Create user
      const userId = jwtAdapter.generateId();
      await db.insert(users).values({
        id: userId,
        email: 'fk-test@example.com',
        passwordHash: await jwtAdapter.hashPassword('password123'),
        displayName: 'FK Test User',
      });
      
      // Create conversation
      const conversationId = jwtAdapter.generateId();
      await db.insert(conversations).values({
        id: conversationId,
        userId,
        title: 'Test Conversation',
      });
      
      // Create message
      const messageId = jwtAdapter.generateId();
      await db.insert(messages).values({
        id: messageId,
        conversationId,
        role: 'user',
        content: 'Test message',
      });
      
      // Verify relationships
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });
      
      const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      });
      
      expect(conversation.userId).toBe(userId);
      expect(message.conversationId).toBe(conversationId);
    });
  });
});
