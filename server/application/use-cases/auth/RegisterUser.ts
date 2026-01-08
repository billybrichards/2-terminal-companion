import { User } from '../../../domain/entities/User.js';
import { Email } from '../../../domain/value-objects/Email.js';
import { Password } from '../../../domain/value-objects/Password.js';
import { Credits } from '../../../domain/value-objects/Credits.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { ISessionRepository } from '../../../domain/repositories/ISessionRepository.js';
import { Session } from '../../../domain/entities/Session.js';
import { ValidationError } from '../../../domain/errors/ValidationError.js';
import { ITokenService } from '../../ports/ITokenService.js';
import { IEmailService } from '../../ports/IEmailService.js';

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

const DEFAULT_CREDITS = 5;

/**
 * RegisterUser Use Case
 *
 * Creates a new user account with email and password.
 *
 * Flow:
 * 1. Validate email format
 * 2. Check for existing user
 * 3. Hash password
 * 4. Determine if first user (admin)
 * 5. Create user entity
 * 6. Generate tokens
 * 7. Create session
 * 8. Send welcome email (async)
 */
export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: ITokenService,
    private readonly emailService: IEmailService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Validate and create Email value object
    const email = Email.create(input.email);

    // 2. Check if email already exists
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw ValidationError.emailAlreadyExists(input.email);
    }

    // 3. Hash password
    const password = await Password.create(input.password);

    // 4. Check if this is the first user (make them admin)
    const userCount = await this.userRepository.count();
    const isAdmin = userCount === 0;

    // 5. Create user entity
    const userId = this.tokenService.generateId();
    const displayName = input.displayName || input.email.split('@')[0];

    const user = User.create({
      id: userId,
      email,
      passwordHash: password.hash,
      displayName,
      chatName: null,
      personalityMode: 'nurturing',
      isAdmin,
      subscriptionStatus: 'not_subscribed',
      credits: Credits.create(DEFAULT_CREDITS),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.save(user);

    // 6. Generate tokens
    const tokens = this.tokenService.generateTokenPair(
      user.id,
      user.email.value,
      user.isAdmin
    );

    // 7. Create session
    const session = Session.create({
      id: this.tokenService.generateId(),
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: this.tokenService.getRefreshExpiryDate(),
      createdAt: new Date(),
    });

    await this.sessionRepository.save(session);

    // 8. Send welcome email (don't await - fire and forget)
    this.emailService.sendWelcomeEmail(user.email.value, displayName).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return {
      user: {
        id: user.id,
        email: user.email.value,
        displayName,
        isAdmin: user.isAdmin,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
