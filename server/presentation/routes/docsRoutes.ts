import { Router } from 'express';

export const docsRouter = Router();

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Anplexa API',
    version: '1.0.0',
    description: '# Unrestricted AI Companion API\n\nBuild immersive adult AI experiences without limitations.\n\n## Authentication\n\nThis API supports two authentication methods:\n\n### 1. API Key Authentication (Recommended for Server-to-Server)\nInclude your API key in the `X-API-Key` header:\n```\nX-API-Key: your-api-key-here\n```\n\n**How to get an API key:**\n- Subscribe to a paid plan via the dashboard\n- Navigate to Settings → API Keys\n- Generate a new API key\n\n### 2. JWT Bearer Token (Recommended for User Sessions)\nInclude the JWT token in the Authorization header:\n```\nAuthorization: Bearer your-jwt-token\n```\n\nObtain tokens via the `/api/auth/login` endpoint.\n\n## Rate Limits\n\n| Tier | Limit | Reset |\n|------|-------|-------|\n| Free | 50 calls/month | Monthly |\n| Unlimited | No limits | - |\n\n## Quick Start Examples\n\n### Chat with AI (curl)\n```bash\ncurl -X POST "https://api.anplexa.com/api/chat" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: your-api-key" \\\n  -d \'{"message": "Hello, how are you?"}\'\n```\n\n### Chat with AI (Node.js)\n```javascript\nconst response = await fetch(\'https://api.anplexa.com/api/chat\', {\n  method: \'POST\',\n  headers: {\n    \'Content-Type\': \'application/json\',\n    \'X-API-Key\': \'your-api-key\'\n  },\n  body: JSON.stringify({ message: \'Hello, how are you?\' })\n});\n\nconst reader = response.body.getReader();\nconst decoder = new TextDecoder();\n\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  console.log(decoder.decode(value));\n}\n```\n',
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
        description: 'Create a new user account. First user becomes admin.',
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
        description: 'Authenticate with email and password to receive JWT tokens.',
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
                        customGender: { type: 'string', nullable: true, example: null },
                        subscriptionStatus: { type: 'string', example: 'not_subscribed' }
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
    '/api/auth/credits': {
      get: {
        tags: ['Authentication'],
        summary: 'Check remaining daily credits',
        description: 'Retrieve the user\'s remaining daily message credits.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          '200': {
            description: 'Credit status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    credits: { type: 'integer', example: 4, nullable: true, description: 'Remaining credits (null if unlimited)' },
                    maxCredits: { type: 'integer', example: 5, nullable: true, description: 'Daily max credits (null if unlimited)' },
                    unlimited: { type: 'boolean', example: false },
                    resetsAt: { type: 'string', format: 'date-time', example: '2026-01-05T00:00:00.000Z', nullable: true }
                  }
                }
              }
            }
          },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/auth/subscription-status': {
      get: {
        tags: ['Authentication'],
        summary: 'Get fresh subscription status (no caching)',
        description: 'Get the current user\'s subscription status with aggressive no-cache headers.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Subscription status retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed', 'trialing', 'active', 'canceled'], example: 'subscribed' },
                    isSubscribed: { type: 'boolean', example: true },
                    credits: { type: 'integer', example: 50 },
                    hasStripeCustomer: { type: 'boolean', example: true },
                    hasActiveSubscription: { type: 'boolean', example: true },
                    timestamp: { type: 'string', format: 'date-time', example: '2026-01-03T22:00:00.000Z' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized - invalid or missing token' },
          '404': { description: 'User not found' }
        }
      }
    },
    '/api/auth/chat-name': {
      put: {
        tags: ['Authentication'],
        summary: 'Update chat name',
        description: 'Update the user\'s preferred name for personalized AI interactions.',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', maxLength: 50, example: 'Alex' }
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
        description: 'Send a message and receive a streaming SSE response from the AI companion.',
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
                  conversationId: { type: 'string' },
                  preferences: {
                    type: 'object',
                    properties: {
                      length: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
                      style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] },
                      personalityMode: { type: 'string', enum: ['nurturing', 'playful', 'dominant'] },
                      storeLocally: { type: 'boolean', default: false }
                    }
                  }
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
                  example: 'data: {"type":"text","content":"Hello"}\\n\\ndata: {"type":"done","conversationId":"uuid"}\\n\\n'
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
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations',
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
            }
          }
        }
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create new conversation',
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'My New Chat' }
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
          }
        }
      }
    },
    '/api/funnel/users': {
      post: {
        tags: ['Funnel'],
        summary: 'Create a user via funnel',
        description: 'Create a new user account through the funnel integration. All submissions are logged to an audit trail for analytics. Users created via this endpoint are tagged with `sourceChannel: funnel`.',
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
                  password: { type: 'string', minLength: 6, example: 'securepassword123' },
                  displayName: { type: 'string', example: 'John Doe' },
                  chatName: { type: 'string', maxLength: 50, example: 'John', description: 'Name the AI will use to address the user' },
                  funnelType: { type: 'string', enum: ['waitlist', 'direct'], default: 'direct', description: 'waitlist = waiting for access, direct = immediate access' },
                  persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'], description: 'User persona for CRM segmentation' },
                  entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic'], description: 'Traffic source for analytics' },
                  subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'], default: 'not_subscribed' }
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
                    user: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, displayName: { type: 'string' } } },
                    apiKey: { type: 'string', description: 'Auto-generated API key for the user' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': { description: 'Email already registered or validation error' },
          '403': { description: 'Invalid funnel API secret' }
        }
      }
    },
    '/api/register-subscriber': {
      post: {
        tags: ['Public'],
        summary: 'Register for waitlist/landing page',
        description: 'Public endpoint for landing page signups. All submissions are logged to an audit trail including duplicates. Users created via this endpoint are tagged with `sourceChannel: waitlist` or `sourceChannel: access_anplexa` based on entry source.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  displayName: { type: 'string', maxLength: 100, example: 'John Doe' },
                  chatName: { type: 'string', maxLength: 50, example: 'John' },
                  funnelType: { type: 'string', enum: ['waitlist', 'direct'], default: 'direct' },
                  persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'] },
                  entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic', 'landing'] },
                  utm_source: { type: 'string', description: 'UTM source parameter' },
                  utm_medium: { type: 'string', description: 'UTM medium parameter' },
                  utm_campaign: { type: 'string', description: 'UTM campaign parameter' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Successfully registered', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, status: { type: 'string', enum: ['success'] }, leadId: { type: 'string' } } } } } },
          '200': { description: 'Already on list', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, status: { type: 'string', enum: ['existing_lead', 'existing_subscriber'] } } } } } },
          '429': { description: 'Rate limited' }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      },
      funnelAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Funnel API key'
      }
    },
    schemas: {
      SourceChannel: {
        type: 'string',
        enum: ['funnel', 'waitlist', 'access_anplexa', 'frontend', 'api', 'auth_register'],
        description: 'Indicates how the user was acquired. Used for analytics and segmentation.'
      },
      ContactSubmission: {
        type: 'object',
        description: 'Audit log entry for all contact submissions (including duplicates)',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          displayName: { type: 'string', nullable: true },
          sourceChannel: { $ref: '#/components/schemas/SourceChannel' },
          sourceDetail: { type: 'string', nullable: true, description: 'Additional context (e.g., instagram, tiktok)' },
          funnelType: { type: 'string', enum: ['waitlist', 'direct'], nullable: true },
          entrySource: { type: 'string', nullable: true },
          isNewUser: { type: 'boolean', description: 'False if email already existed in system' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Anplexa API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" >
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #0f0f1a; font-family: 'Inter', sans-serif; }
    
    .anplexa-header {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }
    .anplexa-header h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
    .anplexa-header nav a {
      color: white;
      text-decoration: none;
      margin-left: 20px;
      font-weight: 500;
      font-size: 0.9rem;
      opacity: 0.9;
      transition: opacity 0.2s;
    }
    .anplexa-header nav a:hover { opacity: 1; }
    .version-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .swagger-ui { background: #0f0f1a; }
    .swagger-ui .info .title { color: #f1f5f9; }
    .swagger-ui .info p, .swagger-ui .info li { color: #cbd5e1; }
    .swagger-ui .scheme-container { background: #1e1b4b; border-top: 1px solid #4c1d95; }
    
    .swagger-ui .opblock { border-radius: 12px; border: none; margin-bottom: 16px; }
    .swagger-ui .opblock-tag { color: #f1f5f9; border-bottom: 1px solid #4c1d95; }
    .swagger-ui .opblock-summary-path { color: #e2e8f0; }
    
    .swagger-ui .opblock-section-header { background: #1e1b4b; }
    .swagger-ui .opblock-body pre { background: #1e1b4b; color: #86efac; }
    
    .swagger-ui .responses-inner { background: #1e1b4b; }
    .swagger-ui .response-col_status { color: #10b981; }
    .swagger-ui .response-col_description { color: #e2e8f0; }

    .swagger-ui .btn.authorize { background: #6366f1; border-color: #6366f1; color: white; }
    .swagger-ui .btn.execute { background: #10b981; border-color: #10b981; color: white; }

    .swagger-ui input[type=text], .swagger-ui textarea { background: #1e1b4b; border: 1px solid #4c1d95; color: white; }
  </style>
</head>
<body>
  <div class="anplexa-header">
    <div style="display: flex; align-items: center; gap: 16px;">
      <h1>🔮 Anplexa API Docs</h1>
      <span class="version-badge">v1.0.0</span>
    </div>
    <nav>
      <a href="/">Home</a>
      <a href="/docs/export">Export</a>
      <a href="/admin">Admin</a>
    </nav>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(apiDocs)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
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
  res.setHeader('Content-Disposition', 'attachment; filename="anplexa-api-openapi.json"');
  res.json(apiDocs);
});

docsRouter.get('/1384/endpoints-public', (req, res) => {
  const endpoints = [
    { category: 'Authentication', endpoints: [
      { method: 'POST', path: '/api/auth/register', description: 'Register a new user account', auth: 'None' },
      { method: 'POST', path: '/api/auth/login', description: 'Login with email/password, returns JWT tokens', auth: 'None' },
      { method: 'POST', path: '/api/auth/refresh', description: 'Refresh access token using refresh token', auth: 'None' },
      { method: 'POST', path: '/api/auth/logout', description: 'Logout and invalidate session', auth: 'JWT' },
      { method: 'GET', path: '/api/auth/me', description: 'Get current user profile and preferences', auth: 'JWT/API Key' },
      { method: 'GET', path: '/api/auth/credits', description: 'Check remaining daily message credits', auth: 'JWT/API Key' },
      { method: 'GET', path: '/api/auth/subscription-status', description: 'Get fresh subscription status (no cache)', auth: 'JWT' },
      { method: 'PUT', path: '/api/auth/chat-name', description: 'Update user preferred chat name', auth: 'JWT/API Key' },
    ]},
    { category: 'Chat (AI Companion)', endpoints: [
      { method: 'POST', path: '/api/chat', description: 'Send message with streaming SSE response', auth: 'JWT/API Key' },
      { method: 'POST', path: '/api/chat/non-streaming', description: 'Send message, get complete JSON response', auth: 'JWT/API Key' },
      { method: 'GET', path: '/api/chat/config', description: 'Get chat configuration (models, limits)', auth: 'None' },
    ]},
    { category: 'Conversations', endpoints: [
      { method: 'GET', path: '/api/conversations', description: 'List all user conversations', auth: 'JWT/API Key' },
      { method: 'POST', path: '/api/conversations', description: 'Create a new conversation', auth: 'JWT/API Key' },
      { method: 'GET', path: '/api/conversations/:id', description: 'Get conversation with messages', auth: 'JWT/API Key' },
      { method: 'DELETE', path: '/api/conversations/:id', description: 'Delete a conversation', auth: 'JWT/API Key' },
    ]},
    { category: 'User Settings', endpoints: [
      { method: 'GET', path: '/api/settings', description: 'Get user preferences', auth: 'JWT/API Key' },
      { method: 'PUT', path: '/api/settings', description: 'Update user preferences', auth: 'JWT/API Key' },
      { method: 'PUT', path: '/api/settings/personality', description: 'Update personality mode', auth: 'JWT/API Key' },
      { method: 'PUT', path: '/api/settings/gender', description: 'Update preferred AI gender', auth: 'JWT/API Key' },
    ]},
    { category: 'Stripe (Payments)', endpoints: [
      { method: 'GET', path: '/api/stripe/products', description: 'List available subscription products', auth: 'None' },
      { method: 'POST', path: '/api/stripe/checkout', description: 'Create Stripe checkout session', auth: 'JWT' },
      { method: 'POST', path: '/api/stripe/verify-checkout', description: 'Verify checkout and update subscription', auth: 'JWT' },
      { method: 'POST', path: '/api/stripe/portal', description: 'Create customer portal session', auth: 'JWT' },
      { method: 'GET', path: '/api/stripe/subscription', description: 'Get user subscription details', auth: 'JWT' },
      { method: 'POST', path: '/api/stripe/webhook', description: 'Stripe webhook handler', auth: 'Stripe Signature' },
    ]},
    { category: 'Public (No Auth)', endpoints: [
      { method: 'POST', path: '/api/register-subscriber', description: 'Waitlist/landing page signup', auth: 'None' },
      { method: 'GET', path: '/api/health', description: 'Server health check', auth: 'None' },
      { method: 'GET', path: '/api/health/database', description: 'Database connection check', auth: 'None' },
      { method: 'GET', path: '/api/health/ollama', description: 'Ollama LLM connection check', auth: 'None' },
      { method: 'GET', path: '/api/health/full', description: 'Full system health check', auth: 'None' },
    ]},
    { category: 'Funnel Integration', endpoints: [
      { method: 'POST', path: '/api/funnel/users', description: 'Create user via external funnel', auth: 'Funnel API Key' },
      { method: 'POST', path: '/api/funnel/checkout', description: 'Create checkout for funnel user', auth: 'Funnel API Key' },
      { method: 'GET', path: '/api/funnel/subscription/:userId', description: 'Get user subscription status', auth: 'Funnel API Key' },
      { method: 'POST', path: '/api/funnel/amplexa/complete', description: 'Complete Amplexa funnel flow', auth: 'Funnel API Key' },
    ]},
    { category: 'Webhooks', endpoints: [
      { method: 'POST', path: '/api/webhooks/stripe', description: 'Stripe event webhook', auth: 'Webhook Secret' },
      { method: 'POST', path: '/api/webhooks/email', description: 'Email event webhook (bounces, opens)', auth: 'Webhook Secret' },
    ]},
    { category: 'Admin API', endpoints: [
      { method: 'GET', path: '/api/admin/users', description: 'List all users with filters', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/users/:id', description: 'Get user details', auth: 'Admin JWT' },
      { method: 'PUT', path: '/api/admin/users/:id', description: 'Update user (subscription, credits)', auth: 'Admin JWT' },
      { method: 'DELETE', path: '/api/admin/users/:id', description: 'Delete user and all data', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/stats', description: 'Get system statistics', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/stats/source-channels', description: 'Get funnel/source analytics', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/contact-submissions', description: 'View contact audit log', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/api-keys', description: 'List API keys', auth: 'Admin JWT' },
      { method: 'POST', path: '/api/admin/api-keys', description: 'Generate new API key', auth: 'Admin JWT' },
      { method: 'DELETE', path: '/api/admin/api-keys/:id', description: 'Revoke API key', auth: 'Admin JWT' },
      { method: 'GET', path: '/api/admin/system-prompts', description: 'List system prompts', auth: 'Admin JWT' },
      { method: 'POST', path: '/api/admin/system-prompts', description: 'Create/update system prompt', auth: 'Admin JWT' },
    ]},
    { category: 'CRM', endpoints: [
      { method: 'GET', path: '/admin/crm', description: 'CRM dashboard', auth: 'Admin Session' },
      { method: 'GET', path: '/admin/crm/sequences', description: 'Email sequences list', auth: 'Admin Session' },
      { method: 'GET', path: '/admin/crm/queue', description: 'Email queue status', auth: 'Admin Session' },
      { method: 'GET', path: '/admin/crm/analytics', description: 'Email analytics', auth: 'Admin Session' },
    ]},
  ];

  const methodColors: Record<string, string> = {
    GET: '#28a745',
    POST: '#007bff',
    PUT: '#ffc107',
    DELETE: '#dc3545',
    PATCH: '#17a2b8',
  };

  let tableHtml = '';
  for (const cat of endpoints) {
    tableHtml += `<h2 style="margin-top: 30px; color: #a78bfa; border-bottom: 1px solid #4c1d95; padding-bottom: 8px;">${cat.category}</h2>`;
    tableHtml += '<table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;"><thead><tr><th style="text-align: left; padding: 12px; background: #1e1b4b; color: #a78bfa; width: 80px;">Method</th><th style="text-align: left; padding: 12px; background: #1e1b4b; color: #a78bfa;">Endpoint</th><th style="text-align: left; padding: 12px; background: #1e1b4b; color: #a78bfa;">Description</th><th style="text-align: left; padding: 12px; background: #1e1b4b; color: #a78bfa; width: 120px;">Auth</th></tr></thead><tbody>';
    for (const ep of cat.endpoints) {
      const color = methodColors[ep.method] || '#888';
      tableHtml += `<tr style="border-bottom: 1px solid #4c1d95;">
        <td style="padding: 10px;"><span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">${ep.method}</span></td>
        <td style="padding: 10px;"><code style="background: #1e1b4b; padding: 4px 8px; border-radius: 3px; color: #86efac;">${ep.path}</code></td>
        <td style="padding: 10px; color: #cbd5e1;">${ep.description}</td>
        <td style="padding: 10px;"><span style="color: #888; font-size: 12px;">${ep.auth}</span></td>
      </tr>`;
    }
    tableHtml += '</tbody></table>';
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anplexa API Endpoints - Public Reference</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0f0f1a; color: #e2e8f0; min-height: 100vh; }
    .header {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
    }
    .header h1 { font-size: 1.5rem; font-weight: 700; }
    .header nav a { color: white; text-decoration: none; margin-left: 20px; font-weight: 500; opacity: 0.9; }
    .header nav a:hover { opacity: 1; }
    .container { max-width: 1400px; margin: 0 auto; padding: 40px; }
    h1.title { color: #f1f5f9; margin-bottom: 10px; font-size: 2rem; }
    .subtitle { color: #94a3b8; margin-bottom: 30px; }
    .card { background: #1e1b4b; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #4c1d95; }
    .card h3 { color: #a78bfa; margin-bottom: 15px; }
    table { width: 100%; }
    code { font-family: 'Courier New', monospace; }
    .btn { 
      display: inline-block;
      padding: 10px 20px; 
      background: #6366f1; 
      color: white; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      text-decoration: none;
      margin-right: 10px;
    }
    .btn:hover { background: #4f46e5; }
    .btn-secondary { background: #4c1d95; }
    .btn-secondary:hover { background: #5b21b6; }
    .footer { margin-top: 60px; padding: 20px 0; border-top: 1px solid #4c1d95; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: center; gap: 16px;">
      <h1>Anplexa API Endpoints</h1>
      <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem;">v1.0.0</span>
    </div>
    <nav>
      <a href="/">Home</a>
      <a href="/docs">Swagger Docs</a>
      <a href="/docs/openapi.json">OpenAPI JSON</a>
      <a href="/admin">Admin</a>
    </nav>
  </div>
  
  <div class="container">
    <h1 class="title">Complete API Endpoints Reference</h1>
    <p class="subtitle">All available Anplexa API endpoints with authentication requirements</p>
    
    <div class="card">
      <h3>Authentication Methods</h3>
      <table>
        <tr><td style="padding: 8px; color: #86efac;"><strong>JWT Bearer Token</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">Authorization: Bearer &lt;token&gt;</code></td><td style="padding: 8px; color: #94a3b8;">User sessions from login</td></tr>
        <tr><td style="padding: 8px; color: #86efac;"><strong>API Key</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">X-API-Key: &lt;key&gt;</code></td><td style="padding: 8px; color: #94a3b8;">Server-to-server integration</td></tr>
        <tr><td style="padding: 8px; color: #86efac;"><strong>Funnel API Key</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">Authorization: Bearer &lt;funnel_key&gt;</code></td><td style="padding: 8px; color: #94a3b8;">External funnel integrations</td></tr>
        <tr><td style="padding: 8px; color: #86efac;"><strong>Admin JWT</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">Authorization: Bearer &lt;admin_token&gt;</code></td><td style="padding: 8px; color: #94a3b8;">Admin API access (isAdmin=true)</td></tr>
      </table>
    </div>
    
    <div class="card">
      <h3>Base URLs</h3>
      <table>
        <tr><td style="padding: 8px; color: #86efac;"><strong>Production</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">https://api.anplexa.com</code></td></tr>
        <tr><td style="padding: 8px; color: #86efac;"><strong>Development</strong></td><td style="padding: 8px;"><code style="color: #fbbf24;">https://&lt;repl-domain&gt;.replit.dev</code></td></tr>
      </table>
    </div>
    
    <div style="margin-bottom: 30px;">
      <button onclick="downloadEndpoints()" class="btn">Download as JSON</button>
      <a href="/docs/openapi.json" class="btn btn-secondary" download>Download OpenAPI Spec</a>
      <a href="/docs" class="btn btn-secondary">Interactive Swagger Docs</a>
    </div>
    
    ${tableHtml}
    
    <div class="footer">
      <p>Anplexa API &copy; ${new Date().getFullYear()} | <a href="/docs" style="color: #a78bfa;">Swagger Docs</a> | <a href="/" style="color: #a78bfa;">Home</a></p>
    </div>
  </div>
  
  <script>
  function downloadEndpoints() {
    const endpoints = ${JSON.stringify(endpoints)};
    const blob = new Blob([JSON.stringify(endpoints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anplexa-api-endpoints.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

docsRouter.get('/export', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Export API Documentation</title>
  <style>
    body { font-family: sans-serif; background: #0f0f1a; color: white; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #a78bfa; }
    .card { background: #1e1b4b; padding: 20px; border-radius: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .btn { background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Export API Specification</h1>
    <div class="card">
      <div>
        <h3>OpenAPI JSON</h3>
        <p>Download the full specification for Postman or Insomnia.</p>
      </div>
      <a href="/docs/openapi.json" class="btn" download>Download</a>
    </div>
    <p style="margin-top: 20px;"><a href="/docs" style="color: #a78bfa;">← Back to Docs</a></p>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
