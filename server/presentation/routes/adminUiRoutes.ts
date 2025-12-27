import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../infrastructure/database/index.js';
import { apiKeys, users, conversations, messages, userFeedback } from '../../../shared/schema.js';
import { eq, desc } from 'drizzle-orm';

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
      <a href="/admin/users">Users</a>
      <a href="/admin/api-keys">API Keys</a>
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

    const html = layout('Dashboard', `
      <h1>Dashboard</h1>
      <div class="card">
        <h2>Statistics</h2>
        <table>
          <tr><td>Total Users</td><td>${allUsers.length}</td></tr>
          <tr><td>Total Conversations</td><td>${allConversations.length}</td></tr>
          <tr><td>Active API Keys</td><td>${allApiKeys.filter((k: any) => k.isActive).length}</td></tr>
        </table>
      </div>
      <div class="card">
        <h2>Quick Links</h2>
        <p><a href="/admin/users">Manage Users</a> - View and update user accounts</p>
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
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    const success = req.query.success ? '<div class="success">User updated successfully</div>' : '';
    const deleted = req.query.deleted ? '<div class="success">User deleted successfully</div>' : '';

    const userRows = allUsers.map((user: any) => `
      <tr>
        <td>${user.email}</td>
        <td>${user.displayName || '-'}</td>
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
    `).join('');

    const html = layout('Users', `
      <h1>User Management</h1>
      ${success}${deleted}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Subscription</th>
            <th>Credits</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${userRows || '<tr><td colspan="6">No users found</td></tr>'}
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
