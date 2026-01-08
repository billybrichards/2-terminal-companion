/**
 * Chat API Contracts
 *
 * Shared type definitions for chat endpoints.
 * These types define the API contract between frontend and backend.
 */

import type { PersonalityMode } from './auth.js';

// ============================================================================
// Request Types
// ============================================================================

export interface ChatPreferences {
  length?: 'brief' | 'moderate' | 'detailed';
  style?: 'casual' | 'thoughtful' | 'creative';
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
  preferences?: ChatPreferences;
  personalityMode?: PersonalityMode;
  storeLocally?: boolean;
  newChat?: boolean;
}

// ============================================================================
// Response Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageDTO {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessagesDTO extends ConversationDTO {
  messages: MessageDTO[];
}

export interface ChatConfigResponse {
  companion: {
    name: string;
    welcomeTitle: string;
    welcomeMessage: string;
  };
  defaults: {
    length: 'brief' | 'moderate' | 'detailed';
    style: 'casual' | 'thoughtful' | 'creative';
  };
}

// ============================================================================
// Streaming Response Types
// ============================================================================

/**
 * Server-Sent Events (SSE) data format for streaming chat responses.
 *
 * Event types:
 * - 'start': Signals beginning of response with metadata
 * - 'token': Individual token/chunk of the response
 * - 'done': Signals completion with final metadata
 * - 'error': Error occurred during streaming
 */

export interface SSEStartEvent {
  type: 'start';
  conversationId: string;
  messageId: string;
}

export interface SSETokenEvent {
  type: 'token';
  content: string;
}

export interface SSEDoneEvent {
  type: 'done';
  conversationId: string;
  messageId: string;
  creditsRemaining?: number;
}

export interface SSEErrorEvent {
  type: 'error';
  error: string;
  code?: string;
}

export type SSEEvent = SSEStartEvent | SSETokenEvent | SSEDoneEvent | SSEErrorEvent;

// ============================================================================
// Amplexa Profile Types (used in chat context)
// ============================================================================

export interface AmplexaProfile {
  funnel?: string;
  funnelName?: string;
  primaryNeed?: string;
  communicationStyle?: string;
  pace?: string;
  tags?: string[];
}

// ============================================================================
// Error Types
// ============================================================================

export interface ChatError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface InsufficientCreditsError extends ChatError {
  code: 'INSUFFICIENT_CREDITS';
  creditsRequired: number;
  creditsAvailable: number;
}
