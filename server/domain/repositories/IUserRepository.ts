import { User } from '../entities/User.js';
import { Email } from '../value-objects/Email.js';

/**
 * User repository interface.
 * Defines the contract for user data persistence.
 */
export interface IUserRepository {
  /**
   * Finds a user by ID.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by email.
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Finds a user by Stripe customer ID.
   */
  findByStripeCustomerId(customerId: string): Promise<User | null>;

  /**
   * Saves a user (create or update).
   */
  save(user: User): Promise<User>;

  /**
   * Deletes a user by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Checks if an email is already registered.
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Counts total users.
   */
  count(): Promise<number>;

  /**
   * Updates user's credits.
   */
  updateCredits(userId: string, credits: number): Promise<void>;

  /**
   * Updates user's subscription status.
   */
  updateSubscription(
    userId: string,
    status: 'subscribed' | 'not_subscribed',
    stripeSubscriptionId?: string
  ): Promise<void>;
}
