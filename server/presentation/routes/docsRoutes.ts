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
  const fullEndpoints = [
    { 
      category: 'Authentication',
      description: 'User registration, login, and session management',
      endpoints: [
        { 
          method: 'POST', 
          path: '/api/auth/register', 
          description: 'Register a new user account. First user automatically becomes admin.',
          auth: 'None',
          requestBody: {
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', minLength: 6, example: 'password123' },
              displayName: { type: 'string', example: 'John Doe' }
            }
          },
          response: {
            '201': {
              message: 'string',
              user: { id: 'string (UUID)', email: 'string', displayName: 'string', isAdmin: 'boolean' },
              accessToken: 'string (JWT)',
              refreshToken: 'string (JWT)'
            },
            '400': { error: 'Email already registered' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/auth/login', 
          description: 'Authenticate with email and password to receive JWT tokens.',
          auth: 'None',
          requestBody: {
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', example: 'password123' }
            }
          },
          response: {
            '200': {
              message: 'Login successful',
              user: { id: 'string', email: 'string', displayName: 'string', isAdmin: 'boolean' },
              accessToken: 'string (JWT, 15min expiry)',
              refreshToken: 'string (JWT, 7day expiry)'
            },
            '401': { error: 'Invalid email or password' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/auth/refresh', 
          description: 'Exchange a valid refresh token for a new access token pair.',
          auth: 'None',
          requestBody: {
            required: ['refreshToken'],
            properties: {
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
            }
          },
          response: {
            '200': { message: 'Token refreshed', accessToken: 'string', refreshToken: 'string' },
            '401': { error: 'Invalid or expired refresh token' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/auth/logout', 
          description: 'Invalidate the current session.',
          auth: 'JWT',
          requestBody: {
            properties: {
              refreshToken: { type: 'string', description: 'Optional, logs out specific session' }
            }
          },
          response: { '200': { message: 'Logged out successfully' } }
        },
        { 
          method: 'GET', 
          path: '/api/auth/me', 
          description: 'Retrieve the authenticated user profile and preferences.',
          auth: 'JWT / API Key',
          response: {
            '200': {
              user: {
                id: 'string (UUID)',
                email: 'string',
                displayName: 'string | null',
                isAdmin: 'boolean',
                storagePreference: '"local" | "cloud"',
                chatName: 'string | null',
                personalityMode: '"nurturing" | "playful" | "dominant" | "filthy_sexy" | "intimate_companion" | "intellectual_muse"',
                preferredGender: '"male" | "female" | "non-binary" | "custom"',
                subscriptionStatus: '"subscribed" | "not_subscribed"'
              },
              preferences: { gender: 'string', preferredLength: 'string', preferredStyle: 'string' }
            }
          }
        },
        { 
          method: 'GET', 
          path: '/api/auth/credits', 
          description: 'Check remaining daily message credits. Free users get 5/day.',
          auth: 'JWT / API Key',
          response: {
            '200': {
              credits: 'integer | null (null if unlimited)',
              maxCredits: 'integer (5 for free users)',
              unlimited: 'boolean',
              resetsAt: 'ISO8601 datetime | null'
            }
          }
        },
        { 
          method: 'GET', 
          path: '/api/auth/subscription-status', 
          description: 'Get fresh subscription status with no-cache headers.',
          auth: 'JWT',
          response: {
            '200': {
              subscriptionStatus: '"subscribed" | "not_subscribed" | "trialing" | "canceled"',
              isSubscribed: 'boolean',
              credits: 'integer',
              hasStripeCustomer: 'boolean',
              hasActiveSubscription: 'boolean',
              timestamp: 'ISO8601 datetime'
            }
          }
        },
        { 
          method: 'PUT', 
          path: '/api/auth/chat-name', 
          description: 'Update the user preferred name for personalized AI interactions.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['name'],
            properties: { name: { type: 'string', maxLength: 50, example: 'Alex' } }
          },
          response: { '200': { message: 'Chat name updated', chatName: 'string' } }
        },
        { 
          method: 'PUT', 
          path: '/api/auth/personality-mode', 
          description: 'Update the AI personality mode for conversations.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['personalityMode'],
            properties: { 
              personalityMode: { 
                type: 'string', 
                enum: ['nurturing', 'playful', 'dominant', 'filthy_sexy', 'intimate_companion', 'intellectual_muse'],
                example: 'nurturing' 
              } 
            }
          },
          response: { '200': { message: 'Personality mode updated', personalityMode: 'string' } }
        },
        { 
          method: 'PUT', 
          path: '/api/auth/preferred-gender', 
          description: 'Update the preferred AI companion gender.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['gender'],
            properties: { 
              gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'custom'], example: 'female' },
              customGender: { type: 'string', maxLength: 100, description: 'Required if gender is "custom"' }
            }
          },
          response: { '200': { message: 'Preferred gender updated', gender: 'string' } }
        },
      ]
    },
    { 
      category: 'Chat (AI Companion)',
      description: 'Send messages to the AI companion with streaming or non-streaming responses',
      endpoints: [
        { 
          method: 'POST', 
          path: '/api/chat', 
          description: 'Send a message and receive a streaming SSE response from the AI companion. Uses credits for free users.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['message'],
            properties: {
              message: { type: 'string', maxLength: 10000, example: 'Hello, how are you?' },
              conversationId: { type: 'string (UUID)', description: 'Continue existing conversation' },
              preferences: {
                type: 'object',
                properties: {
                  length: { type: 'string', enum: ['brief', 'moderate', 'detailed'], default: 'moderate' },
                  style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'], default: 'thoughtful' }
                }
              },
              personalityMode: { type: 'string', enum: ['nurturing', 'playful', 'dominant', 'filthy_sexy', 'intimate_companion', 'intellectual_muse'] },
              storeLocally: { type: 'boolean', default: false, description: 'Skip server-side storage' },
              newChat: { type: 'boolean', default: false, description: 'Trigger ice-breaker response' }
            }
          },
          response: {
            '200 (SSE Stream)': {
              'Content-Type': 'text/event-stream',
              events: [
                'data: {"type":"text","content":"chunk of response"}',
                'data: {"type":"done","conversationId":"uuid","userMessageId":"uuid","assistantMessageId":"uuid"}'
              ]
            },
            '403': {
              errorCode: 'CREDIT_LIMIT_REACHED',
              error: 'Credits exhausted',
              message: 'All used up for today...',
              credits: 0,
              maxCredits: 5,
              resetsAt: 'ISO8601 datetime'
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/chat/non-streaming', 
          description: 'Send a message and receive the complete response as JSON (no streaming).',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['message'],
            properties: {
              message: { type: 'string', maxLength: 10000, example: 'Tell me a joke' },
              preferences: {
                type: 'object',
                properties: {
                  length: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
                  style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] }
                }
              },
              newChat: { type: 'boolean', default: false }
            }
          },
          response: {
            '200': {
              response: 'string (AI response text)',
              model: 'string (e.g., "darkplanet")',
              length: '"brief" | "moderate" | "detailed"',
              style: '"casual" | "thoughtful" | "creative"',
              isNewChat: 'boolean'
            }
          }
        },
        { 
          method: 'GET', 
          path: '/api/chat/config', 
          description: 'Get chat configuration including companion name and defaults.',
          auth: 'None',
          response: {
            '200': {
              name: 'string (companion name)',
              defaultGender: '"male" | "female" | "non-binary" | "custom"',
              defaultLength: '"brief" | "moderate" | "detailed"',
              defaultStyle: '"casual" | "thoughtful" | "creative"',
              welcomeTitle: 'string',
              welcomeMessage: 'string'
            }
          }
        },
      ]
    },
    { 
      category: 'Conversations',
      description: 'Manage conversation history and messages',
      endpoints: [
        { 
          method: 'GET', 
          path: '/api/conversations', 
          description: 'List all conversations for the authenticated user.',
          auth: 'JWT / API Key',
          response: {
            '200': {
              conversations: [{
                id: 'string (UUID)',
                userId: 'string (UUID)',
                title: 'string',
                createdAt: 'ISO8601 datetime',
                updatedAt: 'ISO8601 datetime'
              }]
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/conversations', 
          description: 'Create a new conversation.',
          auth: 'JWT / API Key',
          requestBody: {
            properties: { title: { type: 'string', example: 'My New Chat' } }
          },
          response: {
            '201': {
              conversation: { id: 'string', userId: 'string', title: 'string', createdAt: 'datetime', updatedAt: 'datetime' }
            }
          }
        },
        { 
          method: 'GET', 
          path: '/api/conversations/:id', 
          description: 'Get a conversation with all its messages.',
          auth: 'JWT / API Key',
          pathParams: { id: 'string (UUID) - Conversation ID' },
          response: {
            '200': {
              conversation: { id: 'string', title: 'string', createdAt: 'datetime' },
              messages: [{
                id: 'string',
                role: '"user" | "assistant"',
                content: 'string',
                createdAt: 'datetime'
              }]
            },
            '404': { error: 'Conversation not found' }
          }
        },
        { 
          method: 'PUT', 
          path: '/api/conversations/:id', 
          description: 'Update conversation title.',
          auth: 'JWT / API Key',
          pathParams: { id: 'string (UUID)' },
          requestBody: {
            properties: { title: { type: 'string', example: 'Updated Title' } }
          },
          response: { '200': { message: 'Conversation updated' } }
        },
        { 
          method: 'DELETE', 
          path: '/api/conversations/:id', 
          description: 'Delete a conversation and all its messages.',
          auth: 'JWT / API Key',
          pathParams: { id: 'string (UUID)' },
          response: { '200': { message: 'Conversation deleted' } }
        },
        { 
          method: 'DELETE', 
          path: '/api/conversations/:id/messages', 
          description: 'Clear all messages in a conversation without deleting it.',
          auth: 'JWT / API Key',
          pathParams: { id: 'string (UUID)' },
          response: { '200': { message: 'Messages cleared' } }
        },
      ]
    },
    { 
      category: 'User Settings',
      description: 'Manage user preferences, themes, and API keys',
      endpoints: [
        { 
          method: 'GET', 
          path: '/api/settings', 
          description: 'Get all user settings and preferences.',
          auth: 'JWT / API Key',
          response: {
            '200': {
              user: { id: 'string', email: 'string', displayName: 'string', storagePreference: '"local" | "cloud"' },
              preferences: {
                gender: '"male" | "female" | "non-binary" | "custom" | null',
                customGender: 'string | null',
                preferredLength: '"brief" | "moderate" | "detailed"',
                preferredStyle: '"casual" | "thoughtful" | "creative"',
                themeHue: 'integer (0-360)',
                useOrangeAccent: 'boolean'
              }
            }
          }
        },
        { 
          method: 'PUT', 
          path: '/api/settings', 
          description: 'Update general settings (display name).',
          auth: 'JWT / API Key',
          requestBody: {
            properties: { displayName: { type: 'string', example: 'John Doe' } }
          },
          response: { '200': { message: 'Settings updated' } }
        },
        { 
          method: 'PUT', 
          path: '/api/settings/storage', 
          description: 'Toggle storage preference between local and cloud.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['storagePreference'],
            properties: { storagePreference: { type: 'string', enum: ['local', 'cloud'] } }
          },
          response: { '200': { message: 'Storage preference updated', storagePreference: 'string' } }
        },
        { 
          method: 'PUT', 
          path: '/api/settings/gender', 
          description: 'Update preferred AI companion gender.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['gender'],
            properties: {
              gender: { type: 'string', enum: ['male', 'female', 'non-binary', 'custom'] },
              customGender: { type: 'string', maxLength: 100 }
            }
          },
          response: { '200': { message: 'Gender preference updated', gender: 'string', customGender: 'string | null' } }
        },
        { 
          method: 'PUT', 
          path: '/api/settings/response', 
          description: 'Update response length and style preferences.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['preferredLength', 'preferredStyle'],
            properties: {
              preferredLength: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
              preferredStyle: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] }
            }
          },
          response: { '200': { message: 'Response preferences updated', preferredLength: 'string', preferredStyle: 'string' } }
        },
        { 
          method: 'PUT', 
          path: '/api/settings/theme', 
          description: 'Sync theme preferences (hue and accent color).',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['themeHue', 'useOrangeAccent'],
            properties: {
              themeHue: { type: 'integer', min: 0, max: 360, example: 220 },
              useOrangeAccent: { type: 'boolean', example: false }
            }
          },
          response: { '200': { message: 'Theme preferences updated' } }
        },
        { 
          method: 'POST', 
          path: '/api/settings/feedback', 
          description: 'Submit user feedback or feature request.',
          auth: 'JWT / API Key',
          requestBody: {
            required: ['type', 'content'],
            properties: {
              type: { type: 'string', enum: ['feedback', 'feature'] },
              content: { type: 'string', maxLength: 5000 }
            }
          },
          response: { '201': { message: 'Feedback submitted' } }
        },
        { 
          method: 'GET', 
          path: '/api/settings/api-key', 
          description: 'Get user API key info (prefix only, not full key).',
          auth: 'JWT / API Key',
          response: {
            '200': {
              apiKey: {
                id: 'string',
                name: 'string',
                keyPrefix: 'string (first 8 chars)',
                createdAt: 'datetime',
                lastUsedAt: 'datetime | null'
              }
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/settings/api-key', 
          description: 'Create or regenerate API key. Returns full key only once.',
          auth: 'JWT / API Key',
          response: {
            '201': {
              message: 'API key created',
              apiKey: { key: 'string (SAVE THIS!)', keyPrefix: 'string' }
            }
          }
        },
        { 
          method: 'DELETE', 
          path: '/api/settings/api-key', 
          description: 'Revoke current API key.',
          auth: 'JWT / API Key',
          response: { '200': { message: 'API key revoked' } }
        },
        { 
          method: 'GET', 
          path: '/api/settings/usage', 
          description: 'Get API usage for current month.',
          auth: 'JWT / API Key',
          response: {
            '200': { callsThisMonth: 'integer', monthStart: 'ISO8601 datetime' }
          }
        },
      ]
    },
    { 
      category: 'Stripe (Payments)',
      description: 'Subscription management and payment processing via Stripe',
      endpoints: [
        { 
          method: 'GET', 
          path: '/api/stripe/products', 
          description: 'List available subscription products and prices.',
          auth: 'None',
          response: {
            '200': {
              products: [{
                id: 'string (Stripe product ID)',
                name: 'string',
                description: 'string',
                price: { id: 'string', amount: 'integer (cents)', currency: 'string', interval: '"month" | "year"' }
              }]
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/stripe/checkout', 
          description: 'Create a Stripe checkout session for subscription.',
          auth: 'JWT',
          requestBody: {
            required: ['priceId'],
            properties: {
              priceId: { type: 'string', example: 'price_1234...' },
              successUrl: { type: 'string', description: 'Redirect URL after success' },
              cancelUrl: { type: 'string', description: 'Redirect URL if cancelled' }
            }
          },
          response: {
            '200': { url: 'string (Stripe checkout URL)', sessionId: 'string' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/stripe/verify-checkout', 
          description: 'Verify checkout session and update subscription status immediately (fixes webhook race condition).',
          auth: 'JWT',
          requestBody: {
            required: ['sessionId'],
            properties: { sessionId: { type: 'string', example: 'cs_test_...' } }
          },
          response: {
            '200': { success: true, subscriptionStatus: '"subscribed"', message: 'Subscription activated' },
            '400': { success: false, error: 'Session not completed' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/stripe/portal', 
          description: 'Create Stripe customer portal session for subscription management.',
          auth: 'JWT',
          requestBody: {
            properties: { returnUrl: { type: 'string', description: 'URL to return to after portal' } }
          },
          response: { '200': { url: 'string (Stripe portal URL)' } }
        },
        { 
          method: 'GET', 
          path: '/api/stripe/subscription', 
          description: 'Get user current subscription details.',
          auth: 'JWT',
          response: {
            '200': {
              hasSubscription: 'boolean',
              subscriptionStatus: '"subscribed" | "not_subscribed" | "canceled"',
              currentPeriodEnd: 'ISO8601 datetime | null',
              cancelAtPeriodEnd: 'boolean'
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/stripe/webhook', 
          description: 'Stripe webhook handler for subscription events.',
          auth: 'Stripe Signature',
          requestBody: { description: 'Raw Stripe webhook event (signature verified via stripe-signature header)' },
          response: { '200': { received: true } }
        },
      ]
    },
    { 
      category: 'Public (No Auth)',
      description: 'Public endpoints for landing pages, health checks, and lead capture',
      endpoints: [
        { 
          method: 'POST', 
          path: '/api/register-subscriber', 
          description: 'Public waitlist/landing page signup. All submissions logged to audit trail.',
          auth: 'None',
          requestBody: {
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              displayName: { type: 'string', maxLength: 100, example: 'John Doe' },
              chatName: { type: 'string', maxLength: 50, example: 'John' },
              funnelType: { type: 'string', enum: ['waitlist', 'direct'], default: 'direct' },
              persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'] },
              entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic', 'landing'] },
              utm_source: { type: 'string' },
              utm_medium: { type: 'string' },
              utm_campaign: { type: 'string' }
            }
          },
          response: {
            '201': { message: 'Successfully registered', email: 'string', isNewUser: 'boolean' },
            '200': { message: 'Already registered', email: 'string' }
          }
        },
        { 
          method: 'GET', 
          path: '/api/health', 
          description: 'Basic server health check.',
          auth: 'None',
          response: { '200': { status: '"ok"', timestamp: 'ISO8601 datetime' } }
        },
        { 
          method: 'GET', 
          path: '/api/health/database', 
          description: 'Database connection health check.',
          auth: 'None',
          response: { '200': { status: '"ok"', database: '"connected"' } }
        },
        { 
          method: 'GET', 
          path: '/api/health/ollama', 
          description: 'Ollama LLM connection health check.',
          auth: 'None',
          response: { '200': { status: '"ok"', ollama: '"connected"', models: ['array of model names'] } }
        },
        { 
          method: 'GET', 
          path: '/api/health/full', 
          description: 'Full system health check (server, database, Ollama).',
          auth: 'None',
          response: {
            '200': {
              status: '"ok" | "degraded"',
              server: '"ok"',
              database: '"ok" | "error"',
              ollama: '"ok" | "error"',
              timestamp: 'ISO8601 datetime'
            }
          }
        },
      ]
    },
    { 
      category: 'Funnel Integration',
      description: 'External funnel integration for creating users and managing subscriptions',
      endpoints: [
        { 
          method: 'POST', 
          path: '/api/funnel/users', 
          description: 'Create a user via external funnel. Submissions logged to audit trail. Users tagged with sourceChannel: funnel.',
          auth: 'Funnel API Key (FUNNEL_API_SECRET)',
          requestBody: {
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', minLength: 6 },
              displayName: { type: 'string' },
              chatName: { type: 'string', maxLength: 50, description: 'Name AI uses to address user' },
              funnelType: { type: 'string', enum: ['waitlist', 'direct'], default: 'direct' },
              persona: { type: 'string', enum: ['lonely', 'curious', 'privacy'] },
              entrySource: { type: 'string', enum: ['instagram', 'tiktok', 'reddit', 'search', 'retargeting', 'organic'] },
              subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'], default: 'not_subscribed' }
            }
          },
          response: {
            '201': {
              message: 'User created successfully',
              user: { id: 'string', email: 'string', displayName: 'string' },
              apiKey: 'string (auto-generated)',
              accessToken: 'string',
              refreshToken: 'string'
            },
            '400': { error: 'Email already registered' },
            '403': { error: 'Invalid funnel API secret' }
          }
        },
        { 
          method: 'POST', 
          path: '/api/funnel/checkout', 
          description: 'Create Stripe checkout session for a funnel user.',
          auth: 'Funnel API Key',
          requestBody: {
            required: ['userId', 'priceId'],
            properties: {
              userId: { type: 'string (UUID)' },
              priceId: { type: 'string (Stripe price ID)' },
              successUrl: { type: 'string' },
              cancelUrl: { type: 'string' }
            }
          },
          response: { '200': { url: 'string', sessionId: 'string' } }
        },
        { 
          method: 'GET', 
          path: '/api/funnel/subscription/:userId', 
          description: 'Get subscription status for a funnel user.',
          auth: 'Funnel API Key',
          pathParams: { userId: 'string (UUID)' },
          response: {
            '200': {
              userId: 'string',
              subscriptionStatus: '"subscribed" | "not_subscribed"',
              credits: 'integer'
            }
          }
        },
        { 
          method: 'POST', 
          path: '/api/funnel/amplexa/complete', 
          description: 'Complete Amplexa personality funnel flow with profiling data.',
          auth: 'Funnel API Key',
          requestBody: {
            required: ['userId'],
            properties: {
              userId: { type: 'string (UUID)' },
              funnelName: { type: 'string', example: 'amplexa_v1' },
              responses: { type: 'object', description: 'Key-value pairs of funnel responses' },
              primaryNeed: { type: 'string', example: 'companionship' },
              communicationStyle: { type: 'string', example: 'warm and supportive' },
              pace: { type: 'string', example: 'gradual' },
              tags: { type: 'array of strings', example: ['empathetic', 'listener'] }
            }
          },
          response: { '200': { message: 'Amplexa funnel completed', userId: 'string' } }
        },
      ]
    },
    { 
      category: 'Admin API',
      description: 'Administrative endpoints (requires isAdmin=true)',
      endpoints: [
        { method: 'GET', path: '/api/admin/users', description: 'List all users with filters. Add ?format=json for JSON response.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/users/:id', description: 'Get detailed user info including billing.', auth: 'Admin JWT' },
        { method: 'DELETE', path: '/api/admin/users/:id', description: 'Delete user and all their data (conversations, messages, feedback).', auth: 'Admin JWT' },
        { method: 'PUT', path: '/api/admin/users/:id/subscription', description: 'Manually set subscription status (enables manual override flag).', auth: 'Admin JWT',
          requestBody: { properties: { subscriptionStatus: { type: 'string', enum: ['subscribed', 'not_subscribed'] } } } },
        { method: 'PUT', path: '/api/admin/users/:id/credits', description: 'Update user credits (set, add, or subtract).', auth: 'Admin JWT',
          requestBody: { properties: { credits: { type: 'integer' }, operation: { type: 'string', enum: ['set', 'add', 'subtract'], default: 'set' } } } },
        { method: 'GET', path: '/api/admin/users/:id/billing', description: 'Get user billing info (subscription + credits).', auth: 'Admin JWT' },
        { method: 'PUT', path: '/api/admin/users/:id/password', description: 'Reset user password.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/stats', description: 'Get system statistics (users, conversations, messages, feedback counts).', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/stats/source-channels', description: 'Get funnel/source channel analytics.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/contact-submissions', description: 'View contact audit log with filters.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/feedback', description: 'List all user feedback.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/companion', description: 'Get full companion config.', auth: 'Admin JWT' },
        { method: 'PUT', path: '/api/admin/companion', description: 'Update companion config.', auth: 'Admin JWT' },
        { method: 'POST', path: '/api/admin/test-ollama', description: 'Test Ollama connection with both models.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/models', description: 'List available Ollama models.', auth: 'Admin JWT' },
        { method: 'GET', path: '/api/admin/system-prompts', description: 'List all system prompts with version history.', auth: 'Admin JWT' },
        { method: 'POST', path: '/api/admin/system-prompts', description: 'Create or update system prompt.', auth: 'Admin JWT' },
      ]
    },
    { 
      category: 'Webhooks',
      description: 'External webhook handlers',
      endpoints: [
        { method: 'POST', path: '/api/webhooks/stripe', description: 'Stripe event webhook (subscription.created, updated, deleted, invoice.paid).', auth: 'Webhook Secret (stripe-signature header)' },
        { method: 'POST', path: '/api/webhooks/subscription', description: 'Internal subscription update webhook.', auth: 'WEBHOOK_SECRET header' },
        { method: 'POST', path: '/api/webhooks/credits', description: 'Internal credits update webhook.', auth: 'WEBHOOK_SECRET header' },
      ]
    },
  ];

  const methodColors: Record<string, string> = { GET: '#28a745', POST: '#007bff', PUT: '#ffc107', DELETE: '#dc3545', PATCH: '#17a2b8' };

  let endpointsHtml = '';
  for (const cat of fullEndpoints) {
    endpointsHtml += `<div class="category" id="${cat.category.toLowerCase().replace(/[^a-z]/g, '-')}">
      <h2>${cat.category}</h2>
      <p class="cat-desc">${cat.description}</p>`;
    
    for (const ep of cat.endpoints) {
      const color = methodColors[ep.method] || '#888';
      const endpointId = `${ep.method}-${ep.path}`.replace(/[^a-zA-Z0-9]/g, '-');
      
      let detailsHtml = '';
      if (ep.pathParams) {
        detailsHtml += '<div class="section"><h4>Path Parameters</h4><div class="schema">' + 
          Object.entries(ep.pathParams).map(([k,v]) => `<div class="prop"><span class="key">${k}</span>: <span class="type">${v}</span></div>`).join('') + '</div></div>';
      }
      if (ep.requestBody) {
        const reqProps = ep.requestBody.properties || {};
        const required = ep.requestBody.required || [];
        detailsHtml += '<div class="section"><h4>Request Body</h4><div class="schema">';
        for (const [key, val] of Object.entries(reqProps) as [string, any][]) {
          const isReq = required.includes(key);
          const typeStr = val.enum ? val.enum.map((e: string) => `"${e}"`).join(' | ') : (val.type || 'any');
          detailsHtml += `<div class="prop"><span class="key">${key}${isReq ? ' *' : ''}</span>: <span class="type">${typeStr}</span>${val.example ? ` <span class="example">e.g. ${JSON.stringify(val.example)}</span>` : ''}${val.description ? ` <span class="desc">${val.description}</span>` : ''}</div>`;
        }
        detailsHtml += '</div></div>';
      }
      if (ep.response) {
        detailsHtml += '<div class="section"><h4>Response</h4>';
        for (const [code, schema] of Object.entries(ep.response)) {
          detailsHtml += `<div class="response-code"><span class="code ${code.startsWith('2') ? 'success' : 'error'}">${code}</span></div><div class="schema"><pre>${JSON.stringify(schema, null, 2)}</pre></div>`;
        }
        detailsHtml += '</div>';
      }
      
      endpointsHtml += `
        <div class="endpoint">
          <div class="endpoint-header" onclick="toggleDetails('${endpointId}')">
            <span class="method" style="background:${color}">${ep.method}</span>
            <code class="path">${ep.path}</code>
            <span class="auth-badge">${ep.auth}</span>
            <span class="expand-icon" id="icon-${endpointId}">+</span>
          </div>
          <p class="endpoint-desc">${ep.description}</p>
          <div class="endpoint-details" id="${endpointId}">${detailsHtml}</div>
        </div>`;
    }
    endpointsHtml += '</div>';
  }

  const toc = fullEndpoints.map(c => `<a href="#${c.category.toLowerCase().replace(/[^a-z]/g, '-')}">${c.category}</a>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anplexa API - Complete Interactive Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #0f0a1a; color: #e2e8f0; line-height: 1.6; }
    code, pre { font-family: 'Fira Code', monospace; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 1.5rem; font-weight: 700; color: white; }
    .header .version { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; color: white; margin-left: 12px; }
    .header nav a { color: white; text-decoration: none; margin-left: 24px; font-weight: 500; opacity: 0.9; }
    .header nav a:hover { opacity: 1; }
    .layout { display: flex; max-width: 1600px; margin: 0 auto; }
    .sidebar { width: 260px; background: #1a1025; padding: 24px; position: sticky; top: 0; height: 100vh; overflow-y: auto; border-right: 1px solid #2d1f42; }
    .sidebar h3 { color: #a78bfa; margin-bottom: 16px; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 1px; }
    .sidebar a { display: block; color: #94a3b8; text-decoration: none; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px; font-size: 0.875rem; }
    .sidebar a:hover { background: #2d1f42; color: #e2e8f0; }
    .main { flex: 1; padding: 40px; min-width: 0; }
    .intro { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 32px; border-radius: 16px; margin-bottom: 40px; border: 1px solid #4c1d95; }
    .intro h1 { font-size: 2rem; margin-bottom: 12px; }
    .intro p { color: #a5b4fc; margin-bottom: 20px; }
    .auth-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 24px; }
    .auth-card { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 10px; border: 1px solid #4c1d95; }
    .auth-card h4 { color: #86efac; margin-bottom: 8px; }
    .auth-card code { color: #fbbf24; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }
    .auth-card p { color: #94a3b8; font-size: 0.85rem; margin-top: 8px; }
    .buttons { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
    .btn { padding: 10px 20px; border-radius: 8px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; font-size: 0.9rem; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #4c1d95; color: white; }
    .btn-secondary:hover { background: #5b21b6; }
    .category { margin-bottom: 48px; }
    .category h2 { color: #a78bfa; font-size: 1.5rem; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 2px solid #4c1d95; }
    .cat-desc { color: #94a3b8; margin-bottom: 20px; }
    .endpoint { background: #1a1025; border: 1px solid #2d1f42; border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: all 0.2s; }
    .endpoint:hover { border-color: #4c1d95; }
    .endpoint-header { display: flex; align-items: center; padding: 16px 20px; cursor: pointer; gap: 12px; flex-wrap: wrap; }
    .method { padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; color: white; text-transform: uppercase; }
    .path { color: #86efac; background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 6px; flex: 1; min-width: 200px; }
    .auth-badge { background: #312e81; color: #a5b4fc; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; }
    .expand-icon { color: #6366f1; font-size: 1.2rem; font-weight: bold; margin-left: auto; }
    .endpoint-desc { padding: 0 20px 16px; color: #94a3b8; font-size: 0.9rem; }
    .endpoint-details { display: none; padding: 0 20px 20px; border-top: 1px solid #2d1f42; margin-top: 8px; padding-top: 16px; }
    .endpoint-details.open { display: block; }
    .section { margin-bottom: 20px; }
    .section h4 { color: #a78bfa; margin-bottom: 12px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .schema { background: rgba(0,0,0,0.4); padding: 16px; border-radius: 8px; }
    .schema pre { color: #86efac; font-size: 0.85rem; white-space: pre-wrap; word-break: break-word; }
    .prop { padding: 6px 0; border-bottom: 1px solid #2d1f42; }
    .prop:last-child { border-bottom: none; }
    .key { color: #a78bfa; font-weight: 600; }
    .type { color: #86efac; }
    .example { color: #fbbf24; font-size: 0.8rem; margin-left: 8px; }
    .desc { color: #64748b; font-size: 0.8rem; display: block; margin-top: 4px; }
    .response-code { margin-bottom: 8px; }
    .code { padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .code.success { background: #065f46; color: #6ee7b7; }
    .code.error { background: #7f1d1d; color: #fca5a5; }
    .footer { text-align: center; padding: 40px; color: #64748b; border-top: 1px solid #2d1f42; margin-top: 60px; }
    .footer a { color: #a78bfa; }
    @media (max-width: 900px) { .sidebar { display: none; } .layout { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex;align-items:center;">
      <h1>Anplexa API</h1>
      <span class="version">v1.0.0</span>
    </div>
    <nav>
      <a href="/">Home</a>
      <a href="/docs">Swagger UI</a>
      <a href="/docs/openapi.json" download>OpenAPI JSON</a>
      <a href="/admin">Admin</a>
    </nav>
  </div>
  
  <div class="layout">
    <div class="sidebar">
      <h3>Navigation</h3>
      ${toc}
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #2d1f42;">
        <a href="/docs" style="color:#6366f1;">Swagger Docs</a>
        <a href="/docs/openapi.json" download>Download OpenAPI</a>
      </div>
    </div>
    
    <div class="main">
      <div class="intro">
        <h1>Complete API Reference</h1>
        <p>Full interactive documentation for the Anplexa Unrestricted AI Companion API. Click any endpoint to expand request/response details.</p>
        
        <div class="auth-cards">
          <div class="auth-card">
            <h4>JWT Bearer Token</h4>
            <code>Authorization: Bearer &lt;token&gt;</code>
            <p>User sessions from /api/auth/login. 15min access, 7day refresh.</p>
          </div>
          <div class="auth-card">
            <h4>API Key</h4>
            <code>X-API-Key: &lt;key&gt;</code>
            <p>Server-to-server. Generate in Settings or via /api/settings/api-key.</p>
          </div>
          <div class="auth-card">
            <h4>Funnel API Key</h4>
            <code>Authorization: Bearer &lt;FUNNEL_API_SECRET&gt;</code>
            <p>External funnel integrations. Set via environment variable.</p>
          </div>
          <div class="auth-card">
            <h4>Webhook Secret</h4>
            <code>stripe-signature / webhook-secret header</code>
            <p>Signed payloads for webhooks. Verified server-side.</p>
          </div>
        </div>
        
        <div class="buttons">
          <button onclick="downloadEndpoints()" class="btn btn-primary">Download as JSON</button>
          <a href="/docs/openapi.json" class="btn btn-secondary" download>OpenAPI Spec</a>
          <a href="/docs" class="btn btn-secondary">Swagger UI</a>
        </div>
      </div>
      
      ${endpointsHtml}
      
      <div class="footer">
        <p>Anplexa API &copy; ${new Date().getFullYear()} | <a href="/docs">Swagger</a> | <a href="/">Home</a> | <a href="/admin">Admin</a></p>
      </div>
    </div>
  </div>
  
  <script>
  function toggleDetails(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    const isOpen = el.classList.contains('open');
    
    // Close all others
    document.querySelectorAll('.endpoint-details').forEach(detail => {
      detail.classList.remove('open');
      const otherId = detail.id;
      const otherIcon = document.getElementById('icon-' + otherId);
      if (otherIcon) otherIcon.textContent = '+';
    });
    
    if (!isOpen) {
      el.classList.add('open');
      icon.textContent = '−';
    } else {
      el.classList.remove('open');
      icon.textContent = '+';
    }
  }
  function downloadEndpoints() {
    const endpoints = ${JSON.stringify(fullEndpoints)};
    const blob = new Blob([JSON.stringify(endpoints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anplexa-api-full-documentation.json';
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
