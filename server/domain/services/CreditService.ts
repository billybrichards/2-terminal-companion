import { User } from '../entities/User.js';
import { InsufficientCreditsError } from '../errors/InsufficientCreditsError.js';
import { DEFAULT_DAILY_CREDITS } from '../value-objects/Credits.js';

/**
 * Domain service for credit-related business logic.
 */
export class CreditService {
  /**
   * Checks if user can perform a chat operation.
   * Users with subscription can always chat.
   * Free users need credits.
   */
  canChat(user: User): boolean {
    return user.isSubscribed() || user.hasEnoughCredits(1);
  }

  /**
   * Deducts a credit for a chat message.
   * Subscribers don't consume credits.
   * @throws InsufficientCreditsError if not enough credits
   */
  deductChatCredit(user: User): User {
    // Subscribers don't consume credits
    if (user.isSubscribed()) {
      return user;
    }

    if (!user.hasEnoughCredits(1)) {
      throw InsufficientCreditsError.notEnoughCredits(
        user.credits.value,
        1
      );
    }

    return user.deductCredits(1);
  }

  /**
   * Checks if user needs daily credit refresh.
   */
  needsDailyRefresh(lastRefreshDate: string | null): boolean {
    if (!lastRefreshDate) return true;

    const today = new Date().toISOString().split('T')[0];
    return lastRefreshDate < today;
  }

  /**
   * Refreshes user credits to daily maximum.
   * Returns updated user with fresh credits.
   */
  refreshDailyCredits(user: User): User {
    // Don't cap credits if user has more than daily amount (purchased/gifted)
    if (user.credits.value >= DEFAULT_DAILY_CREDITS) {
      return user;
    }
    return user.resetCredits(DEFAULT_DAILY_CREDITS);
  }

  /**
   * Gets the next credit reset time (midnight UTC).
   */
  getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Gets the daily free credit amount.
   */
  getDailyCredits(): number {
    return DEFAULT_DAILY_CREDITS;
  }
}
