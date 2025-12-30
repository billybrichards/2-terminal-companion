# Abionti Unrestricted API

## Overview
Abionti Unrestricted API is an adult AI companion API that connects to Ollama for LLM inference using the "darkplanet" model. It provides unrestricted AI conversations, user authentication, conversation management, subscription billing via Stripe, and a comprehensive admin dashboard.

**Product Name:** Abionti Unrestricted API
**Tagline:** Unrestricted AI Companion API for Developers

## Pricing
- **Free Tier:** 50 API calls per month, $0
- **Unlimited:** Unlimited API calls, $9.99/month

## Project Structure
```
server/
├── index.ts                           # Express app entry, middleware setup
├── config/
│   └── anplexaPrompt.ts              # Anplexa identity system prompt default
├── infrastructure/
│   ├── adapters/OllamaGateway.ts     # Ollama API client (streaming + non-streaming)
│   ├── auth/
│   │   ├── JWTAdapter.ts             # JWT token generation/verification
│   │   └── ApiKeyGenerator.ts        # API key generation with tc_ prefix
│   ├── email/
│   │   └── resendService.ts          # Resend email service (welcome, reset)
│   ├── stripe/
│   │   ├── stripeClient.ts           # Stripe SDK client (Replit connector)
│   │   ├── stripeService.ts          # Stripe API operations
│   │   ├── storage.ts                # Query stripe schema tables
│   │   └── webhookHandlers.ts        # Stripe webhook event handlers
│   └── database/index.ts             # PostgreSQL/SQLite Drizzle setup
└── presentation/
    ├── middleware/
    │   ├── authMiddleware.ts         # JWT auth guards
    │   ├── apiKeyMiddleware.ts       # API key validation
    │   ├── rateLimitMiddleware.ts    # IP-based rate limiting
    │   └── usageTrackingMiddleware.ts # API usage tracking
    └── routes/
        ├── authRoutes.ts             # Registration, login, tokens, chat-name
        ├── chatRoutes.ts             # AI chat (SSE streaming with system prompt)
        ├── adminRoutes.ts            # Admin API (users, prompts, stats)
        ├── stripeRoutes.ts           # Checkout, portal, subscription
        ├── landingRoutes.ts          # Marketing landing page
        ├── adminUiRoutes.ts          # Admin dashboard UI (users, usage, prompts)
        └── docsRoutes.ts             # Swagger UI API documentation
shared/
├── schema.ts                          # Schema switcher
├── schema.postgres.ts                 # PostgreSQL Drizzle schema
└── schema.sqlite.ts                   # SQLite Drizzle schema
scripts/
└── seed-stripe-products.ts           # Create Stripe products
```

## Development Commands
```bash
npm run dev              # Run server with hot reload (tsx watch)
npm run stripe:seed      # Create Stripe products (Free Tier, Unlimited)
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio for database inspection
npm run build            # Compile TypeScript
npm run start            # Run compiled server
```

## API Endpoints

### Public Pages
- `GET /` - Landing page with pricing and features
- `GET /signup` - User registration page
- `GET /login` - User login page
- `GET /forgot-password` - Password reset request page
- `GET /dashboard` - User dashboard (API keys, subscription, usage)
- `GET /docs` - Swagger UI API documentation
- `GET /release-notes` - Release notes

### Authentication API
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Complete password reset
- `GET /api/auth/me` - Current user info
- `PUT /api/auth/chat-name` - Update user's chat name for AI personalization
- `PUT /api/auth/personality-mode` - Update user's preferred AI personality mode
- `GET /api/auth/personality-modes` - List available personality modes
- `PUT /api/auth/gender` - Update user's preferred AI companion gender
- `GET /api/auth/genders` - List available gender options

### Chat (API key or JWT required)
- `POST /api/chat` - Send message (SSE streaming)
- `GET /api/chat/config` - Get companion config

### Conversations (JWT required)
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation with messages
- `DELETE /api/conversations/:id` - Delete conversation

### Stripe (JWT required for most)
- `GET /api/stripe/publishable-key` - Get Stripe publishable key
- `GET /api/stripe/products` - List products with prices
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Create customer portal
- `GET /api/stripe/subscription` - Get user's subscription
- `POST /api/stripe/webhook` - Stripe webhook (system)

### Admin (Admin JWT required)
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/dashboard/usage` - Usage analytics
- `GET /admin/dashboard/usage/export` - Export usage CSV
- `GET /admin/system-prompts` - System prompt management UI
- `/api/admin/*` - Admin API endpoints

### System Prompts Admin API
- `GET /api/admin/system-prompts` - List all prompts with versions
- `GET /api/admin/system-prompts/:id` - Get specific prompt
- `POST /api/admin/system-prompts` - Create new prompt version
- `PUT /api/admin/system-prompts/:id/activate` - Activate a prompt
- `DELETE /api/admin/system-prompts/:id` - Delete a prompt

### Health
- `GET /api/health` - Server health check

## Database
Uses PostgreSQL with Drizzle ORM (falls back to SQLite if DATABASE_URL not set).

**Key tables:**
- `users` - User accounts with stripe_customer_id, stripe_subscription_id, chatName, personalityMode, preferredGender
- `api_keys` - API keys with tc_ prefix, hashed storage
- `api_usage` - Per-request usage tracking
- `api_usage_daily` - Daily aggregated usage
- `companion_config` - AI companion settings
- `conversations`, `messages` - Chat history
- `system_prompts` - AI system prompts with version control
- `stripe.*` - Stripe data (managed by stripe-replit-sync)

## Environment Variables
**Required secrets (in Replit Secrets):**
- `JWT_SECRET` - Secret for signing tokens
- `WEBHOOK_SECRET` - Secret for authenticating webhook requests
- `ADMIN_UI_PASSWORD` - Password for admin dashboard login
- `OLLAMA_BASE_URL` - Ollama API endpoint
- `OLLAMA_API_KEY` - API key for Ollama (optional)

**Auto-configured:**
- `DATABASE_URL` - PostgreSQL connection string
- `REPLIT_DOMAINS` - Domain for webhooks
- Stripe credentials via Replit connector

## Security Features
- CORS restricted to specific origins
- Content Security Policy via Helmet
- Rate limiting on auth routes (10 login/15min, 5 register/hour)
- API key rate limiting (20 attempts/15min)
- HMAC-signed admin session tokens
- All secrets in encrypted Replit Secrets

## Stripe Integration
- Products: Free Tier ($0), Unlimited ($9.99/mo)
- Checkout flow with automatic API key generation
- Customer portal for subscription management
- Webhook handling for subscription events
- Stripe data synced to PostgreSQL via stripe-replit-sync

## Design Theme
- Background: #0a0a0a (dark)
- Accent: #ff6b35 (orange)
- Responsive, mobile-friendly

## Recent Changes
- 2025-12-30: Added AI companion gender preference (male/female/non-binary/custom) with PUT /api/auth/gender endpoint
- 2025-12-30: Added dynamic personality mode system (nurturing/playful/dominant) with per-request or persistent user preference
- 2025-12-30: Added system prompt management with version control (admin UI at /admin/system-prompts)
- 2025-12-30: Added chatName field for personalized AI addressing (PUT /api/auth/chat-name)
- 2025-12-30: Anplexa identity system prompt now prepended to all chat requests
- 2025-12-30: Added Resend email integration (welcome, password reset)
- 2025-12-28: Added Stripe integration with checkout flow and subscriptions
- 2025-12-28: Created Abionti landing page with pricing
- 2025-12-28: Added API usage tracking and analytics dashboard
- 2025-12-28: Enhanced API documentation with code examples
- 2025-12-28: Added API key generation on subscription
- 2025-12-27: Security audit - moved secrets, added CORS/CSP/rate limiting
- 2025-12-27: Initial Replit setup with PostgreSQL
