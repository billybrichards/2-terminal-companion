import { DomainError } from './DomainError.js';

/**
 * Error codes for validation failures
 */
export enum ValidationErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  INVALID_FORMAT = 'INVALID_FORMAT',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_VALUE = 'INVALID_VALUE',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
}

/**
 * Represents validation-related domain errors.
 * Thrown when input data fails business validation rules.
 */
export class ValidationError extends DomainError {
  public readonly field?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ValidationErrorCode = ValidationErrorCode.INVALID_VALUE,
    field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code);
    this.field = field;
    this.details = details;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      details: this.details,
    };
  }

  static invalidEmail(email?: string): ValidationError {
    return new ValidationError(
      'Invalid email format',
      ValidationErrorCode.INVALID_EMAIL,
      'email',
      email ? { provided: email } : undefined
    );
  }

  static invalidPassword(reason?: string): ValidationError {
    return new ValidationError(
      reason || 'Invalid password',
      ValidationErrorCode.INVALID_PASSWORD,
      'password'
    );
  }

  static passwordTooShort(minLength: number): ValidationError {
    return new ValidationError(
      `Password must be at least ${minLength} characters`,
      ValidationErrorCode.PASSWORD_TOO_SHORT,
      'password',
      { minLength }
    );
  }

  static requiredField(field: string): ValidationError {
    return new ValidationError(
      `${field} is required`,
      ValidationErrorCode.REQUIRED_FIELD,
      field
    );
  }

  /**
   * Alias for requiredField - for backward compatibility
   */
  static required(field: string): ValidationError {
    return ValidationError.requiredField(field);
  }

  static invalidLength(field: string, min?: number, max?: number): ValidationError {
    let message = `Invalid length for ${field}`;
    if (min !== undefined && max !== undefined) {
      message = `${field} must be between ${min} and ${max} characters`;
    } else if (min !== undefined) {
      message = `${field} must be at least ${min} characters`;
    } else if (max !== undefined) {
      message = `${field} must be at most ${max} characters`;
    }

    return new ValidationError(
      message,
      ValidationErrorCode.INVALID_LENGTH,
      field,
      { min, max }
    );
  }

  static emailAlreadyExists(email: string): ValidationError {
    return new ValidationError(
      'Email already registered',
      ValidationErrorCode.EMAIL_ALREADY_EXISTS,
      'email',
      { email }
    );
  }

  static invalidFormat(field: string, expected: string): ValidationError {
    return new ValidationError(
      `Invalid ${field} format. Expected: ${expected}`,
      ValidationErrorCode.INVALID_FORMAT,
      field,
      { expected }
    );
  }

  static invalidValue(field: string, reason?: string): ValidationError {
    return new ValidationError(
      reason || `Invalid value for ${field}`,
      ValidationErrorCode.INVALID_VALUE,
      field
    );
  }
}
