import { IConversationRepository } from '../../../domain/repositories/IConversationRepository.js';
import { ValidationError } from '../../../domain/errors/ValidationError.js';

export interface GetConversationHistoryInput {
  userId: string;
  conversationId?: string;
  limit?: number;
  offset?: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface GetConversationHistoryOutput {
  conversations?: ConversationSummary[];
  messages?: MessageDTO[];
  total: number;
}

/**
 * GetConversationHistory Use Case
 *
 * Retrieves conversation history for a user.
 *
 * If conversationId is provided, returns messages for that conversation.
 * Otherwise, returns list of user's conversations.
 */
export class GetConversationHistory {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: GetConversationHistoryInput): Promise<GetConversationHistoryOutput> {
    if (!input.userId) {
      throw ValidationError.requiredField('userId');
    }

    const limit = input.limit || 20;
    const offset = input.offset || 0;

    // If specific conversation requested, return messages
    if (input.conversationId) {
      const conversation = await this.conversationRepository.findById(input.conversationId);

      if (!conversation) {
        return { messages: [], total: 0 };
      }

      // Verify ownership
      if (conversation.userId !== input.userId) {
        throw ValidationError.invalidValue('conversationId', 'Not your conversation');
      }

      const messages = conversation.messages;
      const paginatedMessages = messages.slice(offset, offset + limit);

      return {
        messages: paginatedMessages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
        total: messages.length,
      };
    }

    // Otherwise, return conversation list
    const conversations = await this.conversationRepository.findByUserId(input.userId);
    const total = conversations.length;
    const paginatedConversations = conversations.slice(offset, offset + limit);

    return {
      conversations: paginatedConversations.map(c => ({
        id: c.id,
        title: c.title || 'Untitled',
        lastMessage: c.messages.length > 0
          ? c.messages[c.messages.length - 1].content.substring(0, 100)
          : undefined,
        messageCount: c.messages.length,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      total,
    };
  }
}
