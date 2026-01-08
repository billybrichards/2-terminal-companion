import { DomainError } from './DomainError.js';

/**
 * Error codes for authentication failures
 */
export enum AuthenticationErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
}

/**
 * Represents authentication-related domain errors.
 * Thrown when authentication or authorization fails.
 */
export class AuthenticationError extends DomainError {
  constructor(message: string, code: AuthenticationErrorCode = AuthenticationErrorCode.INVALID_CREDENTIALS) {
    super(message, code);
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError(
      'Invalid email or password',
      AuthenticationErrorCode.INVALID_CREDENTIALS
    );
  }

  static userNotFound(): AuthenticationError {
    return new AuthenticationError(
      'User not found',
      AuthenticationErrorCode.USER_NOT_FOUND
    );
  }

  static sessionExpired(): AuthenticationError {
    return new AuthenticationError(
      'Session has expired',
      AuthenticationErrorCode.SESSION_EXPIRED
    );
  }

  static sessionNotFound(): AuthenticationError {
    return new AuthenticationError(
      'Session not found',
      AuthenticationErrorCode.SESSION_NOT_FOUND
    );
  }

  static invalidToken(): AuthenticationError {
    return new AuthenticationError(
      'Invalid token',
      AuthenticationErrorCode.INVALID_TOKEN
    );
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError(
      'Token has expired',
      AuthenticationErrorCode.TOKEN_EXPIRED
    );
  }

  static accountLocked(): AuthenticationError {
    return new AuthenticationError(
      'Account has been locked',
      AuthenticationErrorCode.ACCOUNT_LOCKED
    );
  }

  static emailNotVerified(): AuthenticationError {
    return new AuthenticationError(
      'Email has not been verified',
      AuthenticationErrorCode.EMAIL_NOT_VERIFIED
    );
  }
}
