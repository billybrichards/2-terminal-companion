/**
 * Stripe API Contracts
 *
 * Shared type definitions for payment/subscription endpoints.
 */

// ============================================================================
// Request Types
// ============================================================================

export interface CreateCheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface PublishableKeyResponse {
  publishableKey: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  prices: PriceDTO[];
}

export interface PriceDTO {
  id: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year' | 'week' | 'day';
  intervalCount: number;
}

export interface ProductListResponse {
  products: ProductDTO[];
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface SubscriptionWebhookPayload {
  userId: string;
  subscriptionStatus: 'subscribed' | 'not_subscribed';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CreditsWebhookPayload {
  userId: string;
  credits: number;
  operation: 'set' | 'add' | 'subtract';
}
