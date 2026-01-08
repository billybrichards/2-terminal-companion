/**
 * Email Service Port
 *
 * Interface for email operations.
 * Infrastructure layer provides concrete implementation.
 */
export interface IEmailService {
  /**
   * Sends a welcome email to a new user.
   */
  sendWelcomeEmail(email: string, displayName: string): Promise<void>;

  /**
   * Sends a password reset email.
   */
  sendPasswordResetEmail(email: string, token: string): Promise<void>;

  /**
   * Sends a magic link email.
   */
  sendMagicLinkEmail(email: string, link: string): Promise<void>;

  /**
   * Sends a raw email with custom subject and HTML body.
   */
  sendRawEmail(email: string, subject: string, html: string): Promise<void>;
}
