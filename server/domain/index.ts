/**
 * Domain Layer
 *
 * This is the core of the application containing business logic.
 * The domain layer has ZERO external dependencies.
 */

// Entities
export { User } from './entities/User.js';
export type { UserProps, SubscriptionStatus, PersonalityMode } from './entities/User.js';
export { Conversation } from './entities/Conversation.js';
export type { ConversationProps } from './entities/Conversation.js';
export { Message } from './entities/Message.js';
export type { MessageProps, MessageRole } from './entities/Message.js';
export { Session } from './entities/Session.js';
export type { SessionProps } from './entities/Session.js';

// Value Objects
export { Email } from './value-objects/Email.js';
export { Password } from './value-objects/Password.js';
export { Credits } from './value-objects/Credits.js';
export { Token } from './value-objects/Token.js';

// Repository Interfaces
export type { IUserRepository } from './repositories/IUserRepository.js';
export type { IConversationRepository } from './repositories/IConversationRepository.js';
export type { IMessageRepository } from './repositories/IMessageRepository.js';
export type { ISessionRepository } from './repositories/ISessionRepository.js';

// Domain Services
export { CreditService } from './services/CreditService.js';

// Errors
export { DomainError } from './errors/DomainError.js';
export { AuthenticationError } from './errors/AuthenticationError.js';
export { ValidationError } from './errors/ValidationError.js';
export { InsufficientCreditsError } from './errors/InsufficientCreditsError.js';
