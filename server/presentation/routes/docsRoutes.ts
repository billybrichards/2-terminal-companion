import { Router } from 'express';

export const docsRouter = Router();

const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Terminal Companion API',
    version: '0.1.0',
    description: 'AI chat backend API with user authentication, conversation management, and admin-configurable AI companion settings.',
  },
  servers: [
    { url: '/', description: 'Current server' }
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
          '201': { description: 'Registration successful, returns user and tokens' },
          '400': { description: 'Validation error or email already registered' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        description: 'Authenticate with email and password.',
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
          '200': { description: 'Login successful, returns user and tokens' },
          '401': { description: 'Invalid email or password' }
        }
      }
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'New tokens returned' },
          '401': { description: 'Invalid or expired refresh token' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        security: [{ bearerAuth: [] }],
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
          '200': { description: 'Logged out successfully' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Returns user info and preferences' },
          '401': { description: 'Not authenticated' }
        }
      }
    },
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Send message (streaming)',
        description: 'Send a message and receive streaming SSE response from AI companion.',
        security: [{ bearerAuth: [] }],
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
                      length: { type: 'string', enum: ['brief', 'moderate', 'detailed'] },
                      style: { type: 'string', enum: ['casual', 'thoughtful', 'creative'] }
                    }
                  },
                  storeLocally: { type: 'boolean', default: false }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'SSE stream with text chunks and done event' }
        }
      }
    },
    '/api/chat/non-streaming': {
      post: {
        tags: ['Chat'],
        summary: 'Send message (non-streaming)',
        description: 'Send a message and receive full response.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', maxLength: 10000 },
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
          '200': { description: 'Full response with model info' }
        }
      }
    },
    '/api/chat/config': {
      get: {
        tags: ['Chat'],
        summary: 'Get companion config',
        responses: {
          '200': { description: 'Companion name, defaults, and welcome message' }
        }
      }
    },
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'List conversations',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Array of user conversations' }
        }
      }
    },
    '/api/conversations/{id}': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation with messages',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Conversation with messages' },
          '404': { description: 'Conversation not found' }
        }
      },
      delete: {
        tags: ['Conversations'],
        summary: 'Delete conversation',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Deleted successfully' }
        }
      }
    },
    '/api/settings/preferences': {
      get: {
        tags: ['Settings'],
        summary: 'Get user preferences',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User preferences' }
        }
      },
      put: {
        tags: ['Settings'],
        summary: 'Update user preferences',
        security: [{ bearerAuth: [] }],
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
          '200': { description: 'Server status' }
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
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminal Companion API - Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b4151; }
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
        showCommonExtensions: true
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
