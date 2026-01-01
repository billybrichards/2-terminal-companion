/**
 * Test Database Utilities
 * Utilities for setting up and tearing down test databases following Clean Architecture
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load test environment
config({ path: path.resolve(__dirname, '../../.env.test') });

const TEST_DB_PATH = './data/test.db';

/**
 * Initialize a clean test database
 */
export async function setupTestDatabase(): Promise<any> {
  // Remove existing test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Ensure data directory exists
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize database - importing .ts files in Jest
  const database = require('../../server/infrastructure/database/index');
  await database.initializeDatabase();
  
  return database.db;
}

/**
 * Clean up test database
 */
export async function teardownTestDatabase(): Promise<void> {
  // Give time for connections to close
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Remove test database
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch (error) {
      // Ignore errors during cleanup
      console.warn('Could not remove test database:', error);
    }
  }
}

/**
 * Create a test user
 */
export async function createTestUser(db: any, userData?: {
  email?: string;
  password?: string;
  displayName?: string;
  isAdmin?: boolean;
}) {
  const auth = require('../../server/infrastructure/auth/JWTAdapter');
  const jwtAdapter = auth.jwtAdapter;
  const schema = require('../../shared/schema');
  const { users, userPreferences } = schema;
  
  const email = userData?.email || 'test@example.com';
  const password = userData?.password || 'password123';
  const displayName = userData?.displayName || 'Test User';
  const isAdmin = userData?.isAdmin || false;
  
  const userId = jwtAdapter.generateId();
  const passwordHash = await jwtAdapter.hashPassword(password);
  
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    displayName,
    isAdmin,
  });
  
  await db.insert(userPreferences).values({
    id: jwtAdapter.generateId(),
    userId,
  });
  
  return { userId, email, password, displayName, isAdmin };
}

/**
 * Create test companion config
 */
export async function createTestCompanionConfig(db: any) {
  const schema = require('../../shared/schema');
  const { companionConfig } = schema;
  
  await db.insert(companionConfig).values({
    id: 'default',
    name: 'Test Companion',
    systemPromptTemplate: 'You are {{companion_name}}, a helpful assistant. {{gender_persona}} {{length_instruction}} {{style_instruction}}',
    defaultGender: 'female',
    defaultLength: 'moderate',
    defaultStyle: 'thoughtful',
    generalModel: 'test-model',
    longFormModel: 'test-model',
    temperature: 0.8,
    useLongFormForDetailed: true,
  });
}

/**
 * Generate auth tokens for testing
 */
export async function generateTestTokens(userId: string, email: string, isAdmin: boolean = false) {
  const auth = require('../../server/infrastructure/auth/JWTAdapter');
  const jwtAdapter = auth.jwtAdapter;
  return jwtAdapter.generateTokenPair(userId, email, isAdmin);
}
