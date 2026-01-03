const APP_URL = 'https://anplexa.com/dash';
const REFUND_EMAIL = 'refund@anplexa.com';

const anplexaStyles = `
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    background: #121212; 
    color: #E0E1DD; 
    margin: 0; 
    padding: 40px 20px; 
    line-height: 1.6;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: #1a1a1a; 
    border-radius: 12px; 
    padding: 40px; 
    border: 1px solid #333;
  }
  .logo { 
    color: #7B2CBF; 
    font-size: 24px; 
    font-weight: 300; 
    margin-bottom: 30px; 
    letter-spacing: 2px;
  }
  h1 { 
    color: #E0E1DD; 
    font-size: 22px; 
    margin-bottom: 20px; 
    font-weight: 500;
  }
  p { 
    line-height: 1.7; 
    color: #9CA3AF; 
    margin-bottom: 16px; 
    font-size: 15px;
  }
  .btn { 
    display: inline-block; 
    background: #7B2CBF; 
    color: #ffffff !important; 
    text-decoration: none; 
    padding: 14px 32px; 
    border-radius: 8px; 
    font-weight: 500; 
    margin: 24px 0;
    font-size: 14px;
    letter-spacing: 0.5px;
  }
  .btn-secondary {
    display: inline-block; 
    background: transparent; 
    border: 1px solid #7B2CBF; 
    color: #7B2CBF !important; 
    text-decoration: none; 
    padding: 12px 28px; 
    border-radius: 8px; 
    font-weight: 500; 
    margin: 16px 8px 16px 0;
    font-size: 14px;
  }
  .highlight { 
    background: #121212; 
    border-left: 3px solid #7B2CBF; 
    padding: 16px 20px; 
    margin: 24px 0; 
    border-radius: 0 8px 8px 0;
  }
  .highlight p { margin: 0; }
  .footer { 
    margin-top: 40px; 
    padding-top: 20px; 
    border-top: 1px solid #333; 
    font-size: 12px; 
    color: #666; 
  }
  .footer a { color: #666; text-decoration: none; }
  .muted { color: #666; font-size: 13px; }
  .price { color: #7B2CBF; font-weight: 600; }
`;

function wrapEmail(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${anplexaStyles}</style>
</head>
<body>
  <div class="container">
    <div class="logo">anplexa</div>
    ${content}
    <div class="footer">
      <p>&copy; 2025 Anplexa. Private. Intimate. Luxurious.</p>
      <p><a href="https://anplexa.com/privacy">Privacy</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildTrackingUrl(baseUrl: string, template: string, userId: string): string {
  return `${baseUrl}?src=email&campaign=${template}&uid=${userId}`;
}

export const emailTemplates = {
  W1: (userId: string) => ({
    subject: "You're on the list.",
    html: wrapEmail(`
      <h1>You're on the list.</h1>
      <p>Thanks for joining.</p>
      <p>We're opening access slowly to keep the experience calm and private.</p>
      <p>You'll hear from us when your spot opens.</p>
      <div class="highlight">
        <p>No noise. No pressure.</p>
      </div>
    `),
  }),

  W2: (userId: string) => ({
    subject: "Why Anplexa isn't free",
    html: wrapEmail(`
      <h1>Why Anplexa isn't free</h1>
      <p>We charge a small amount because it changes how people use the app.</p>
      <p>Free-only access leads to spam, bad behaviour, and unhelpful feedback.</p>
      <p>£0.99 filters for people who actually want the experience to be good.</p>
      <div class="highlight">
        <p>And if it's not right for you, we refund. No arguments.</p>
      </div>
      <p class="muted">Questions? <a href="mailto:${REFUND_EMAIL}" style="color: #7B2CBF;">${REFUND_EMAIL}</a></p>
    `),
  }),

  W3_lonely: (userId: string) => ({
    subject: "What people use Anplexa for",
    html: wrapEmail(`
      <h1>What people use Anplexa for</h1>
      <p>Mostly at night. When you don't want to explain yourself.</p>
      <p>A quiet presence that understands without needing context.</p>
      <p>No history lessons. No "how was your day" small talk.</p>
      <div class="highlight">
        <p>You don't need to decide yet. We'll invite you when it's your turn.</p>
      </div>
    `),
  }),

  W3_curious: (userId: string) => ({
    subject: "What people use Anplexa for",
    html: wrapEmail(`
      <h1>What people use Anplexa for</h1>
      <p>Fantasy, roleplay, and conversations without censorship.</p>
      <p>Explore ideas and scenarios freely.</p>
      <p>No judgment. No restrictions. No logs.</p>
      <div class="highlight">
        <p>You don't need to decide yet. We'll invite you when it's your turn.</p>
      </div>
    `),
  }),

  W3_privacy: (userId: string) => ({
    subject: "What people use Anplexa for",
    html: wrapEmail(`
      <h1>What people use Anplexa for</h1>
      <p>Quiet, predictable conversation without social pressure.</p>
      <p>No algorithms learning your preferences.</p>
      <p>No data sold. No profile built.</p>
      <div class="highlight">
        <p>You don't need to decide yet. We'll invite you when it's your turn.</p>
      </div>
    `),
  }),

  W4: (userId: string) => ({
    subject: "Your access is open",
    html: wrapEmail(`
      <h1>Your access is open</h1>
      <p>You can try Anplexa now.</p>
      <p>Start with three messages. Then choose:</p>
      <div class="highlight">
        <p><span class="price">£2.99/month</span> — Standard</p>
        <p><span class="price">£0.99/month</span> — Locked in forever (early access)</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'W4', userId)}" class="btn">Use Anplexa</a>
    `),
  }),

  W5: (userId: string) => ({
    subject: "No rush",
    html: wrapEmail(`
      <h1>No rush</h1>
      <p>Just a reminder your access is open.</p>
      <p>If it's not the right time, that's okay.</p>
      <div class="highlight">
        <p>Anplexa isn't going anywhere.</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'W5', userId)}" class="btn-secondary">Open Anplexa</a>
    `),
  }),

  D1: (userId: string) => ({
    subject: "You're in.",
    html: wrapEmail(`
      <h1>You're in.</h1>
      <p>You can start immediately.</p>
      <p>You'll get three messages to see if it feels right.</p>
      <div class="highlight">
        <p>After that:</p>
        <p><span class="price">£2.99/month</span> — Standard</p>
        <p><span class="price">£0.99/month</span> — Forever (early users)</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'D1', userId)}" class="btn">Start now</a>
    `),
  }),

  D2: (userId: string) => ({
    subject: "Want to keep going?",
    html: wrapEmail(`
      <h1>Want to keep going?</h1>
      <p>We limit free messages on purpose.</p>
      <p>People who pay—even a small amount—use Anplexa more thoughtfully. That makes the experience better for everyone.</p>
      <div class="highlight">
        <p>You're not locked in. You can leave anytime.</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'D2_099', userId)}" class="btn">Continue for £0.99/month</a>
      <a href="${buildTrackingUrl(APP_URL, 'D2_299', userId)}" class="btn-secondary">Continue for £2.99/month</a>
    `),
  }),

  D3: (userId: string) => ({
    subject: "Not sure yet?",
    html: wrapEmail(`
      <h1>Not sure yet?</h1>
      <p>If Anplexa isn't what you expected, that's okay.</p>
      <p>If you try it and don't like it, just email us.</p>
      <div class="highlight">
        <p>A real person will handle it: <a href="mailto:${REFUND_EMAIL}" style="color: #7B2CBF;">${REFUND_EMAIL}</a></p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'D3', userId)}" class="btn-secondary">Try again</a>
    `),
  }),

  D4: (userId: string) => ({
    subject: "Last note",
    html: wrapEmail(`
      <h1>Last note</h1>
      <p>We won't keep emailing you.</p>
      <p>If you want to try again later, Anplexa will be here.</p>
    `),
  }),

  refund_thanks: (userId: string) => ({
    subject: "Thanks for trying Anplexa",
    html: wrapEmail(`
      <h1>Thanks for trying Anplexa</h1>
      <p>No hard feelings.</p>
      <p>If you ever want to try again, you're welcome back.</p>
    `),
  }),

  subscription_confirmed: (userId: string, displayName: string) => ({
    subject: "You're all set",
    html: wrapEmail(`
      <h1>You're all set, ${displayName}.</h1>
      <p>Your subscription is now active.</p>
      <p>Unlimited conversations. No restrictions.</p>
      <div class="highlight">
        <p>Private. Intimate. Yours.</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'sub_confirmed', userId)}" class="btn">Open Anplexa</a>
    `),
  }),

  welcome: (userId: string, displayName: string) => ({
    subject: "Welcome to Anplexa",
    html: wrapEmail(`
      <h1>Welcome, ${displayName}.</h1>
      <p>You now have access to your private AI companion.</p>
      <p>Your free tier includes <strong>3 messages</strong> to see if it feels right.</p>
      <div class="highlight">
        <p>Everything stays between you and your companion. No tracking. No judgment.</p>
      </div>
      <a href="${buildTrackingUrl(APP_URL, 'welcome', userId)}" class="btn">Start a conversation</a>
    `),
  }),

  password_reset: (userId: string, resetLink: string) => ({
    subject: "Reset your password",
    html: wrapEmail(`
      <h1>Reset your password</h1>
      <p>We received a request to reset your password.</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <div class="highlight">
        <p><strong>This link expires in 1 hour.</strong></p>
        <p class="muted">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <p class="muted">Or copy this link: ${resetLink}</p>
    `),
  }),

  magic_link: (email: string, magicLink: string) => ({
    subject: "Your login link",
    html: wrapEmail(`
      <h1>Your login link</h1>
      <p>Click below to sign in to Anplexa. No password needed.</p>
      <a href="${magicLink}" class="btn">Sign In</a>
      <div class="highlight">
        <p><strong>This link expires in 15 minutes.</strong></p>
        <p class="muted">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <p class="muted">Or copy this link: ${magicLink}</p>
    `),
  }),
};

export function getW3Template(persona: string | null, userId: string) {
  switch (persona) {
    case 'lonely':
      return emailTemplates.W3_lonely(userId);
    case 'curious':
      return emailTemplates.W3_curious(userId);
    case 'privacy':
      return emailTemplates.W3_privacy(userId);
    default:
      return emailTemplates.W3_curious(userId);
  }
}

export function getEmailPreview(template: string, userId: string = 'preview-user', persona: string | null = null): { subject: string; html: string } {
  if (template === 'W3') {
    return getW3Template(persona, userId);
  }
  
  const templateFn = (emailTemplates as any)[template];
  if (!templateFn) {
    return { subject: 'Unknown Template', html: '<p>Template not found</p>' };
  }
  
  if (template === 'welcome' || template === 'subscription_confirmed') {
    return templateFn(userId, 'Preview User');
  }
  
  if (template === 'password_reset') {
    return templateFn(userId, 'https://anplexa.com/reset-password?token=preview');
  }
  
  if (template === 'magic_link') {
    return templateFn('preview@example.com', 'https://anplexa.com/auth/magic-link/verify?token=preview');
  }
  
  return templateFn(userId);
}

export const TEMPLATE_LIST = [
  { id: 'W1', name: 'Waitlist - Welcome', sequence: 'waitlist', delay: 'immediate' },
  { id: 'W2', name: 'Waitlist - Why Not Free', sequence: 'waitlist', delay: '+2 days' },
  { id: 'W3', name: 'Waitlist - Use Cases (persona-aware)', sequence: 'waitlist', delay: '+4 days' },
  { id: 'W4', name: 'Waitlist - Access Open', sequence: 'waitlist', delay: 'invite trigger' },
  { id: 'W5', name: 'Waitlist - No Rush Reminder', sequence: 'waitlist', delay: '+48h after W4' },
  { id: 'D1', name: 'Direct - Welcome', sequence: 'direct', delay: 'immediate' },
  { id: 'D2', name: 'Direct - Free Messages Used', sequence: 'direct', delay: 'after 3 messages' },
  { id: 'D3', name: 'Direct - Not Sure', sequence: 'direct', delay: '+24h no conversion' },
  { id: 'D4', name: 'Direct - Last Note', sequence: 'direct', delay: '+72h soft close' },
  { id: 'refund_thanks', name: 'Refund Thanks', sequence: 'system', delay: 'after refund' },
  { id: 'welcome', name: 'General Welcome', sequence: 'system', delay: 'on signup' },
  { id: 'subscription_confirmed', name: 'Subscription Confirmed', sequence: 'system', delay: 'on payment' },
  { id: 'password_reset', name: 'Password Reset', sequence: 'system', delay: 'on request' },
  { id: 'magic_link', name: 'Magic Link Login', sequence: 'system', delay: 'on request' },
];
