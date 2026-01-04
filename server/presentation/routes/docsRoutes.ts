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
