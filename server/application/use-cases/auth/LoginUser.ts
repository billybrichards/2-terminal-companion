import { User } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { ISessionRepository } from '../../../domain/repositories/ISessionRepository.js';
import { Session } from '../../../domain/entities/Session.js';
import { AuthenticationError } from '../../../domain/errors/AuthenticationError.js';
import { ITokenService } from '../../ports/ITokenService.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    isAdmin: boolean;
    subscriptionStatus: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * LoginUser Use Case
 *
 * Authenticates a user with email and password, returning JWT tokens.
 *
 * Flow:
 * 1. Validate email format
 * 2. Find user by email
 * 3. Verify password
 * 4. Generate token pair
 * 5. Create session
 */
export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // 1. Validate and create Email value object
    const email = Email.create(input.email);

    // 2. Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AuthenticationError.invalidCredentials();
    }

    // 3. Verify password
    const isValid = await user.validatePassword(input.password);
    if (!isValid) {
      throw AuthenticationError.invalidCredentials();
    }

    // 4. Generate tokens
    const tokens = this.tokenService.generateTokenPair(
      user.id,
      user.email.value,
      user.isAdmin
    );

    // 5. Create session
    const session = Session.create({
      id: this.tokenService.generateId(),
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: this.tokenService.getRefreshExpiryDate(),
      createdAt: new Date(),
    });

    await this.sessionRepository.save(session);

    return {
      user: {
        id: user.id,
        email: user.email.value,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        subscriptionStatus: user.subscriptionStatus,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
