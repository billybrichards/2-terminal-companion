import { Router, Request, Response } from 'express';

export const releaseNotesRouter = Router();

const darkThemeStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Courier New', monospace; 
    background: #0a0a0a; 
    color: #e0e0e0; 
    min-height: 100vh;
    padding: 20px;
  }
  .container { max-width: 800px; margin: 0 auto; }
  h1 { color: #ff6b35; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px; }
  h2 { color: #ff6b35; margin: 30px 0 15px 0; }
  h3 { color: #ff8c5a; margin: 20px 0 10px 0; }
  a { color: #ff6b35; text-decoration: none; }
  a:hover { text-decoration: underline; }
  p { margin: 10px 0; line-height: 1.6; }
  ul { margin: 10px 0 10px 25px; }
  li { margin: 8px 0; line-height: 1.5; }
  .version { 
    display: inline-block;
    background: #ff6b35; 
    color: #0a0a0a; 
    padding: 5px 12px; 
    border-radius: 4px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  .date { color: #888; font-size: 14px; margin-bottom: 20px; }
  .card { background: #1a1a1a; padding: 20px; border-radius: 5px; margin: 20px 0; }
  .badge { 
    display: inline-block;
    padding: 3px 8px; 
    border-radius: 3px; 
    font-size: 12px;
    margin-right: 5px;
  }
  .badge-new { background: #28a745; color: white; }
  .badge-security { background: #dc3545; color: white; }
  .badge-improvement { background: #17a2b8; color: white; }
`;

releaseNotesRouter.get('/', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Release Notes - Terminal Companion API</title>
  <style>${darkThemeStyles}</style>
</head>
<body>
  <div class="container">
    <h1>Terminal Companion API</h1>
    <span class="version">v0.1.0</span>
    <p class="date">Release Date: December 2024</p>

    <div class="card">
      <h2>Features</h2>
      
      <h3><span class="badge badge-new">NEW</span> Authentication System</h3>
      <ul>
        <li>JWT-based authentication with access and refresh tokens</li>
        <li>User registration with email validation</li>
        <li>Secure password hashing with bcrypt</li>
        <li>Session management with automatic token refresh</li>
      </ul>

      <h3><span class="badge badge-new">NEW</span> Chat Integration</h3>
      <ul>
        <li>Real-time chat with AI models via Ollama</li>
        <li>Conversation history and management</li>
        <li>Support for multiple AI models (general and long-form)</li>
        <li>Streaming responses for better UX</li>
      </ul>

      <h3><span class="badge badge-new">NEW</span> Admin UI</h3>
      <ul>
        <li>Secure admin dashboard with password protection</li>
        <li>User management (view, update, delete)</li>
        <li>Subscription and credits management</li>
        <li>Dark theme interface</li>
      </ul>

      <h3><span class="badge badge-new">NEW</span> Webhooks</h3>
      <ul>
        <li>Configurable webhook endpoints</li>
        <li>Secret-based authentication for webhooks</li>
        <li>Event notification system</li>
      </ul>

      <h3><span class="badge badge-new">NEW</span> API Keys</h3>
      <ul>
        <li>Generate and manage API keys</li>
        <li>Secure key hashing (keys never stored in plain text)</li>
        <li>Key prefix display for identification</li>
        <li>Usage tracking with last-used timestamps</li>
      </ul>
    </div>

    <div class="card">
      <h2>Security Improvements</h2>
      
      <h3><span class="badge badge-security">SECURITY</span> CORS Configuration</h3>
      <ul>
        <li>Restricted CORS to specific allowed origins</li>
        <li>Whitelist includes Replit domains and configured frontend URL</li>
        <li>Proper handling of credentials and allowed methods</li>
      </ul>

      <h3><span class="badge badge-security">SECURITY</span> Content Security Policy</h3>
      <ul>
        <li>Enabled CSP via Helmet middleware</li>
        <li>Restricted script and style sources</li>
        <li>Protected against XSS and injection attacks</li>
      </ul>

      <h3><span class="badge badge-security">SECURITY</span> Rate Limiting</h3>
      <ul>
        <li>IP-based rate limiting on authentication routes</li>
        <li>10 login attempts per 15 minutes</li>
        <li>5 registration attempts per hour</li>
        <li>Protection against brute-force attacks</li>
      </ul>

      <h3><span class="badge badge-security">SECURITY</span> Secret Management</h3>
      <ul>
        <li>Sensitive configuration stored in Replit Secrets</li>
        <li>JWT secrets, API keys, and admin passwords secured</li>
        <li>Environment-based configuration</li>
      </ul>

      <h3><span class="badge badge-improvement">IMPROVEMENT</span> Error Handling</h3>
      <ul>
        <li>Production-safe error responses</li>
        <li>Stack traces hidden in production environment</li>
        <li>Detailed errors available in development mode</li>
      </ul>
    </div>

    <div class="card">
      <h2>API Documentation</h2>
      <p>For complete API documentation, visit <a href="/docs">/docs</a>.</p>
      <p>Admin dashboard available at <a href="/admin">/admin</a>.</p>
    </div>

    <p style="margin-top: 30px; color: #666; text-align: center;">
      Terminal Companion API &copy; 2024
    </p>
  </div>
</body>
</html>`;

  res.send(html);
});
