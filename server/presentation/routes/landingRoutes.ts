import { Router, Request, Response } from 'express';

export const landingRouter = Router();

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
        <a href="/api/auth/register" class="btn btn-primary">Get API Key</a>
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
          <a href="/api/auth/register" class="btn btn-secondary">Get Started</a>
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
          <a href="/api/stripe/checkout?plan=unlimited" class="btn btn-primary">Subscribe</a>
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
