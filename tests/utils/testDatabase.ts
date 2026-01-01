import { db } from '../../server/infrastructure/database/index';
import { users, apiKeys, conversations, messages, apiUsage, emailQueue } from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function cleanDatabase() {
  try {
    await db.delete(messages);
    await db.delete(conversations);
    await db.delete(apiUsage);
    await db.delete(emailQueue);
    await db.delete(apiKeys);
    await db.delete(users);
  } catch (error) {
    console.error('Error cleaning database:', error);
  }
}

export async function createTestUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
  
  const userData = {
    id: userId,
    email: `test-${userId.slice(0, 8)}@example.com`,
    passwordHash: hashedPassword,
    displayName: 'Test User',
    subscriptionStatus: 'not_subscribed',
    credits: 50,
    accountSource: 'anplexa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };

  await db.insert(users).values(userData);
  return { ...userData, password: 'TestPassword123!' };
}

export async function createTestApiKey(userId: string) {
  const keyId = uuidv4();
  const rawKey = `tc_test_${uuidv4().replace(/-/g, '')}`;
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 12);

  await db.insert(apiKeys).values({
    id: keyId,
    name: 'Test API Key',
    keyHash,
    keyPrefix,
    userId,
    createdBy: userId,
    isActive: true,
    createdAt: new Date().toISOString()
  });

  return { id: keyId, key: rawKey, keyPrefix };
}
