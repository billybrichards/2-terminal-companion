import { DomainError } from './DomainError.js';

/**
 * Error codes for credit-related failures
 */
export enum CreditErrorCode {
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  CREDIT_LIMIT_REACHED = 'CREDIT_LIMIT_REACHED',
  INVALID_CREDIT_AMOUNT = 'INVALID_CREDIT_AMOUNT',
}

/**
 * Represents credit-related domain errors.
 * Thrown when a user lacks sufficient credits for an operation.
 */
export class InsufficientCreditsError extends DomainError {
  public readonly currentCredits: number;
  public readonly requiredCredits: number;
  public readonly maxCredits?: number;
  public readonly resetsAt?: Date;

  constructor(
    message: string,
    code: CreditErrorCode,
    currentCredits: number,
    requiredCredits: number,
    resetsAt?: Date,
    maxCredits?: number
  ) {
    super(message, code);
    this.currentCredits = currentCredits;
    this.requiredCredits = requiredCredits;
    this.maxCredits = maxCredits;
    this.resetsAt = resetsAt;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentCredits: this.currentCredits,
      requiredCredits: this.requiredCredits,
      maxCredits: this.maxCredits,
      resetsAt: this.resetsAt?.toISOString(),
    };
  }

  /**
   * Creates an error for when daily credit limit is reached
   */
  static dailyLimitReached(currentCredits: number, maxCredits: number, resetsAt: Date): InsufficientCreditsError {
    return new InsufficientCreditsError(
      'All used up for today! Subscribe for unlimited messages, or come back tomorrow for more free messages.',
      CreditErrorCode.CREDIT_LIMIT_REACHED,
      currentCredits,
      1,
      resetsAt,
      maxCredits
    );
  }

  /**
   * Creates an error for insufficient credits for a specific operation
   */
  static notEnoughCredits(current: number, required: number): InsufficientCreditsError {
    return new InsufficientCreditsError(
      `Insufficient credits. You have ${current} credits but need ${required}.`,
      CreditErrorCode.INSUFFICIENT_CREDITS,
      current,
      required
    );
  }

  /**
   * Creates an error for invalid credit amount
   */
  static invalidAmount(amount: number): InsufficientCreditsError {
    return new InsufficientCreditsError(
      `Invalid credit amount: ${amount}. Credits must be a positive integer.`,
      CreditErrorCode.INVALID_CREDIT_AMOUNT,
      0,
      amount
    );
  }
}
