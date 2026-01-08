import { ValidationError } from '../errors/ValidationError.js';

/**
 * Email value object.
 * Ensures email is always in a valid, normalized format.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.toLowerCase().trim();
  }

  get value(): string {
    return this._value;
  }

  /**
   * Creates a new Email value object.
   * @throws ValidationError if email is invalid
   */
  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw ValidationError.required('email');
    }

    const trimmed = email.trim();
    if (!Email.isValid(trimmed)) {
      throw ValidationError.invalidEmail(trimmed);
    }

    return new Email(trimmed);
  }

  /**
   * Creates Email from a trusted source (e.g., database).
   * Skips validation for performance.
   */
  static fromTrusted(email: string): Email {
    return new Email(email);
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
