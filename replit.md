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
- `/api/admin/*` - Companion config, user management, Ollama testing (admin only)
- `/api/health/*` - Server, database, Ollama connection checks

## Database
Uses PostgreSQL with Drizzle ORM (falls back to SQLite if DATABASE_URL not set).

Key tables: `users`, `companion_config`, `conversations`, `messages`, `sessions`, `user_preferences`, `user_feedback`.

## Environment Variables
Required secrets:
- `JWT_SECRET` - Secret for signing tokens (set this in secrets)
- `OLLAMA_BASE_URL` - Ollama API endpoint (optional for basic auth functionality)
- `OLLAMA_API_KEY` - API key for Ollama (optional)

Auto-configured:
- `DATABASE_URL` - PostgreSQL connection string (Replit managed)
- `PORT` - Server port (set to 5000)

## Recent Changes
- 2025-12-27: Initial Replit setup, configured to use port 5000, connected to Replit PostgreSQL database
