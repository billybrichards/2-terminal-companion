import { User } from '../../../domain/entities/User.js';
import { Conversation } from '../../../domain/entities/Conversation.js';
import { Message } from '../../../domain/entities/Message.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository.js';
import { InsufficientCreditsError } from '../../../domain/errors/InsufficientCreditsError.js';
import { IAIProvider, AIMessage, AIStreamChunk } from '../../ports/IAIProvider.js';

export interface SendMessageInput {
  userId?: string;
  conversationId?: string;
  message: string;
  personalityMode?: string;
  isNewChat?: boolean;
  storeLocally?: boolean;
}

export interface SendMessageOutput {
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
}

const DAILY_FREE_CREDITS = 5;

/**
 * SendMessage Use Case
 *
 * Handles sending a chat message and streaming the AI response.
 *
 * Flow:
 * 1. Check user credits (if authenticated, non-subscribed)
 * 2. Deduct credit
 * 3. Get or create conversation
 * 4. Build system prompt with personality
 * 5. Store user message
 * 6. Stream AI response
 * 7. Store assistant message
 */
export class SendMessage {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly aiProvider: IAIProvider
  ) {}

  async *execute(input: SendMessageInput): AsyncGenerator<AIStreamChunk, SendMessageOutput> {
    let user: User | null = null;

    // 1. Load user and check credits
    if (input.userId) {
      user = await this.userRepository.findById(input.userId);

      if (user && !user.isSubscribed() && !input.isNewChat) {
        if (!user.canChat()) {
          const tomorrow = new Date();
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(0, 0, 0, 0);

          throw InsufficientCreditsError.dailyLimitReached(
            user.credits.value,
            DAILY_FREE_CREDITS,
            tomorrow
          );
        }

        // 2. Deduct credit
        const updatedUser = user.deductCredits(1);
        await this.userRepository.save(updatedUser);
        user = updatedUser;
      }
    }

    // 3. Get or create conversation
    let conversationId = input.conversationId;
    let conversation: Conversation | null = null;

    if (!input.storeLocally && input.userId && !conversationId) {
      const title = input.isNewChat
        ? 'New Conversation'
        : input.message.substring(0, 50) + (input.message.length > 50 ? '...' : '');

      conversation = Conversation.create({
        id: this.generateId(),
        userId: input.userId,
        title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.conversationRepository.save(conversation);
      conversationId = conversation.id;
    } else if (conversationId) {
      conversation = await this.conversationRepository.findById(conversationId);
    }

    // 4. Build messages for AI
    const history = conversation?.recentMessages(10) || [];
    const aiMessages: AIMessage[] = [
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
      { role: 'user' as const, content: input.message },
    ];

    // 5. Store user message
    let userMessageId: string | undefined;
    if (!input.storeLocally && conversationId && conversation) {
      userMessageId = this.generateId();
      const userMessage = Message.create({
        id: userMessageId,
        conversationId,
        role: 'user',
        content: input.message,
        createdAt: new Date(),
      });
      conversation = conversation.addMessage(userMessage);
      await this.conversationRepository.save(conversation);
    }

    // 6. Stream AI response
    let fullResponse = '';
    for await (const chunk of this.aiProvider.generateStream({
      messages: aiMessages,
      personalityMode: input.personalityMode,
      userName: user?.chatName || undefined,
    })) {
      fullResponse += chunk.content;
      yield chunk;
    }

    // 7. Store assistant message
    let assistantMessageId: string | undefined;
    if (!input.storeLocally && conversationId && conversation) {
      assistantMessageId = this.generateId();
      const assistantMessage = Message.create({
        id: assistantMessageId,
        conversationId,
        role: 'assistant',
        content: fullResponse,
        createdAt: new Date(),
      });
      conversation = conversation.addMessage(assistantMessage);
      await this.conversationRepository.save(conversation);
    }

    return {
      conversationId,
      userMessageId,
      assistantMessageId,
    };
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
