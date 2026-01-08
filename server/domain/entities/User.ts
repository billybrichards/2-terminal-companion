import { Email } from '../value-objects/Email.js';
import { Password } from '../value-objects/Password.js';
import { Credits } from '../value-objects/Credits.js';

export type SubscriptionStatus = 'subscribed' | 'not_subscribed';
export type PersonalityMode = 'nurturing' | 'playful' | 'dominant' | 'filthy_sexy' | 'intimate_companion' | 'intellectual_muse';

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  displayName: string | null;
  chatName: string | null;
  personalityMode: PersonalityMode;
  isAdmin: boolean;
  subscriptionStatus: SubscriptionStatus;
  credits: Credits;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity.
 * Encapsulates user-related business logic.
 */
export class User {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get email(): Email { return this.props.email; }
  get displayName(): string | null { return this.props.displayName; }
  get chatName(): string | null { return this.props.chatName; }
  get personalityMode(): PersonalityMode { return this.props.personalityMode; }
  get isAdmin(): boolean { return this.props.isAdmin; }
  get subscriptionStatus(): SubscriptionStatus { return this.props.subscriptionStatus; }
  get credits(): Credits { return this.props.credits; }
  get stripeCustomerId(): string | null { return this.props.stripeCustomerId; }
  get stripeSubscriptionId(): string | null { return this.props.stripeSubscriptionId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get passwordHash(): string { return this.props.passwordHash; }

  /**
   * Creates a new User entity.
   */
  static create(props: UserProps): User {
    return new User(props);
  }

  /**
   * Reconstructs a User from persistence.
   */
  static fromPersistence(data: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string | null;
    chatName: string | null;
    personalityMode: string | null;
    isAdmin: boolean | null;
    subscriptionStatus: string | null;
    credits: number | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }): User {
    return new User({
      id: data.id,
      email: Email.fromTrusted(data.email),
      passwordHash: data.passwordHash,
      displayName: data.displayName,
      chatName: data.chatName,
      personalityMode: (data.personalityMode as PersonalityMode) || 'nurturing',
      isAdmin: data.isAdmin ?? false,
      subscriptionStatus: (data.subscriptionStatus as SubscriptionStatus) || 'not_subscribed',
      credits: Credits.create(data.credits ?? 0),
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

  /**
   * Validates a password against the user's stored hash.
   */
  async validatePassword(rawPassword: string): Promise<boolean> {
    const password = Password.fromHash(this.props.passwordHash);
    return password.verify(rawPassword);
  }

  /**
   * Checks if user has active subscription.
   */
  isSubscribed(): boolean {
    return this.props.subscriptionStatus === 'subscribed';
  }

  /**
   * Checks if user can send a chat message (has credits or subscription).
   */
  canChat(): boolean {
    return this.isSubscribed() || this.props.credits.canSpend(1);
  }

  /**
   * Checks if user has enough credits.
   */
  hasEnoughCredits(amount: number): boolean {
    return this.props.credits.canSpend(amount);
  }

  /**
   * Deducts credits. Returns updated User.
   */
  deductCredits(amount: number = 1): User {
    return new User({
      ...this.props,
      credits: this.props.credits.spend(amount),
      updatedAt: new Date(),
    });
  }

  /**
   * Adds credits. Returns updated User.
   */
  addCredits(amount: number): User {
    return new User({
      ...this.props,
      credits: this.props.credits.add(amount),
      updatedAt: new Date(),
    });
  }

  /**
   * Resets credits to a specific value.
   */
  resetCredits(value: number): User {
    return new User({
      ...this.props,
      credits: Credits.create(value),
      updatedAt: new Date(),
    });
  }

  /**
   * Updates subscription status.
   */
  updateSubscription(status: SubscriptionStatus, stripeSubscriptionId?: string): User {
    return new User({
      ...this.props,
      subscriptionStatus: status,
      stripeSubscriptionId: stripeSubscriptionId ?? this.props.stripeSubscriptionId,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates personality mode.
   */
  updatePersonalityMode(mode: PersonalityMode): User {
    return new User({
      ...this.props,
      personalityMode: mode,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates chat name.
   */
  updateChatName(chatName: string): User {
    return new User({
      ...this.props,
      chatName,
      updatedAt: new Date(),
    });
  }
}
