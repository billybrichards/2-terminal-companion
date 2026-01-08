/**
 * Conversation API Contracts
 *
 * Shared type definitions for conversation management endpoints.
 */

import type { MessageDTO } from './chat.js';

// ============================================================================
// Request Types
// ============================================================================

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title: string;
}

export interface SaveMessagesRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

export interface ConversationDetailResponse {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: MessageDTO[];
}

export interface ConversationMessagesResponse {
  conversationId: string;
  messages: MessageDTO[];
  hasMore: boolean;
}

// ============================================================================
// Grouped Conversations (for UI display)
// ============================================================================

export interface GroupedConversations {
  today: ConversationSummary[];
  yesterday: ConversationSummary[];
  thisWeek: ConversationSummary[];
  older: ConversationSummary[];
}
