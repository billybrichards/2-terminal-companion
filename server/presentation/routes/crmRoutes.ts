import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../infrastructure/database/index.js';
import { users, emailQueue, emailLogs } from '../../../shared/schema.js';
import { eq, desc, sql, and, gte, count } from 'drizzle-orm';
import { emailTemplates, getEmailPreview, TEMPLATE_LIST, getW3Template } from '../../infrastructure/email/emailTemplates.js';
import { emailScheduler } from '../../infrastructure/email/emailScheduler.js';

export const crmRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_UI_PASSWORD || '';
const COOKIE_NAME = 'admin_session';
const SESSION_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const activeSessions = new Map<string, { expiresAt: number }>();

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

const anplexaStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
    background: #121212; 
    color: #E0E1DD; 
    min-height: 100vh;
  }
  .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid #333;
  }
  .logo { color: #7B2CBF; font-size: 24px; font-weight: 300; letter-spacing: 2px; }
  .nav { display: flex; gap: 16px; }
  .nav a { 
    color: #9CA3AF; 
    text-decoration: none; 
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .nav a:hover, .nav a.active { color: #E0E1DD; background: #1a1a1a; }
  h1 { font-size: 24px; font-weight: 500; margin-bottom: 24px; }
  h2 { font-size: 18px; font-weight: 500; margin-bottom: 16px; color: #9CA3AF; }
  .card { 
    background: #1a1a1a; 
    border: 1px solid #333; 
    border-radius: 12px; 
    padding: 24px;
    margin-bottom: 24px;
  }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat { 
    background: #1a1a1a; 
    border: 1px solid #333; 
    border-radius: 12px; 
    padding: 20px;
    text-align: center;
  }
  .stat-value { font-size: 32px; font-weight: 600; color: #7B2CBF; }
  .stat-label { font-size: 14px; color: #9CA3AF; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { 
    padding: 12px 16px; 
    text-align: left; 
    border-bottom: 1px solid #333;
  }
  th { 
    color: #9CA3AF; 
    font-weight: 500; 
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tr:hover { background: rgba(123, 44, 191, 0.05); }
  .badge { 
    display: inline-block; 
    padding: 4px 10px; 
    border-radius: 20px; 
    font-size: 12px;
    font-weight: 500;
  }
  .badge-waitlist { background: rgba(123, 44, 191, 0.2); color: #7B2CBF; }
  .badge-direct { background: rgba(39, 174, 96, 0.2); color: #27ae60; }
  .badge-new { background: rgba(52, 152, 219, 0.2); color: #3498db; }
  .badge-invited { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
  .badge-converted { background: rgba(39, 174, 96, 0.2); color: #27ae60; }
  .badge-dormant { background: rgba(149, 165, 166, 0.2); color: #95a5a6; }
  .badge-pending { background: rgba(241, 196, 15, 0.2); color: #f1c40f; }
  .badge-sent { background: rgba(39, 174, 96, 0.2); color: #27ae60; }
  .badge-failed { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
  .btn { 
    display: inline-block; 
    background: #7B2CBF; 
    color: #fff; 
    text-decoration: none; 
    padding: 10px 20px; 
    border-radius: 8px; 
    font-weight: 500; 
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .btn:hover { background: #6a24a8; }
  .btn-secondary { 
    background: transparent; 
    border: 1px solid #7B2CBF; 
    color: #7B2CBF;
  }
  .btn-secondary:hover { background: rgba(123, 44, 191, 0.1); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .filters { 
    display: flex; 
    gap: 12px; 
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .filter-select { 
    background: #1a1a1a; 
    border: 1px solid #333; 
    color: #E0E1DD; 
    padding: 8px 16px; 
    border-radius: 6px;
    font-size: 14px;
  }
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; }
  .tab { 
    padding: 12px 24px; 
    background: #1a1a1a; 
    border: 1px solid #333;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    color: #9CA3AF;
    transition: all 0.2s;
  }
  .tab.active { background: #2a2a2a; color: #E0E1DD; border-bottom-color: #2a2a2a; }
  .email-preview { 
    background: #fff; 
    border-radius: 8px; 
    padding: 0;
    overflow: hidden;
  }
  .email-preview iframe {
    width: 100%;
    height: 600px;
    border: none;
  }
  .template-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .template-card {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .template-card:hover { border-color: #7B2CBF; }
  .template-card.active { border-color: #7B2CBF; background: rgba(123, 44, 191, 0.1); }
  .template-name { font-weight: 500; margin-bottom: 4px; }
  .template-delay { font-size: 13px; color: #9CA3AF; }
  .template-seq { font-size: 11px; color: #666; margin-top: 4px; text-transform: uppercase; }
  .funnel-flow {
    display: flex;
    gap: 24px;
    padding: 24px 0;
    overflow-x: auto;
  }
  .funnel-step {
    min-width: 200px;
    text-align: center;
    position: relative;
  }
  .funnel-step::after {
    content: '→';
    position: absolute;
    right: -18px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
  .funnel-step:last-child::after { display: none; }
  .funnel-box {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
  }
  .funnel-box.waitlist { border-color: #7B2CBF; }
  .funnel-box.direct { border-color: #27ae60; }
  .funnel-count { font-size: 24px; font-weight: 600; color: #7B2CBF; }
  .funnel-label { font-size: 13px; color: #9CA3AF; margin-top: 4px; }
  .search-box {
    background: #1a1a1a;
    border: 1px solid #333;
    color: #E0E1DD;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    width: 300px;
  }
`;

function wrapPage(title: string, content: string, activeTab: string = 'users'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Anplexa CRM</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>${anplexaStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">anplexa <span style="color: #9CA3AF; font-size: 14px; margin-left: 8px;">CRM</span></div>
      <nav class="nav">
        <a href="/admin/crm" class="${activeTab === 'users' ? 'active' : ''}">Users</a>
        <a href="/admin/crm/emails" class="${activeTab === 'emails' ? 'active' : ''}">Email Queue</a>
        <a href="/admin/crm/templates" class="${activeTab === 'templates' ? 'active' : ''}">Email Templates</a>
        <a href="/admin/crm/funnel" class="${activeTab === 'funnel' ? 'active' : ''}">Funnel View</a>
        <a href="/admin/dashboard" style="border-left: 1px solid #333; margin-left: 8px; padding-left: 24px;">Admin Dashboard</a>
      </nav>
    </div>
    ${content}
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

crmRouter.get('/', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const funnelFilter = req.query.funnel as string || '';
    const stageFilter = req.query.stage as string || '';
    const personaFilter = req.query.persona as string || '';

    let whereConditions: any[] = [];
    
    const allUsers = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
      limit: 100,
    });

    const filteredUsers = allUsers.filter((user: any) => {
      if (funnelFilter && user.funnelType !== funnelFilter) return false;
      if (stageFilter && user.stage !== stageFilter) return false;
      if (personaFilter && user.persona !== personaFilter) return false;
      return true;
    });

    const stats = {
      total: allUsers.length,
      waitlist: allUsers.filter((u: any) => u.funnelType === 'waitlist').length,
      direct: allUsers.filter((u: any) => u.funnelType === 'direct').length,
      converted: allUsers.filter((u: any) => u.subscriptionStatus === 'subscribed').length,
    };

    const usersHtml = filteredUsers.map((user: any) => `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.displayName)}</td>
        <td><span class="badge badge-${user.funnelType || 'direct'}">${user.funnelType || 'direct'}</span></td>
        <td><span class="badge badge-${user.stage || 'new'}">${user.stage || 'new'}</span></td>
        <td>${escapeHtml(user.persona) || '-'}</td>
        <td>${escapeHtml(user.entrySource) || '-'}</td>
        <td>${user.subscriptionStatus === 'subscribed' ? '✓' : '-'}</td>
        <td>${user.usedFreeMessages || 0}</td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewUser('${user.id}')">View</button>
        </td>
      </tr>
    `).join('');

    const content = `
      <h1>CRM - User Management</h1>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.waitlist}</div>
          <div class="stat-label">Waitlist</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.direct}</div>
          <div class="stat-label">Direct Signups</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.converted}</div>
          <div class="stat-label">Converted</div>
        </div>
      </div>

      <div class="filters">
        <select class="filter-select" id="funnelFilter" onchange="applyFilters()">
          <option value="">All Funnels</option>
          <option value="waitlist" ${funnelFilter === 'waitlist' ? 'selected' : ''}>Waitlist</option>
          <option value="direct" ${funnelFilter === 'direct' ? 'selected' : ''}>Direct</option>
        </select>
        <select class="filter-select" id="stageFilter" onchange="applyFilters()">
          <option value="">All Stages</option>
          <option value="new" ${stageFilter === 'new' ? 'selected' : ''}>New</option>
          <option value="waitlist" ${stageFilter === 'waitlist' ? 'selected' : ''}>Waitlist</option>
          <option value="invited" ${stageFilter === 'invited' ? 'selected' : ''}>Invited</option>
          <option value="converted" ${stageFilter === 'converted' ? 'selected' : ''}>Converted</option>
          <option value="dormant" ${stageFilter === 'dormant' ? 'selected' : ''}>Dormant</option>
        </select>
        <select class="filter-select" id="personaFilter" onchange="applyFilters()">
          <option value="">All Personas</option>
          <option value="lonely" ${personaFilter === 'lonely' ? 'selected' : ''}>Lonely</option>
          <option value="curious" ${personaFilter === 'curious' ? 'selected' : ''}>Curious</option>
          <option value="privacy" ${personaFilter === 'privacy' ? 'selected' : ''}>Privacy</option>
        </select>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Funnel</th>
              <th>Stage</th>
              <th>Persona</th>
              <th>Source</th>
              <th>Subscribed</th>
              <th>Free Msgs</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${usersHtml || '<tr><td colspan="10" style="text-align: center; padding: 40px; color: #666;">No users found</td></tr>'}
          </tbody>
        </table>
      </div>

      <script>
        function applyFilters() {
          const funnel = document.getElementById('funnelFilter').value;
          const stage = document.getElementById('stageFilter').value;
          const persona = document.getElementById('personaFilter').value;
          const params = new URLSearchParams();
          if (funnel) params.set('funnel', funnel);
          if (stage) params.set('stage', stage);
          if (persona) params.set('persona', persona);
          window.location.href = '/admin/crm?' + params.toString();
        }
        
        function viewUser(userId) {
          window.location.href = '/admin/crm/user/' + userId;
        }
      </script>
    `;

    res.send(wrapPage('Users', content, 'users'));
  } catch (error) {
    console.error('CRM users page error:', error);
    res.status(500).send('Failed to load CRM');
  }
});

crmRouter.get('/emails', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const emailQueueItems = await db.query.emailQueue.findMany({
      orderBy: desc(emailQueue.createdAt),
      limit: 100,
    });

    const stats = {
      pending: emailQueueItems.filter((e: any) => e.status === 'pending').length,
      sent: emailQueueItems.filter((e: any) => e.status === 'sent').length,
      failed: emailQueueItems.filter((e: any) => e.status === 'failed').length,
    };

    const queueHtml = await Promise.all(emailQueueItems.map(async (item: any) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, item.userId),
      });
      return `
        <tr>
          <td>${escapeHtml(user?.email || 'Unknown')}</td>
          <td><strong>${item.emailTemplate}</strong></td>
          <td><span class="badge badge-${item.status}">${item.status}</span></td>
          <td>${item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : '-'}</td>
          <td>${item.sentAt ? new Date(item.sentAt).toLocaleString() : '-'}</td>
          <td>${escapeHtml(item.errorMessage) || '-'}</td>
          <td>
            ${item.status === 'pending' ? `<button class="btn btn-sm btn-secondary" onclick="cancelEmail('${item.id}')">Cancel</button>` : ''}
          </td>
        </tr>
      `;
    }));

    const content = `
      <h1>Email Queue</h1>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${stats.pending}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.sent}</div>
          <div class="stat-label">Sent</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.failed}</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <button class="btn" onclick="processEmails()">Process Pending Emails Now</button>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Template</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Sent</th>
              <th>Error</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${queueHtml.join('') || '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No emails in queue</td></tr>'}
          </tbody>
        </table>
      </div>

      <script>
        async function processEmails() {
          try {
            const res = await fetch('/api/admin/crm/process-emails', {
              method: 'POST',
              credentials: 'include'
            });
            const data = await res.json();
            alert('Processed: ' + data.sent + ' sent, ' + data.failed + ' failed');
            location.reload();
          } catch (err) {
            alert('Failed to process emails');
          }
        }
        
        async function cancelEmail(id) {
          if (!confirm('Cancel this email?')) return;
          try {
            const res = await fetch('/api/admin/crm/cancel-email/' + id, {
              method: 'POST',
              credentials: 'include'
            });
            if (res.ok) location.reload();
            else alert('Failed to cancel');
          } catch (err) {
            alert('Failed to cancel email');
          }
        }
      </script>
    `;

    res.send(wrapPage('Email Queue', content, 'emails'));
  } catch (error) {
    console.error('CRM emails page error:', error);
    res.status(500).send('Failed to load email queue');
  }
});

crmRouter.get('/templates', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  const selectedTemplate = req.query.template as string || 'W1';
  const persona = req.query.persona as string || 'curious';

  const preview = getEmailPreview(selectedTemplate, 'preview-user', persona);

  const templateCards = TEMPLATE_LIST.map(t => `
    <div class="template-card ${t.id === selectedTemplate ? 'active' : ''}" 
         onclick="selectTemplate('${t.id}')">
      <div class="template-name">${t.name}</div>
      <div class="template-delay">${t.delay}</div>
      <div class="template-seq">${t.sequence}</div>
    </div>
  `).join('');

  const content = `
    <h1>Email Templates</h1>
    
    <div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px;">
      <div>
        <h2>Templates</h2>
        <div class="template-list" style="display: flex; flex-direction: column; gap: 12px;">
          ${templateCards}
        </div>
        
        ${selectedTemplate === 'W3' ? `
          <div style="margin-top: 24px;">
            <h2>Persona Variant</h2>
            <select class="filter-select" style="width: 100%;" onchange="selectPersona(this.value)">
              <option value="lonely" ${persona === 'lonely' ? 'selected' : ''}>Lonely</option>
              <option value="curious" ${persona === 'curious' ? 'selected' : ''}>Curious</option>
              <option value="privacy" ${persona === 'privacy' ? 'selected' : ''}>Privacy</option>
            </select>
          </div>
        ` : ''}
      </div>
      
      <div>
        <h2>Preview: ${escapeHtml(preview.subject)}</h2>
        <div class="email-preview">
          <iframe srcdoc="${escapeHtml(preview.html)}"></iframe>
        </div>
      </div>
    </div>

    <script>
      function selectTemplate(id) {
        const params = new URLSearchParams(window.location.search);
        params.set('template', id);
        if (id !== 'W3') params.delete('persona');
        window.location.href = '/admin/crm/templates?' + params.toString();
      }
      
      function selectPersona(persona) {
        const params = new URLSearchParams(window.location.search);
        params.set('persona', persona);
        window.location.href = '/admin/crm/templates?' + params.toString();
      }
    </script>
  `;

  res.send(wrapPage('Email Templates', content, 'templates'));
});

crmRouter.get('/funnel', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const allUsers = await db.query.users.findMany();

    const funnelStats = {
      waitlist: {
        total: allUsers.filter((u: any) => u.funnelType === 'waitlist').length,
        new: allUsers.filter((u: any) => u.funnelType === 'waitlist' && u.stage === 'waitlist').length,
        invited: allUsers.filter((u: any) => u.funnelType === 'waitlist' && u.stage === 'invited').length,
        converted: allUsers.filter((u: any) => u.funnelType === 'waitlist' && u.subscriptionStatus === 'subscribed').length,
      },
      direct: {
        total: allUsers.filter((u: any) => u.funnelType === 'direct').length,
        new: allUsers.filter((u: any) => u.funnelType === 'direct' && u.stage === 'new').length,
        usedFree: allUsers.filter((u: any) => u.funnelType === 'direct' && (u.usedFreeMessages || 0) >= 3).length,
        converted: allUsers.filter((u: any) => u.funnelType === 'direct' && u.subscriptionStatus === 'subscribed').length,
      },
    };

    const content = `
      <h1>Funnel View</h1>
      
      <div class="card">
        <h2>Waitlist Funnel</h2>
        <div class="funnel-flow">
          <div class="funnel-step">
            <div class="funnel-box waitlist">
              <div class="funnel-count">${funnelStats.waitlist.total}</div>
              <div class="funnel-label">Joined Waitlist</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box waitlist">
              <div class="funnel-count">${funnelStats.waitlist.new}</div>
              <div class="funnel-label">Waiting</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box waitlist">
              <div class="funnel-count">${funnelStats.waitlist.invited}</div>
              <div class="funnel-label">Invited</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box waitlist">
              <div class="funnel-count">${funnelStats.waitlist.converted}</div>
              <div class="funnel-label">Converted</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Direct Signup Funnel</h2>
        <div class="funnel-flow">
          <div class="funnel-step">
            <div class="funnel-box direct">
              <div class="funnel-count">${funnelStats.direct.total}</div>
              <div class="funnel-label">Signed Up</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box direct">
              <div class="funnel-count">${funnelStats.direct.new}</div>
              <div class="funnel-label">New (< 3 msgs)</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box direct">
              <div class="funnel-count">${funnelStats.direct.usedFree}</div>
              <div class="funnel-label">Used Free</div>
            </div>
          </div>
          <div class="funnel-step">
            <div class="funnel-box direct">
              <div class="funnel-count">${funnelStats.direct.converted}</div>
              <div class="funnel-label">Converted</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Conversion Rates</h2>
        <table>
          <tr>
            <th>Funnel</th>
            <th>Total</th>
            <th>Converted</th>
            <th>Rate</th>
          </tr>
          <tr>
            <td>Waitlist</td>
            <td>${funnelStats.waitlist.total}</td>
            <td>${funnelStats.waitlist.converted}</td>
            <td>${funnelStats.waitlist.total > 0 ? ((funnelStats.waitlist.converted / funnelStats.waitlist.total) * 100).toFixed(1) : 0}%</td>
          </tr>
          <tr>
            <td>Direct</td>
            <td>${funnelStats.direct.total}</td>
            <td>${funnelStats.direct.converted}</td>
            <td>${funnelStats.direct.total > 0 ? ((funnelStats.direct.converted / funnelStats.direct.total) * 100).toFixed(1) : 0}%</td>
          </tr>
        </table>
      </div>
    `;

    res.send(wrapPage('Funnel View', content, 'funnel'));
  } catch (error) {
    console.error('CRM funnel page error:', error);
    res.status(500).send('Failed to load funnel view');
  }
});

crmRouter.get('/user/:userId', async (req: Request, res: Response) => {
  if (!requireAuth(req, res)) return;

  try {
    const { userId } = req.params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const userEmailLogs = await db.query.emailLogs.findMany({
      where: eq(emailLogs.userId, userId),
      orderBy: desc(emailLogs.sentAt),
    });

    const pendingEmails = await db.query.emailQueue.findMany({
      where: and(eq(emailQueue.userId, userId), eq(emailQueue.status, 'pending')),
    });

    const emailLogsHtml = userEmailLogs.map((log: any) => `
      <tr>
        <td>${log.emailTemplate}</td>
        <td>${escapeHtml(log.subject)}</td>
        <td>${log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</td>
        <td>${log.openedAt ? '✓ ' + new Date(log.openedAt).toLocaleString() : '-'}</td>
        <td>${log.clickedAt ? '✓ ' + new Date(log.clickedAt).toLocaleString() : '-'}</td>
      </tr>
    `).join('');

    const content = `
      <h1>User: ${escapeHtml(user.email)}</h1>
      <a href="/admin/crm" style="color: #7B2CBF; margin-bottom: 24px; display: inline-block;">← Back to Users</a>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${(user as any).funnelType || 'direct'}</div>
          <div class="stat-label">Funnel Type</div>
        </div>
        <div class="stat">
          <div class="stat-value">${(user as any).stage || 'new'}</div>
          <div class="stat-label">Stage</div>
        </div>
        <div class="stat">
          <div class="stat-value">${(user as any).persona || '-'}</div>
          <div class="stat-label">Persona</div>
        </div>
        <div class="stat">
          <div class="stat-value">${(user as any).usedFreeMessages || 0}</div>
          <div class="stat-label">Free Messages Used</div>
        </div>
      </div>

      <div class="card">
        <h2>User Details</h2>
        <table>
          <tr><td style="width: 200px; color: #9CA3AF;">Email</td><td>${escapeHtml(user.email)}</td></tr>
          <tr><td style="color: #9CA3AF;">Display Name</td><td>${escapeHtml(user.displayName)}</td></tr>
          <tr><td style="color: #9CA3AF;">Chat Name</td><td>${escapeHtml((user as any).chatName) || '-'}</td></tr>
          <tr><td style="color: #9CA3AF;">Entry Source</td><td>${escapeHtml((user as any).entrySource) || '-'}</td></tr>
          <tr><td style="color: #9CA3AF;">Subscription Status</td><td>${(user as any).subscriptionStatus || 'not_subscribed'}</td></tr>
          <tr><td style="color: #9CA3AF;">Joined</td><td>${user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td></tr>
        </table>
      </div>

      ${pendingEmails.length > 0 ? `
        <div class="card">
          <h2>Pending Emails (${pendingEmails.length})</h2>
          <table>
            <tr><th>Template</th><th>Scheduled</th><th></th></tr>
            ${pendingEmails.map((e: any) => `
              <tr>
                <td>${e.emailTemplate}</td>
                <td>${new Date(e.scheduledAt).toLocaleString()}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="cancelEmail('${e.id}')">Cancel</button></td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}

      <div class="card">
        <h2>Email History</h2>
        <table>
          <thead>
            <tr><th>Template</th><th>Subject</th><th>Sent</th><th>Opened</th><th>Clicked</th></tr>
          </thead>
          <tbody>
            ${emailLogsHtml || '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #666;">No emails sent yet</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Actions</h2>
        <button class="btn" onclick="inviteUser('${userId}')">Send Invite (W4)</button>
        <button class="btn btn-secondary" onclick="cancelAllEmails('${userId}')">Cancel All Pending Emails</button>
        <button class="btn btn-secondary" onclick="updateStage('${userId}', 'dormant')">Mark as Dormant</button>
      </div>

      <script>
        async function cancelEmail(id) {
          if (!confirm('Cancel this email?')) return;
          await fetch('/api/admin/crm/cancel-email/' + id, { method: 'POST', credentials: 'include' });
          location.reload();
        }
        
        async function cancelAllEmails(userId) {
          if (!confirm('Cancel all pending emails for this user?')) return;
          await fetch('/api/admin/crm/cancel-all-emails/' + userId, { method: 'POST', credentials: 'include' });
          location.reload();
        }
        
        async function inviteUser(userId) {
          if (!confirm('Send invite email (W4) to this user?')) return;
          await fetch('/api/admin/crm/invite/' + userId, { method: 'POST', credentials: 'include' });
          location.reload();
        }
        
        async function updateStage(userId, stage) {
          await fetch('/api/admin/crm/update-stage/' + userId, { 
            method: 'POST', 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage })
          });
          location.reload();
        }
      </script>
    `;

    res.send(wrapPage('User Details', content, 'users'));
  } catch (error) {
    console.error('CRM user page error:', error);
    res.status(500).send('Failed to load user');
  }
});

crmRouter.post('/api/admin/crm/process-emails', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await emailScheduler.processPendingEmails();
    res.json(result);
  } catch (error) {
    console.error('Process emails error:', error);
    res.status(500).json({ error: 'Failed to process emails' });
  }
});

crmRouter.post('/api/admin/crm/cancel-email/:id', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await db.update(emailQueue)
      .set({ status: 'cancelled' })
      .where(eq(emailQueue.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Cancel email error:', error);
    res.status(500).json({ error: 'Failed to cancel email' });
  }
});

crmRouter.post('/api/admin/crm/cancel-all-emails/:userId', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await emailScheduler.cancelPendingEmails(req.params.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Cancel all emails error:', error);
    res.status(500).json({ error: 'Failed to cancel emails' });
  }
});

crmRouter.post('/api/admin/crm/invite/:userId', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await emailScheduler.scheduleWaitlistInvite(req.params.userId);
    await db.update(users)
      .set({ stage: 'invited' } as any)
      .where(eq(users.id, req.params.userId));
    res.json({ success: true });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

crmRouter.post('/api/admin/crm/update-stage/:userId', async (req: Request, res: Response) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { stage } = req.body;
    await db.update(users)
      .set({ stage } as any)
      .where(eq(users.id, req.params.userId));
    res.json({ success: true });
  } catch (error) {
    console.error('Update stage error:', error);
    res.status(500).json({ error: 'Failed to update stage' });
  }
});

crmRouter.get('/track/open/:logId', async (req: Request, res: Response) => {
  try {
    await emailScheduler.trackEmailOpen(req.params.logId);
    
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(pixel);
  } catch (error) {
    console.error('Track open error:', error);
    res.status(204).send();
  }
});

crmRouter.get('/track/click/:logId', async (req: Request, res: Response) => {
  try {
    const source = req.query.source as string || 'unknown';
    await emailScheduler.trackEmailClick(req.params.logId, source);
    
    const redirect = req.query.redirect as string || 'https://anplexa.com/dash';
    res.redirect(redirect);
  } catch (error) {
    console.error('Track click error:', error);
    res.redirect('https://anplexa.com/dash');
  }
});
