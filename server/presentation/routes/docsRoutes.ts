import { Router } from 'express';

export const docsRouter = Router();

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Abionti Unrestricted API',
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
curl -X POST "https://api.abionti.com/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"message": "Hello, how are you?"}'
\`\`\`

### Chat with AI (Node.js)
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/chat', {
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
    { name: 'Admin', description: 'Administrative endpoints (requires admin role)' },
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
curl -X POST "https://api.abionti.com/api/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "securepass123", "displayName": "John Doe"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/auth/register', {
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
curl -X POST "https://api.abionti.com/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/auth/login', {
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
                        chatName: { type: 'string', example: 'Alex', nullable: true }
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
curl -X PUT "https://api.abionti.com/api/auth/chat-name" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -d '{"name": "Alex"}'
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/auth/chat-name', {
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
curl -X POST "https://api.abionti.com/api/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"message": "Hello, how are you?", "preferences": {"length": "moderate", "style": "casual"}}'
\`\`\`

**Example (Node.js with streaming):**
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/chat', {
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
        description: `Retrieve all conversations for the authenticated user.

**Example (curl):**
\`\`\`bash
curl -X GET "https://api.abionti.com/api/conversations" \\
  -H "Authorization: Bearer your-jwt-token"
\`\`\`

**Example (Node.js):**
\`\`\`javascript
const response = await fetch('https://api.abionti.com/api/conversations', {
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
const conversations = await response.json();
console.log(conversations);
\`\`\``,
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          '200': {
            description: 'Array of conversations',
            content: {
              'application/json': {
                schema: {
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
    },
    '/api/conversations/{id}': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation with messages',
        description: 'Retrieve a specific conversation including all its messages.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Conversation ID' }
        ],
        responses: {
          '200': {
            description: 'Conversation with messages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    conversation: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' }
                      }
                    },
                    messages: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          role: { type: 'string', enum: ['user', 'assistant'] },
                          content: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
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
          }
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
    '/api/admin/config': {
      get: {
        tags: ['Admin'],
        summary: 'Get companion config (admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Full companion configuration' }
        }
      },
      put: {
        tags: ['Admin'],
        summary: 'Update companion config',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Updated configuration' }
        }
      }
    },
    '/api/admin/system-prompts': {
      get: {
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
        summary: 'List all users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of users' }
        }
      }
    },
    '/api/admin/users/{id}/subscription': {
      put: {
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
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
        tags: ['Admin'],
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
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abionti Unrestricted API - Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 30px 0; }
    .swagger-ui .info .title { 
      color: #e94560; 
      font-size: 2.5rem;
      font-weight: 700;
    }
    .swagger-ui .info .description { 
      color: #eaeaea;
    }
    .swagger-ui .info .description p { 
      color: #b8b8b8;
      line-height: 1.6;
    }
    .swagger-ui .info .description h1,
    .swagger-ui .info .description h2,
    .swagger-ui .info .description h3 { 
      color: #e94560;
      border-bottom: 1px solid #e94560;
      padding-bottom: 8px;
    }
    .swagger-ui .info .description code { 
      background: #1a1a2e;
      color: #00d9ff;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .swagger-ui .info .description pre { 
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
    }
    .swagger-ui .info .description pre code { 
      background: transparent;
      color: #00ff88;
    }
    .swagger-ui .info .description table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    .swagger-ui .info .description th,
    .swagger-ui .info .description td {
      border: 1px solid #444;
      padding: 12px;
      text-align: left;
    }
    .swagger-ui .info .description th {
      background: #e94560;
      color: white;
    }
    .swagger-ui .info .description td {
      background: #1a1a2e;
    }
    .swagger-ui .scheme-container { 
      background: #16213e; 
      box-shadow: none;
    }
    .swagger-ui .opblock-tag { 
      color: #eaeaea;
      border-bottom: 1px solid #333;
    }
    .swagger-ui .opblock { 
      background: #16213e;
      border-color: #333;
    }
    .swagger-ui .opblock .opblock-summary { 
      border-color: #333;
    }
    .swagger-ui .opblock .opblock-summary-description { 
      color: #b8b8b8;
    }
    .swagger-ui .opblock.opblock-post { 
      border-color: #49cc90;
      background: rgba(73, 204, 144, 0.1);
    }
    .swagger-ui .opblock.opblock-get { 
      border-color: #61affe;
      background: rgba(97, 175, 254, 0.1);
    }
    .swagger-ui .opblock.opblock-delete { 
      border-color: #f93e3e;
      background: rgba(249, 62, 62, 0.1);
    }
    .swagger-ui .opblock.opblock-put { 
      border-color: #fca130;
      background: rgba(252, 161, 48, 0.1);
    }
    .swagger-ui .btn { 
      border-radius: 4px;
    }
    .swagger-ui .btn.authorize { 
      background: #e94560;
      border-color: #e94560;
      color: white;
    }
    .swagger-ui .btn.authorize:hover { 
      background: #c73a52;
    }
    .swagger-ui section.models { 
      border-color: #333;
    }
    .swagger-ui .model-container { 
      background: #16213e;
    }
    .swagger-ui .wrapper { 
      max-width: 1400px;
    }
  </style>
</head>
<body>
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
    };
  </script>
</body>
</html>`;

docsRouter.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(swaggerHtml);
});

docsRouter.get('/openapi.json', (req, res) => {
  res.json(apiDocs);
});
