import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/index.js';
import { emailQueue, emailLogs, users } from '../../../shared/schema.js';
import { eq, lte, and } from 'drizzle-orm';
import { emailTemplates, getW3Template } from './emailTemplates.js';
import { emailService } from './resendService.js';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export const emailScheduler = {
  async scheduleWaitlistSequence(userId: string): Promise<void> {
    const now = new Date();
    
    const emails = [
      { template: 'W1', scheduledAt: now },
      { template: 'W2', scheduledAt: addDays(now, 2) },
      { template: 'W3', scheduledAt: addDays(now, 4) },
      { template: 'W4', scheduledAt: addDays(now, 7) },
      { template: 'W5', scheduledAt: addDays(now, 9) },
    ];

    for (const email of emails) {
      await db.insert(emailQueue).values({
        id: uuidv4(),
        userId,
        emailTemplate: email.template,
        scheduledAt: email.scheduledAt.toISOString(),
        status: 'pending',
      });
    }
  },

  async scheduleDirectSequence(userId: string): Promise<void> {
    const now = new Date();
    
    const emails = [
      { template: 'D1', scheduledAt: now },
      { template: 'D2', scheduledAt: addDays(now, 1) },
      { template: 'D3', scheduledAt: addDays(now, 3) },
      { template: 'D4', scheduledAt: addDays(now, 5) },
    ];

    for (const email of emails) {
      await db.insert(emailQueue).values({
        id: uuidv4(),
        userId,
        emailTemplate: email.template,
        scheduledAt: email.scheduledAt.toISOString(),
        status: 'pending',
      });
    }
  },

  async scheduleWaitlistInvite(userId: string): Promise<void> {
    const now = new Date();
    
    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'W4',
      scheduledAt: now.toISOString(),
      status: 'pending',
    });

    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'W5',
      scheduledAt: addHours(now, 48).toISOString(),
      status: 'pending',
    });
  },

  async scheduleAfterFreeMessagesUsed(userId: string): Promise<void> {
    const now = new Date();
    
    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'D2',
      scheduledAt: now.toISOString(),
      status: 'pending',
    });

    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'D3',
      scheduledAt: addHours(now, 24).toISOString(),
      status: 'pending',
    });

    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'D4',
      scheduledAt: addHours(now, 72).toISOString(),
      status: 'pending',
    });
  },

  async scheduleRefundThanks(userId: string): Promise<void> {
    await db.insert(emailQueue).values({
      id: uuidv4(),
      userId,
      emailTemplate: 'refund_thanks',
      scheduledAt: new Date().toISOString(),
      status: 'pending',
    });
  },

  async cancelPendingEmails(userId: string): Promise<void> {
    await db.update(emailQueue)
      .set({ status: 'cancelled' })
      .where(and(
        eq(emailQueue.userId, userId),
        eq(emailQueue.status, 'pending')
      ));
  },

  async processPendingEmails(): Promise<{ sent: number; failed: number }> {
    const now = new Date().toISOString();
    let sent = 0;
    let failed = 0;

    const pendingEmails = await db.query.emailQueue.findMany({
      where: and(
        eq(emailQueue.status, 'pending'),
        lte(emailQueue.scheduledAt, now)
      ),
    });

    for (const queuedEmail of pendingEmails) {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, queuedEmail.userId),
        });

        if (!user) {
          await db.update(emailQueue)
            .set({ status: 'failed', errorMessage: 'User not found' })
            .where(eq(emailQueue.id, queuedEmail.id));
          failed++;
          continue;
        }

        if ((user as any).subscriptionStatus === 'subscribed' && 
            ['D2', 'D3', 'D4', 'W5'].includes(queuedEmail.emailTemplate)) {
          await db.update(emailQueue)
            .set({ status: 'cancelled' })
            .where(eq(emailQueue.id, queuedEmail.id));
          continue;
        }

        let emailContent: { subject: string; html: string };
        
        switch (queuedEmail.emailTemplate) {
          case 'W3':
            emailContent = getW3Template((user as any).persona, user.id);
            break;
          case 'welcome':
            emailContent = emailTemplates.welcome(user.id, user.displayName || user.email.split('@')[0]);
            break;
          case 'subscription_confirmed':
            emailContent = emailTemplates.subscription_confirmed(user.id, user.displayName || user.email.split('@')[0]);
            break;
          default:
            const templateFn = (emailTemplates as any)[queuedEmail.emailTemplate];
            if (!templateFn) {
              await db.update(emailQueue)
                .set({ status: 'failed', errorMessage: 'Unknown template' })
                .where(eq(emailQueue.id, queuedEmail.id));
              failed++;
              continue;
            }
            emailContent = templateFn(user.id);
        }

        const success = await emailService.sendRawEmail(
          user.email,
          emailContent.subject,
          emailContent.html
        );

        if (success) {
          await db.update(emailQueue)
            .set({ status: 'sent', sentAt: new Date().toISOString() })
            .where(eq(emailQueue.id, queuedEmail.id));

          await db.insert(emailLogs).values({
            id: uuidv4(),
            userId: user.id,
            emailTemplate: queuedEmail.emailTemplate,
            subject: emailContent.subject,
            sentAt: new Date().toISOString(),
          });

          sent++;
        } else {
          await db.update(emailQueue)
            .set({ status: 'failed', errorMessage: 'Send failed' })
            .where(eq(emailQueue.id, queuedEmail.id));
          failed++;
        }
      } catch (error) {
        console.error('Error processing email:', error);
        await db.update(emailQueue)
          .set({ status: 'failed', errorMessage: String(error) })
          .where(eq(emailQueue.id, queuedEmail.id));
        failed++;
      }
    }

    return { sent, failed };
  },

  async trackEmailOpen(logId: string): Promise<void> {
    await db.update(emailLogs)
      .set({ openedAt: new Date().toISOString() })
      .where(eq(emailLogs.id, logId));
  },

  async trackEmailClick(logId: string, source: string): Promise<void> {
    await db.update(emailLogs)
      .set({ 
        clickedAt: new Date().toISOString(),
        clickSource: source,
      })
      .where(eq(emailLogs.id, logId));
  },
};

let processingInterval: NodeJS.Timeout | null = null;

export function startEmailProcessor(intervalMinutes: number = 5): void {
  if (processingInterval) return;
  
  console.log(`Starting email processor (every ${intervalMinutes} minutes)`);
  
  emailScheduler.processPendingEmails()
    .then(result => console.log(`Initial email processing: ${result.sent} sent, ${result.failed} failed`))
    .catch(err => console.error('Email processing error:', err));
  
  processingInterval = setInterval(async () => {
    try {
      const result = await emailScheduler.processPendingEmails();
      if (result.sent > 0 || result.failed > 0) {
        console.log(`Email processing: ${result.sent} sent, ${result.failed} failed`);
      }
    } catch (error) {
      console.error('Email processing error:', error);
    }
  }, intervalMinutes * 60 * 1000);
}

export function stopEmailProcessor(): void {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    console.log('Email processor stopped');
  }
}
