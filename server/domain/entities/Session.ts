import { Token } from '../value-objects/Token.js';

export interface SessionProps {
  id: string;
  userId: string;
  refreshToken: Token;
  createdAt: Date;
}

/**
 * Session entity.
 * Represents an authenticated user session.
 */
export class Session {
  private readonly props: SessionProps;

  private constructor(props: SessionProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get refreshToken(): Token { return this.props.refreshToken; }
  get createdAt(): Date { return this.props.createdAt; }

  /**
   * Creates a new Session.
   */
  static create(props: {
    id: string;
    userId: string;
    refreshToken: string;
    expiresAt: Date;
  }): Session {
    return new Session({
      id: props.id,
      userId: props.userId,
      refreshToken: Token.create(props.refreshToken, props.expiresAt),
      createdAt: new Date(),
    });
  }

  /**
   * Reconstructs from persistence.
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    refreshToken: string;
    expiresAt: string;
    createdAt: string | null;
  }): Session {
    return new Session({
      id: data.id,
      userId: data.userId,
      refreshToken: Token.create(data.refreshToken, new Date(data.expiresAt)),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    });
  }

  /**
   * Checks if the session is still valid.
   */
  isValid(): boolean {
    return this.props.refreshToken.isValid();
  }

  /**
   * Checks if the session has expired.
   */
  isExpired(): boolean {
    return this.props.refreshToken.isExpired();
  }

  /**
   * Validates a refresh token against this session.
   */
  validateRefreshToken(token: string): boolean {
    return this.props.refreshToken.value === token && this.isValid();
  }
}
