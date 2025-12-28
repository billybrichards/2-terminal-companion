import { Router, Request, Response } from 'express';

export const landingRouter = Router();

const sharedStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #0a0a0a; 
    color: #e0e0e0; 
    line-height: 1.6;
  }
  a { color: #ff6b35; text-decoration: none; transition: color 0.2s; }
  a:hover { color: #ff8c5a; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
  .btn {
    display: inline-block;
    padding: 16px 40px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    text-decoration: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, #ff6b35, #ff8c5a);
    color: #0a0a0a;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
    color: #0a0a0a;
  }
  .btn-secondary {
    background: transparent;
    border: 2px solid #ff6b35;
    color: #ff6b35;
  }
  .btn-secondary:hover {
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  }
  .auth-card {
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 40px;
    max-width: 420px;
    width: 100%;
  }
  .auth-card h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #ff6b35, #ff8c5a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
  }
  .auth-card .subtitle {
    color: #888;
    text-align: center;
    margin-bottom: 30px;
  }
  .form-group {
    margin-bottom: 20px;
  }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #aaa;
    font-size: 0.9rem;
  }
  .form-group input {
    width: 100%;
    padding: 14px 16px;
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    color: #e0e0e0;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  .form-group input:focus {
    outline: none;
    border-color: #ff6b35;
  }
  .form-group .hint {
    font-size: 0.8rem;
    color: #666;
    margin-top: 5px;
  }
  .auth-card .btn {
    width: 100%;
    margin-top: 10px;
  }
  .auth-links {
    margin-top: 25px;
    text-align: center;
    color: #888;
    font-size: 0.9rem;
  }
  .auth-links a {
    margin-left: 5px;
  }
  .error-message {
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.3);
    color: #ff6b6b;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    display: none;
  }
  .success-message {
    background: rgba(52, 199, 89, 0.1);
    border: 1px solid rgba(52, 199, 89, 0.3);
    color: #34c759;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    display: none;
  }
  .brand-link {
    display: block;
    text-align: center;
    margin-bottom: 30px;
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

landingRouter.get('/signup', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Up - Abionti API</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="auth-container">
    <div class="auth-card">
      <a href="/" class="brand-link">Abionti</a>
      <h1>Create Account</h1>
      <p class="subtitle">Get started with the Abionti API</p>
      
      <div id="error" class="error-message"></div>
      
      <form id="signupForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required minlength="6" placeholder="Min. 6 characters">
          <p class="hint">At least 6 characters</p>
        </div>
        
        <div class="form-group">
          <label for="displayName">Display Name (optional)</label>
          <input type="text" id="displayName" name="displayName" placeholder="Your name">
        </div>
        
        <button type="submit" class="btn btn-primary" id="submitBtn">Create Account</button>
      </form>
      
      <p class="auth-links">
        Already have an account?<a href="/login">Log in</a>
      </p>
    </div>
  </div>
  
  <script>
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const errorDiv = document.getElementById('error');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
      errorDiv.style.display = 'none';
      
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            displayName: document.getElementById('displayName').value || undefined
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = '/dashboard';
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  </script>
</body>
</html>`;
  res.send(html);
});

landingRouter.get('/login', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Log In - Abionti API</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="auth-container">
    <div class="auth-card">
      <a href="/" class="brand-link">Abionti</a>
      <h1>Welcome Back</h1>
      <p class="subtitle">Log in to your account</p>
      
      <div id="error" class="error-message"></div>
      
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required placeholder="Your password">
        </div>
        
        <button type="submit" class="btn btn-primary" id="submitBtn">Log In</button>
      </form>
      
      <p class="auth-links">
        <a href="/forgot-password">Forgot password?</a>
      </p>
      <p class="auth-links">
        Don't have an account?<a href="/signup">Sign up</a>
      </p>
    </div>
  </div>
  
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const errorDiv = document.getElementById('error');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';
      errorDiv.style.display = 'none';
      
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.location.href = '/dashboard';
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
      }
    });
  </script>
</body>
</html>`;
  res.send(html);
});

landingRouter.get('/forgot-password', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password - Abionti API</title>
  <style>${sharedStyles}</style>
</head>
<body>
  <div class="auth-container">
    <div class="auth-card">
      <a href="/" class="brand-link">Abionti</a>
      <h1>Reset Password</h1>
      <p class="subtitle">We'll send you a link to reset your password</p>
      
      <div id="error" class="error-message"></div>
      <div id="success" class="success-message"></div>
      
      <form id="forgotForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com">
        </div>
        
        <button type="submit" class="btn btn-primary" id="submitBtn">Send Reset Link</button>
      </form>
      
      <p class="auth-links">
        Remember your password?<a href="/login">Log in</a>
      </p>
    </div>
  </div>
  
  <script>
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const errorDiv = document.getElementById('error');
      const successDiv = document.getElementById('success');
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      errorDiv.style.display = 'none';
      successDiv.style.display = 'none';
      
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: document.getElementById('email').value
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Request failed');
        }
        
        successDiv.textContent = data.message || 'If an account exists, a reset link has been sent.';
        successDiv.style.display = 'block';
        submitBtn.textContent = 'Email Sent';
      } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
      }
    });
  </script>
</body>
</html>`;
  res.send(html);
});

landingRouter.get('/dashboard', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Abionti API</title>
  <style>
    ${sharedStyles}
    .dashboard-container {
      min-height: 100vh;
      padding: 40px 20px;
      background: #0a0a0a;
    }
    .dashboard-header {
      max-width: 900px;
      margin: 0 auto 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .dashboard-header .brand {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ff6b35;
    }
    .dashboard-header .actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .logout-btn {
      padding: 10px 20px;
      font-size: 0.9rem;
    }
    .dashboard-content {
      max-width: 900px;
      margin: 0 auto;
    }
    .welcome-section {
      margin-bottom: 40px;
    }
    .welcome-section h1 {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 5px;
    }
    .welcome-section p {
      color: #888;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin-bottom: 30px;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 25px;
    }
    .card h3 {
      font-size: 0.9rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    .card .value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
    }
    .card .value.accent {
      color: #ff6b35;
    }
    .card .subtext {
      font-size: 0.85rem;
      color: #666;
      margin-top: 5px;
    }
    .api-key-section {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 25px;
    }
    .api-key-section h2 {
      font-size: 1.2rem;
      color: #fff;
      margin-bottom: 20px;
    }
    .api-key-display {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .api-key-value {
      flex: 1;
      background: #0a0a0a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 14px 16px;
      font-family: 'Fira Code', monospace;
      color: #e0e0e0;
      font-size: 0.95rem;
    }
    .copy-btn {
      padding: 14px 20px;
      background: #2a2a2a;
      border: none;
      border-radius: 8px;
      color: #e0e0e0;
      cursor: pointer;
      transition: background 0.2s;
    }
    .copy-btn:hover {
      background: #3a3a3a;
    }
    .no-key-message {
      color: #888;
      margin-bottom: 20px;
    }
    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .action-buttons .btn {
      padding: 14px 30px;
    }
    .loading {
      text-align: center;
      padding: 60px;
      color: #888;
    }
    .upgrade-banner {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 140, 90, 0.05));
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    .upgrade-banner h3 {
      color: #ff6b35;
      margin-bottom: 5px;
    }
    .upgrade-banner p {
      color: #aaa;
      font-size: 0.9rem;
    }
    @media (max-width: 600px) {
      .dashboard-header { flex-direction: column; gap: 20px; text-align: center; }
      .api-key-display { flex-direction: column; }
      .action-buttons { flex-direction: column; }
      .action-buttons .btn { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <a href="/" class="brand">Abionti</a>
      <div class="actions">
        <a href="/docs" class="btn btn-secondary logout-btn">API Docs</a>
        <button id="logoutBtn" class="btn btn-secondary logout-btn">Log Out</button>
      </div>
    </header>
    
    <div id="loading" class="loading">Loading your dashboard...</div>
    
    <div id="dashboardContent" class="dashboard-content" style="display: none;">
      <div class="welcome-section">
        <h1>Welcome, <span id="userName">User</span></h1>
        <p id="userEmail"></p>
      </div>
      
      <div id="upgradeBanner" class="upgrade-banner" style="display: none;">
        <div>
          <h3>Upgrade to Unlimited</h3>
          <p>Get unlimited API calls and priority support for just $9.99/month</p>
        </div>
        <button id="upgradeBtn" class="btn btn-primary">Upgrade Now</button>
      </div>
      
      <div class="card-grid">
        <div class="card">
          <h3>Subscription</h3>
          <div class="value" id="subscriptionStatus">Free</div>
          <p class="subtext" id="subscriptionSubtext">50 calls/month limit</p>
        </div>
        <div class="card">
          <h3>API Usage This Month</h3>
          <div class="value accent" id="usageCount">0</div>
          <p class="subtext" id="usageLimit">of 50 calls</p>
        </div>
      </div>
      
      <div class="api-key-section">
        <h2>Your API Key</h2>
        <div id="noApiKey" class="no-key-message">
          <p>You don't have an API key yet. Create one to start using the API.</p>
        </div>
        <div id="apiKeyContainer" style="display: none;">
          <div class="api-key-display">
            <div class="api-key-value" id="apiKeyValue">Loading...</div>
            <button class="copy-btn" id="copyBtn" title="Copy API Key">Copy</button>
          </div>
          <p class="subtext" style="margin-top: 10px;">Keep your API key secure and never share it publicly.</p>
        </div>
        <div class="action-buttons" style="margin-top: 20px;">
          <button id="createKeyBtn" class="btn btn-primary">Create API Key</button>
          <button id="manageSubBtn" class="btn btn-secondary" style="display: none;">Manage Subscription</button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      window.location.href = '/login';
    }
    
    async function fetchWithAuth(url, options = {}) {
      const token = localStorage.getItem('accessToken');
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
    }
    
    async function loadDashboard() {
      try {
        const [userRes, subRes] = await Promise.all([
          fetchWithAuth('/api/auth/me'),
          fetchWithAuth('/api/stripe/subscription')
        ]);
        
        if (userRes.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
        const userData = await userRes.json();
        const subData = await subRes.json();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        
        const user = userData.user;
        document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('userEmail').textContent = user.email;
        
        const isSubscribed = subData.status === 'active' || subData.status === 'trialing';
        
        if (isSubscribed) {
          document.getElementById('subscriptionStatus').textContent = 'Unlimited';
          document.getElementById('subscriptionSubtext').textContent = 'Unlimited API calls';
          document.getElementById('usageLimit').textContent = 'unlimited';
          document.getElementById('manageSubBtn').style.display = 'inline-block';
          document.getElementById('upgradeBanner').style.display = 'none';
        } else {
          document.getElementById('subscriptionStatus').textContent = 'Free';
          document.getElementById('subscriptionSubtext').textContent = '50 calls/month limit';
          document.getElementById('usageLimit').textContent = 'of 50 calls';
          document.getElementById('upgradeBanner').style.display = 'flex';
        }
        
        await loadApiKey();
        await loadUsage();
        
      } catch (err) {
        console.error('Dashboard error:', err);
        document.getElementById('loading').textContent = 'Failed to load dashboard. Please refresh.';
      }
    }
    
    async function loadApiKey() {
      try {
        const res = await fetchWithAuth('/api/settings/api-key');
        if (res.ok) {
          const data = await res.json();
          if (data.apiKey) {
            document.getElementById('noApiKey').style.display = 'none';
            document.getElementById('apiKeyContainer').style.display = 'block';
            const prefix = data.apiKey.keyPrefix || data.apiKey.substring(0, 8);
            document.getElementById('apiKeyValue').textContent = prefix + '••••••••••••••••••••••••';
            document.getElementById('apiKeyValue').dataset.full = data.apiKey.key || data.apiKey;
            document.getElementById('createKeyBtn').textContent = 'Regenerate Key';
          }
        }
      } catch (err) {
        console.log('No API key found');
      }
    }
    
    async function loadUsage() {
      try {
        const res = await fetchWithAuth('/api/settings/usage');
        if (res.ok) {
          const data = await res.json();
          document.getElementById('usageCount').textContent = data.callsThisMonth || 0;
        }
      } catch (err) {
        console.log('Could not load usage');
      }
    }
    
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      try {
        await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      } catch (err) {}
      localStorage.clear();
      window.location.href = '/';
    });
    
    document.getElementById('copyBtn').addEventListener('click', () => {
      const apiKeyEl = document.getElementById('apiKeyValue');
      const fullKey = apiKeyEl.dataset.full || apiKeyEl.textContent;
      navigator.clipboard.writeText(fullKey).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
    
    document.getElementById('createKeyBtn').addEventListener('click', async () => {
      const btn = document.getElementById('createKeyBtn');
      btn.disabled = true;
      btn.textContent = 'Creating...';
      
      try {
        const res = await fetchWithAuth('/api/settings/api-key', { method: 'POST' });
        const data = await res.json();
        
        if (res.ok && data.apiKey) {
          document.getElementById('noApiKey').style.display = 'none';
          document.getElementById('apiKeyContainer').style.display = 'block';
          const key = data.apiKey.key || data.apiKey;
          document.getElementById('apiKeyValue').textContent = key;
          document.getElementById('apiKeyValue').dataset.full = key;
          btn.textContent = 'Regenerate Key';
          
          alert('Your new API key: ' + key + '\\n\\nCopy it now - you won\\'t be able to see the full key again!');
        } else {
          throw new Error(data.error || 'Failed to create key');
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
      btn.disabled = false;
    });
    
    document.getElementById('upgradeBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('upgradeBtn');
      btn.disabled = true;
      btn.textContent = 'Redirecting...';
      
      try {
        const res = await fetchWithAuth('/api/stripe/checkout', {
          method: 'POST',
          body: JSON.stringify({ plan: 'unlimited' })
        });
        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to start checkout');
        }
      } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Upgrade Now';
      }
    });
    
    document.getElementById('manageSubBtn').addEventListener('click', async () => {
      const btn = document.getElementById('manageSubBtn');
      btn.disabled = true;
      btn.textContent = 'Loading...';
      
      try {
        const res = await fetchWithAuth('/api/stripe/portal', { method: 'POST' });
        const data = await res.json();
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to open portal');
        }
      } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Manage Subscription';
      }
    });
    
    loadDashboard();
  </script>
</body>
</html>`;
  res.send(html);
});

landingRouter.get('/', (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Abionti Unrestricted API - Unrestricted AI Companion API for Developers. Build adult AI experiences with no censorship.">
  <title>Abionti Unrestricted API - Adult AI Companion API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #0a0a0a; 
      color: #e0e0e0; 
      line-height: 1.6;
    }
    a { color: #ff6b35; text-decoration: none; transition: color 0.2s; }
    a:hover { color: #ff8c5a; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%);
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; }
    .hero h1 { 
      font-size: clamp(2.5rem, 6vw, 4rem); 
      font-weight: 800; 
      margin-bottom: 20px;
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero .tagline { 
      font-size: clamp(1.1rem, 2.5vw, 1.5rem); 
      color: #888; 
      margin-bottom: 15px;
    }
    .hero .description {
      font-size: 1.1rem;
      color: #aaa;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      display: inline-block;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      text-decoration: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
      color: #0a0a0a;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
      color: #0a0a0a;
    }
    .btn-secondary {
      background: transparent;
      border: 2px solid #ff6b35;
      color: #ff6b35;
      margin-left: 15px;
    }
    .btn-secondary:hover {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
    }

    /* Features Section */
    .features {
      padding: 100px 20px;
      background: #0a0a0a;
    }
    .section-title {
      text-align: center;
      font-size: clamp(2rem, 4vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 60px;
      color: #fff;
    }
    .section-title span { color: #ff6b35; }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .feature-card {
      background: linear-gradient(135deg, #1a1a1a, #151515);
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 35px;
      transition: all 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      border-color: #ff6b35;
      box-shadow: 0 10px 40px rgba(255, 107, 53, 0.1);
    }
    .feature-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .feature-card h3 {
      font-size: 1.3rem;
      color: #fff;
      margin-bottom: 12px;
    }
    .feature-card p {
      color: #888;
      font-size: 1rem;
    }

    /* Pricing Section */
    .pricing {
      padding: 100px 20px;
      background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
    }
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      max-width: 700px;
      margin: 0 auto;
    }
    .pricing-card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .pricing-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }
    .pricing-card.featured {
      border-color: #ff6b35;
      position: relative;
    }
    .pricing-card.featured::before {
      content: 'POPULAR';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff6b35;
      color: #0a0a0a;
      padding: 5px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .pricing-card h3 {
      font-size: 1.5rem;
      color: #fff;
      margin-bottom: 10px;
    }
    .pricing-card .price {
      font-size: 3rem;
      font-weight: 800;
      color: #ff6b35;
      margin: 20px 0;
    }
    .pricing-card .price span {
      font-size: 1rem;
      color: #666;
      font-weight: 400;
    }
    .pricing-card ul {
      list-style: none;
      margin: 30px 0;
      text-align: left;
    }
    .pricing-card li {
      padding: 10px 0;
      color: #aaa;
      display: flex;
      align-items: center;
    }
    .pricing-card li::before {
      content: '✓';
      color: #ff6b35;
      font-weight: bold;
      margin-right: 12px;
    }
    .pricing-card .btn {
      width: 100%;
      margin-top: 10px;
    }

    /* Code Example Section */
    .code-section {
      padding: 100px 20px;
      background: #0a0a0a;
    }
    .code-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .code-block {
      background: #151515;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      overflow: hidden;
    }
    .code-header {
      background: #1a1a1a;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #2a2a2a;
    }
    .code-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .code-dot.red { background: #ff5f56; }
    .code-dot.yellow { background: #ffbd2e; }
    .code-dot.green { background: #27c93f; }
    .code-header span {
      margin-left: auto;
      color: #666;
      font-size: 14px;
    }
    pre {
      padding: 25px;
      overflow-x: auto;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.7;
      color: #e0e0e0;
    }
    .code-comment { color: #6a737d; }
    .code-string { color: #a5d6ff; }
    .code-key { color: #ff6b35; }

    /* Footer */
    footer {
      padding: 60px 20px;
      background: #0a0a0a;
      border-top: 1px solid #1a1a1a;
    }
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    .footer-brand {
      font-size: 1.3rem;
      font-weight: 700;
      color: #ff6b35;
    }
    .footer-links {
      display: flex;
      gap: 30px;
    }
    .footer-links a {
      color: #888;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: #ff6b35;
    }
    .footer-copyright {
      width: 100%;
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #1a1a1a;
      color: #555;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero { padding: 40px 20px; }
      .btn-secondary { margin-left: 0; margin-top: 15px; display: block; }
      .features-grid { grid-template-columns: 1fr; }
      .pricing-grid { grid-template-columns: 1fr; }
      .footer-content { flex-direction: column; text-align: center; }
      .footer-links { flex-wrap: wrap; justify-content: center; }
      pre { font-size: 12px; padding: 15px; }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Abionti Unrestricted API</h1>
      <p class="tagline">Unrestricted AI Companion API for Developers</p>
      <p class="description">Build immersive adult AI experiences without limitations. Our uncensored API delivers natural, unrestricted conversations with full context memory and lightning-fast streaming responses.</p>
      <div>
        <a href="/signup" class="btn btn-primary">Get API Key</a>
        <a href="/docs" class="btn btn-secondary">View Docs</a>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features" id="features">
    <div class="container">
      <h2 class="section-title">Powerful <span>Features</span></h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔓</div>
          <h3>Unrestricted Content</h3>
          <p>No censorship or content filters. Full creative freedom for adult-oriented AI applications and experiences.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Streaming Responses</h3>
          <p>Real-time SSE streaming support for instant, natural-feeling conversations without waiting for complete responses.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🧠</div>
          <h3>Conversation Memory</h3>
          <p>Context-aware AI that remembers previous interactions for coherent, continuous conversations across sessions.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔌</div>
          <h3>Easy Integration</h3>
          <p>Simple REST API with comprehensive documentation. Get started in minutes with just a few lines of code.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Usage-Based Pricing</h3>
          <p>Only pay for what you use. No hidden fees, no commitments. Start free and scale as you grow.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>99.9% Uptime</h3>
          <p>Enterprise-grade infrastructure ensuring your applications stay online with reliable, consistent performance.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section class="pricing" id="pricing">
    <div class="container">
      <h2 class="section-title">Simple <span>Pricing</span></h2>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Free</h3>
          <div class="price">$0<span>/month</span></div>
          <ul>
            <li>50 API calls per month</li>
            <li>Standard response speed</li>
            <li>Basic conversation memory</li>
            <li>Community support</li>
          </ul>
          <a href="/signup" class="btn btn-secondary">Get Started</a>
        </div>
        <div class="pricing-card featured">
          <h3>Unlimited</h3>
          <div class="price">$9.99<span>/month</span></div>
          <ul>
            <li>Unlimited API calls</li>
            <li>Priority response speed</li>
            <li>Extended conversation memory</li>
            <li>Priority email support</li>
          </ul>
          <a href="/signup" class="btn btn-primary">Subscribe</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Code Example Section -->
  <section class="code-section" id="code">
    <div class="container">
      <h2 class="section-title">Quick <span>Integration</span></h2>
      <div class="code-container">
        <div class="code-block">
          <div class="code-header">
            <div class="code-dot red"></div>
            <div class="code-dot yellow"></div>
            <div class="code-dot green"></div>
            <span>Terminal</span>
          </div>
          <pre><code><span class="code-comment"># Send a message to the Abionti API</span>
curl -X POST https://api.abionti.com/api/chat \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -H <span class="code-string">"X-API-Key: your_api_key_here"</span> \\
  -d '{
    <span class="code-key">"message"</span>: <span class="code-string">"Hello, how are you today?"</span>,
    <span class="code-key">"conversationId"</span>: <span class="code-string">"optional-conversation-id"</span>
  }'</code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <div class="footer-brand">Abionti</div>
      <div class="footer-links">
        <a href="/docs">Documentation</a>
        <a href="/release-notes">Release Notes</a>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="/login">Login</a>
      </div>
      <div class="footer-copyright">
        &copy; ${new Date().getFullYear()} Abionti Unrestricted API. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>`;

  res.send(html);
});
