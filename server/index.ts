import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

// Load environment variables
config();

import { db, initializeDatabase } from './infrastructure/database/index.js';
import { authRouter } from './presentation/routes/authRoutes.js';
import { chatRouter } from './presentation/routes/chatRoutes.js';
import { conversationRouter } from './presentation/routes/conversationRoutes.js';
import { settingsRouter } from './presentation/routes/settingsRoutes.js';
import { adminRouter } from './presentation/routes/adminRoutes.js';
import { adminUiRouter } from './presentation/routes/adminUiRoutes.js';
import { healthRouter } from './presentation/routes/healthRoutes.js';
import { docsRouter } from './presentation/routes/docsRoutes.js';
import { webhookRouter } from './presentation/routes/webhookRoutes.js';
import { releaseNotesRouter } from './presentation/routes/releaseNotesRoutes.js';
import { apiKeyMiddleware, optionalApiKeyMiddleware } from './presentation/middleware/apiKeyMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS must be first to handle preflight requests
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    /\.replit\.dev$/,
    /\.repl\.co$/,
    'http://localhost:5000',
    'http://localhost:3000',
  ].filter(Boolean) as (string | RegExp)[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-API-Key'],
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.OLLAMA_BASE_URL || ''].filter(Boolean),
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/health', healthRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/docs', docsRouter);
app.use('/admin', adminUiRouter);
app.use('/release-notes', releaseNotesRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Terminal Companion API',
    version: '0.1.0',
    status: 'running',
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Initialize database and start server
async function start() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');
      console.log(`\n🚀 Terminal Companion API running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${isPostgres ? 'PostgreSQL' : 'SQLite (./data/companion.db)'}`);
      console.log(`🤖 Ollama: ${process.env.OLLAMA_BASE_URL}`);
      console.log(`\n📡 Endpoints:`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/chat`);
      console.log(`   GET  /api/health`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
