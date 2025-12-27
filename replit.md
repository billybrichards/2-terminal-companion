# Terminal Companion API

## Overview
Terminal Companion is an AI chat backend API that connects to Ollama for LLM inference. It provides user authentication, conversation management, and admin-configurable AI companion settings.

## Project Structure
```
server/
├── index.ts                           # Express app entry, middleware setup
├── infrastructure/
│   ├── adapters/OllamaGateway.ts     # Ollama API client (streaming + non-streaming)
│   ├── auth/JWTAdapter.ts            # JWT token generation/verification, password hashing
│   └── database/index.ts             # PostgreSQL/SQLite Drizzle setup, schema initialization
└── presentation/
    ├── middleware/authMiddleware.ts   # Auth guards (required, optional, admin)
    └── routes/                        # Express routers by domain
shared/
├── schema.ts                          # Schema switcher
├── schema.postgres.ts                 # PostgreSQL Drizzle schema
└── schema.sqlite.ts                   # SQLite Drizzle schema
```

## Development Commands
```bash
npm run dev              # Run server with hot reload (tsx watch)
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio for database inspection
npm run build            # Compile TypeScript
npm run start            # Run compiled server
```

## API Endpoints
- `/api/auth/*` - Register, login, refresh, logout, me
- `/api/chat` - Send message (SSE streaming), get config
- `/api/conversations/*` - CRUD for conversation history
- `/api/settings/*` - User preferences (storage, gender, response style, theme)
- `/api/admin/*` - Companion config, user management, billing (subscription/credits), Ollama testing (admin only)
- `/api/webhooks/*` - External webhook endpoints for subscription and credits updates (X-Webhook-Secret auth)
- `/api/health/*` - Server, database, Ollama connection checks
- `/docs` - Swagger UI API documentation

## Database
Uses PostgreSQL with Drizzle ORM (falls back to SQLite if DATABASE_URL not set).

Key tables: `users`, `companion_config`, `conversations`, `messages`, `sessions`, `user_preferences`, `user_feedback`.

## Environment Variables
Required secrets:
- `JWT_SECRET` - Secret for signing tokens
- `WEBHOOK_SECRET` - Secret for authenticating webhook requests (X-Webhook-Secret header)
- `OLLAMA_BASE_URL` - Ollama API endpoint (optional for basic auth functionality)
- `OLLAMA_API_KEY` - API key for Ollama (optional)

Auto-configured:
- `DATABASE_URL` - PostgreSQL connection string (Replit managed)
- `PORT` - Server port (set to 5000)

## Webhook Integration
External services (like Stripe) can update user billing via webhooks:
- `POST /api/webhooks/subscription` - Update subscription status
- `POST /api/webhooks/credits` - Update credits (set/add/subtract)

All webhook requests require the `X-Webhook-Secret` header with the configured WEBHOOK_SECRET value.

## Recent Changes
- 2025-12-27: Added webhook endpoints for subscription/credits with X-Webhook-Secret authentication
- 2025-12-27: Added admin billing endpoints (subscription status, credits management)
- 2025-12-27: Added Swagger UI documentation at /docs
- 2025-12-27: Initial Replit setup, configured to use port 5000, connected to Replit PostgreSQL database
