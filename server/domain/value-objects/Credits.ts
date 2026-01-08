import { InsufficientCreditsError } from '../errors/InsufficientCreditsError.js';

/**
 * Default daily free credits for non-subscribed users.
 */
export const DEFAULT_DAILY_CREDITS = 5;

/**
 * Credits value object.
 * Represents a user's credit balance with business rules.
 * This is an immutable value object - all operations return new instances.
 */
export class Credits {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = Math.max(0, Math.floor(value));
  }

  get value(): number {
    return this._value;
  }

  /**
   * Creates a Credits instance with the given value.
   */
  static create(value: number): Credits {
    return new Credits(value);
  }

  /**
   * Creates a Credits instance with zero balance.
   */
  static zero(): Credits {
    return new Credits(0);
  }

  /**
   * Creates a Credits instance with default daily credits.
   */
  static defaultDaily(): Credits {
    return new Credits(DEFAULT_DAILY_CREDITS);
  }

  /**
   * Checks if there are enough credits for an operation.
   */
  canSpend(amount: number): boolean {
    return this._value >= amount && amount > 0;
  }

  /**
   * Deducts credits. Returns new Credits instance.
   * @throws InsufficientCreditsError if not enough credits
   */
  spend(amount: number): Credits {
    if (amount <= 0) {
      throw InsufficientCreditsError.invalidAmount(amount);
    }
    if (!this.canSpend(amount)) {
      throw InsufficientCreditsError.notEnoughCredits(this._value, amount);
    }
    return new Credits(this._value - amount);
  }

  /**
   * Adds credits. Returns new Credits instance.
   */
  add(amount: number): Credits {
    if (amount < 0) {
      return this;
    }
    return new Credits(this._value + amount);
  }

  /**
   * Resets credits to a specific value. Returns new Credits instance.
   */
  reset(value: number): Credits {
    return new Credits(value);
  }

  /**
   * Checks if credits are exhausted.
   */
  isEmpty(): boolean {
    return this._value <= 0;
  }

  /**
   * Checks if there's at least one credit available.
   */
  hasCredits(): boolean {
    return this._value > 0;
  }

  equals(other: Credits): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `${this._value} credits`;
  }
}
