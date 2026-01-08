import { Session } from '../entities/Session.js';

/**
 * Session repository interface.
 * Defines the contract for session data persistence.
 */
export interface ISessionRepository {
  /**
   * Finds a session by ID.
   */
  findById(id: string): Promise<Session | null>;

  /**
   * Finds a session by refresh token.
   */
  findByRefreshToken(token: string): Promise<Session | null>;

  /**
   * Finds all sessions for a user.
   */
  findByUserId(userId: string): Promise<Session[]>;

  /**
   * Saves a session.
   */
  save(session: Session): Promise<Session>;

  /**
   * Deletes a session by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Deletes all sessions for a user.
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Deletes expired sessions.
   */
  deleteExpired(): Promise<number>;

  /**
   * Checks if a refresh token exists and is valid.
   */
  isValidRefreshToken(token: string): Promise<boolean>;
}
