import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { db } from '../../infrastructure/database/index.js';
import { companionConfig, users, userFeedback, messages, conversations, systemPrompts, contactSubmissions } from '../../../shared/schema.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { getOllamaGateway } from '../../infrastructure/adapters/OllamaGateway.js';
import { jwtAdapter } from '../../infrastructure/auth/JWTAdapter.js';
import { eq, desc, count, like, and, gte, lte, sql } from 'drizzle-orm';
import { ANPLEXA_DEFAULT_PROMPT } from '../../config/anplexaPrompt.js';

export const adminRouter = Router();

// All admin routes require authentication and admin role
adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// Validation schemas
const identitySchema = z.object({
  name: z.string().min(1).max(100),
  defaultGender: z.enum(['male', 'female', 'non-binary', 'custom']),
  customGenderText: z.string().max(100).optional(),
});

const responsesSchema = z.object({
  defaultLength: z.enum(['brief', 'moderate', 'detailed']),
  defaultStyle: z.enum(['casual', 'thoughtful', 'creative']),
  briefTokens: z.number().min(100).max(5000).optional(),
  moderateTokens: z.number().min(100).max(5000).optional(),
  detailedTokens: z.number().min(100).max(10000).optional(),
  briefInstruction: z.string().max(1000).optional(),
  moderateInstruction: z.string().max(1000).optional(),
  detailedInstruction: z.string().max(1000).optional(),
  casualInstruction: z.string().max(1000).optional(),
  thoughtfulInstruction: z.string().max(1000).optional(),
  creativeInstruction: z.string().max(1000).optional(),
});

const modelSchema = z.object({
  generalModel: z.string().min(1).max(100),
  longFormModel: z.string().min(1).max(100),
  temperature: z.number().min(0).max(2),
  useLongFormForDetailed: z.boolean(),
});

const welcomeSchema = z.object({
  welcomeTitle: z.string().max(200),
  welcomeMessage: z.string().max(2000),
});

const promptSchema = z.object({
  systemPromptTemplate: z.string().min(1).max(10000),
});

// GET /api/admin/companion - Get full companion config
adminRouter.get('/companion', async (req, res) => {
  try {
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    if (!config) {
      return res.status(404).json({ error: 'Companion not configured' });
    }

    res.json({ config });
  } catch (error) {
    console.error('Get companion config error:', error);
    res.status(500).json({ error: 'Failed to get companion config' });
  }
});

// PUT /api/admin/companion - Update full companion config
adminRouter.put('/companion', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // Remove id field if present
    delete updateData.id;

    await db.update(companionConfig)
      .set(updateData)
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Companion config updated' });
  } catch (error) {
    console.error('Update companion config error:', error);
    res.status(500).json({ error: 'Failed to update companion config' });
  }
});

// PUT /api/admin/companion/identity - Update name, gender defaults
adminRouter.put('/companion/identity', async (req, res) => {
  try {
    const body = identitySchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        name: body.name,
        defaultGender: body.defaultGender,
        customGenderText: body.customGenderText || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Identity settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update identity error:', error);
    res.status(500).json({ error: 'Failed to update identity settings' });
  }
});

// PUT /api/admin/companion/responses - Update length/style settings & instructions
adminRouter.put('/companion/responses', async (req, res) => {
  try {
    const body = responsesSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Response settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update responses error:', error);
    res.status(500).json({ error: 'Failed to update response settings' });
  }
});

// PUT /api/admin/companion/model - Update Ollama model & temperature
adminRouter.put('/companion/model', async (req, res) => {
  try {
    const body = modelSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        generalModel: body.generalModel,
        longFormModel: body.longFormModel,
        temperature: body.temperature,
        useLongFormForDetailed: body.useLongFormForDetailed,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Model settings updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update model error:', error);
    res.status(500).json({ error: 'Failed to update model settings' });
  }
});

// PUT /api/admin/companion/welcome - Update welcome message
adminRouter.put('/companion/welcome', async (req, res) => {
  try {
    const body = welcomeSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        welcomeTitle: body.welcomeTitle,
        welcomeMessage: body.welcomeMessage,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'Welcome message updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update welcome error:', error);
    res.status(500).json({ error: 'Failed to update welcome message' });
  }
});

// PUT /api/admin/companion/prompt - Update system prompt template
adminRouter.put('/companion/prompt', async (req, res) => {
  try {
    const body = promptSchema.parse(req.body);

    await db.update(companionConfig)
      .set({
        systemPromptTemplate: body.systemPromptTemplate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(companionConfig.id, 'default'));

    res.json({ message: 'System prompt updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update system prompt' });
  }
});

// GET /api/admin/users - List all users
adminRouter.get('/users', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    // Remove sensitive data
    const safeUsers = allUsers.map((user: typeof allUsers[number]) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      storagePreference: user.storagePreference,
      isAdmin: user.isAdmin,
      subscriptionStatus: (user as any).subscriptionStatus || 'not_subscribed',
      credits: (user as any).credits || 0,
      sourceChannel: (user as any).sourceChannel || 'unknown',
      accountSource: (user as any).accountSource || 'unknown',
      createdAt: user.createdAt,
    }));

    const sourceChannelBadge = (channel: string) => {
      const badges: Record<string, { class: string; label: string }> = {
        'funnel': { class: 'bg-primary', label: 'Funnel' },
        'waitlist': { class: 'bg-info', label: 'Waitlist' },
        'access_anplexa': { class: 'bg-success', label: 'Access' },
        'auth_register': { class: 'bg-warning text-dark', label: 'Register' },
        'frontend': { class: 'bg-secondary', label: 'Frontend' },
        'api': { class: 'bg-dark', label: 'API' },
        'unknown': { class: 'bg-secondary', label: '-' },
      };
      const badge = badges[channel] || badges['unknown'];
      return `<span class="badge ${badge.class}">${badge.label}</span>`;
    };

    if (req.query.format === 'json') {
      return res.json({ users: safeUsers });
    }

    // Simple HTML UI for user management
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - User Management</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #0a0a0a; color: #e0e1dd; font-family: 'Inter', sans-serif; }
    .card { background-color: #1a1a1a; border: 1px solid #333; color: #e0e1dd; }
    .table { color: #e0e1dd; }
    .btn-primary { background-color: #7b2cbf; border: none; }
    .btn-primary:hover { background-color: #6a25a4; }
    .badge-sub { background-color: #7b2cbf; }
    .password-display { background: #000; padding: 10px; border-radius: 4px; font-family: monospace; border: 1px solid #7b2cbf; color: #7b2cbf; margin-top: 10px; }
  </style>
</head>
<body class="p-4">
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>User Management</h1>
      <a href="/admin/stats" class="btn btn-outline-light btn-sm">Back to Dashboard</a>
    </div>

    ${req.query.success ? '<div class="alert alert-success">Action completed successfully</div>' : ''}
    
    <div id="passwordAlert" class="alert alert-info d-none">
      <strong>New Password Generated:</strong>
      <div id="newPasswordValue" class="password-display"></div>
      <small class="d-block mt-2">Please copy this password now. It cannot be shown again.</small>
    </div>

    <div class="card shadow">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0">
            <thead>
              <tr>
                <th>Name/Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${safeUsers.map((u: any) => `
                <tr>
                  <td>
                    <strong>${u.displayName || 'No Name'}</strong><br>
                    <small class="text-muted">${u.email}</small>
                  </td>
                  <td>${sourceChannelBadge(u.sourceChannel)}</td>
                  <td>
                    <span class="badge ${u.subscriptionStatus === 'subscribed' ? 'badge-sub' : 'bg-secondary'}">
                      ${u.subscriptionStatus}
                    </span>
                  </td>
                  <td>${u.credits}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button onclick="generatePassword('${u.id}')" class="btn btn-outline-primary">Auto-Gen Pwd</button>
                      <button onclick="showSetPassword('${u.id}', '${u.email}')" class="btn btn-outline-secondary">Set Pwd</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Set Password Modal -->
  <div class="modal fade" id="setPasswordModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content bg-dark text-light border-secondary">
        <div class="modal-header border-secondary">
          <h5 class="modal-title">Set Password for <span id="modalUserEmail"></span></h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <input type="password" id="newPasswordInput" class="form-control bg-dark text-light border-secondary" placeholder="Enter new password (min 6 chars)">
          <input type="hidden" id="modalUserId">
        </div>
        <div class="modal-footer border-secondary">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" onclick="submitNewPassword()" class="btn btn-primary">Update Password</button>
        </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    const modal = new bootstrap.Modal(document.getElementById('setPasswordModal'));
    
    async function generatePassword(userId) {
      if(!confirm('Are you sure you want to generate a new password for this user?')) return;
      
      try {
        const res = await fetch(\`/api/admin/users/\${userId}/password/generate\`, { method: 'POST' });
        const data = await res.json();
        if (data.newPassword) {
          document.getElementById('newPasswordValue').innerText = data.newPassword;
          document.getElementById('passwordAlert').classList.remove('d-none');
          window.scrollTo(0,0);
        } else {
          alert('Error: ' + (data.error || 'Failed to generate password'));
        }
      } catch (e) {
        alert('Network error');
      }
    }

    function showSetPassword(userId, email) {
      document.getElementById('modalUserId').value = userId;
      document.getElementById('modalUserEmail').innerText = email;
      document.getElementById('newPasswordInput').value = '';
      modal.show();
    }

    async function submitNewPassword() {
      const userId = document.getElementById('modalUserId').value;
      const password = document.getElementById('newPasswordInput').value;
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }

      try {
        const res = await fetch(\`/api/admin/users/\${userId}/password\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok) {
          modal.hide();
          location.href = '/api/admin/users?success=1';
        } else {
          alert('Error: ' + (data.error || 'Failed to update password'));
        }
      } catch (e) {
        alert('Network error');
      }
    }
  </script>
</body>
</html>
    `;
    res.send(html);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// GET /api/admin/users/:id - Get specific user details
adminRouter.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get conversation count
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, id),
    });

    // Get message count
    let messageCount = 0;
    for (const conv of userConversations) {
      const convMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conv.id),
      });
      messageCount += convMessages.length;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        storagePreference: user.storagePreference,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      stats: {
        conversationCount: userConversations.length,
        messageCount,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// DELETE /api/admin/users/:id - Delete user and their data
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.sub) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's messages (via conversations)
    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, id),
    });

    for (const conv of userConversations) {
      await db.delete(messages).where(eq(messages.conversationId, conv.id));
    }

    // Delete conversations
    await db.delete(conversations).where(eq(conversations.userId, id));

    // Delete feedback
    await db.delete(userFeedback).where(eq(userFeedback.userId, id));

    // Delete user
    await db.delete(users).where(eq(users.id, id));

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/feedback - List all user feedback
adminRouter.get('/feedback', async (req, res) => {
  try {
    const allFeedback = await db.query.userFeedback.findMany({
      orderBy: [desc(userFeedback.createdAt)],
    });

    res.json({ feedback: allFeedback });
  } catch (error) {
    console.error('List feedback error:', error);
    res.status(500).json({ error: 'Failed to list feedback' });
  }
});

// GET /api/admin/stats - Usage statistics
adminRouter.get('/stats', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany();
    const allConversations = await db.query.conversations.findMany();
    const allMessages = await db.query.messages.findMany();
    const allFeedback = await db.query.userFeedback.findMany();

    res.json({
      stats: {
        totalUsers: allUsers.length,
        totalConversations: allConversations.length,
        totalMessages: allMessages.length,
        totalFeedback: allFeedback.length,
        feedbackByType: {
          feedback: allFeedback.filter((f: typeof allFeedback[number]) => f.type === 'feedback').length,
          feature: allFeedback.filter((f: typeof allFeedback[number]) => f.type === 'feature').length,
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// POST /api/admin/test-ollama - Test Ollama connection
adminRouter.post('/test-ollama', async (req, res) => {
  try {
    const ollama = getOllamaGateway();
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    const generalModel = config?.generalModel || process.env.OLLAMA_GENERAL_MODEL || 'darkplanet';
    const longFormModel = config?.longFormModel || process.env.OLLAMA_LONGFORM_MODEL || 'darkplanet';

    // Test with a simple prompt
    const testPrompt = 'Say "Hello, I am working!" in exactly 5 words.';

    let generalResult = '';
    let longFormResult = '';
    let generalError = null;
    let longFormError = null;

    // Test general model
    try {
      generalResult = await ollama.generate({
        model: generalModel,
        messages: [{ role: 'user', content: testPrompt }],
        maxTokens: 50,
      });
    } catch (e) {
      generalError = e instanceof Error ? e.message : 'Unknown error';
    }

    // Test long-form model
    try {
      longFormResult = await ollama.generate({
        model: longFormModel,
        messages: [{ role: 'user', content: testPrompt }],
        maxTokens: 50,
      });
    } catch (e) {
      longFormError = e instanceof Error ? e.message : 'Unknown error';
    }

    res.json({
      success: !generalError && !longFormError,
      generalModel: {
        model: generalModel,
        success: !generalError,
        response: generalResult || undefined,
        error: generalError || undefined,
      },
      longFormModel: {
        model: longFormModel,
        success: !longFormError,
        response: longFormResult || undefined,
        error: longFormError || undefined,
      },
    });
  } catch (error) {
    console.error('Test Ollama error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/admin/models - List available Ollama models
adminRouter.get('/models', async (req, res) => {
  try {
    const ollama = getOllamaGateway();
    const models = await ollama.getModels();

    res.json({ models });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// Validation schemas for subscription and credits
const subscriptionSchema = z.object({
  subscriptionStatus: z.enum(['subscribed', 'not_subscribed']),
});

const creditsSchema = z.object({
  credits: z.number().int(),
  operation: z.enum(['set', 'add', 'subtract']).default('set'),
});

// PUT /api/admin/users/:id/subscription - Update user subscription status
adminRouter.put('/users/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const body = subscriptionSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set manual override flag so Stripe webhooks won't change this status
    await db.update(users)
      .set({
        subscriptionStatus: body.subscriptionStatus,
        manualSubscriptionOverride: true, // Prevent Stripe from overriding this manual change
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    console.log(`[Admin API] User ${id} subscription set to ${body.subscriptionStatus} with manual override enabled`);

    res.json({
      message: 'Subscription status updated (manual override enabled)',
      userId: id,
      subscriptionStatus: body.subscriptionStatus,
      manualOverride: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

// PUT /api/admin/users/:id/credits - Update user credits
adminRouter.put('/users/:id/credits', async (req, res) => {
  try {
    const { id } = req.params;
    const body = creditsSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newCredits: number;
    const currentCredits = (user as any).credits || 0;

    switch (body.operation) {
      case 'add':
        newCredits = currentCredits + body.credits;
        break;
      case 'subtract':
        newCredits = Math.max(0, currentCredits - body.credits);
        break;
      case 'set':
      default:
        newCredits = body.credits;
        break;
    }

    await db.update(users)
      .set({
        credits: newCredits,
        updatedAt: new Date().toISOString(),
      } as any)
      .where(eq(users.id, id));

    res.json({
      message: 'Credits updated',
      userId: id,
      previousCredits: currentCredits,
      newCredits,
      operation: body.operation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// GET /api/admin/users/:id/billing - Get user billing info (subscription + credits)
adminRouter.get('/users/:id/billing', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: id,
      email: user.email,
      subscriptionStatus: (user as any).subscriptionStatus || 'not_subscribed',
      credits: (user as any).credits || 0,
    });
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ error: 'Failed to get billing info' });
  }
});

// ============== USER PASSWORD MANAGEMENT ==============

const setPasswordSchema = z.object({
  password: z.string().min(6).max(100),
});

// Helper to generate secure random password using rejection sampling
function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  return password;
}

// PUT /api/admin/users/:id/password - Manually set a user's password
adminRouter.put('/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const body = setPasswordSchema.parse(req.body);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await jwtAdapter.hashPassword(body.password);

    await db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    res.json({
      message: 'Password updated successfully',
      userId: id,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Set password error:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// POST /api/admin/users/:id/password/generate - Auto-generate a new password for user
adminRouter.post('/users/:id/password/generate', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPassword = generateSecurePassword(16);
    const passwordHash = await jwtAdapter.hashPassword(newPassword);

    await db.update(users)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    res.json({
      message: 'Password generated successfully',
      userId: id,
      email: user.email,
      newPassword: newPassword,
      note: 'Save this password now - it cannot be retrieved later',
    });
  } catch (error) {
    console.error('Generate password error:', error);
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

// ============== SYSTEM PROMPT MANAGEMENT ==============

const systemPromptSchema = z.object({
  name: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  notes: z.string().max(500).optional(),
});

// GET /api/admin/system-prompts - List all system prompts with version history
adminRouter.get('/system-prompts', async (req, res) => {
  try {
    const prompts = await db.query.systemPrompts.findMany({
      orderBy: [desc(systemPrompts.createdAt)],
    });

    res.json({
      prompts,
      defaultPrompt: ANPLEXA_DEFAULT_PROMPT,
    });
  } catch (error) {
    console.error('List system prompts error:', error);
    res.status(500).json({ error: 'Failed to list system prompts' });
  }
});

// GET /api/admin/system-prompts/active - Get the currently active system prompt
adminRouter.get('/system-prompts/active', async (req, res) => {
  try {
    const activePrompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.isActive, true),
    });

    res.json({
      prompt: activePrompt || {
        content: ANPLEXA_DEFAULT_PROMPT,
        name: 'Anplexa Default (Built-in)',
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Get active system prompt error:', error);
    res.status(500).json({ error: 'Failed to get active system prompt' });
  }
});

// GET /api/admin/system-prompts/:id - Get a specific system prompt by ID
adminRouter.get('/system-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    res.json({ prompt });
  } catch (error) {
    console.error('Get system prompt error:', error);
    res.status(500).json({ error: 'Failed to get system prompt' });
  }
});

// POST /api/admin/system-prompts - Create a new system prompt version
adminRouter.post('/system-prompts', async (req, res) => {
  try {
    const body = systemPromptSchema.parse(req.body);
    const adminId = req.user!.sub;

    // Get the current highest version for this prompt name
    const existingPrompts = await db.query.systemPrompts.findMany({
      where: eq(systemPrompts.name, body.name),
      orderBy: [desc(systemPrompts.version)],
    });
    
    const nextVersion = existingPrompts.length > 0 ? (existingPrompts[0].version || 0) + 1 : 1;

    const newPromptId = `sp_${uuidv4().substring(0, 8)}`;

    await db.insert(systemPrompts).values({
      id: newPromptId,
      name: body.name,
      content: body.content,
      version: nextVersion,
      isActive: false,
      createdBy: adminId,
      createdAt: new Date().toISOString(),
      notes: body.notes || null,
    });

    res.status(201).json({
      message: 'System prompt created',
      promptId: newPromptId,
      version: nextVersion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create system prompt error:', error);
    res.status(500).json({ error: 'Failed to create system prompt' });
  }
});

// PUT /api/admin/system-prompts/:id/activate - Set a system prompt as the active one
adminRouter.put('/system-prompts/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the prompt exists
    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    // Deactivate all other prompts
    await db.update(systemPrompts)
      .set({ isActive: false })
      .where(eq(systemPrompts.isActive, true));

    // Activate the selected prompt
    await db.update(systemPrompts)
      .set({ isActive: true })
      .where(eq(systemPrompts.id, id));

    res.json({
      message: 'System prompt activated',
      promptId: id,
      promptName: prompt.name,
    });
  } catch (error) {
    console.error('Activate system prompt error:', error);
    res.status(500).json({ error: 'Failed to activate system prompt' });
  }
});

// DELETE /api/admin/system-prompts/:id - Delete a system prompt
adminRouter.delete('/system-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const prompt = await db.query.systemPrompts.findFirst({
      where: eq(systemPrompts.id, id),
    });

    if (!prompt) {
      return res.status(404).json({ error: 'System prompt not found' });
    }

    if (prompt.isActive) {
      return res.status(400).json({ error: 'Cannot delete the active system prompt. Activate another prompt first.' });
    }

    await db.delete(systemPrompts).where(eq(systemPrompts.id, id));

    res.json({
      message: 'System prompt deleted',
      promptId: id,
    });
  } catch (error) {
    console.error('Delete system prompt error:', error);
    res.status(500).json({ error: 'Failed to delete system prompt' });
  }
});

// ============================================
// CONTACT SUBMISSIONS (Audit Log)
// ============================================

// GET /api/admin/contact-submissions - List all contact submissions with filtering
adminRouter.get('/contact-submissions', async (req, res) => {
  try {
    const { 
      sourceChannel, 
      email, 
      startDate, 
      endDate, 
      limit = '50', 
      offset = '0',
      format 
    } = req.query;

    const pageLimit = Math.min(parseInt(limit as string) || 50, 200);
    const pageOffset = parseInt(offset as string) || 0;

    // Build query with filters
    let allSubmissions = await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));

    // Apply filters in JS (simple approach for now)
    let filtered = allSubmissions;
    if (sourceChannel && sourceChannel !== 'all') {
      filtered = filtered.filter((s: any) => s.sourceChannel === sourceChannel);
    }
    if (email) {
      filtered = filtered.filter((s: any) => s.email.toLowerCase().includes((email as string).toLowerCase()));
    }
    if (startDate) {
      filtered = filtered.filter((s: any) => s.createdAt >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((s: any) => s.createdAt <= endDate);
    }

    const total = filtered.length;
    const paginated = filtered.slice(pageOffset, pageOffset + pageLimit);

    if (format === 'json') {
      return res.json({ 
        submissions: paginated, 
        total,
        limit: pageLimit,
        offset: pageOffset,
      });
    }

    // HTML UI for contact submissions
    const sourceChannelBadgeClass = (channel: string) => {
      const classes: Record<string, string> = {
        'funnel': 'bg-primary',
        'waitlist': 'bg-info',
        'access_anplexa': 'bg-success',
        'auth_register': 'bg-warning',
        'frontend': 'bg-secondary',
        'api': 'bg-dark',
      };
      return classes[channel] || 'bg-secondary';
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Contact Submissions Log</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background-color: #0a0a0a; color: #e0e1dd; font-family: 'Inter', sans-serif; }
    .card { background-color: #1a1a1a; border: 1px solid #333; color: #e0e1dd; }
    .table { color: #e0e1dd; }
    .btn-primary { background-color: #ff6b35; border: none; }
    .btn-primary:hover { background-color: #e55a2b; }
    .form-control, .form-select { background-color: #1a1a1a; border-color: #333; color: #e0e1dd; }
    .form-control:focus, .form-select:focus { background-color: #1a1a1a; border-color: #ff6b35; color: #e0e1dd; }
    .badge { font-size: 0.75rem; }
  </style>
</head>
<body class="p-4">
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Contact Submissions Log</h1>
      <a href="/admin/stats" class="btn btn-outline-light btn-sm">Back to Dashboard</a>
    </div>
    
    <div class="card mb-4">
      <div class="card-body">
        <form method="GET" class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Source Channel</label>
            <select name="sourceChannel" class="form-select">
              <option value="all" ${!sourceChannel || sourceChannel === 'all' ? 'selected' : ''}>All Sources</option>
              <option value="funnel" ${sourceChannel === 'funnel' ? 'selected' : ''}>Funnel</option>
              <option value="waitlist" ${sourceChannel === 'waitlist' ? 'selected' : ''}>Waitlist</option>
              <option value="access_anplexa" ${sourceChannel === 'access_anplexa' ? 'selected' : ''}>Access Anplexa</option>
              <option value="auth_register" ${sourceChannel === 'auth_register' ? 'selected' : ''}>Auth Register</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Email Search</label>
            <input type="text" name="email" class="form-control" placeholder="Search email..." value="${email || ''}">
          </div>
          <div class="col-md-2">
            <label class="form-label">Start Date</label>
            <input type="date" name="startDate" class="form-control" value="${startDate || ''}">
          </div>
          <div class="col-md-2">
            <label class="form-label">End Date</label>
            <input type="date" name="endDate" class="form-control" value="${endDate || ''}">
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button type="submit" class="btn btn-primary w-100">Filter</button>
          </div>
        </form>
      </div>
    </div>

    <div class="mb-3">
      <small class="text-muted">Showing ${paginated.length} of ${total} submissions</small>
    </div>

    <div class="card shadow">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Entry Source</th>
                <th>New User?</th>
                <th>IP Address</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${paginated.map((s: any) => `
                <tr>
                  <td>
                    <strong>${s.email}</strong>
                    ${s.displayName ? `<br><small class="text-muted">${s.displayName}</small>` : ''}
                  </td>
                  <td>
                    <span class="badge ${sourceChannelBadgeClass(s.sourceChannel)}">${s.sourceChannel}</span>
                  </td>
                  <td>${s.entrySource || s.sourceDetail || '-'}</td>
                  <td>
                    <span class="badge ${s.isNewUser ? 'bg-success' : 'bg-warning'}">${s.isNewUser ? 'Yes' : 'Duplicate'}</span>
                  </td>
                  <td><small>${s.ipAddress || '-'}</small></td>
                  <td><small>${new Date(s.createdAt).toLocaleString()}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    ${total > pageLimit ? `
    <nav class="mt-4">
      <ul class="pagination justify-content-center">
        ${pageOffset > 0 ? `<li class="page-item"><a class="page-link" href="?offset=${pageOffset - pageLimit}&limit=${pageLimit}&sourceChannel=${sourceChannel || 'all'}&email=${email || ''}">Previous</a></li>` : ''}
        ${pageOffset + pageLimit < total ? `<li class="page-item"><a class="page-link" href="?offset=${pageOffset + pageLimit}&limit=${pageLimit}&sourceChannel=${sourceChannel || 'all'}&email=${email || ''}">Next</a></li>` : ''}
      </ul>
    </nav>
    ` : ''}
  </div>
</body>
</html>`;

    res.send(html);
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Failed to get contact submissions' });
  }
});

// GET /api/admin/stats/source-channels - Get user counts by source channel
adminRouter.get('/stats/source-channels', async (req, res) => {
  try {
    // Get counts by source channel
    const allUsers = await db.select().from(users);
    
    const channelCounts: Record<string, number> = {};
    allUsers.forEach((u: any) => {
      const channel = u.sourceChannel || 'unknown';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });

    // Get today's and last 7 days submission counts
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const allSubmissions = await db.select().from(contactSubmissions);
    
    const todaySubmissions = allSubmissions.filter((s: any) => s.createdAt?.startsWith(today)).length;
    const weekSubmissions = allSubmissions.filter((s: any) => s.createdAt >= weekAgo).length;
    const totalSubmissions = allSubmissions.length;

    res.json({
      usersByChannel: channelCounts,
      submissions: {
        today: todaySubmissions,
        last7Days: weekSubmissions,
        total: totalSubmissions,
      },
    });
  } catch (error) {
    console.error('Get source channel stats error:', error);
    res.status(500).json({ error: 'Failed to get source channel stats' });
  }
});
