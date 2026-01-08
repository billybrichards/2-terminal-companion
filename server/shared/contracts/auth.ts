/**
 * Auth API Contracts
 *
 * Shared type definitions for authentication endpoints.
 * These types define the API contract between frontend and backend.
 */

// ============================================================================
// Request Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkVerifyRequest {
  token: string;
}

export interface ExchangeTokenRequest {
  code: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface UserDTO {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  subscriptionStatus?: 'subscribed' | 'not_subscribed';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse extends AuthTokens {
  message: string;
  user: UserDTO;
}

export interface LoginResponse extends AuthTokens {
  message: string;
  user: UserDTO;
}

export interface RefreshTokenResponse extends AuthTokens {
  message: string;
}

export interface SubscriptionStatusResponse {
  subscriptionStatus: 'subscribed' | 'not_subscribed';
  isSubscribed: boolean;  // Backward compatibility
  credits: number;
  plan?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  hasStripeCustomer?: boolean;
  hasActiveSubscription?: boolean;
  timestamp: string;
}

export interface MeResponse {
  user: UserDTO & {
    chatName: string | null;
    personalityMode: string | null;
    credits: number;
    subscriptionStatus: 'subscribed' | 'not_subscribed';
    stripeCustomerId: string | null;
    createdAt: string;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface AuthError {
  error: string;
  message?: string;
  details?: unknown;
}

export interface ValidationError extends AuthError {
  details: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

// ============================================================================
// Personality Types (used in auth/user context)
// ============================================================================

export type PersonalityMode =
  | 'nurturing'
  | 'playful'
  | 'dominant'
  | 'filthy_sexy'
  | 'intimate_companion'
  | 'intellectual_muse';

export interface UpdatePersonalityRequest {
  personalityMode: PersonalityMode;
}

export interface UpdateChatNameRequest {
  chatName: string;
}
