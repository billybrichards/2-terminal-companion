import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { ISessionRepository } from '../../../domain/repositories/ISessionRepository.js';
import { AuthenticationError } from '../../../domain/errors/AuthenticationError.js';
import { ITokenService } from '../../ports/ITokenService.js';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

/**
 * RefreshToken Use Case
 *
 * Exchanges a valid refresh token for a new token pair.
 *
 * Flow:
 * 1. Verify refresh token signature
 * 2. Find session by refresh token
 * 3. Check session expiry
 * 4. Find user
 * 5. Generate new token pair
 * 6. Update session with new refresh token
 */
export class RefreshToken {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    // 1. Verify refresh token
    const payload = this.tokenService.verifyRefreshToken(input.refreshToken);
    if (!payload) {
      throw AuthenticationError.invalidToken();
    }

    // 2. Find session by refresh token
    const session = await this.sessionRepository.findByRefreshToken(input.refreshToken);
    if (!session) {
      throw AuthenticationError.sessionNotFound();
    }

    // 3. Check if session is expired
    if (!session.isValid()) {
      await this.sessionRepository.delete(session.id);
      throw AuthenticationError.sessionExpired();
    }

    // 4. Find user
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw AuthenticationError.userNotFound();
    }

    // 5. Generate new tokens
    const tokens = this.tokenService.generateTokenPair(
      user.id,
      user.email.value,
      user.isAdmin
    );

    // 6. Update session with new refresh token
    const updatedSession = session.updateRefreshToken(
      tokens.refreshToken,
      this.tokenService.getRefreshExpiryDate()
    );

    await this.sessionRepository.save(updatedSession);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
