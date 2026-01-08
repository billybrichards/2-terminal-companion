import { ValidationError } from '../errors/ValidationError.js';

export type MessageRole = 'user' | 'assistant' | 'system';

const MAX_MESSAGE_LENGTH = 10000;

export interface MessageProps {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

/**
 * Message entity.
 * Represents a single message in a conversation.
 */
export class Message {
  private readonly props: MessageProps;

  private constructor(props: MessageProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get conversationId(): string { return this.props.conversationId; }
  get role(): MessageRole { return this.props.role; }
  get content(): string { return this.props.content; }
  get createdAt(): Date { return this.props.createdAt; }

  /**
   * Validates message content.
   * @throws ValidationError if content is invalid
   */
  static validate(content: string, role: MessageRole): void {
    if (!content || content.trim().length === 0) {
      throw ValidationError.requiredField('message content');
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw ValidationError.invalidLength('message content', 1, MAX_MESSAGE_LENGTH);
    }

    const validRoles: MessageRole[] = ['user', 'assistant', 'system'];
    if (!validRoles.includes(role)) {
      throw ValidationError.invalidFormat('role', 'user | assistant | system');
    }
  }

  /**
   * Creates a new Message.
   * @throws ValidationError if content is empty or too long
   */
  static create(props: {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
  }): Message {
    Message.validate(props.content, props.role);

    return new Message({
      id: props.id,
      conversationId: props.conversationId,
      role: props.role,
      content: props.content.trim(),
      createdAt: new Date(),
    });
  }

  /**
   * Reconstructs from persistence.
   */
  static fromPersistence(data: {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    createdAt: string | null;
  }): Message {
    return new Message({
      id: data.id,
      conversationId: data.conversationId,
      role: data.role as MessageRole,
      content: data.content,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    });
  }

  /**
   * Checks if this is a user message.
   */
  isUserMessage(): boolean {
    return this.props.role === 'user';
  }

  /**
   * Checks if this is an assistant message.
   */
  isAssistantMessage(): boolean {
    return this.props.role === 'assistant';
  }

  /**
   * Checks if this is a system message.
   */
  isSystemMessage(): boolean {
    return this.props.role === 'system';
  }

  /**
   * Gets a truncated preview of the content.
   */
  getPreview(maxLength: number = 100): string {
    if (this.props.content.length <= maxLength) {
      return this.props.content;
    }
    return this.props.content.substring(0, maxLength - 3) + '...';
  }
}
