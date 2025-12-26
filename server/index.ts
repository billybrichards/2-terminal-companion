import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

// Load environment variables
config();

import { db, initializeDatabase } from './infrastructure/database/index.js';
import { authRouter } from './presentation/routes/authRoutes.js';
import { chatRouter } from './presentation/routes/chatRoutes.js';
import { conversationRouter } from './presentation/routes/conversationRoutes.js';
import { settingsRouter } from './presentation/routes/settingsRoutes.js';
import { adminRouter } from './presentation/routes/adminRoutes.js';
import { healthRouter } from './presentation/routes/healthRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/health', healthRouter);

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
    initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Terminal Companion API running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: SQLite (./data/companion.db)`);
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
