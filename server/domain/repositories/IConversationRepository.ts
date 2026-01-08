import { Conversation } from '../entities/Conversation.js';

/**
 * Conversation repository interface.
 * Defines the contract for conversation data persistence.
 */
export interface IConversationRepository {
  /**
   * Finds a conversation by ID.
   */
  findById(id: string): Promise<Conversation | null>;

  /**
   * Finds a conversation by ID with all messages.
   */
  findByIdWithMessages(id: string): Promise<Conversation | null>;

  /**
   * Lists all conversations for a user.
   */
  findByUserId(userId: string): Promise<Conversation[]>;

  /**
   * Lists conversations for a user with pagination.
   */
  findByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<Conversation[]>;

  /**
   * Saves a conversation (create or update).
   */
  save(conversation: Conversation): Promise<Conversation>;

  /**
   * Deletes a conversation by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Updates a conversation's title.
   */
  updateTitle(id: string, title: string): Promise<void>;

  /**
   * Counts conversations for a user.
   */
  countByUserId(userId: string): Promise<number>;
}
