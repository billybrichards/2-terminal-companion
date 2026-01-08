import { Message } from '../entities/Message.js';

/**
 * Message repository interface.
 * Defines the contract for message data persistence.
 */
export interface IMessageRepository {
  /**
   * Finds a message by ID.
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Finds all messages for a conversation.
   */
  findByConversationId(conversationId: string): Promise<Message[]>;

  /**
   * Finds messages for a conversation with pagination.
   */
  findByConversationIdPaginated(
    conversationId: string,
    limit: number,
    offset: number
  ): Promise<Message[]>;

  /**
   * Saves a message.
   */
  save(message: Message): Promise<Message>;

  /**
   * Saves multiple messages.
   */
  saveMany(messages: Message[]): Promise<Message[]>;

  /**
   * Deletes a message by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Deletes all messages for a conversation.
   */
  deleteByConversationId(conversationId: string): Promise<void>;

  /**
   * Counts messages in a conversation.
   */
  countByConversationId(conversationId: string): Promise<number>;

  /**
   * Gets the last message in a conversation.
   */
  getLastMessage(conversationId: string): Promise<Message | null>;
}
