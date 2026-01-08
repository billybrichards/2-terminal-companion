/**
 * Token value object.
 * Represents JWT tokens with expiry tracking.
 */
export class Token {
  private readonly _value: string;
  private readonly _expiresAt: Date;

  private constructor(value: string, expiresAt: Date) {
    this._value = value;
    this._expiresAt = expiresAt;
  }

  get value(): string {
    return this._value;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  /**
   * Creates a new Token.
   */
  static create(value: string, expiresAt: Date): Token {
    return new Token(value, expiresAt);
  }

  /**
   * Creates a Token from a value with duration in seconds.
   */
  static createWithDuration(value: string, durationSeconds: number): Token {
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);
    return new Token(value, expiresAt);
  }

  /**
   * Checks if the token has expired.
   */
  isExpired(): boolean {
    return new Date() >= this._expiresAt;
  }

  /**
   * Checks if the token is still valid.
   */
  isValid(): boolean {
    return !this.isExpired() && this._value.length > 0;
  }

  /**
   * Gets remaining time in seconds.
   */
  remainingSeconds(): number {
    const remaining = this._expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  toString(): string {
    return this._value;
  }
}
