# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terminal Companion is an AI chat backend API that connects to Ollama for LLM inference. It provides user authentication, conversation management, and admin-configurable AI companion settings.

## Commands

```bash
# Development
npm run dev              # Run server with hot reload (tsx watch)

# Database
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push schema changes to SQLite
npm run db:studio        # Open Drizzle Studio for database inspection

# Production
npm run build            # Compile TypeScript
npm run start            # Run compiled server
```

## Architecture

### Backend Structure (Express + TypeScript)

```
server/
├── index.ts                           # Express app entry, middleware setup
├── infrastructure/
│   ├── adapters/OllamaGateway.ts     # Ollama API client (streaming + non-streaming)
│   ├── auth/JWTAdapter.ts            # JWT token generation/verification, password hashing
│   └── database/index.ts             # SQLite/Drizzle setup, schema initialization
└── presentation/
    ├── middleware/authMiddleware.ts   # Auth guards (required, optional, admin)
    └── routes/                        # Express routers by domain
shared/
└── schema.ts                          # Drizzle ORM schema (single source of truth)
```

### Key Patterns

- **OllamaGateway**: Singleton pattern for LLM communication. Uses Mistral Instruct format for prompts. Supports both streaming (`generateStream`) and non-streaming (`generate`) responses.

- **Authentication**: JWT access/refresh token pair. First registered user becomes admin. Token payload includes `sub` (userId), `email`, `isAdmin`.

- **Companion Config**: Single-row `companion_config` table stores AI personality settings (name, system prompt template, response styles). Uses placeholder syntax: `{{companion_name}}`, `{{gender_persona}}`, `{{length_instruction}}`, `{{style_instruction}}`.

- **User Preferences**: Override companion defaults per-user. Stored in `user_preferences` table.

### API Routes

- `/api/auth/*` - Register, login, refresh, logout, me
- `/api/chat` - Send message (SSE streaming), get config
- `/api/conversations/*` - CRUD for conversation history
- `/api/settings/*` - User preferences (storage, gender, response style, theme)
- `/api/admin/*` - Companion config, user management, Ollama testing (admin only)
- `/api/health/*` - Server, database, Ollama connection checks

### Database

SQLite with Drizzle ORM. Database file at `./data/companion.db`. Schema defined in `shared/schema.ts` with inline SQL in `database/index.ts` for table creation.

Key tables: `users`, `companion_config`, `conversations`, `messages`, `sessions`, `user_preferences`, `user_feedback`.

## Environment Variables

Required in `.env`:
- `OLLAMA_BASE_URL` - Ollama API endpoint
- `OLLAMA_API_KEY` - API key for Ollama
- `JWT_SECRET` - Secret for signing tokens

Optional:
- `PORT` (default: 3001)
- `OLLAMA_GENERAL_MODEL` (default: darkplanet)
- `OLLAMA_LONGFORM_MODEL` (default: darkplanet)
- `JWT_ACCESS_EXPIRES` (default: 15m)
- `JWT_REFRESH_EXPIRES` (default: 7d)
