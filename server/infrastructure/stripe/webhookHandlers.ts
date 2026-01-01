import { getStripeSync, getUncachableStripeClient, getStripeSecretKey } from './stripeClient.js';
import { db } from '../../infrastructure/database/index.js';
import { users, apiKeys, emailQueue } from '../../../shared/schema.js';
import { eq, and, inArray } from 'drizzle-orm';
import { generateApiKey } from '../auth/ApiKeyGenerator.js';
import { v4 as uuidv4 } from 'uuid';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload.toString());
      }
    } catch (err) {
      console.error('Error parsing webhook event:', err);
      return;
    }

    await WebhookHandlers.handleStripeEvent(event);
  }

  static async handleStripeEvent(event: any): Promise<void> {
    const eventType = event.type;
    console.log(`Processing Stripe webhook event: ${eventType}`);

    switch (eventType) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.created':
        await WebhookHandlers.handleSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await WebhookHandlers.handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionDeleted(event);
        break;
      case 'invoice.paid':
        await WebhookHandlers.handleInvoicePaid(event);
        break;
      default:
        break;
    }
  }

  static async handleCheckoutCompleted(event: any): Promise<void> {
    const session = event.data.object;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string | null;
    const customerDetails = session.customer_details;

    if (!customerId) {
      console.error('No customer ID in checkout session');
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

    if (!user) {
      console.error('No user found with stripe_customer_id:', customerId);
      return;
    }

    const customerName = customerDetails?.name as string | undefined;
    const updateData: any = { 
      subscriptionStatus: 'subscribed',
      stripeSubscriptionId: subscriptionId,
      stage: 'converted',
      updatedAt: new Date().toISOString()
    };

    if (customerName && !user.displayName) {
      updateData.displayName = customerName;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    await WebhookHandlers.cancelPendingCrmEmails(user.id);

    const existingKeys = await db.select().from(apiKeys).where(eq(apiKeys.userId, user.id));
    if (existingKeys.length === 0) {
      const { keyHash, keyPrefix } = await generateApiKey();
      await db.insert(apiKeys).values({
        id: uuidv4(),
        name: 'Subscription API Key',
        keyHash,
        keyPrefix,
        userId: user.id,
        createdBy: user.id,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      console.log(`User ${user.id} subscribed. Subscription ID: ${subscriptionId}. API key generated with prefix: ${keyPrefix}`);
    } else {
      console.log(`User ${user.id} subscribed. Subscription ID: ${subscriptionId}. Existing API key preserved.`);
    }
  }

  static async handleSubscriptionCreated(event: any): Promise<void> {
    const subscription = event.data.object;
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id as string;
    const status = subscription.status as string;

    if (!customerId) {
      console.error('No customer ID in subscription created event');
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

    if (!user) {
      console.error('No user found with stripe_customer_id:', customerId);
      return;
    }

    const isActive = ['active', 'trialing'].includes(status);
    
    await db.update(users)
      .set({ 
        subscriptionStatus: isActive ? 'subscribed' : 'not_subscribed',
        stripeSubscriptionId: subscriptionId,
        stage: isActive ? 'converted' : user.stage,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    if (isActive) {
      await WebhookHandlers.cancelPendingCrmEmails(user.id);
    }

    console.log(`User ${user.id} subscription created. Status: ${status}, Subscription ID: ${subscriptionId}`);
  }

  static async handleSubscriptionUpdated(event: any): Promise<void> {
    const subscription = event.data.object;
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id as string;
    const status = subscription.status as string;

    if (!customerId) {
      console.error('No customer ID in subscription updated event');
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

    if (!user) {
      console.error('No user found with stripe_customer_id:', customerId);
      return;
    }

    const isActive = ['active', 'trialing'].includes(status);
    const isCanceled = ['canceled', 'unpaid', 'past_due'].includes(status);
    
    await db.update(users)
      .set({ 
        subscriptionStatus: isActive ? 'subscribed' : 'not_subscribed',
        stripeSubscriptionId: isCanceled ? null : subscriptionId,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    console.log(`User ${user.id} subscription updated. Status: ${status}`);
  }

  static async handleInvoicePaid(event: any): Promise<void> {
    const invoice = event.data.object;
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string | null;

    if (!customerId || !subscriptionId) {
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

    if (!user) {
      return;
    }

    await db.update(users)
      .set({ 
        subscriptionStatus: 'subscribed',
        stripeSubscriptionId: subscriptionId,
        stage: 'converted',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    console.log(`User ${user.id} invoice paid. Subscription confirmed.`);
  }

  static async cancelPendingCrmEmails(userId: string): Promise<void> {
    try {
      await db.update(emailQueue)
        .set({ status: 'cancelled' })
        .where(
          and(
            eq(emailQueue.userId, userId),
            eq(emailQueue.status, 'pending')
          )
        );
      console.log(`Cancelled pending CRM emails for user ${userId}`);
    } catch (error) {
      console.error('Error cancelling CRM emails:', error);
    }
  }

  static async handleSubscriptionDeleted(event: any): Promise<void> {
    const subscription = event.data.object;
    const customerId = subscription.customer as string;

    if (!customerId) {
      console.error('No customer ID in subscription deleted event');
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));

    if (!user) {
      console.error('No user found with stripe_customer_id:', customerId);
      return;
    }

    await db.update(users)
      .set({ 
        subscriptionStatus: 'not_subscribed',
        stripeSubscriptionId: null,
        credits: 50,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.userId, user.id));

    console.log(`User ${user.id} subscription cancelled. Status updated to not_subscribed. Credits reset to 50. API keys deactivated.`);
  }
}
