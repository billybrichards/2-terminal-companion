import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

// Load environment variables
config();

import { runMigrations } from 'stripe-replit-sync';
import { db, initializeDatabase } from './infrastructure/database/index.js';
import { getStripeSync } from './infrastructure/stripe/stripeClient.js';
import { WebhookHandlers } from './infrastructure/stripe/webhookHandlers.js';
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
import { landingRouter } from './presentation/routes/landingRoutes.js';
import { stripeRouter } from './presentation/routes/stripeRoutes.js';
import { funnelRouter } from './presentation/routes/funnelRoutes.js';
import { publicFunnelRouter } from './presentation/routes/publicFunnelRoutes.js';
import { crmRouter } from './presentation/routes/crmRoutes.js';
import { apiKeyMiddleware, optionalApiKeyMiddleware } from './presentation/middleware/apiKeyMiddleware.js';
import { usageTrackingMiddleware } from './presentation/middleware/usageTrackingMiddleware.js';
import { startEmailProcessor } from './infrastructure/email/emailScheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configurations
const strictCorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5000',
      'http://localhost:3000',
      'https://anplexa.com',
      'https://www.anplexa.com',
    ].filter(Boolean) as string[];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    if (origin.includes('.replit.dev') || origin.includes('.repl.co') || origin.includes('.replit.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-API-Key', 'stripe-signature'],
};

const permissiveCorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-API-Key', 'stripe-signature'],
};

// Apply permissive CORS to admin routes (password is the security gate)
app.use('/admin', cors(permissiveCorsOptions));

// Apply permissive CORS to API routes (API key is the security gate)
app.use('/api', cors(permissiveCorsOptions));

// Apply permissive CORS to public pages
app.use('/docs', cors(permissiveCorsOptions));
app.use('/release-notes', cors(permissiveCorsOptions));

// Default permissive CORS for landing page and other routes
app.use(cors(permissiveCorsOptions));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.OLLAMA_BASE_URL || ''].filter(Boolean),
      fontSrc: ["'self'", "https://unpkg.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cookieParser());

// CRITICAL: Stripe webhook route MUST be registered BEFORE express.json()
// Webhook needs raw Buffer, not parsed JSON
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

// Now apply JSON middleware for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', usageTrackingMiddleware, chatRouter);
app.use('/api/conversations', conversationRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/health', healthRouter);
app.use('/api/webhooks', webhookRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/funnel', funnelRouter);
app.use('/api', publicFunnelRouter);
app.use('/docs', docsRouter);
app.use('/admin', adminUiRouter);
app.use('/admin/crm', crmRouter);
app.use('/release-notes', releaseNotesRouter);

// Landing page
app.use('/', landingRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('DATABASE_URL not set, skipping Stripe initialization');
    return;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Setting up managed webhook...');
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const webhookUrl = `${webhookBaseUrl}/api/stripe/webhook`;
    const result = await stripeSync.findOrCreateManagedWebhook(webhookUrl);
    if (result?.webhook) {
      console.log(`Webhook configured: ${result.webhook.url}`);
    } else {
      console.log(`Webhook endpoint registered: ${webhookUrl}`);
    }

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => {
        console.log('Stripe data synced');
      })
      .catch((err: Error) => {
        console.error('Error syncing Stripe data:', err);
      });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

// Initialize database and start server
async function start() {
  try {
    // Initialize database
    await initializeDatabase();

    // Initialize Stripe (after database is ready)
    await initStripe();

    // Start email processor for scheduled emails
    startEmailProcessor(5);

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
      console.log(`   POST /api/stripe/webhook`);
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
