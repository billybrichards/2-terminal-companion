import { Router, Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { getStripePublishableKey, getUncachableStripeClient } from '../../infrastructure/stripe/stripeClient.js';
import { storage } from '../../infrastructure/stripe/storage.js';
import { stripeService } from '../../infrastructure/stripe/stripeService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { db } from '../../infrastructure/database/index.js';

const router = Router();

router.get('/publishable-key', async (req: Request, res: Response) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (error: any) {
    console.error('Error fetching publishable key:', error);
    res.status(500).json({ error: 'Failed to fetch publishable key' });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    const productsWithPrices = await storage.listProductsWithPrices(true, 50, 0);
    
    const productsMap = new Map<string, any>();
    
    for (const row of productsWithPrices) {
      const productId = row.product_id as string;
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          id: productId,
          name: row.product_name,
          description: row.product_description,
          active: row.product_active,
          metadata: row.product_metadata,
          prices: [],
        });
      }
      
      if (row.price_id) {
        productsMap.get(productId).prices.push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
          active: row.price_active,
          metadata: row.price_metadata,
        });
      }
    }
    
    const products = Array.from(productsMap.values());
    res.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/checkout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { priceId, plan } = req.body;
    const userId = req.user!.sub;
    
    let finalPriceId = priceId;
    
    // Anplexa product price IDs (production)
    const ANPLEXA_PRICES = {
      yearly: 'price_1SkBhsHf3F7YsE79UDhlyjdG',   // £11.99/year (early adopter £0.99/mo)
      monthly: 'price_1Sj3Q4Hf3F7YsE79EfGL6BuF',  // £2.99/month (standard)
    };
    
    // Handle plan-based checkout
    if (!priceId && plan) {
      if (plan === 'yearly' || plan === 'early') {
        finalPriceId = ANPLEXA_PRICES.yearly;
      } else if (plan === 'monthly' || plan === 'standard' || plan === 'unlimited') {
        finalPriceId = ANPLEXA_PRICES.monthly;
      } else {
        // Try to find in database as fallback
        const result = await db.execute(
          sql`
            SELECT pr.id as price_id
            FROM stripe.products p
            JOIN stripe.prices pr ON pr.product = p.id
            WHERE (p.name ILIKE '%Anplexa%' OR p.name ILIKE '%Unlimited%') AND p.active = true AND pr.active = true
            LIMIT 1
          `
        );
        
        if (result.rows.length > 0) {
          finalPriceId = result.rows[0].price_id as string;
        }
      }
    }
    
    if (!finalPriceId) {
      return res.status(400).json({ error: 'priceId or plan is required. Valid plans: yearly, monthly' });
    }
    
    const userResult = await db.execute(
      sql`SELECT id, email, stripe_customer_id FROM users WHERE id = ${userId}`
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0] as { id: string; email: string; stripe_customer_id: string | null };
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripeService.createCustomer(user.email, userId);
      customerId = customer.id;
      
      await db.execute(
        sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}`
      );
    }
    
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/subscription/cancel`;
    
    const session = await stripeService.createCheckoutSession(
      customerId,
      finalPriceId,
      successUrl,
      cancelUrl,
      {
        customerEmail: user.email,
        customerCreation: 'always',
        billingAddressCollection: 'required',
        userId: userId,
      }
    );
    
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/portal', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    
    const userResult = await db.execute(
      sql`SELECT stripe_customer_id FROM users WHERE id = ${userId}`
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0] as { stripe_customer_id: string | null };
    
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found for this user' });
    }
    
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const returnUrl = `${baseUrl}/account`;
    
    const session = await stripeService.createCustomerPortalSession(
      user.stripe_customer_id,
      returnUrl
    );
    
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

router.post('/verify-checkout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user!.sub;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // Security: Validate that this session belongs to the requesting user
    const sessionUserId = session.client_reference_id || session.metadata?.userId;
    if (sessionUserId && sessionUserId !== userId) {
      console.warn(`[Stripe] User ${userId} attempted to verify session belonging to ${sessionUserId}`);
      return res.status(403).json({ error: 'Session does not belong to this user' });
    }

    // Also validate customer ID matches if user already has one
    const userResult = await db.execute(
      sql`SELECT stripe_customer_id FROM users WHERE id = ${userId}`
    );
    const existingCustomerId = (userResult.rows[0] as any)?.stripe_customer_id;
    const sessionCustomerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    if (existingCustomerId && sessionCustomerId && existingCustomerId !== sessionCustomerId) {
      console.warn(`[Stripe] Customer ID mismatch for user ${userId}: expected ${existingCustomerId}, got ${sessionCustomerId}`);
      return res.status(403).json({ error: 'Customer ID mismatch' });
    }

    // Handle different payment statuses
    if (session.payment_status === 'unpaid') {
      return res.json({
        success: false,
        subscriptionStatus: 'not_subscribed',
        message: 'Payment not completed',
      });
    }

    // payment_status can be 'paid' or 'no_payment_required' (for trials)
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;
    
    const customerId = sessionCustomerId;

    if (!subscriptionId || !customerId) {
      return res.status(400).json({ 
        error: 'Invalid session: missing subscription or customer data',
        success: false,
      });
    }

    let plan = 'monthly';
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price?.id;
    
    const ANPLEXA_PRICES = {
      yearly: 'price_1SkBhsHf3F7YsE79UDhlyjdG',
      monthly: 'price_1Sj3Q4Hf3F7YsE79EfGL6BuF',
    };
    
    if (priceId === ANPLEXA_PRICES.yearly) {
      plan = 'yearly';
    }

    await db.execute(
      sql`UPDATE users SET 
        subscription_status = 'subscribed',
        stripe_customer_id = ${customerId},
        stripe_subscription_id = ${subscriptionId},
        stage = 'converted'
      WHERE id = ${userId}`
    );

    console.log(`[Stripe] Verified checkout for user ${userId}: subscribed to ${plan} plan`);

    res.json({
      success: true,
      subscriptionStatus: 'subscribed',
      plan,
      customerId,
      subscriptionId,
    });
  } catch (error: any) {
    console.error('Error verifying checkout:', error);
    res.status(500).json({ error: 'Failed to verify checkout session' });
  }
});

router.get('/subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    
    const userResult = await db.execute(
      sql`SELECT stripe_customer_id, stripe_subscription_id, subscription_status FROM users WHERE id = ${userId}`
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0] as { 
      stripe_customer_id: string | null; 
      stripe_subscription_id: string | null;
      subscription_status: string | null;
    };
    
    if (!user.stripe_customer_id) {
      return res.json({
        status: 'not_subscribed',
        subscription: null,
      });
    }
    
    let subscription = null;
    
    if (user.stripe_subscription_id) {
      subscription = await storage.getSubscription(user.stripe_subscription_id);
    }
    
    if (!subscription) {
      const subscriptions = await storage.listSubscriptions(user.stripe_customer_id);
      subscription = subscriptions.find((s: any) => s.status === 'active' || s.status === 'trialing') || subscriptions[0] || null;
    }
    
    res.json({
      status: user.subscription_status || 'not_subscribed',
      subscription,
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export { router as stripeRouter };
