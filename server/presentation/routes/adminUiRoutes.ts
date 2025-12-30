import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../infrastructure/database/index.js';
import { apiKeys, users, conversations, messages, userFeedback, apiUsage, systemPrompts } from '../../../shared/schema.js';
import { eq, desc, sql, gte, count } from 'drizzle-orm';
import { ANPLEXA_DEFAULT_PROMPT } from '../../config/anplexaPrompt.js';

export const adminUiRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_UI_PASSWORD || '';
const COOKIE_NAME = 'admin_session';
const SESSION_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const activeSessions = new Map<string, { expiresAt: number }>();

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;
  if (Date.now() - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip);
    return false;
  }
  return attempt.count >= MAX_ATTEMPTS;
}

function recordLoginAttempt(ip: string, success: boolean) {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempt.count++;
  attempt.lastAttempt = Date.now();
  loginAttempts.set(ip, attempt);
}

function generateSessionToken(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', SESSION_SECRET)
    .update(randomBytes + timestamp)
    .digest('hex');
  return `${randomBytes}.${timestamp}.${signature}`;
}

function validateSessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [randomBytes, timestamp, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET)
    .update(randomBytes + timestamp)
    .digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return false;
  }
  return true;
}

function isAuthenticated(req: Request): boolean {
  const sessionToken = req.cookies?.[COOKIE_NAME];
  if (!sessionToken || !ADMIN_PASSWORD) return false;
  return validateSessionToken(sessionToken);
}

function requireAuth(req: Request, res: Response): boolean {
  if (!isAuthenticated(req)) {
    res.redirect('/admin');
    return false;
  }
  return true;
}

const darkThemeStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Courier New', monospace; 
    background: #0a0a0a; 
    color: #e0e0e0; 
    min-height: 100vh;
    padding: 20px;
  }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { color: #ff6b35; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
  h2 { color: #ff6b35; margin: 20px 0 15px 0; }
  a { color: #ff6b35; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .nav { margin-bottom: 30px; padding: 15px; background: #1a1a1a; border-radius: 5px; }
  .nav a { margin-right: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
  th { background: #1a1a1a; color: #ff6b35; }
  tr:hover { background: #1a1a1a; }
  .btn { 
    display: inline-block;
    padding: 8px 16px; 
    background: #ff6b35; 
    color: #0a0a0a; 
    border: none; 
    border-radius: 4px; 
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    text-decoration: none;
  }
  .btn:hover { background: #ff8c5a; text-decoration: none; }
  .btn-danger { background: #dc3545; color: white; }
  .btn-danger:hover { background: #c82333; }
  .btn-sm { padding: 4px 10px; font-size: 12px; }
  input, select { 
    padding: 10px; 
    background: #1a1a1a; 
    border: 1px solid #333; 
    color: #e0e0e0; 
    border-radius: 4px;
    font-family: inherit;
    width: 100%;
    max-width: 300px;
  }
  input:focus, select:focus { outline: none; border-color: #ff6b35; }
  .form-group { margin-bottom: 15px; }
  label { display: block; margin-bottom: 5px; color: #888; }
  .card { background: #1a1a1a; padding: 20px; border-radius: 5px; margin: 20px 0; }
  .success { color: #28a745; padding: 10px; background: #1a1a1a; border-left: 3px solid #28a745; margin: 10px 0; }
  .error { color: #dc3545; padding: 10px; background: #1a1a1a; border-left: 3px solid #dc3545; margin: 10px 0; }
  .api-key-display { 
    background: #2a2a2a; 
    padding: 15px; 
    border-radius: 5px; 
    font-family: monospace;
    word-break: break-all;
    border: 2px solid #28a745;
  }
  .badge { 
    display: inline-block;
    padding: 3px 8px; 
    border-radius: 3px; 
    font-size: 12px;
  }
  .badge-success { background: #28a745; color: white; }
  .badge-warning { background: #ffc107; color: #000; }
  .badge-secondary { background: #6c757d; color: white; }
  .badge-api { background: #ff6b35; color: white; }
  .filter-tabs { margin-bottom: 20px; display: flex; gap: 10px; }
  .filter-tab { 
    padding: 8px 16px; 
    background: #1a1a1a; 
    border: 1px solid #333; 
    border-radius: 4px; 
    color: #e0e0e0;
    text-decoration: none;
  }
  .filter-tab:hover { border-color: #ff6b35; text-decoration: none; }
  .filter-tab.active { background: #ff6b35; color: #0a0a0a; border-color: #ff6b35; }
`;

function layout(title: string, content: string, showNav: boolean = true): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Terminal Companion Admin</title>
  <style>${darkThemeStyles}</style>
</head>
<body>
  <div class="container">
    ${showNav ? `
    <nav class="nav">
      <a href="/admin/dashboard">Dashboard</a>
      <a href="/admin/dashboard/usage">Usage Analytics</a>
      <a href="/admin/users">Users</a>
      <a href="/admin/api-keys">API Keys</a>
      <a href="/admin/system-prompts">System Prompts</a>
      <a href="/admin/logout">Logout</a>
    </nav>
    ` : ''}
    ${content}
  </div>
</body>
</html>`;
}

adminUiRouter.get('/', (req: Request, res: Response) => {
  if (isAuthenticated(req)) {
    return res.redirect('/admin/dashboard');
  }

  const error = req.query.error ? '<div class="error">Invalid password</div>' : '';

  const html = layout('Login', `
    <h1>Terminal Companion Admin</h1>
    ${error}
    <div class="card">
      <form method="POST" action="/admin/login">
        <div class="form-group">
          <label for="password">Admin Password</label>
          <input type="password" id="password" name="password" required autofocus>
        </div>
        <button type="submit" class="btn">Login</button>
      </form>
    </div>
  `, false);

  res.send(html);
});

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

adminUiRouter.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const clientIp = getClientIp(req);

  if (isRateLimited(clientIp)) {
    return res.redirect('/admin?error=rate_limited');
  }

  if (password === ADMIN_PASSWORD) {
    recordLoginAttempt(clientIp, true);
    const sessionToken = generateSessionToken();
    activeSessions.set(sessionToken, { expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    
    res.cookie(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.redirect('/admin/dashboard');
  }

  recordLoginAttempt(clientIp, false);
  res.redirect('/admin?error=1');
});

adminUiRouter.get('/logout', (req: Request, res: Response) => {
  const sessionToken = req.cookies?.[COOKIE_NAME];
  if (sessionToken) {
    activeSessions.delete(sessionToken);
  }
  res.clearCookie(COOKIE_NAME);
  res.redirect('/admin');
});

adminUiRouter.get('/dashboard', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const allUsers = await db.query.users.findMany();
    const allConversations = await db.query.conversations.findMany();
    const allApiKeys = await db.query.apiKeys.findMany();

    const frontendUsers = allUsers.filter((u: any) => u.accountSource !== 'api').length;
    const apiUsers = allUsers.filter((u: any) => u.accountSource === 'api').length;

    const html = layout('Dashboard', `
      <h1>Dashboard</h1>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${allUsers.length}</div>
          <div style="color: #888; margin-top: 5px;">Total Users</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #6c757d; font-weight: bold;">${frontendUsers}</div>
          <div style="color: #888; margin-top: 5px;">Frontend Users</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${apiUsers}</div>
          <div style="color: #888; margin-top: 5px;">API Users</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${allApiKeys.filter((k: any) => k.isActive).length}</div>
          <div style="color: #888; margin-top: 5px;">Active API Keys</div>
        </div>
      </div>
      <div class="card">
        <h2>Statistics</h2>
        <table>
          <tr><td>Total Users</td><td>${allUsers.length}</td></tr>
          <tr><td>Frontend Users</td><td><span class="badge badge-secondary">${frontendUsers}</span></td></tr>
          <tr><td>API Users</td><td><span class="badge badge-api">${apiUsers}</span></td></tr>
          <tr><td>Total Conversations</td><td>${allConversations.length}</td></tr>
          <tr><td>Active API Keys</td><td>${allApiKeys.filter((k: any) => k.isActive).length}</td></tr>
        </table>
      </div>
      <div class="card">
        <h2>Quick Links</h2>
        <p><a href="/admin/users">Manage Users</a> - View and update user accounts</p>
        <p><a href="/admin/users?source=frontend">Frontend Users</a> - View users registered via frontend</p>
        <p><a href="/admin/users?source=api">API Users</a> - View users created via API</p>
        <p><a href="/admin/api-keys">API Keys</a> - Generate and manage API keys</p>
      </div>
    `);

    res.send(html);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to load dashboard</div>'));
  }
});

adminUiRouter.get('/users', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const sourceFilter = req.query.source as string | undefined;
    
    let allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    const totalCount = allUsers.length;
    const frontendCount = allUsers.filter((u: any) => u.accountSource !== 'api').length;
    const apiCount = allUsers.filter((u: any) => u.accountSource === 'api').length;

    if (sourceFilter === 'frontend') {
      allUsers = allUsers.filter((u: any) => u.accountSource !== 'api');
    } else if (sourceFilter === 'api') {
      allUsers = allUsers.filter((u: any) => u.accountSource === 'api');
    }

    const success = req.query.success ? '<div class="success">User updated successfully</div>' : '';
    const deleted = req.query.deleted ? '<div class="success">User deleted successfully</div>' : '';

    const userRows = allUsers.map((user: any) => {
      const isApiUser = user.accountSource === 'api';
      return `
      <tr>
        <td>${user.email}</td>
        <td>${user.displayName || '-'}</td>
        <td>
          <span class="badge ${isApiUser ? 'badge-api' : 'badge-secondary'}">
            ${isApiUser ? 'API' : 'Frontend'}
          </span>
        </td>
        <td>
          <span class="badge ${user.subscriptionStatus === 'subscribed' ? 'badge-success' : 'badge-secondary'}">
            ${user.subscriptionStatus || 'not_subscribed'}
          </span>
        </td>
        <td>${user.credits || 0}</td>
        <td>${user.isAdmin ? 'Yes' : 'No'}</td>
        <td>
          <form method="POST" action="/admin/users/${user.id}" style="display: inline-flex; gap: 5px; align-items: center;">
            <select name="subscriptionStatus" style="width: 120px;">
              <option value="not_subscribed" ${user.subscriptionStatus !== 'subscribed' ? 'selected' : ''}>Not Subscribed</option>
              <option value="subscribed" ${user.subscriptionStatus === 'subscribed' ? 'selected' : ''}>Subscribed</option>
            </select>
            <input type="number" name="credits" value="${user.credits || 0}" style="width: 80px;">
            <button type="submit" class="btn btn-sm">Update</button>
          </form>
          <form method="POST" action="/admin/users/${user.id}/delete" style="display: inline; margin-left: 5px;"
                onsubmit="return confirm('Delete this user and all their data?')">
            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
          </form>
        </td>
      </tr>
    `}).join('');

    const html = layout('Users', `
      <h1>User Management</h1>
      ${success}${deleted}
      <div class="filter-tabs">
        <a href="/admin/users" class="filter-tab ${!sourceFilter ? 'active' : ''}">All (${totalCount})</a>
        <a href="/admin/users?source=frontend" class="filter-tab ${sourceFilter === 'frontend' ? 'active' : ''}">Frontend (${frontendCount})</a>
        <a href="/admin/users?source=api" class="filter-tab ${sourceFilter === 'api' ? 'active' : ''}">API (${apiCount})</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Account Type</th>
            <th>Subscription</th>
            <th>Credits</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${userRows || '<tr><td colspan="7">No users found</td></tr>'}
        </tbody>
      </table>
    `);

    res.send(html);
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to load users</div>'));
  }
});

adminUiRouter.post('/users/:id', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.params;
    const { subscriptionStatus, credits } = req.body;

    await db.update(users)
      .set({
        subscriptionStatus: subscriptionStatus || 'not_subscribed',
        credits: parseInt(credits) || 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id));

    res.redirect('/admin/users?success=1');
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to update user</div>'));
  }
});

adminUiRouter.post('/users/:id/delete', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.params;

    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, id),
    });

    for (const conv of userConversations) {
      await db.delete(messages).where(eq(messages.conversationId, conv.id));
    }

    await db.delete(conversations).where(eq(conversations.userId, id));
    await db.delete(userFeedback).where(eq(userFeedback.userId, id));
    await db.delete(users).where(eq(users.id, id));

    res.redirect('/admin/users?deleted=1');
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to delete user</div>'));
  }
});

adminUiRouter.get('/api-keys', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const allKeys = await db.query.apiKeys.findMany({
      orderBy: [desc(apiKeys.createdAt)],
    });

    const newKey = req.query.newKey as string;
    const success = req.query.success ? '<div class="success">API key revoked</div>' : '';

    const keyRows = allKeys.map((key: any) => `
      <tr>
        <td>${key.name}</td>
        <td><code>${key.keyPrefix}...</code></td>
        <td>
          <span class="badge ${key.isActive ? 'badge-success' : 'badge-secondary'}">
            ${key.isActive ? 'Active' : 'Revoked'}
          </span>
        </td>
        <td>${key.lastUsedAt || 'Never'}</td>
        <td>${key.createdAt}</td>
        <td>
          ${key.isActive ? `
            <form method="POST" action="/admin/api-keys/${key.id}/delete" style="display: inline;"
                  onsubmit="return confirm('Revoke this API key?')">
              <button type="submit" class="btn btn-sm btn-danger">Revoke</button>
            </form>
          ` : '-'}
        </td>
      </tr>
    `).join('');

    const html = layout('API Keys', `
      <h1>API Key Management</h1>
      ${success}
      ${newKey ? `
        <div class="card">
          <h2>New API Key Generated</h2>
          <p style="color: #ffc107; margin-bottom: 10px;">⚠️ Copy this key now - it will not be shown again!</p>
          <div class="api-key-display">${newKey}</div>
        </div>
      ` : ''}
      <div class="card">
        <h2>Generate New API Key</h2>
        <form method="POST" action="/admin/api-keys">
          <div class="form-group">
            <label for="name">Key Name</label>
            <input type="text" id="name" name="name" required placeholder="e.g., Production Server">
          </div>
          <button type="submit" class="btn">Generate Key</button>
        </form>
      </div>
      <h2>Existing Keys</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Prefix</th>
            <th>Status</th>
            <th>Last Used</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${keyRows || '<tr><td colspan="6">No API keys found</td></tr>'}
        </tbody>
      </table>
    `);

    res.send(html);
  } catch (error) {
    console.error('API keys list error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to load API keys</div>'));
  }
});

adminUiRouter.post('/api-keys', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).send(layout('Error', '<div class="error">Key name is required</div>'));
    }

    const rawKey = `tc_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = await bcrypt.hash(rawKey, 10);

    const id = uuidv4();

    await db.insert(apiKeys).values({
      id,
      name: name.trim(),
      keyHash,
      keyPrefix,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    res.redirect(`/admin/api-keys?newKey=${encodeURIComponent(rawKey)}`);
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to generate API key</div>'));
  }
});

adminUiRouter.post('/api-keys/:id/delete', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.params;

    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id));

    res.redirect('/admin/api-keys?success=1');
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to revoke API key</div>'));
  }
});

adminUiRouter.get('/dashboard/usage', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const today = new Date().toISOString().split('T')[0];

    const allUsage = await db.query.apiUsage.findMany({
      orderBy: [desc(apiUsage.createdAt)],
    });

    const totalCalls = allUsage.length;
    const todayCalls = allUsage.filter((u: any) => u.createdAt?.startsWith(today)).length;

    const allApiKeys = await db.query.apiKeys.findMany();
    const activeKeysCount = allApiKeys.filter((k: any) => k.isActive).length;

    const allUsers = await db.query.users.findMany();
    const subscribersCount = allUsers.filter((u: any) => u.subscriptionStatus === 'subscribed').length;

    const recentUsage = allUsage.slice(0, 50);

    const keyUsageMap = new Map<string, { total: number; lastUsed: string | null }>();
    for (const usage of allUsage) {
      if (usage.apiKeyId) {
        const existing = keyUsageMap.get(usage.apiKeyId) || { total: 0, lastUsed: null };
        existing.total++;
        if (!existing.lastUsed || (usage.createdAt && usage.createdAt > existing.lastUsed)) {
          existing.lastUsed = usage.createdAt;
        }
        keyUsageMap.set(usage.apiKeyId, existing);
      }
    }

    const keyStatsRows = allApiKeys.map((key: any) => {
      const stats = keyUsageMap.get(key.id) || { total: 0, lastUsed: null };
      const owner = allUsers.find((u: any) => u.id === key.userId);
      return `
        <tr>
          <td><code>${key.keyPrefix}...</code></td>
          <td>${owner?.email || '-'}</td>
          <td>${stats.total}</td>
          <td>${stats.lastUsed ? new Date(stats.lastUsed).toLocaleString() : 'Never'}</td>
          <td>
            <span class="badge ${key.isActive ? 'badge-success' : 'badge-secondary'}">
              ${key.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    const usageRows = recentUsage.map((u: any) => {
      const key = allApiKeys.find((k: any) => k.id === u.apiKeyId);
      return `
        <tr>
          <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
          <td><code>${key?.keyPrefix || '-'}...</code></td>
          <td>${u.endpoint}</td>
          <td>${u.method}</td>
          <td>
            <span class="badge ${u.statusCode && u.statusCode < 400 ? 'badge-success' : u.statusCode ? 'badge-warning' : 'badge-secondary'}">
              ${u.statusCode || '-'}
            </span>
          </td>
          <td>${u.latencyMs || '-'}</td>
        </tr>
      `;
    }).join('');

    const html = layout('Usage Analytics', `
      <h1>Usage Analytics</h1>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${totalCalls}</div>
          <div style="color: #888; margin-top: 5px;">Total API Calls</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${todayCalls}</div>
          <div style="color: #888; margin-top: 5px;">Calls Today</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${activeKeysCount}</div>
          <div style="color: #888; margin-top: 5px;">Active API Keys</div>
        </div>
        <div class="card" style="text-align: center;">
          <div style="font-size: 36px; color: #ff6b35; font-weight: bold;">${subscribersCount}</div>
          <div style="color: #888; margin-top: 5px;">Total Subscribers</div>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Per-Key Usage Summary</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Key Prefix</th>
              <th>User Email</th>
              <th>Total Requests</th>
              <th>Last Used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${keyStatsRows || '<tr><td colspan="5">No API keys found</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Recent Usage (Last 50 Requests)</h2>
          <a href="/admin/dashboard/usage/export" class="btn">Export CSV</a>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>API Key</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Status Code</th>
              <th>Latency (ms)</th>
            </tr>
          </thead>
          <tbody>
            ${usageRows || '<tr><td colspan="6">No usage data found</td></tr>'}
          </tbody>
        </table>
      </div>
    `);

    res.send(html);
  } catch (error) {
    console.error('Usage analytics error:', error);
    res.status(500).send(layout('Error', '<div class="error">Failed to load usage analytics</div>'));
  }
});

adminUiRouter.get('/dashboard/usage/export', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const allUsage = await db.query.apiUsage.findMany({
      orderBy: [desc(apiUsage.createdAt)],
    });

    const allApiKeys = await db.query.apiKeys.findMany();
    const allUsers = await db.query.users.findMany();

    const csvHeader = 'Date/Time,API Key Prefix,User Email,Endpoint,Method,Status Code,Latency (ms),Tokens Used\n';
    
    const csvRows = allUsage.map((u: any) => {
      const key = allApiKeys.find((k: any) => k.id === u.apiKeyId);
      const user = allUsers.find((usr: any) => usr.id === u.userId);
      const dateTime = u.createdAt ? new Date(u.createdAt).toISOString() : '';
      const keyPrefix = key?.keyPrefix || '';
      const email = user?.email || '';
      const endpoint = u.endpoint?.replace(/,/g, ';') || '';
      const method = u.method || '';
      const statusCode = u.statusCode || '';
      const latency = u.latencyMs || '';
      const tokens = u.tokensUsed || 0;
      return `"${dateTime}","${keyPrefix}","${email}","${endpoint}","${method}","${statusCode}","${latency}","${tokens}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="api-usage-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export usage error:', error);
    res.status(500).send('Failed to export usage data');
  }
});

adminUiRouter.get('/system-prompts', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const allPrompts = await db.query.systemPrompts.findMany({
      orderBy: [desc(systemPrompts.createdAt)],
    });

    const activePrompt = allPrompts.find((p: any) => p.isActive);
    const allUsers = await db.query.users.findMany();

    const promptsHtml = allPrompts.length === 0 
      ? '<p style="color: #888;">No custom prompts yet. The built-in Anplexa prompt is being used.</p>'
      : allPrompts.map((p: any) => {
          const creator = allUsers.find((u: any) => u.id === p.createdBy);
          const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Unknown';
          const contentPreview = p.content.substring(0, 200) + (p.content.length > 200 ? '...' : '');
          return `
            <tr>
              <td>
                ${p.isActive ? '<span class="badge badge-active">ACTIVE</span>' : ''}
                <strong>${escapeHtml(p.name)}</strong>
                <div style="color: #888; font-size: 12px;">Version ${p.version}</div>
              </td>
              <td style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(contentPreview)}
              </td>
              <td style="font-size: 12px;">
                ${createdDate}<br>
                <span style="color: #888;">by ${creator?.email || 'System'}</span>
              </td>
              <td>
                <button class="btn btn-sm" onclick="viewPrompt('${p.id}')">View</button>
                ${!p.isActive ? `<button class="btn btn-sm" style="margin-left: 5px;" onclick="activatePrompt('${p.id}')">Activate</button>` : ''}
                ${!p.isActive ? `<button class="btn btn-sm btn-danger" style="margin-left: 5px;" onclick="deletePrompt('${p.id}')">Delete</button>` : ''}
              </td>
            </tr>
          `;
        }).join('');

    const html = layout('System Prompts', `
      <style>
        .badge { 
          display: inline-block; 
          padding: 2px 8px; 
          border-radius: 3px; 
          font-size: 11px; 
          font-weight: bold;
          margin-right: 8px;
        }
        .badge-active { background: #28a745; color: white; }
        .prompt-editor {
          width: 100%;
          min-height: 400px;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #e0e0e0;
          padding: 15px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
          border-radius: 4px;
        }
        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .modal.show { display: flex; }
        .modal-content {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 8px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-content h2 { margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; color: #ff6b35; }
        .form-group input, .form-group textarea { width: 100%; }
      </style>

      <h1>System Prompts</h1>
      
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="color: #ff6b35; margin-bottom: 10px;">Current Active Prompt</h3>
        <p><strong>${activePrompt ? escapeHtml(activePrompt.name) : 'Anplexa Default (Built-in)'}</strong></p>
        <p style="color: #888; font-size: 14px;">
          ${activePrompt 
            ? `Version ${activePrompt.version} - Created ${new Date(activePrompt.createdAt || '').toLocaleString()}`
            : 'Using the default Anplexa identity prompt. Create a new version to customize.'}
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <button class="btn" onclick="showCreateModal()">Create New Prompt Version</button>
        <button class="btn" style="margin-left: 10px; background: #333; color: #e0e0e0;" onclick="showDefaultPrompt()">View Default Prompt</button>
      </div>

      <h2>Prompt History</h2>
      <table>
        <thead>
          <tr>
            <th>Name / Version</th>
            <th>Content Preview</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${promptsHtml}
        </tbody>
      </table>

      <div id="createModal" class="modal">
        <div class="modal-content">
          <h2>Create New Prompt Version</h2>
          <form id="createForm">
            <div class="form-group">
              <label for="promptName">Prompt Name</label>
              <input type="text" id="promptName" placeholder="e.g., Anplexa v2" required>
            </div>
            <div class="form-group">
              <label for="promptNotes">Notes (optional)</label>
              <input type="text" id="promptNotes" placeholder="Brief description of changes">
            </div>
            <div class="form-group">
              <label for="promptContent">System Prompt Content</label>
              <textarea id="promptContent" class="prompt-editor" required placeholder="Enter the full system prompt..."></textarea>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="btn">Create Prompt</button>
              <button type="button" class="btn" style="background: #333; color: #e0e0e0;" onclick="hideCreateModal()">Cancel</button>
              <button type="button" class="btn" style="background: #555; color: #e0e0e0;" onclick="loadDefaultIntoEditor()">Load Default Template</button>
            </div>
          </form>
        </div>
      </div>

      <div id="viewModal" class="modal">
        <div class="modal-content">
          <h2 id="viewModalTitle">View Prompt</h2>
          <pre id="viewModalContent" style="background: #0a0a0a; padding: 20px; border-radius: 4px; white-space: pre-wrap; max-height: 60vh; overflow-y: auto;"></pre>
          <div style="margin-top: 20px;">
            <button class="btn" style="background: #333; color: #e0e0e0;" onclick="hideViewModal()">Close</button>
          </div>
        </div>
      </div>

      <script>
        const defaultPrompt = ${JSON.stringify(ANPLEXA_DEFAULT_PROMPT)};
        
        function showCreateModal() {
          document.getElementById('createModal').classList.add('show');
        }
        
        function hideCreateModal() {
          document.getElementById('createModal').classList.remove('show');
        }
        
        function showViewModal() {
          document.getElementById('viewModal').classList.add('show');
        }
        
        function hideViewModal() {
          document.getElementById('viewModal').classList.remove('show');
        }
        
        function loadDefaultIntoEditor() {
          document.getElementById('promptContent').value = defaultPrompt;
        }
        
        function showDefaultPrompt() {
          document.getElementById('viewModalTitle').textContent = 'Anplexa Default Prompt (Built-in)';
          document.getElementById('viewModalContent').textContent = defaultPrompt;
          showViewModal();
        }
        
        async function viewPrompt(id) {
          try {
            const res = await fetch('/api/admin/system-prompts/' + id, {
              credentials: 'include'
            });
            const data = await res.json();
            if (data.prompt) {
              document.getElementById('viewModalTitle').textContent = data.prompt.name + ' (v' + data.prompt.version + ')';
              document.getElementById('viewModalContent').textContent = data.prompt.content;
              showViewModal();
            }
          } catch (err) {
            alert('Failed to load prompt');
          }
        }
        
        async function activatePrompt(id) {
          if (!confirm('Activate this prompt? All chat requests will use this prompt.')) return;
          try {
            const res = await fetch('/api/admin/system-prompts/' + id + '/activate', {
              method: 'PUT',
              credentials: 'include'
            });
            if (res.ok) {
              location.reload();
            } else {
              const data = await res.json();
              alert(data.error || 'Failed to activate');
            }
          } catch (err) {
            alert('Failed to activate prompt');
          }
        }
        
        async function deletePrompt(id) {
          if (!confirm('Delete this prompt version? This cannot be undone.')) return;
          try {
            const res = await fetch('/api/admin/system-prompts/' + id, {
              method: 'DELETE',
              credentials: 'include'
            });
            if (res.ok) {
              location.reload();
            } else {
              const data = await res.json();
              alert(data.error || 'Failed to delete');
            }
          } catch (err) {
            alert('Failed to delete prompt');
          }
        }
        
        document.getElementById('createForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('promptName').value;
          const notes = document.getElementById('promptNotes').value;
          const content = document.getElementById('promptContent').value;
          
          try {
            const res = await fetch('/api/admin/system-prompts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ name, notes, content })
            });
            if (res.ok) {
              location.reload();
            } else {
              const data = await res.json();
              alert(data.error || 'Failed to create prompt');
            }
          } catch (err) {
            alert('Failed to create prompt');
          }
        });
      </script>
    `);

    res.send(html);
  } catch (error) {
    console.error('System prompts page error:', error);
    res.status(500).send('Failed to load system prompts');
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
