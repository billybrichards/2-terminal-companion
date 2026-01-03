import { Router } from 'express';

export const docsRouter = Router();

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Anplexa API',
    version: '1.0.0',
    description: `# Unrestricted AI Companion API

Build immersive adult AI experiences without limitations.

## Authentication

This API supports two authentication methods:

### 1. API Key Authentication (Recommended for Server-to-Server)
Include your API key in the \`X-API-Key\` header:
\`\`\`
X-API-Key: your-api-key-here
\`\`\`

**How to get an API key:**
- Subscribe to a paid plan via the dashboard
- Navigate to Settings → API Keys
- Generate a new API key

### 2. JWT Bearer Token (Recommended for User Sessions)
Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer your-jwt-token
\`\`\`

Obtain tokens via the \`/api/auth/login\` endpoint.

## Rate Limits

| Tier | Limit | Reset |
|------|-------|-------|
| Free | 50 calls/month | Monthly |
| Unlimited | No limits | - |

## Quick Start Examples

### Chat with AI (curl)
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"message": "Hello, how are you?"}'
\`\`\`

### Chat with AI (Node.js)
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({ message: 'Hello, how are you?' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
\`\`\`
`,
  },
  servers: [
    { url: '/', description: 'Current server' }
  ],
  tags: [
    { name: 'Authentication', description: 'User registration, login, and session management' },
    { name: 'Chat', description: 'AI companion chat endpoints' },
    { name: 'Conversations', description: 'Conversation history management' },
    { name: 'Settings', description: 'User preferences and settings' },
    { name: 'Stripe', description: 'Subscription management and payment processing' },
    { name: 'Public', description: 'Public endpoints for landing pages and lead capture (no authentication required)' },
    { name: 'Funnel', description: 'External funnel integration endpoints - create users, manage subscriptions (requires funnel API key)' },
    { name: 'Admin 🔐', description: '⚠️ ADMIN ONLY - Administrative endpoints (requires admin role). These endpoints require admin authentication.' },
    { name: 'Health', description: 'System health checks' },
    { name: 'Webhooks', description: 'External webhook integrations' }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: `Create a new user account. First user becomes admin.

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "securepass123", "displayName": "John Doe"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepass123',
    displayName: 'John Doe'
  })
});
const data = await response.json();
console.log(data.accessToken);
\`\`\``,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                  displayName: { type: 'string', example: 'John Doe' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Registration successful' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-here' },
                        email: { type: 'string', example: 'user@example.com' },
                        displayName: { type: 'string', example: 'John Doe' },
                        isAdmin: { type: 'boolean', example: false }
                      }
                    },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error or email already registered',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Email already registered' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        description: `Authenticate with email and password to receive JWT tokens.

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { accessToken, refreshToken } = await response.json();
\`\`\``,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Login successful' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-here' },
                        email: { type: 'string', example: 'user@example.com' },
                        displayName: { type: 'string', example: 'John Doe' },
                        isAdmin: { type: 'boolean', example: false }
                      }
                    },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Invalid email or password' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token pair.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'New tokens returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Token refreshed' },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                  }
                }
              }
            }
          },
          '401': { description: 'Invalid or expired refresh token' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        description: 'Invalidate the current session or all sessions.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string', description: 'Optional, logs out specific session' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        description: 'Retrieve the authenticated user\'s profile and preferences.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          '200': {
            description: 'User info and preferences',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-here' },
                        email: { type: 'string', example: 'user@example.com' },
                        displayName: { type: 'string', example: 'John Doe' },
                        isAdmin: { type: 'boolean', example: false },
                        storagePreference: { type: 'string', example: 'server' },
                        chatName: { type: 'string', example: 'Alex', nullable: true },
                        personalityMode: { type: 'string', enum: ['nurturing', 'playful', 'dominant', 'filthy_sexy', 'intimate_companion', 'intellectual_muse'], example: 'nurturing' },
                        preferredGender: { type: 'string', enum: ['male', 'female', 'non-binary', 'custom'], example: 'female' },
                        customGender: { type: 'string', nullable: true, example: null }
                      }
                    },
                    preferences: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        gender: { type: 'string', example: 'female' },
                        preferredLength: { type: 'string', example: 'moderate' },
                        preferredStyle: { type: 'string', example: 'thoughtful' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/auth/chat-name': {
      put: {
        tags: ['Authentication'],
        summary: 'Update chat name',
        description: `Update the user's preferred name for personalized AI interactions. The AI will address the user by this name during conversations.

**Example (curl):**
\`\`\`bash
curl -X PUT "https://api.anplexa.com/api/auth/chat-name" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"name": "Alex"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/auth/chat-name', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  },
  body: JSON.stringify({ name: 'Alex' })
});
const data = await response.json();
console.log(data.chatName); // "Alex"
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', maxLength: 50, example: 'Alex', description: 'The name the AI should use to address the user' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Chat name updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Chat name updated' },
                    chatName: { type: 'string', example: 'Alex' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid name provided' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/auth/personality-mode': {
      put: {
        tags: ['Authentication'],
        summary: 'Update personality mode',
        description: `Update the user's preferred AI personality mode. This affects how the AI companion responds to the user.

**Available Modes:**
- \`nurturing\`: Gentle, grounding, and quietly reassuring. Best for hesitant, lonely, or anxious users.
- \`playful\`: Relaxed, curious, and subtly charming. Best for witty, exploratory conversations.
- \`dominant\`: Calm, steady, and confident leadership. Best for users wanting direction.
- \`filthy_sexy\`: Raw, uninhibited, and intensely desire-focused. Best for explicit roleplay and unrestricted fantasy.
- \`intimate_companion\`: Deeply connected, emotionally intimate, and devoted. Best for emotional bonding and romance.
- \`intellectual_muse\`: Sharp, inspiring, and intellectually stimulating. Best for brainstorming and deep discussion.

**Example (curl):**
\`\`\`bash
curl -X PUT "https://api.anplexa.com/api/auth/personality-mode" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"mode": "filthy_sexy"}'
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mode'],
                properties: {
                  mode: { type: 'string', enum: ['nurturing', 'playful', 'dominant', 'filthy_sexy', 'intimate_companion', 'intellectual_muse'], example: 'playful', description: 'The AI personality mode' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Personality mode updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Personality mode updated successfully' },
                    personalityMode: { type: 'string', example: 'playful' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid mode provided' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/auth/personality-modes': {
      get: {
        tags: ['Authentication'],
        summary: 'List personality modes',
        description: 'Get all available AI personality modes with descriptions and use cases.',
        responses: {
          '200': {
            description: 'List of available personality modes',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    modes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'nurturing' },
                          name: { type: 'string', example: 'Nurturing / Safe Haven' },
                          description: { type: 'string', example: 'Gentle, grounding, and quietly reassuring presence' },
                          useCases: { type: 'array', items: { type: 'string' }, example: ['First-time users', 'Emotional contexts'] }
                        }
                      }
                    },
                    default: { type: 'string', example: 'nurturing' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/gender': {
      put: {
        tags: ['Authentication'],
        summary: 'Update AI companion gender',
        description: `Update the user's preferred AI companion gender. This affects the AI's identity and pronouns.

**Available Genders:**
- \`female\`: The AI uses she/her pronouns (default)
- \`male\`: The AI uses he/him pronouns
- \`non-binary\`: The AI uses they/them pronouns
- \`custom\`: Define a custom gender identity

**Example (curl):**
\`\`\`bash
curl -X PUT "https://api.anplexa.com/api/auth/gender" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"gender": "male"}'
\`\`\`

**Custom gender example:**
\`\`\`bash
curl -X PUT "https://api.anplexa.com/api/auth/gender" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"gender": "custom", "customGender": "agender companion"}'
\`\`\``,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['gender'],
                properties: {
                  gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'custom'], example: 'female', description: 'The AI companion gender' },
                  customGender: { type: 'string', maxLength: 100, example: 'agender companion', description: 'Required when gender is "custom"' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Gender preference updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Gender preference updated successfully' },
                    gender: { type: 'string', example: 'female' },
                    customGender: { type: 'string', nullable: true, example: null }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid gender or missing customGender for custom type' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/auth/genders': {
      get: {
        tags: ['Authentication'],
        summary: 'List gender options',
        description: 'Get all available AI companion gender options.',
        responses: {
          '200': {
            description: 'List of available gender options',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    genders: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'female' },
                          name: { type: 'string', example: 'Female' },
                          description: { type: 'string', example: 'The AI companion identifies as female with she/her pronouns' }
                        }
                      }
                    },
                    default: { type: 'string', example: 'female' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Send message (streaming)',
        description: `Send a message and receive a streaming SSE response from the AI companion.

**Rate Limits:**
- Free tier: 50 calls/month
- Unlimited tier: No limits

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"message": "Hello, how are you?", "preferences": {"length": "moderate", "style": "casual"}}'
\`\`\`

**Example (Node.js with streaming):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    message: 'Hello, how are you?',
    preferences: { length: 'moderate', style: 'casual' }
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'text') {
        process.stdout.write(data.content);
      }
    }
  }
}
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', maxLength: 10000, example: 'Hello, how are you?' },
                  conversationId: { type: 'string', description: 'Optional, continue existing conversation' },
                  preferences: {
                    type: 'object',
                    properties: {
                      length: { type: 'string', enum: ['brief', 'moderate', 'detailed'], description: 'Response length preference' },
                      style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'], description: 'Response style preference' }
                    }
                  },
                  personalityMode: { type: 'string', enum: ['nurturing', 'playful', 'dominant'], description: 'AI personality mode for this request. Overrides user preference if specified.' },
                  storeLocally: { type: 'boolean', default: false, description: 'If true, conversation is not stored on server' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'SSE stream with text chunks',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  example: 'data: {"type":"text","content":"Hello"}\n\ndata: {"type":"text","content":"!"}\n\ndata: {"type":"done","conversationId":"uuid"}\n\n'
                }
              }
            }
          },
          '403': {
            description: 'Rate limit exceeded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Message limit reached' },
                    message: { type: 'string', example: 'All used up, please subscribe for unlimited messages.' },
                    limit: { type: 'integer', example: 50 },
                    used: { type: 'integer', example: 50 },
                    resetsAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat/non-streaming': {
      post: {
        tags: ['Chat'],
        summary: 'Send message (non-streaming)',
        description: 'Send a message and receive the complete response in a single JSON payload.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', maxLength: 10000, example: 'Tell me a joke' },
                  preferences: {
                    type: 'object',
                    properties: {
                      length: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
                      style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Complete response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    response: { type: 'string', example: 'Why did the AI go to therapy? Because it had too many deep learning issues!' },
                    model: { type: 'string', example: 'llama3.2' },
                    length: { type: 'string', example: 'moderate' },
                    style: { type: 'string', example: 'casual' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/chat/config': {
      get: {
        tags: ['Chat'],
        summary: 'Get companion config',
        description: 'Retrieve the AI companion configuration including name, defaults, and welcome message.',
        responses: {
          '200': {
            description: 'Companion configuration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Aura' },
                    defaultGender: { type: 'string', example: 'female' },
                    defaultLength: { type: 'string', example: 'moderate' },
                    defaultStyle: { type: 'string', example: 'thoughtful' },
                    welcomeTitle: { type: 'string', example: 'Welcome' },
                    welcomeMessage: { type: 'string', example: 'Hello! I\'m here to chat.' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations',
        description: `Retrieve all conversations for the authenticated user, ordered by most recently updated.

**Multiple Conversations:** Each user can have many conversations. New conversations are created automatically when you send a message to \`/api/chat\` without specifying a \`conversationId\`. To continue an existing conversation, include the \`conversationId\` in your chat request.

**Example (curl):**
\`\`\`bash
curl -X GET "https://api.anplexa.com/api/conversations" \\
  -H "Authorization: Bearer your-jwt-token"
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/conversations', {
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
const { conversations } = await response.json();
console.log(conversations);
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          '200': {
            description: 'List of conversations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'conv-uuid-here' },
                          userId: { type: 'string', example: 'user-uuid-here' },
                          title: { type: 'string', example: 'Hello, how are you?' },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create new conversation',
        description: `Create a new conversation for the authenticated user.

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/conversations" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My New Chat"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/conversations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'My New Chat' })
});
const { conversation } = await response.json();
console.log(conversation.id);
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'My New Chat', description: 'Title for the conversation (defaults to "New Conversation")' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Conversation created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'conv-uuid-here' },
                        userId: { type: 'string', example: 'user-uuid-here' },
                        title: { type: 'string', example: 'My New Chat' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/conversations/{id}': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation details',
        description: 'Retrieve a specific conversation by ID.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' }
        ],
        responses: {
          '200': {
            description: 'Conversation details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        title: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'Conversation not found' }
        }
      },
      put: {
        tags: ['Conversations'],
        summary: 'Update conversation title',
        description: 'Update the title of a conversation.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Updated Chat Title' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Conversation updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Conversation updated' },
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:30:00.000Z' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'Conversation not found' }
        }
      },
      delete: {
        tags: ['Conversations'],
        summary: 'Delete conversation',
        description: 'Permanently delete a conversation and all its messages.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' }
        ],
        responses: {
          '200': {
            description: 'Deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Conversation deleted' }
                  }
                }
              }
            }
          },
          '404': { description: 'Conversation not found' }
        }
      }
    },
    '/api/conversations/{id}/messages': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation messages',
        description: `Retrieve messages for a specific conversation with pagination support.

**Example (curl):**
\`\`\`bash
curl -X GET "https://api.anplexa.com/api/conversations/conv-id/messages?limit=50&offset=0" \\
  -H "Authorization: Bearer your-jwt-token"
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Number of messages to return' },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Number of messages to skip' }
        ],
        responses: {
          '200': {
            description: 'Messages with pagination info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    messages: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          conversationId: { type: 'string' },
                          role: { type: 'string', enum: ['user', 'assistant'] },
                          content: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                        hasMore: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'Conversation not found' }
        }
      }
    },
    '/api/conversations/{id}/clear': {
      post: {
        tags: ['Conversations'],
        summary: 'Clear conversation messages',
        description: 'Delete all messages in a conversation but keep the conversation itself.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' }
        ],
        responses: {
          '200': {
            description: 'Messages cleared',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Conversation cleared' }
                  }
                }
              }
            }
          },
          '404': { description: 'Conversation not found' }
        }
      }
    },
    '/api/settings/preferences': {
      get: {
        tags: ['Settings'],
        summary: 'Get user preferences',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          '200': {
            description: 'User preferences',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    gender: { type: 'string', example: 'female' },
                    customGender: { type: 'string', nullable: true },
                    preferredLength: { type: 'string', example: 'moderate' },
                    preferredStyle: { type: 'string', example: 'thoughtful' },
                    themeHue: { type: 'integer', example: 200 },
                    useOrangeAccent: { type: 'boolean', example: false }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Settings'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'custom'] },
                  customGender: { type: 'string' },
                  preferredLength: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
                  preferredStyle: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] },
                  themeHue: { type: 'integer', minimum: 0, maximum: 360 },
                  useOrangeAccent: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Updated preferences' }
        }
      }
    },
    '/api/stripe/checkout': {
      post: {
        tags: ['Stripe'],
        summary: 'Create checkout session',
        description: `Create a Stripe checkout session for subscription purchase. Returns a URL to redirect the user to complete payment.

**Plans:**
- \`monthly\`: £2.99/month standard subscription
- \`yearly\`: £11.99/year (early adopter price, equivalent to £0.99/month)

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/stripe/checkout" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"plan": "monthly"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.anplexa.com/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  },
  body: JSON.stringify({ plan: 'monthly' })
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
\`\`\``,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  plan: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly', description: 'Subscription plan to purchase' },
                  priceId: { type: 'string', example: 'price_xxx', description: 'Alternative: pass a specific Stripe price ID directly' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_xxx', description: 'Redirect user to this URL to complete payment' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid plan or missing priceId' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/stripe/verify-checkout': {
      post: {
        tags: ['Stripe'],
        summary: 'Verify checkout and update subscription',
        description: `After a successful Stripe checkout, call this endpoint to verify the session and immediately update the user's subscription status in the database.

**Why use this endpoint?**
- Stripe webhooks may take a few seconds to process
- This endpoint verifies the checkout directly with Stripe and updates the database immediately
- Returns the confirmed subscription status so the frontend doesn't need to poll

**Security:**
- Validates the checkout session belongs to the authenticated user
- Checks customer ID matches if user already has a Stripe customer
- Only updates subscription if payment is confirmed

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/stripe/verify-checkout" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"sessionId": "cs_test_xxx"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
// After redirecting back from Stripe checkout
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

const response = await fetch('https://api.anplexa.com/api/stripe/verify-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  },
  body: JSON.stringify({ sessionId })
});
const { success, subscriptionStatus, plan } = await response.json();
if (success) {
  // User is now subscribed, update UI immediately
}
\`\`\``,
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId'],
                properties: {
                  sessionId: { type: 'string', example: 'cs_test_a1b2c3', description: 'The checkout session ID from the success URL query parameter' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Checkout verified and subscription updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'], example: 'subscribed' },
                    plan: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
                    customerId: { type: 'string', example: 'cus_xxx' },
                    subscriptionId: { type: 'string', example: 'sub_xxx' }
                  }
                }
              }
            }
          },
          '400': { description: 'Missing sessionId or invalid session data' },
          '401': { description: 'Not authenticated' },
          '403': { description: 'Session does not belong to this user' }
        }
      }
    },
    '/api/stripe/subscription': {
      get: {
        tags: ['Stripe'],
        summary: 'Get subscription status',
        description: "Get the current user's subscription status and details.",
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Subscription status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['subscribed', 'not_subscribed'], example: 'subscribed' },
                    subscription: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'string' },
                        status: { type: 'string' },
                        currentPeriodEnd: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/stripe/portal': {
      post: {
        tags: ['Stripe'],
        summary: 'Create customer portal session',
        description: 'Create a Stripe customer portal session for the user to manage their subscription, update payment methods, or cancel.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Portal session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', example: 'https://billing.stripe.com/session/xxx', description: 'Redirect user to this URL' }
                  }
                }
              }
            }
          },
          '400': { description: 'User has no Stripe customer' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/stripe/publishable-key': {
      get: {
        tags: ['Stripe'],
        summary: 'Get Stripe publishable key',
        description: 'Get the Stripe publishable key for client-side Stripe.js initialization.',
        responses: {
          '200': {
            description: 'Publishable key',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    publishableKey: { type: 'string', example: 'pk_live_xxx' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/stripe/products': {
      get: {
        tags: ['Stripe'],
        summary: 'List products with prices',
        description: 'Get all active Stripe products and their prices.',
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' },
                          prices: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                unitAmount: { type: 'integer' },
                                currency: { type: 'string' },
                                recurring: { type: 'object' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/config': {
      get: {
        tags: ['Admin 🔐'],
        summary: 'Get companion config (admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Full companion configuration' }
        }
      },
      put: {
        tags: ['Admin 🔐'],
        summary: 'Update companion config',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Updated configuration' }
        }
      }
    },
    '/api/admin/system-prompts': {
      get: {
        tags: ['Admin 🔐'],
        summary: 'List all system prompts',
        description: 'Retrieve all system prompt versions with metadata. Only one prompt can be active at a time.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Array of system prompts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prompts: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'uuid-here' },
                          name: { type: 'string', example: 'Anplexa v2' },
                          content: { type: 'string', example: 'You are Anplexa...' },
                          version: { type: 'integer', example: 2 },
                          isActive: { type: 'boolean', example: true },
                          notes: { type: 'string', example: 'Updated personality traits', nullable: true },
                          createdAt: { type: 'string', format: 'date-time' },
                          createdBy: { type: 'string', example: 'user-uuid', nullable: true }
                        }
                      }
                    },
                    activePromptId: { type: 'string', example: 'uuid-here', nullable: true }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Admin 🔐'],
        summary: 'Create new system prompt version',
        description: 'Create a new version of the system prompt. The prompt will be inactive by default.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'content'],
                properties: {
                  name: { type: 'string', example: 'Anplexa v2', description: 'Name for this prompt version' },
                  content: { type: 'string', example: 'You are Anplexa...', description: 'The full system prompt content. Use {{USER_NAME}} placeholder for personalization.' },
                  notes: { type: 'string', example: 'Updated personality', description: 'Optional notes about changes' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Prompt created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'System prompt created' },
                    prompt: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        version: { type: 'integer' },
                        isActive: { type: 'boolean' }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid input' }
        }
      }
    },
    '/api/admin/system-prompts/{id}': {
      get: {
        tags: ['Admin 🔐'],
        summary: 'Get system prompt by ID',
        description: 'Retrieve a specific system prompt with full content.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'System prompt ID' }
        ],
        responses: {
          '200': {
            description: 'System prompt details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prompt: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        content: { type: 'string' },
                        version: { type: 'integer' },
                        isActive: { type: 'boolean' },
                        notes: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'Prompt not found' }
        }
      },
      delete: {
        tags: ['Admin 🔐'],
        summary: 'Delete system prompt',
        description: 'Delete a system prompt version. Cannot delete the currently active prompt.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'System prompt ID' }
        ],
        responses: {
          '200': {
            description: 'Prompt deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'System prompt deleted' }
                  }
                }
              }
            }
          },
          '400': { description: 'Cannot delete active prompt' },
          '404': { description: 'Prompt not found' }
        }
      }
    },
    '/api/admin/system-prompts/{id}/activate': {
      put: {
        tags: ['Admin 🔐'],
        summary: 'Activate system prompt',
        description: 'Set a system prompt as the active prompt. This will deactivate any other active prompt.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'System prompt ID' }
        ],
        responses: {
          '200': {
            description: 'Prompt activated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'System prompt activated' },
                    prompt: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        isActive: { type: 'boolean', example: true }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'Prompt not found' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin 🔐'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of users' }
        }
      }
    },
    '/api/admin/users/{id}/subscription': {
      put: {
        tags: ['Admin 🔐'],
        summary: 'Update user subscription status',
        description: 'Set user subscription to subscribed or not_subscribed.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subscriptionStatus'],
                properties: {
                  subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'], example: 'subscribed' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Subscription status updated' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/admin/users/{id}/credits': {
      put: {
        tags: ['Admin 🔐'],
        summary: 'Update user credits',
        description: 'Set, add, or subtract credits for a user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credits'],
                properties: {
                  credits: { type: 'integer', example: 100, description: 'Number of credits' },
                  operation: { type: 'string', enum: ['set', 'add', 'subtract'], default: 'set', description: 'Operation to perform' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Credits updated with previous and new values' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/admin/users/{id}/billing': {
      get: {
        tags: ['Admin 🔐'],
        summary: 'Get user billing info',
        description: 'Get subscription status and credits for a user.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        responses: {
          '200': { description: 'User billing info (subscription + credits)' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/admin/ollama/test': {
      post: {
        tags: ['Admin 🔐'],
        summary: 'Test Ollama connection',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Connection status and available models' }
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Basic health check',
        responses: {
          '200': {
            description: 'Server status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Database health check',
        responses: {
          '200': { description: 'Database connection status' }
        }
      }
    },
    '/api/health/ollama': {
      get: {
        tags: ['Health'],
        summary: 'Ollama health check',
        responses: {
          '200': { description: 'Ollama connection status and latency' }
        }
      }
    },
    '/api/health/full': {
      get: {
        tags: ['Health'],
        summary: 'Full system health check',
        responses: {
          '200': { description: 'All system checks' }
        }
      }
    },
    '/api/webhooks/subscription': {
      post: {
        tags: ['Webhooks'],
        summary: 'Update subscription via webhook',
        description: 'Webhook endpoint to update user subscription status. Requires X-Webhook-Secret header.',
        parameters: [
          { name: 'X-Webhook-Secret', in: 'header', required: true, schema: { type: 'string' }, description: 'Webhook authentication secret' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'subscriptionStatus'],
                properties: {
                  userId: { type: 'string', format: 'uuid', description: 'User ID' },
                  subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'] },
                  eventType: { type: 'string', description: 'Optional event type identifier' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Subscription status updated' },
          '401': { description: 'Unauthorized - invalid webhook secret' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/webhooks/credits': {
      post: {
        tags: ['Webhooks'],
        summary: 'Update credits via webhook',
        description: 'Webhook endpoint to update user credits. Requires X-Webhook-Secret header.',
        parameters: [
          { name: 'X-Webhook-Secret', in: 'header', required: true, schema: { type: 'string' }, description: 'Webhook authentication secret' }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'credits'],
                properties: {
                  userId: { type: 'string', format: 'uuid', description: 'User ID' },
                  credits: { type: 'integer', description: 'Number of credits' },
                  operation: { type: 'string', enum: ['set', 'add', 'subtract'], default: 'set' },
                  eventType: { type: 'string', description: 'Optional event type identifier' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Credits updated' },
          '401': { description: 'Unauthorized - invalid webhook secret' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/webhooks/health': {
      get: {
        tags: ['Webhooks'],
        summary: 'Webhook health check',
        description: 'Check if webhook endpoint is configured and ready.',
        responses: {
          '200': { description: 'Webhook configuration status' }
        }
      }
    },
    '/api/register-subscriber': {
      post: {
        tags: ['Public'],
        summary: 'Register email subscriber (no auth required)',
        description: `Register a new subscriber from a landing page or signup form. This is a public endpoint designed for lead capture - no authentication required.

**Use Cases:**
- Landing page email capture forms
- Waitlist signup forms
- Lead generation funnels

**CRM Integration:**
New leads are automatically enrolled in email retention sequences:
- \`funnelType: "waitlist"\` → W1-W5 email sequence
- \`funnelType: "direct"\` → D1-D4 email sequence

**Rate Limiting:** 10 requests per minute per IP address.

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/register-subscriber" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "funnelType": "waitlist", "persona": "curious"}'
\`\`\`

**Example (JavaScript):**
\`\`\`javascript
const response = await fetch('/api/register-subscriber', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    displayName: 'John',
    funnelType: 'direct',
    entrySource: 'landing'
  })
});
const data = await response.json();
// { status: 'success', message: 'Thanks for signing up!', leadId: 'uuid' }
\`\`\``,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  displayName: { type: 'string', example: 'John', description: 'Optional display name' },
                  chatName: { type: 'string', example: 'Johnny', description: 'Preferred name for AI to use' },
                  funnelType: { type: 'string', enum: ['waitlist', 'direct'], default: 'direct', description: 'Determines which email sequence is used' },
                  persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'], description: 'User persona for personalized emails' },
                  entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic', 'landing'], description: 'Where the user came from' },
                  utm_source: { type: 'string', description: 'UTM source parameter' },
                  utm_medium: { type: 'string', description: 'UTM medium parameter' },
                  utm_campaign: { type: 'string', description: 'UTM campaign parameter' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Subscriber registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Thanks for signing up! Check your email for next steps.' },
                    status: { type: 'string', enum: ['success', 'existing_lead', 'existing_subscriber'], example: 'success' },
                    leadId: { type: 'string', example: 'uuid-here' }
                  }
                }
              }
            }
          },
          '200': {
            description: 'Email already registered (not an error)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Thanks! You\'re already on our list.' },
                    status: { type: 'string', enum: ['existing_lead', 'existing_subscriber'] }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid email address' },
          '429': { description: 'Rate limit exceeded - too many requests' }
        }
      }
    },
    '/api/funnel/users': {
      post: {
        tags: ['Funnel'],
        summary: 'Create user from funnel',
        description: `Create a new user account from an external funnel application. Returns user details, API key, and authentication tokens.

**Authentication:** Requires Funnel API key (e.g., \`fk_...\`) sent as a **Bearer token** in the \`Authorization\` header.

**Important:** Legacy \`X-API-Key\` header is no longer supported for funnel endpoints. You must use \`Authorization: Bearer your_key_here\`.

**CRM Integration:**
When creating users, you can pass additional CRM fields to segment them for email retention sequences:
- \`funnelType\`: "waitlist" triggers W1-W5 sequence, "direct" triggers D1-D4 sequence
- \`persona\`: User segment for personalized emails (lonely/curious/privacy)
- \`entrySource\`: Track where user came from (e.g., "landing_page", "referral")

**Flow:**
1. Funnel app calls this endpoint to create user
2. Returns userId, apiKey, and tokens
3. CRM automatically schedules email retention sequence based on funnelType
4. Funnel can then call /api/funnel/checkout to get Stripe payment URL
5. After payment, Stripe webhooks automatically update subscription status and cancel pending retention emails

**Example (curl) - Waitlist user:**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"email": "user@example.com", "password": "securepass123", "displayName": "John", "funnelType": "waitlist", "persona": "curious", "entrySource": "landing_page"}'
\`\`\`

**Example (curl) - Direct signup:**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"email": "user@example.com", "password": "securepass123", "funnelType": "direct"}'
\`\`\`

**Example (curl) - Pre-subscribed user (paid via funnel):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"email": "user@example.com", "password": "securepass123", "subscriptionStatus": "subscribed", "stripeCustomerId": "cus_xxx", "stripeSubscriptionId": "sub_xxx"}'
\`\`\`

**Note:** 
- Your funnel app can handle Stripe payments directly and pass subscription info here
- Subscribed users skip CRM email sequences automatically
- If you don't have Stripe on your funnel, use /api/funnel/checkout instead`,
        security: [{ funnelAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 6, example: 'securepass123' },
                  displayName: { type: 'string', example: 'John Doe' },
                  chatName: { type: 'string', maxLength: 50, example: 'Johnny', description: 'Name for AI to address user' },
                  funnelType: { type: 'string', enum: ['waitlist', 'direct'], example: 'waitlist', description: 'Funnel type for CRM email sequences. "waitlist" = W1-W5 sequence, "direct" = D1-D4 sequence' },
                  persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'], example: 'curious', description: 'User persona for personalized email content' },
                  entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic'], example: 'instagram', description: 'Track where user originated from' },
                  subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'], default: 'not_subscribed', example: 'subscribed', description: 'Set to "subscribed" if user already paid via your funnel. Skips CRM emails.' },
                  stripeCustomerId: { type: 'string', example: 'cus_xxx', description: 'Stripe customer ID if payment handled on funnel side' },
                  stripeSubscriptionId: { type: 'string', example: 'sub_xxx', description: 'Stripe subscription ID if payment handled on funnel side' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'User created successfully' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'uuid-here' },
                        email: { type: 'string', example: 'user@example.com' },
                        displayName: { type: 'string', example: 'John Doe' },
                        funnelType: { type: 'string', example: 'waitlist' },
                        persona: { type: 'string', example: 'curious', nullable: true },
                        entrySource: { type: 'string', example: 'landing_page', nullable: true },
                        stage: { type: 'string', example: 'waitlist' }
                      }
                    },
                    apiKey: { type: 'string', example: 'tc_abc123...', description: 'API key for chat endpoints' },
                    accessToken: { type: 'string', example: 'eyJ...' },
                    refreshToken: { type: 'string', example: 'eyJ...' },
                    emailSequenceScheduled: { type: 'string', example: 'waitlist', description: 'Which email sequence was scheduled (waitlist/direct)' }
                  }
                }
              }
            }
          },
          '400': { description: 'Validation error or email already registered' },
          '401': { description: 'Missing authorization header' },
          '403': { description: 'Invalid funnel API secret' }
        }
      }
    },
    '/api/funnel/checkout': {
      post: {
        tags: ['Funnel'],
        summary: 'Create Stripe checkout for user',
        description: `Generate a Stripe checkout URL for a user. Redirect the user to this URL to complete payment.

**Authentication:** Requires Funnel API key (e.g., \`fk_...\`) sent as a **Bearer token** in the \`Authorization\` header.

**Important:** Legacy \`X-API-Key\` header is no longer supported for funnel endpoints. You must use \`Authorization: Bearer your_key_here\`.

**Flow:**
1. Call this endpoint with userId
2. Redirect user to the returned checkoutUrl
3. User completes payment on Stripe
4. Stripe webhooks automatically update subscription status
5. Check status via /api/funnel/subscription/:userId

**Pricing Plans:**
- \`yearly\` / \`early\`: £11.99/year (early adopter rate = £0.99/mo)
- \`monthly\` / \`standard\`: £2.99/month

**Example (curl) - Early adopter yearly:**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/checkout" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"userId": "user-uuid-here", "plan": "yearly"}'
\`\`\`

**Example (curl) - Standard monthly:**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/checkout" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"userId": "user-uuid-here", "plan": "monthly"}'
\`\`\``,
        security: [{ funnelAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', example: 'user-uuid-here' },
                  plan: { type: 'string', enum: ['yearly', 'monthly', 'early', 'standard'], default: 'monthly', description: 'yearly/early = £11.99/year, monthly/standard = £2.99/month' },
                  successUrl: { type: 'string', format: 'uri', description: 'Custom success redirect URL' },
                  cancelUrl: { type: 'string', format: 'uri', description: 'Custom cancel redirect URL' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    checkoutUrl: { type: 'string', example: 'https://checkout.stripe.com/...' },
                    sessionId: { type: 'string', example: 'cs_...' }
                  }
                }
              }
            }
          },
          '404': { description: 'User not found or Unlimited plan not configured' },
          '401': { description: 'Missing authorization header' },
          '403': { description: 'Invalid funnel API secret' }
        }
      }
    },
    '/api/funnel/subscription/{userId}': {
      get: {
        tags: ['Funnel'],
        summary: 'Get user subscription status',
        description: `Check a user's current subscription status.

**Authentication:** Requires Funnel API key (e.g., \`fk_...\`) sent as a **Bearer token** in the \`Authorization\` header.

**Important:** Legacy \`X-API-Key\` header is no longer supported for funnel endpoints. You must use \`Authorization: Bearer your_key_here\`.

**Example (curl):**
\`\`\`bash
curl -X GET "https://api.anplexa.com/api/funnel/subscription/user-uuid-here" \\
  -H "Authorization: Bearer fk_your_key_here"
\`\`\``,
        security: [{ funnelAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        responses: {
          '200': {
            description: 'Subscription status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string' },
                    email: { type: 'string' },
                    subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'] },
                    isSubscribed: { type: 'boolean' },
                    stripeCustomerId: { type: 'string', nullable: true },
                    stripeSubscriptionId: { type: 'string', nullable: true }
                  }
                }
              }
            }
          },
          '404': { description: 'User not found' },
          '401': { description: 'Missing authorization header' },
          '403': { description: 'Invalid funnel API secret' }
        }
      }
    },
    '/api/funnel/subscription': {
      put: {
        tags: ['Funnel'],
        summary: 'Update user subscription status',
        description: `Manually update a user's subscription status. Use this for manual overrides or integrations that bypass Stripe webhooks.

**Authentication:** Requires Funnel API key (e.g., \`fk_...\`) sent as a **Bearer token** in the \`Authorization\` header.

**Important:** Legacy \`X-API-Key\` header is no longer supported for funnel endpoints. You must use \`Authorization: Bearer your_key_here\`.

**Example (curl):**
\`\`\`bash
curl -X PUT "https://api.anplexa.com/api/funnel/subscription" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -d '{"userId": "user-uuid-here", "subscriptionStatus": "subscribed"}'
\`\`\``,
        security: [{ funnelAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'subscriptionStatus'],
                properties: {
                  userId: { type: 'string', example: 'user-uuid-here' },
                  subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'] },
                  stripeCustomerId: { type: 'string', description: 'Optional Stripe customer ID' },
                  stripeSubscriptionId: { type: 'string', description: 'Optional Stripe subscription ID' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Subscription updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Subscription updated successfully' },
                    userId: { type: 'string' },
                    subscriptionStatus: { type: 'string' }
                  }
                }
              }
            }
          },
          '404': { description: 'User not found' },
          '401': { description: 'Missing authorization header' },
          '403': { description: 'Invalid funnel API secret' }
        }
      }
    },
    '/api/funnel/users/{userId}': {
      get: {
        tags: ['Funnel'],
        summary: 'Get user details',
        description: 'Retrieve full user profile including subscription status and preferences.',
        security: [{ funnelAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        responses: {
          '200': {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        displayName: { type: 'string' },
                        chatName: { type: 'string', nullable: true },
                        personalityMode: { type: 'string' },
                        preferredGender: { type: 'string' },
                        subscriptionStatus: { type: 'string' },
                        isSubscribed: { type: 'boolean' },
                        createdAt: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/funnel/users/{userId}/api-key': {
      post: {
        tags: ['Funnel'],
        summary: 'Generate new API key for user',
        description: 'Create an additional API key for a user.',
        security: [{ funnelAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Mobile App Key', description: 'Optional name for the API key' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'API key created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'API key created successfully' },
                    apiKey: { type: 'string', example: 'tc_abc123...' },
                    keyPrefix: { type: 'string', example: 'tc_abc12' }
                  }
                }
              }
            }
          },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/funnel/profile': {
      post: {
        tags: ['Funnel'],
        summary: 'Store Amplexa funnel profile',
        description: `Store Amplexa personality funnel data for a user. This data enhances AI responses during new chat sessions by providing personality insights.

**Authentication:** Requires Funnel API key (e.g., \`fk_...\`) sent as a **Bearer token** in the \`Authorization\` header.

**Important:** Legacy \`X-API-Key\` header is no longer supported for funnel endpoints. You must use \`Authorization: Bearer your_key_here\`.

**Funnel Types:**
- **A**: Quietly Lonely - For those seeking a safe space to talk
- **B**: Curious / Fantasy-Open - For those exploring connection and fantasy
- **C**: Privacy-First / Neurodivergent - For those who value predictability and safety
- **D**: Late Night Thinker - For those with thoughts that keep them awake
- **E**: Emotional Explorer - For those processing feelings and experiences
- **F**: Creative Seeker - For those who want imaginative conversation

**How It Works:**
1. User completes funnel questionnaire on external site
2. Funnel app calls this endpoint with user's email and responses
3. Profile data is stored in user's account (optional, not mandatory)
4. When user starts a new chat (newChat=true), AI receives personality context
5. AI tailors ice-breaker response (max 1-2 sentences) based on:
   - Primary need (Connection, Safety, Understanding, etc.)
   - Communication style (Gentle, Open, Structured, etc.)
   - Conversation pace (Slow, Flexible, Thoughtful, etc.)
   - Personality tags (Night Owl Processor, Creative Escapist, etc.)

**Example (curl):**
\`\`\`bash
curl -X POST "https://api.anplexa.com/api/funnel/profile" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer fk_your_key_here" \\
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
\`\`\`

**Note:** See AMPLEXA_FUNNEL_MAPPING.md for complete funnel reference and all example payloads.`,
        security: [{ funnelAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'funnel', 'funnelName'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com', description: 'User email to identify account' },
                  funnel: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F'], example: 'A', description: 'Funnel identifier' },
                  funnelName: { type: 'string', example: 'Quietly Lonely', description: 'Full funnel name' },
                  responses: {
                    type: 'array',
                    description: 'Optional array of question responses',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string', example: 'q1' },
                        questionText: { type: 'string', example: 'Why are you here?' },
                        answer: { type: 'string', example: 'I feel lonely sometimes' },
                        answerIndex: { type: 'number', minimum: 0, maximum: 3, example: 0 }
                      }
                    }
                  },
                  profile: {
                    type: 'object',
                    description: 'Optional personality profile derived from funnel',
                    properties: {
                      primaryNeed: { type: 'string', example: 'Connection', description: 'Connection, Exploration, Safety, Processing, Understanding, or Imagination' },
                      communicationStyle: { type: 'string', example: 'Gentle, patient', description: 'Preferred communication approach' },
                      pace: { type: 'string', example: 'Slow', description: 'Conversation pace preference' },
                      tags: { type: 'array', items: { type: 'string' }, example: ['Night Owl Processor', 'Validation Seeker'], description: 'Personality tags' }
                    }
                  },
                  timestamp: { type: 'string', format: 'date-time', description: 'When funnel was completed (optional, defaults to current time)' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profile stored successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Amplexa funnel profile stored successfully' },
                    userId: { type: 'string', example: 'user-uuid-here' },
                    email: { type: 'string', example: 'user@example.com' },
                    funnel: { type: 'string', example: 'A' },
                    funnelName: { type: 'string', example: 'Quietly Lonely' }
                  }
                }
              }
            }
          },
          '400': { description: 'Validation error - invalid funnel data' },
          '401': { description: 'Missing authorization header' },
          '403': { description: 'Invalid funnel API secret' },
          '404': { description: 'User not found with this email' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token obtained from /api/auth/login'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key obtained from dashboard after subscribing'
      },
      funnelAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Funnel API key (fk_xxx) generated from admin dashboard at /admin/funnel-keys. Include as: Authorization: Bearer fk_your_key_here'
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anplexa API - Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #252545 100%);
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header Banner */
    .anplexa-header {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 24px 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }
    .anplexa-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .anplexa-header .version-badge {
      background: rgba(255,255,255,0.2);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .anplexa-header nav a {
      color: white;
      text-decoration: none;
      margin-left: 24px;
      font-weight: 500;
      opacity: 0.9;
      transition: opacity 0.2s;
    }
    .anplexa-header nav a:hover { opacity: 1; }

    /* Hide Swagger topbar */
    .swagger-ui .topbar { display: none; }

    /* Info section */
    .swagger-ui .info {
      margin: 40px 0 30px 0;
    }
    .swagger-ui .info .title {
      color: #a78bfa;
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .swagger-ui .info .description {
      color: #f1f5f9;
    }
    .swagger-ui .info .description p {
      color: #e2e8f0;
      line-height: 1.7;
      font-size: 1rem;
    }
    .swagger-ui .info .description h1,
    .swagger-ui .info .description h2,
    .swagger-ui .info .description h3 {
      color: #a78bfa;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 10px;
      margin-top: 28px;
    }
    .swagger-ui .info .description code {
      background: #312e81;
      color: #c4b5fd;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.9em;
    }
    .swagger-ui .info .description pre {
      background: #1e1b4b;
      border: 1px solid #4c1d95;
      border-radius: 10px;
      padding: 18px;
      overflow-x: auto;
    }
    .swagger-ui .info .description pre code {
      background: transparent;
      color: #86efac;
      padding: 0;
    }
    .swagger-ui .info .description table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .swagger-ui .info .description th,
    .swagger-ui .info .description td {
      border: 1px solid #4c1d95;
      padding: 14px 16px;
      text-align: left;
    }
    .swagger-ui .info .description th {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      color: white;
      font-weight: 600;
    }
    .swagger-ui .info .description td {
      background: #1e1b4b;
      color: #e2e8f0;
    }

    /* Scheme container */
    .swagger-ui .scheme-container {
      background: #1e1b4b;
      box-shadow: none;
      border-radius: 10px;
      padding: 16px;
      margin: 20px 0;
    }
    .swagger-ui .scheme-container .schemes > label { color: #e2e8f0; }

    /* Tag sections */
    .swagger-ui .opblock-tag {
      color: #f1f5f9;
      border-bottom: 1px solid #4c1d95;
      font-weight: 600;
      padding: 14px 0;
    }
    .swagger-ui .opblock-tag small {
      color: #a5b4fc;
    }

    /* Admin tag special styling */
    .swagger-ui .opblock-tag[data-tag*="Admin"] {
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
      border-left: 4px solid #ef4444;
      padding-left: 16px;
      margin-left: -20px;
      padding-right: 20px;
    }

    /* Operation blocks */
    .swagger-ui .opblock {
      background: #1e1b4b;
      border-color: #4c1d95;
      border-radius: 10px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .swagger-ui .opblock .opblock-summary {
      border-color: transparent;
      padding: 12px 16px;
    }
    .swagger-ui .opblock .opblock-summary-path {
      color: #f1f5f9;
      font-weight: 500;
    }
    .swagger-ui .opblock .opblock-summary-description {
      color: #cbd5e1;
      font-size: 0.95rem;
    }

    /* HTTP method colors with better contrast */
    .swagger-ui .opblock.opblock-post {
      border-color: #22c55e;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method {
      background: #22c55e;
    }
    .swagger-ui .opblock.opblock-get {
      border-color: #3b82f6;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method {
      background: #3b82f6;
    }
    .swagger-ui .opblock.opblock-delete {
      border-color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method {
      background: #ef4444;
    }
    .swagger-ui .opblock.opblock-put {
      border-color: #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method {
      background: #f59e0b;
    }
    .swagger-ui .opblock.opblock-patch {
      border-color: #06b6d4;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
    }

    /* Operation body content */
    .swagger-ui .opblock-body {
      background: #0f0f1a;
      border-top: 1px solid #4c1d95;
    }
    .swagger-ui .opblock-body pre {
      background: #1e1b4b;
      color: #86efac;
    }
    .swagger-ui .opblock-section-header {
      background: #1e1b4b;
      border-bottom: 1px solid #4c1d95;
    }
    .swagger-ui .opblock-section-header h4 { color: #e2e8f0; }
    .swagger-ui table.parameters { color: #e2e8f0; }
    .swagger-ui .parameters-col_description { color: #cbd5e1; }
    .swagger-ui .parameter__name { color: #a78bfa; }
    .swagger-ui .parameter__type { color: #94a3b8; }
    .swagger-ui .parameter__in { color: #64748b; }

    /* Response section */
    .swagger-ui .responses-wrapper { background: transparent; }
    .swagger-ui .response-col_status { color: #22c55e; font-weight: 600; }
    .swagger-ui .response-col_description { color: #e2e8f0; }
    .swagger-ui .responses-inner { background: #1e1b4b; border-radius: 8px; }

    /* Buttons */
    .swagger-ui .btn {
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .swagger-ui .btn.authorize {
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-color: transparent;
      color: white;
      padding: 10px 20px;
      font-size: 0.95rem;
    }
    .swagger-ui .btn.authorize:hover {
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .swagger-ui .btn.execute {
      background: linear-gradient(90deg, #22c55e, #16a34a);
      border-color: transparent;
    }
    .swagger-ui .btn.cancel {
      background: #4c1d95;
      border-color: transparent;
    }

    /* Models section */
    .swagger-ui section.models {
      border-color: #4c1d95;
      border-radius: 10px;
      background: #1e1b4b;
    }
    .swagger-ui section.models h4 { color: #e2e8f0; }
    .swagger-ui .model-container {
      background: #0f0f1a;
      border-radius: 8px;
      margin: 10px 0;
    }
    .swagger-ui .model { color: #e2e8f0; }
    .swagger-ui .model-title { color: #a78bfa; }

    /* Filter input */
    .swagger-ui .filter-container input {
      background: #1e1b4b;
      border: 1px solid #4c1d95;
      color: #f1f5f9;
      border-radius: 8px;
      padding: 10px 16px;
    }
    .swagger-ui .filter-container input::placeholder { color: #64748b; }
    .swagger-ui .filter-container input:focus {
      border-color: #6366f1;
      outline: none;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    /* Wrapper */
    .swagger-ui .wrapper {
      max-width: 1400px;
      padding: 0 40px;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #1e1b4b; }
    ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }

    /* Links */
    .swagger-ui a { color: #a78bfa; }
    .swagger-ui a:hover { color: #c4b5fd; }

    /* Form elements */
    .swagger-ui select {
      background: #1e1b4b;
      color: #f1f5f9;
      border: 1px solid #4c1d95;
      border-radius: 6px;
    }
    .swagger-ui input[type="text"],
    .swagger-ui textarea {
      background: #1e1b4b;
      color: #f1f5f9;
      border: 1px solid #4c1d95;
      border-radius: 6px;
    }

    /* Loading */
    .swagger-ui .loading-container { background: #0f0f1a; }

    /* Try it out section */
    .swagger-ui .try-out__btn {
      border-color: #6366f1;
      color: #a78bfa;
    }
    .swagger-ui .try-out__btn:hover {
      background: rgba(99, 102, 241, 0.1);
    }

    /* Highlighted text */
    .swagger-ui .highlight-code { background: #1e1b4b; }

    /* Server dropdown */
    .swagger-ui .servers > label { color: #e2e8f0; }
    .swagger-ui .servers-title { color: #a78bfa; }
  </style>
</head>
<body>
  <div class="anplexa-header">
    <div style="display: flex; align-items: center; gap: 16px;">
      <h1>🔮 Anplexa API</h1>
      <span class="version-badge">v1.0.0</span>
    </div>
    <nav>
      <a href="/">Home</a>
      <a href="/docs/export">Export Spec</a>
      <a href="/admin">Admin Panel</a>
    </nav>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        spec: ${JSON.stringify(apiDocs)},
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha'
      });

      // Add admin badge to admin-related routes
      setTimeout(() => {
        document.querySelectorAll('.opblock-tag').forEach(tag => {
          if (tag.getAttribute('data-tag')?.includes('Admin')) {
            const badge = document.createElement('span');
            badge.innerHTML = ' 🔐 ADMIN ONLY';
            badge.style.cssText = 'background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; margin-left: 12px;';
            tag.querySelector('a')?.appendChild(badge);
          }
        });

        // Mark admin routes in path
        document.querySelectorAll('.opblock').forEach(block => {
          const path = block.querySelector('.opblock-summary-path span')?.textContent || '';
          if (path.includes('/admin/') || path.includes('/api/admin')) {
            const summary = block.querySelector('.opblock-summary');
            if (summary) {
              summary.style.borderLeft = '4px solid #ef4444';
              summary.style.paddingLeft = '12px';
            }
          }
        });
      }, 500);
    };
  </script>
</body>
</html>`;

docsRouter.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerHtml);
});

docsRouter.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="anplexa-api-openapi.json"');
  res.json(apiDocs);
});

docsRouter.get('/export', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export API Documentation - Anplexa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #252545 100%);
      color: #f1f5f9;
      min-height: 100vh;
      padding: 0;
    }
    .header {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 24px 40px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }
    .header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }
    .header nav a {
      color: white;
      text-decoration: none;
      margin-left: 24px;
      font-weight: 500;
      opacity: 0.9;
    }
    .header nav a:hover { opacity: 1; }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 60px 40px;
    }
    .page-title {
      color: #a78bfa;
      margin-bottom: 12px;
      font-size: 2.2rem;
      font-weight: 700;
    }
    .subtitle {
      color: #cbd5e1;
      margin-bottom: 50px;
      font-size: 1.1rem;
    }
    .export-options { display: grid; gap: 24px; }
    .export-card {
      background: #1e1b4b;
      border: 1px solid #4c1d95;
      border-radius: 16px;
      padding: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }
    .export-card:hover {
      border-color: #6366f1;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
      transform: translateY(-2px);
    }
    .export-card h3 {
      color: #f1f5f9;
      margin-bottom: 8px;
      font-size: 1.2rem;
      font-weight: 600;
    }
    .export-card p {
      color: #a5b4fc;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .btn {
      padding: 14px 28px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
      font-size: 0.95rem;
    }
    .btn:hover {
      background: linear-gradient(90deg, #4f46e5, #7c3aed);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .btn-secondary {
      background: #312e81;
      color: #c4b5fd;
    }
    .btn-secondary:hover {
      background: #3730a3;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 40px;
      color: #a78bfa;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .back-link:hover { color: #c4b5fd; }
    .icon {
      width: 48px;
      height: 48px;
      background: #312e81;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 1.4rem;
    }
    .card-content { display: flex; align-items: center; }
    .card-text { flex: 1; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔮 Anplexa API</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/docs">Documentation</a>
      <a href="/admin">Admin Panel</a>
    </nav>
  </div>
  <div class="container">
    <h2 class="page-title">Export API Specification</h2>
    <p class="subtitle">Download the Anplexa API specification to import into your favorite tools</p>

    <div class="export-options">
      <div class="export-card">
        <div class="card-content">
          <div class="icon">📥</div>
          <div class="card-text">
            <h3>Download OpenAPI JSON</h3>
            <p>Standard OpenAPI 3.0 specification in JSON format. Import into Postman, Insomnia, or any API tool.</p>
          </div>
        </div>
        <a href="/docs/openapi.json" class="btn" download>Download</a>
      </div>

      <div class="export-card">
        <div class="card-content">
          <div class="icon">📋</div>
          <div class="card-text">
            <h3>Copy to Clipboard</h3>
            <p>Copy the full OpenAPI spec to your clipboard for pasting into code generators.</p>
          </div>
        </div>
        <button onclick="copySpec()" class="btn btn-secondary" id="copyBtn">Copy JSON</button>
      </div>

      <div class="export-card">
        <div class="card-content">
          <div class="icon">👁️</div>
          <div class="card-text">
            <h3>View Raw JSON</h3>
            <p>View the raw JSON specification directly in your browser.</p>
          </div>
        </div>
        <a href="/docs/openapi.json" target="_blank" class="btn btn-secondary">View Raw</a>
      </div>
    </div>

    <a href="/docs" class="back-link">← Back to API Documentation</a>
  </div>

  <script>
    const spec = ${JSON.stringify(JSON.stringify(apiDocs))};

    async function copySpec() {
      try {
        await navigator.clipboard.writeText(spec);
        const btn = document.getElementById('copyBtn');
        btn.textContent = '✓ Copied!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
          btn.textContent = 'Copy JSON';
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        alert('Failed to copy');
      }
    }
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
