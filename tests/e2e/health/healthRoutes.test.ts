/**
 * Health Routes E2E Tests
 * End-to-end tests for health check endpoints
 * Following Clean Architecture: testing interface adapters
 */

import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, createTestCompanionConfig } from '../../utils/testDatabase';
import { createTestApp } from '../../utils/testServer';

describe('Health Routes E2E', () => {
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

  describe('GET /api/health', () => {
    it('should return server health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    it('should include timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    it('should return current environment', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.environment).toBe('test');
    });
  });

  describe('GET /api/health/database', () => {
    it('should return database connection status', async () => {
      const response = await request(app)
        .get('/api/health/database');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'connected');
      expect(response.body).toHaveProperty('hasConfig');
      expect(response.body).toHaveProperty('companionName');
    });

    it('should show companion config exists', async () => {
      const response = await request(app)
        .get('/api/health/database');

      expect(response.status).toBe(200);
      expect(response.body.hasConfig).toBe(true);
      expect(response.body.companionName).toBe('Test Companion');
    });
  });

  describe('GET /api/health/ollama', () => {
    it('should check Ollama connection', async () => {
      const response = await request(app)
        .get('/api/health/ollama');

      // Ollama might not be running in test environment
      // Just check that endpoint responds
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('baseUrl');
    });

    it('should include baseUrl in response', async () => {
      const response = await request(app)
        .get('/api/health/ollama');

      expect(response.body.baseUrl).toBeDefined();
    });
  });

  describe('GET /api/health/full', () => {
    it('should return full system health check', async () => {
      const response = await request(app)
        .get('/api/health/full');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('checks');
    });

    it('should check all components', async () => {
      const response = await request(app)
        .get('/api/health/full');

      expect(response.body.checks).toHaveProperty('server');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('ollama');
    });

    it('should mark server as healthy', async () => {
      const response = await request(app)
        .get('/api/health/full');

      expect(response.body.checks.server.status).toBe('healthy');
    });

    it('should mark database as healthy', async () => {
      const response = await request(app)
        .get('/api/health/full');

      expect(response.body.checks.database.status).toBe('healthy');
    });

    it('should return degraded status if any component unhealthy', async () => {
      const response = await request(app)
        .get('/api/health/full');

      // If Ollama is not running, status should be degraded
      if (response.body.checks.ollama.status === 'unhealthy') {
        expect(response.body.status).toBe('degraded');
        expect(response.status).toBe(503);
      }
    });
  });

  describe('Health Check Consistency', () => {
    it('should return consistent health status across calls', async () => {
      const response1 = await request(app).get('/api/health');
      const response2 = await request(app).get('/api/health');

      expect(response1.status).toBe(response2.status);
      expect(response1.body.status).toBe(response2.body.status);
    });

    it('should return different timestamps for each call', async () => {
      const response1 = await request(app).get('/api/health');
      await new Promise(resolve => setTimeout(resolve, 10));
      const response2 = await request(app).get('/api/health');

      expect(response1.body.timestamp).not.toBe(response2.body.timestamp);
    });
  });
});
