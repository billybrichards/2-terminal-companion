import { Router } from 'express';
import { db } from '../../infrastructure/database/index.js';
import { getOllamaGateway } from '../../infrastructure/adapters/OllamaGateway.js';
import { companionConfig } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

export const healthRouter = Router();

// GET /api/health - Server health check
healthRouter.get('/', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/health/ollama - Ollama connection status
healthRouter.get('/ollama', async (req, res) => {
  try {
    const ollama = getOllamaGateway();
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    const generalModel = config?.generalModel || process.env.OLLAMA_GENERAL_MODEL || 'darkplanet-general:latest';

    // Quick health check with minimal generation
    const startTime = Date.now();
    await ollama.generate({
      model: generalModel,
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 5,
    });
    const latency = Date.now() - startTime;

    res.json({
      status: 'connected',
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: generalModel,
      latencyMs: latency,
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      baseUrl: process.env.OLLAMA_BASE_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/health/database - Database connection status
healthRouter.get('/database', async (req, res) => {
  try {
    // Simple query to check database
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    res.json({
      status: 'connected',
      hasConfig: !!config,
      companionName: config?.name || 'Not configured',
    });
  } catch (error) {
    res.status(503).json({
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/health/full - Full system health check
healthRouter.get('/full', async (req, res) => {
  const results = {
    server: { status: 'healthy' as string },
    database: { status: 'unknown' as string, error: undefined as string | undefined },
    ollama: { status: 'unknown' as string, error: undefined as string | undefined },
  };

  // Check database
  try {
    await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });
    results.database.status = 'healthy';
  } catch (error) {
    results.database.status = 'unhealthy';
    results.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Check Ollama
  try {
    const ollama = getOllamaGateway();
    await ollama.generate({
      model: process.env.OLLAMA_GENERAL_MODEL || 'darkplanet-general:latest',
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 5,
    });
    results.ollama.status = 'healthy';
  } catch (error) {
    results.ollama.status = 'unhealthy';
    results.ollama.error = error instanceof Error ? error.message : 'Unknown error';
  }

  const allHealthy = results.database.status === 'healthy' && results.ollama.status === 'healthy';

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: results,
  });
});
