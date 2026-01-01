/**
 * Test Server Setup
 * Creates an isolated Express app instance for testing
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import path from 'path';

// Load test environment
config({ path: path.resolve(__dirname, '../../.env.test') });

export async function createTestApp() {
  const app = express();

  // CORS configuration for tests
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-API-Key'],
  };

  app.use(cors(corsOptions));
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Import routes using require for better test compatibility (Jest handles .ts)
  const authRoutes = require('../../server/presentation/routes/authRoutes');
  const chatRoutes = require('../../server/presentation/routes/chatRoutes');
  const conversationRoutes = require('../../server/presentation/routes/conversationRoutes');
  const settingsRoutes = require('../../server/presentation/routes/settingsRoutes');
  const adminRoutes = require('../../server/presentation/routes/adminRoutes');
  const healthRoutes = require('../../server/presentation/routes/healthRoutes');

  // Mount routes
  app.use('/api/auth', authRoutes.authRouter);
  app.use('/api/chat', chatRoutes.chatRouter);
  app.use('/api/conversations', conversationRoutes.conversationRouter);
  app.use('/api/settings', settingsRoutes.settingsRouter);
  app.use('/api/admin', adminRoutes.adminRouter);
  app.use('/api/health', healthRoutes.healthRouter);

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Test app error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}
