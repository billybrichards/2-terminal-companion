# Amplexa Funnel Mapping

Complete reference of all funnels, questions, and answer options for personality profiling.

---

## Funnel A: Quietly Lonely
**Description:** For those seeking a safe space to talk.

### Question 1: This is private. Why are you here right now?
| Option | Personality Indicator |
|--------|----------------------|
| I feel lonely sometimes | Acknowledges emotional need |
| I just want someone to talk to | Seeking connection |
| I can't sleep | Nighttime vulnerability |
| I'm just curious | Exploratory/guarded |

### Question 2: When do you usually feel like talking?
| Option | Personality Indicator |
|--------|----------------------|
| Late at night | Nighttime processor |
| When I'm stressed | Stress-driven communicator |
| When I don't want to bother people | Considerate/self-sacrificing |
| Random moments | Spontaneous emotional needs |

### Question 3: What matters most to you?
| Option | Personality Indicator |
|--------|----------------------|
| Not being judged | Fear of judgment |
| Feeling heard | Validation-seeking |
| Privacy | Protective of self |
| Going at my own pace | Autonomy-focused |

---

## Funnel B: Curious / Fantasy-Open
**Description:** For those exploring connection and fantasy.

### Question 1: What are you hoping for?
| Option | Personality Indicator |
|--------|----------------------|
| Emotional connection | Intimacy-seeking |
| Fantasy or roleplay | Creative escapism |
| Someone who listens | Validation need |
| I don't know yet | Exploratory/uncertain |

### Question 2: What would ruin the experience?
| Option | Personality Indicator |
|--------|----------------------|
| Being censored | Values freedom of expression |
| Being rushed | Needs time and patience |
| Feeling watched | Privacy-conscious |
| Having to perform | Authenticity-focused |

### Question 3: How important is control?
| Option | Personality Indicator |
|--------|----------------------|
| Essential | High control need |
| Very important | Strong autonomy preference |
| Somewhat | Flexible |
| I want to explore freely | Open to spontaneity |

---

## Funnel C: Privacy-First / Neurodivergent
**Description:** For those who value predictability and safety.

### Question 1: What do you usually avoid online?
| Option | Personality Indicator |
|--------|----------------------|
| Loud social platforms | Sensory overwhelm avoidance |
| Dating apps | Relationship anxiety |
| Being misunderstood | Communication challenges |
| Overwhelming interfaces | Sensory/cognitive sensitivity |

### Question 2: What helps you feel safe?
| Option | Personality Indicator |
|--------|----------------------|
| Anonymity | Identity protection |
| Clear boundaries | Structure-seeking |
| Predictability | Routine-oriented |
| Being able to leave anytime | Exit strategy need |

### Question 3: How do you prefer to start?
| Option | Personality Indicator |
|--------|----------------------|
| Slowly | Gradual trust builder |
| With control | Autonomy-focused |
| With clear limits | Boundary-conscious |
| At my own pace | Self-directed |

---

## Funnel D: Late Night Thinker
**Description:** For those with thoughts that keep them awake.

### Question 1: What usually keeps you up at night?
| Option | Personality Indicator |
|--------|----------------------|
| Overthinking | Analytical/ruminative |
| Worry about tomorrow | Future anxiety |
| Unprocessed emotions | Emotional backlog |
| Just restless energy | Physical/mental activation |

### Question 2: What would help right now?
| Option | Personality Indicator |
|--------|----------------------|
| Someone to listen | Connection-seeking |
| A distraction | Avoidance coping |
| Understanding | Empathy need |
| Just company | Presence over advice |

### Question 3: How do you usually cope?
| Option | Personality Indicator |
|--------|----------------------|
| I scroll endlessly | Digital escapism |
| I bottle it up | Suppression pattern |
| I reach out (sometimes) | Selective vulnerability |
| I wait for it to pass | Passive coping |

---

## Funnel E: Emotional Explorer
**Description:** For those processing feelings and experiences.

### Question 1: What brings you here today?
| Option | Personality Indicator |
|--------|----------------------|
| Processing something difficult | Active processing |
| Looking for clarity | Insight-seeking |
| Need to vent | Release-focused |
| Exploring my feelings | Self-discovery oriented |

### Question 2: What do you need from a conversation?
| Option | Personality Indicator |
|--------|----------------------|
| Validation | Affirmation-seeking |
| A new perspective | Growth-oriented |
| Just to be heard | Witness need |
| Space to think out loud | External processing |

### Question 3: How do you process emotions?
| Option | Personality Indicator |
|--------|----------------------|
| Talking it through | Verbal processor |
| Writing or journaling | Reflective processor |
| Keeping busy | Action-oriented coping |
| I struggle with this | Emotional processing difficulty |

---

## Funnel F: Creative Seeker
**Description:** For those who want imaginative conversation.

### Question 1: What draws you to creative expression?
| Option | Personality Indicator |
|--------|----------------------|
| Escape from reality | Escapism motivation |
| Self-discovery | Introspective creativity |
| Pure entertainment | Pleasure-seeking |
| Exploring possibilities | Curiosity-driven |

### Question 2: What kind of conversation excites you?
| Option | Personality Indicator |
|--------|----------------------|
| Storytelling | Narrative-oriented |
| Deep philosophical talks | Intellectual depth |
| Playful banter | Light/fun preference |
| Unpredictable exchanges | Spontaneity-loving |

### Question 3: What matters in a creative space?
| Option | Personality Indicator |
|--------|----------------------|
| No judgment | Safety-focused creativity |
| Freedom to explore | Autonomy in expression |
| Someone who gets it | Understanding/resonance |
| Going wherever it leads | Flow-state preference |

---

## Personality Profile Matrix

### By Core Emotional Need
| Funnel | Primary Need | Secondary Need |
|--------|-------------|----------------|
| A | Connection | Acceptance |
| B | Exploration | Freedom |
| C | Safety | Predictability |
| D | Processing | Presence |
| E | Understanding | Validation |
| F | Imagination | Expression |

### By Communication Style
| Funnel | Preferred Style | Pace |
|--------|----------------|------|
| A | Gentle, patient | Slow |
| B | Open, uninhibited | Flexible |
| C | Structured, clear | Controlled |
| D | Reflective, present | Late-night |
| E | Deep, validating | Thoughtful |
| F | Dynamic, playful | Spontaneous |

### By Time of Engagement
| Funnel | Likely Active Time | Trigger |
|--------|-------------------|---------|
| A | Late night | Loneliness |
| B | Anytime | Curiosity/boredom |
| C | Structured times | Need for routine |
| D | 2-4 AM | Insomnia/overthinking |
| E | During/after events | Emotional processing |
| F | Creative hours | Inspiration |

---

## API Integration

### Endpoint: POST /api/funnel/profile

Store Amplexa funnel profile data for a user.

**Authentication:** Requires `FUNNEL_API_SECRET` in Authorization header as Bearer token.

**Request Body:**
```json
{
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
}
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

**Notes:**
- All funnel profile fields are optional but recommended for best personalization
- User is identified by email address
- Profile data enhances AI responses during new chat sessions
- Data is stored securely and used only to improve user experience

---

## Example API Payloads by Funnel

### Funnel A Example
```json
{
  "email": "user@example.com",
  "funnel": "A",
  "funnelName": "Quietly Lonely",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "This is private. Why are you here right now?",
      "answer": "I can't sleep",
      "answerIndex": 2
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
      "answer": "Privacy",
      "answerIndex": 2
    }
  ],
  "profile": {
    "primaryNeed": "Connection",
    "communicationStyle": "Gentle, patient",
    "pace": "Slow",
    "tags": ["Night Owl Processor", "Privacy Focused"]
  }
}
```

### Funnel B Example
```json
{
  "email": "user@example.com",
  "funnel": "B",
  "funnelName": "Curious / Fantasy-Open",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "What are you hoping for?",
      "answer": "Fantasy or roleplay",
      "answerIndex": 1
    },
    {
      "questionId": "q2",
      "questionText": "What would ruin the experience?",
      "answer": "Being censored",
      "answerIndex": 0
    },
    {
      "questionId": "q3",
      "questionText": "How important is control?",
      "answer": "I want to explore freely",
      "answerIndex": 3
    }
  ],
  "profile": {
    "primaryNeed": "Exploration",
    "communicationStyle": "Open, uninhibited",
    "pace": "Flexible",
    "tags": ["Creative Escapist", "Freedom Seeker"]
  }
}
```

### Funnel C Example
```json
{
  "email": "user@example.com",
  "funnel": "C",
  "funnelName": "Privacy-First / Neurodivergent",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "What do you usually avoid online?",
      "answer": "Overwhelming interfaces",
      "answerIndex": 3
    },
    {
      "questionId": "q2",
      "questionText": "What helps you feel safe?",
      "answer": "Predictability",
      "answerIndex": 2
    },
    {
      "questionId": "q3",
      "questionText": "How do you prefer to start?",
      "answer": "At my own pace",
      "answerIndex": 3
    }
  ],
  "profile": {
    "primaryNeed": "Safety",
    "communicationStyle": "Structured, clear",
    "pace": "Controlled",
    "tags": ["Secure Base Seeker", "Sensory Sensitive"]
  }
}
```

### Funnel D Example
```json
{
  "email": "user@example.com",
  "funnel": "D",
  "funnelName": "Late Night Thinker",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "What usually keeps you up at night?",
      "answer": "Overthinking",
      "answerIndex": 0
    },
    {
      "questionId": "q2",
      "questionText": "What would help right now?",
      "answer": "Someone to listen",
      "answerIndex": 0
    },
    {
      "questionId": "q3",
      "questionText": "How do you usually cope?",
      "answer": "I scroll endlessly",
      "answerIndex": 0
    }
  ],
  "profile": {
    "primaryNeed": "Processing",
    "communicationStyle": "Reflective, present",
    "pace": "Late-night",
    "tags": ["Night Owl Processor", "Digital Escapism"]
  }
}
```

### Funnel E Example
```json
{
  "email": "user@example.com",
  "funnel": "E",
  "funnelName": "Emotional Explorer",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "What brings you here today?",
      "answer": "Processing something difficult",
      "answerIndex": 0
    },
    {
      "questionId": "q2",
      "questionText": "What do you need from a conversation?",
      "answer": "Validation",
      "answerIndex": 0
    },
    {
      "questionId": "q3",
      "questionText": "How do you process emotions?",
      "answer": "Talking it through",
      "answerIndex": 0
    }
  ],
  "profile": {
    "primaryNeed": "Understanding",
    "communicationStyle": "Deep, validating",
    "pace": "Thoughtful",
    "tags": ["Open Heart", "Verbal Processor"]
  }
}
```

### Funnel F Example
```json
{
  "email": "user@example.com",
  "funnel": "F",
  "funnelName": "Creative Seeker",
  "responses": [
    {
      "questionId": "q1",
      "questionText": "What draws you to creative expression?",
      "answer": "Escape from reality",
      "answerIndex": 0
    },
    {
      "questionId": "q2",
      "questionText": "What kind of conversation excites you?",
      "answer": "Storytelling",
      "answerIndex": 0
    },
    {
      "questionId": "q3",
      "questionText": "What matters in a creative space?",
      "answer": "Going wherever it leads",
      "answerIndex": 3
    }
  ],
  "profile": {
    "primaryNeed": "Imagination",
    "communicationStyle": "Dynamic, playful",
    "pace": "Spontaneous",
    "tags": ["Creative Escapist", "Flow State Lover"]
  }
}
```

---

## How Funnel Data Enhances User Experience

When a user has completed an Amplexa funnel:

1. **Profile Data Storage**: The funnel responses and personality insights are stored in the user's profile
2. **New Chat Ice-Breakers**: When the user starts a new conversation (newChat=true), the AI receives context about:
   - Primary emotional need (e.g., "Connection", "Safety", "Understanding")
   - Communication style preference (e.g., "Gentle, patient", "Open, uninhibited")
   - Conversation pace (e.g., "Slow", "Thoughtful", "Spontaneous")
   - Personality tags (e.g., "Night Owl Processor", "Creative Escapist")

3. **Personalized Responses**: The AI tailors its initial greeting to:
   - Match the user's communication style
   - Address their primary need
   - Set the right pace for conversation
   - Make them feel understood from the first interaction
   - Keep responses SHORT (1-2 sentences max) to encourage engagement

4. **Retention Strategy**: By making users feel immediately understood and validated based on their funnel responses, the system increases the likelihood of:
   - Continued engagement
   - Emotional connection
   - Long-term retention
   - Subscription conversion

---

## Answer Index Reference

Use these indices when sending compact data:

### Funnel A: Quietly Lonely
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | I feel lonely sometimes | I just want someone to talk to | I can't sleep | I'm just curious |
| q2 | Late at night | When I'm stressed | When I don't want to bother people | Random moments |
| q3 | Not being judged | Feeling heard | Privacy | Going at my own pace |

### Funnel B: Curious / Fantasy-Open
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | Emotional connection | Fantasy or roleplay | Someone who listens | I don't know yet |
| q2 | Being censored | Being rushed | Feeling watched | Having to perform |
| q3 | Essential | Very important | Somewhat | I want to explore freely |

### Funnel C: Privacy-First / Neurodivergent
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | Loud social platforms | Dating apps | Being misunderstood | Overwhelming interfaces |
| q2 | Anonymity | Clear boundaries | Predictability | Being able to leave anytime |
| q3 | Slowly | With control | With clear limits | At my own pace |

### Funnel D: Late Night Thinker
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | Overthinking | Worry about tomorrow | Unprocessed emotions | Just restless energy |
| q2 | Someone to listen | A distraction | Understanding | Just company |
| q3 | I scroll endlessly | I bottle it up | I reach out (sometimes) | I wait for it to pass |

### Funnel E: Emotional Explorer
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | Processing something difficult | Looking for clarity | Need to vent | Exploring my feelings |
| q2 | Validation | A new perspective | Just to be heard | Space to think out loud |
| q3 | Talking it through | Writing or journaling | Keeping busy | I struggle with this |

### Funnel F: Creative Seeker
| Q | Index 0 | Index 1 | Index 2 | Index 3 |
|---|---------|---------|---------|---------|
| q1 | Escape from reality | Self-discovery | Pure entertainment | Exploring possibilities |
| q2 | Storytelling | Deep philosophical talks | Playful banter | Unpredictable exchanges |
| q3 | No judgment | Freedom to explore | Someone who gets it | Going wherever it leads |
