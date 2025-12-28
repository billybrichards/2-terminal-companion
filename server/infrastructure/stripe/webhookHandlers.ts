import { getStripeSync, getUncachableStripeClient, getStripeSecretKey } from './stripeClient.js';
import { db } from '../../infrastructure/database/index.js';
import { users, apiKeys } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
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

    switch (eventType) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionDeleted(event);
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
      credits: -1,
      accountSource: 'api',
      updatedAt: new Date().toISOString()
    };

    if (customerName && !user.displayName) {
      updateData.displayName = customerName;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    const { key, keyHash, keyPrefix } = await generateApiKey();

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

    console.log(`User ${user.id} subscribed (API). Subscription ID: ${subscriptionId}. API key generated with prefix: ${keyPrefix}`);
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
