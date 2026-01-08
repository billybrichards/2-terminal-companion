import bcrypt from 'bcryptjs';
import { ValidationError } from '../errors/ValidationError.js';

const SALT_ROUNDS = 10;
const MIN_LENGTH = 6;

/**
 * Password value object.
 * Handles password hashing and verification.
 */
export class Password {
  private readonly _hash: string;

  private constructor(hash: string) {
    this._hash = hash;
  }

  get hash(): string {
    return this._hash;
  }

  /**
   * Creates a new Password from a raw password string.
   * Validates and hashes the password.
   * @throws ValidationError if password doesn't meet requirements
   */
  static async create(rawPassword: string): Promise<Password> {
    if (!rawPassword || typeof rawPassword !== 'string') {
      throw ValidationError.required('password');
    }

    if (rawPassword.length < MIN_LENGTH) {
      throw ValidationError.passwordTooShort(MIN_LENGTH);
    }

    const hash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
    return new Password(hash);
  }

  /**
   * Creates a Password from an existing hash (e.g., from database).
   */
  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  /**
   * Verifies a raw password against this password's hash.
   */
  async verify(rawPassword: string): Promise<boolean> {
    if (!rawPassword) return false;
    return bcrypt.compare(rawPassword, this._hash);
  }
}
