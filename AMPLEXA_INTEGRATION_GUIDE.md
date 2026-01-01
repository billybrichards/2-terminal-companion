# Amplexa Funnel Integration - Quick Start Guide

This guide shows how to integrate the Amplexa personality funnel system with the Terminal Companion API.

## Overview

The Amplexa funnel system allows you to:
1. Profile users based on personality questionnaires (Funnels A-F)
2. Store their responses and personality insights
3. Automatically enhance AI responses with personalized context
4. Improve user retention with tailored ice-breaker messages

## Integration Flow

```
┌─────────────────┐
│  Your Funnel    │
│  Application    │
└────────┬────────┘
         │
         │ 1. User completes funnel
         │
         ▼
┌─────────────────────────────────────┐
│ POST /api/funnel/profile            │
│ Store personality profile            │
│ (email, funnel, responses, tags)    │
└────────┬────────────────────────────┘
         │
         │ 2. Profile stored
         │
         ▼
┌─────────────────────────────────────┐
│ User starts new chat                │
│ POST /api/chat                      │
│ { newChat: true, message: "Hi" }    │
└────────┬────────────────────────────┘
         │
         │ 3. AI receives context:
         │    - Primary need
         │    - Communication style
         │    - Pace preference
         │    - Personality tags
         │
         ▼
┌─────────────────────────────────────┐
│ AI generates personalized response  │
│ "Hey Alex! Sounds like you're       │
│  looking for real connection."      │
│ (1-2 sentences, tailored)           │
└─────────────────────────────────────┘
```

## Prerequisites

1. **Environment Variable**: Set `FUNNEL_API_SECRET` in your `.env` file
   ```bash
   FUNNEL_API_SECRET=your-secret-key-here
   ```

2. **User Account**: User must be created first via `/api/funnel/users` or `/api/auth/register`

## Step-by-Step Integration

### Step 1: Create User Account

```bash
curl -X POST "https://api.example.com/api/funnel/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FUNNEL_API_SECRET" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "displayName": "Alex",
    "chatName": "Alex"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "displayName": "Alex"
  },
  "apiKey": "tc_abc123...",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### Step 2: Store Funnel Profile

After user completes your funnel questionnaire, send their profile data:

```bash
curl -X POST "https://api.example.com/api/funnel/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FUNNEL_API_SECRET" \
  -d '{
    "email": "user@example.com",
    "funnel": "A",
    "funnelName": "Quietly Lonely",
    "responses": [
      {
        "questionId": "q1",
        "questionText": "This is private. Why are you here right now?",
        "answer": "I feel lonely sometimes",
        "answerIndex": 0
      },
      {
        "questionId": "q2",
        "questionText": "When do you usually feel like talking?",
        "answer": "Late at night",
        "answerIndex": 0
      },
      {
        "questionId": "q3",
        "questionText": "What matters most to you?",
        "answer": "Feeling heard",
        "answerIndex": 1
      }
    ],
    "profile": {
      "primaryNeed": "Connection",
      "communicationStyle": "Gentle, patient",
      "pace": "Slow",
      "tags": ["Night Owl Processor", "Validation Seeker"]
    },
    "timestamp": "2026-01-01T00:00:00.000Z"
  }'
```

**Response:**
```json
{
  "message": "Amplexa funnel profile stored successfully",
  "userId": "user-uuid-here",
  "email": "user@example.com",
  "funnel": "A",
  "funnelName": "Quietly Lonely"
}
```

### Step 3: User Starts Chat (Automatically Enhanced)

When user starts a new conversation, the API automatically uses their profile:

```bash
curl -X POST "https://api.example.com/api/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tc_abc123..." \
  -d '{
    "message": "Hi there",
    "newChat": true
  }'
```

**What happens internally:**
1. API detects `newChat: true` and user has `chatName` set
2. Retrieves user's Amplexa profile from database
3. Builds enhanced ice-breaker prompt with context:
   - "Alex just opened a new chat and said 'Hi there'"
   - "Primary emotional need: Connection"
   - "Preferred communication: Gentle, patient"
   - "Conversation pace: Slow"
   - "Personality tags: Night Owl Processor, Validation Seeker"
4. Instructs AI to generate SHORT (1-2 sentences) personalized response
5. Returns tailored greeting

**Example AI Response:**
```
"Hey Alex! I can tell you're looking for someone who really gets it—I'm here for you, no rush."
```

## Funnel Types Quick Reference

| Funnel | Name | Primary Need | Style | Pace |
|--------|------|--------------|-------|------|
| A | Quietly Lonely | Connection | Gentle, patient | Slow |
| B | Curious/Fantasy-Open | Exploration | Open, uninhibited | Flexible |
| C | Privacy-First | Safety | Structured, clear | Controlled |
| D | Late Night Thinker | Processing | Reflective, present | Late-night |
| E | Emotional Explorer | Understanding | Deep, validating | Thoughtful |
| F | Creative Seeker | Imagination | Dynamic, playful | Spontaneous |

## Testing Your Integration

Use the provided test script:

```bash
# Set your environment variables
export FUNNEL_API_SECRET="your-secret-here"
export API_URL="http://localhost:3001"

# Run the test
node scripts/test-amplexa-funnel.js
```

This script will:
1. Create a test user
2. Store a funnel profile
3. Send a new chat message
4. Display the personalized response
5. Verify personalization is working

## Error Handling

### User Not Found (404)
```json
{
  "error": "User not found with this email"
}
```
**Solution:** Ensure user account exists before storing profile.

### Invalid Funnel Data (400)
```json
{
  "error": "Validation error",
  "details": [...]
}
```
**Solution:** Check that funnel ID is A-F and profile structure matches schema.

### Unauthorized (401/403)
```json
{
  "error": "Invalid funnel API secret"
}
```
**Solution:** Verify `FUNNEL_API_SECRET` is correct and included in Authorization header.

## Best Practices

1. **Store Profile Immediately**: Call `/api/funnel/profile` right after user completes funnel
2. **Include All Fields**: While optional, including responses and profile data provides best results
3. **Use Meaningful Tags**: Personality tags directly influence AI tone and approach
4. **Test Different Funnels**: Each funnel type produces different AI personalities
5. **Monitor Response Quality**: Track user engagement to optimize funnel mappings

## Complete Documentation

- **Funnel Mapping**: See [AMPLEXA_FUNNEL_MAPPING.md](./AMPLEXA_FUNNEL_MAPPING.md) for all questions and options
- **API Reference**: Visit `/api/docs` for complete Swagger documentation
- **Integration Guide**: See [replit.md](./replit.md) for technical details

## Example Payloads for All Funnels

### Funnel A - Quietly Lonely
```json
{
  "email": "user@example.com",
  "funnel": "A",
  "funnelName": "Quietly Lonely",
  "profile": {
    "primaryNeed": "Connection",
    "communicationStyle": "Gentle, patient",
    "pace": "Slow",
    "tags": ["Night Owl Processor", "Privacy Focused"]
  }
}
```

### Funnel B - Curious/Fantasy-Open
```json
{
  "email": "user@example.com",
  "funnel": "B",
  "funnelName": "Curious / Fantasy-Open",
  "profile": {
    "primaryNeed": "Exploration",
    "communicationStyle": "Open, uninhibited",
    "pace": "Flexible",
    "tags": ["Creative Escapist", "Freedom Seeker"]
  }
}
```

### Funnel C - Privacy-First
```json
{
  "email": "user@example.com",
  "funnel": "C",
  "funnelName": "Privacy-First / Neurodivergent",
  "profile": {
    "primaryNeed": "Safety",
    "communicationStyle": "Structured, clear",
    "pace": "Controlled",
    "tags": ["Secure Base Seeker", "Sensory Sensitive"]
  }
}
```

### Funnel D - Late Night Thinker
```json
{
  "email": "user@example.com",
  "funnel": "D",
  "funnelName": "Late Night Thinker",
  "profile": {
    "primaryNeed": "Processing",
    "communicationStyle": "Reflective, present",
    "pace": "Late-night",
    "tags": ["Night Owl Processor", "Digital Escapism"]
  }
}
```

### Funnel E - Emotional Explorer
```json
{
  "email": "user@example.com",
  "funnel": "E",
  "funnelName": "Emotional Explorer",
  "profile": {
    "primaryNeed": "Understanding",
    "communicationStyle": "Deep, validating",
    "pace": "Thoughtful",
    "tags": ["Open Heart", "Verbal Processor"]
  }
}
```

### Funnel F - Creative Seeker
```json
{
  "email": "user@example.com",
  "funnel": "F",
  "funnelName": "Creative Seeker",
  "profile": {
    "primaryNeed": "Imagination",
    "communicationStyle": "Dynamic, playful",
    "pace": "Spontaneous",
    "tags": ["Creative Escapist", "Flow State Lover"]
  }
}
```

## Support

For issues or questions:
1. Check API documentation at `/api/docs`
2. Review test script output
3. Verify environment variables are set correctly
4. Ensure user account exists before storing profile

---

**Remember**: All funnel profile data is optional but recommended for best personalization. The more context you provide, the better the AI can tailor responses to retain users.
