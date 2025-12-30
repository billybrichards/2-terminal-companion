import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );
  const data = await response.json() as { items?: any[] };
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getResendClient() {
  const { apiKey } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

const BASE_URL = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
  : 'http://localhost:5000';

export const emailService = {
  async sendWelcomeEmail(to: string, displayName: string): Promise<boolean> {
    try {
      const { client, fromEmail } = await getResendClient();
      
      await client.emails.send({
        from: fromEmail || 'Abionti <noreply@updates.anplexa.com>',
        to,
        subject: 'Welcome to Abionti API',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; }
    .logo { color: #ff6b35; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
    h1 { color: #ff6b35; font-size: 24px; margin-bottom: 20px; }
    p { line-height: 1.6; color: #b0b0b0; margin-bottom: 16px; }
    .btn { display: inline-block; background: #ff6b35; color: #0a0a0a !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Abionti</div>
    <h1>Welcome, ${displayName}!</h1>
    <p>Thank you for signing up for the Abionti Unrestricted API. You now have access to our powerful AI companion API.</p>
    <p>Your free tier includes <strong>50 API calls per month</strong>. To unlock unlimited calls, upgrade to our Pro plan for just $9.99/month.</p>
    <a href="${BASE_URL}/dashboard" class="btn">Go to Dashboard</a>
    <p>From your dashboard, you can:</p>
    <ul style="color: #b0b0b0; line-height: 1.8;">
      <li>Generate your API key</li>
      <li>View your usage statistics</li>
      <li>Upgrade to unlimited access</li>
      <li>Manage your subscription</li>
    </ul>
    <a href="${BASE_URL}/docs" class="btn" style="background: transparent; border: 2px solid #ff6b35; color: #ff6b35 !important;">View API Docs</a>
    <div class="footer">
      <p>&copy; 2025 Anplexa. All rights reserved.</p>
      <p><a href="${BASE_URL}/terms" style="color: #666;">Terms</a> | <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a></p>
    </div>
  </div>
</body>
</html>
        `,
      });
      
      console.log(`Welcome email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  },

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    try {
      const { client, fromEmail } = await getResendClient();
      const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
      
      await client.emails.send({
        from: fromEmail || 'Abionti <noreply@updates.anplexa.com>',
        to,
        subject: 'Reset Your Abionti Password',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; }
    .logo { color: #ff6b35; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
    h1 { color: #ff6b35; font-size: 24px; margin-bottom: 20px; }
    p { line-height: 1.6; color: #b0b0b0; margin-bottom: 16px; }
    .btn { display: inline-block; background: #ff6b35; color: #0a0a0a !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .warning { background: #2a1a1a; border-left: 4px solid #ff6b35; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Abionti</div>
    <h1>Password Reset Request</h1>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <a href="${resetLink}" class="btn">Reset Password</a>
    <div class="warning">
      <p style="margin: 0;"><strong>This link expires in 1 hour.</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <p style="font-size: 14px; color: #666;">Or copy this link: <br><code style="background: #0a0a0a; padding: 4px 8px; border-radius: 4px; word-break: break-all;">${resetLink}</code></p>
    <div class="footer">
      <p>&copy; 2025 Anplexa. All rights reserved.</p>
      <p><a href="${BASE_URL}/terms" style="color: #666;">Terms</a> | <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a></p>
    </div>
  </div>
</body>
</html>
        `,
      });
      
      console.log(`Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  },

  async sendSubscriptionConfirmation(to: string, displayName: string, apiKeyPrefix: string): Promise<boolean> {
    try {
      const { client, fromEmail } = await getResendClient();
      
      await client.emails.send({
        from: fromEmail || 'Abionti <noreply@updates.anplexa.com>',
        to,
        subject: 'Welcome to Abionti Unlimited!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; }
    .logo { color: #ff6b35; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
    h1 { color: #ff6b35; font-size: 24px; margin-bottom: 20px; }
    p { line-height: 1.6; color: #b0b0b0; margin-bottom: 16px; }
    .btn { display: inline-block; background: #ff6b35; color: #0a0a0a !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .highlight { background: #0a0a0a; border: 2px solid #ff6b35; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Abionti</div>
    <h1>You're Now Unlimited!</h1>
    <p>Congratulations, ${displayName}! Your subscription to Abionti Unlimited is now active.</p>
    <div class="highlight">
      <p style="margin: 0; color: #ff6b35; font-size: 18px; font-weight: bold;">Unlimited API Calls</p>
      <p style="margin: 8px 0 0 0; font-size: 14px;">$9.99/month</p>
    </div>
    <p>Your API key has been generated and is ready to use. You can view it in your dashboard:</p>
    <p style="font-family: monospace; background: #0a0a0a; padding: 12px; border-radius: 8px; text-align: center;">${apiKeyPrefix}••••••••••••</p>
    <a href="${BASE_URL}/dashboard" class="btn">View Full API Key</a>
    <p>Need help getting started? Check out our documentation:</p>
    <a href="${BASE_URL}/docs" class="btn" style="background: transparent; border: 2px solid #ff6b35; color: #ff6b35 !important;">API Documentation</a>
    <div class="footer">
      <p>&copy; 2025 Anplexa. All rights reserved.</p>
      <p><a href="${BASE_URL}/terms" style="color: #666;">Terms</a> | <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a></p>
    </div>
  </div>
</body>
</html>
        `,
      });
      
      console.log(`Subscription confirmation email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send subscription confirmation email:', error);
      return false;
    }
  },

  async sendRawEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const { client, fromEmail } = await getResendClient();
      
      await client.emails.send({
        from: fromEmail || 'Anplexa <noreply@updates.anplexa.com>',
        to,
        subject,
        html,
      });
      
      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },
};
