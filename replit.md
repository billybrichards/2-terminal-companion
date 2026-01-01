# Abionti Unrestricted API

### Overview
Abionti Unrestricted API is an adult AI companion API that connects to Ollama for LLM inference using the "darkplanet" model. It provides unrestricted AI conversations, user authentication, conversation management, subscription billing via Stripe, and a comprehensive admin dashboard. The project aims to offer a robust and scalable platform for developers to integrate an unrestricted AI companion into their applications, with features like personalized AI interactions based on user preferences and an advanced CRM for user engagement.

### User Preferences
No explicit user preferences were provided in the original `replit.md` file.

### System Architecture
The project is built with Node.js and Express, utilizing a clean architecture with clear separation of concerns (infrastructure, presentation).

**UI/UX Decisions:**
- **Admin Dashboard:** Provides interfaces for user management, usage analytics, system prompt management, CRM, and funnel key management.
- **Landing Page:** Marketing-focused page detailing pricing and features.
- **User Dashboard:** Allows users to manage API keys, subscriptions, and view usage.
- **Design Theme:** Dark background (`#0a0a0a`) with an orange accent (`#ff6b35`), designed to be responsive and mobile-friendly.

**Technical Implementations:**
- **Database:** PostgreSQL with Drizzle ORM (falls back to SQLite). Key tables include `users`, `api_keys`, `funnel_api_keys`, `api_usage`, `conversations`, `messages`, `system_prompts`, `companion_config`, `email_queue`, and `email_logs`.
- **Authentication:** JWT for user sessions and API Keys for API access. Funnel API keys are also supported for external integrations.
- **AI Integration:** Connects to Ollama for LLM inference, using a customizable "Anplexa" identity system prompt. Supports streaming (SSE) and non-streaming chat.
- **Conversation Management:** Stores and retrieves user conversations and messages.
- **Personalization:**
    - Users can set a `chatName` for personalized AI addressing.
    - Supports dynamic personality modes (e.g., nurturing, playful, dominant) and preferred AI companion gender (male/female/non-binary/custom).
    - **Amplexa Funnel Integration:** Incorporates personality profiling based on user responses to funnel questions, storing `amplexa_funnel`, `amplexa_responses`, `amplexa_primary_need`, `amplexa_communication_style`, `amplexa_pace`, and `amplexa_tags`. This data is used to tailor AI ice-breakers and conversation style.
- **Admin Features:**
    - System prompt management with version control.
    - Comprehensive CRM system with email retention sequences, scheduling, tracking, and funnel analytics.
    - Management of funnel API keys.
- **Security:** Implements CORS, Content Security Policy (Helmet), rate limiting on authentication and API routes, HMAC-signed admin session tokens, and encrypted secrets.

**Feature Specifications:**
- **API Endpoints:** Comprehensive set of public, authentication, funnel, chat, conversation, Stripe, and admin API endpoints.
- **Rate Limiting:** Implemented for authentication and API key usage.
- **Email Services:** Utilizes Resend for welcome and password reset emails, and an internal CRM for email sequences and tracking.
- **Stripe Integration:** Handles product listing, checkout sessions, customer portal management, subscription webhooks, and syncing Stripe data to the database.
  - Key endpoints:
    - `POST /api/stripe/checkout` - Create checkout session (returns Stripe URL)
    - `POST /api/stripe/verify-checkout` - Verify checkout session and update subscription status immediately (fixes race condition with webhooks)
    - `POST /api/stripe/portal` - Create customer portal session
    - `GET /api/stripe/subscription` - Get user's subscription status

### External Dependencies
- **Ollama:** Used for Large Language Model (LLM) inference, specifically with the "darkplanet" model.
- **Stripe:** For subscription billing, payment processing, and customer portal management. Integrated via the Stripe SDK and `stripe-replit-sync`.
- **Resend:** Email service for sending welcome and password reset emails.
- **PostgreSQL / SQLite:** Database systems for data persistence, managed with Drizzle ORM.
- **tsx:** For running TypeScript files directly during development.
- **Helmet:** Express middleware for setting various HTTP headers to improve security.