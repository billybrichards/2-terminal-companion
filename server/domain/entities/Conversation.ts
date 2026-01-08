import { Message } from './Message.js';

export interface ConversationProps {
  id: string;
  userId: string;
  title: string | null;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation entity.
 * Represents a chat conversation with messages.
 */
export class Conversation {
  private readonly props: ConversationProps;

  private constructor(props: ConversationProps) {
    this.props = props;
  }

  // Getters
  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get title(): string | null { return this.props.title; }
  get messages(): Message[] { return [...this.props.messages]; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Creates a new Conversation.
   */
  static create(props: {
    id: string;
    userId: string;
    title?: string | null;
  }): Conversation {
    return new Conversation({
      id: props.id,
      userId: props.userId,
      title: props.title ?? null,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Reconstructs from persistence.
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    title: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }, messages: Message[] = []): Conversation {
    return new Conversation({
      id: data.id,
      userId: data.userId,
      title: data.title,
      messages,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

  /**
   * Adds a message to the conversation.
   */
  addMessage(message: Message): Conversation {
    return new Conversation({
      ...this.props,
      messages: [...this.props.messages, message],
      updatedAt: new Date(),
    });
  }

  /**
   * Updates the conversation title.
   */
  updateTitle(title: string): Conversation {
    return new Conversation({
      ...this.props,
      title,
      updatedAt: new Date(),
    });
  }

  /**
   * Gets the last message in the conversation.
   */
  getLastMessage(): Message | null {
    return this.props.messages.length > 0
      ? this.props.messages[this.props.messages.length - 1]
      : null;
  }

  /**
   * Gets message count.
   */
  getMessageCount(): number {
    return this.props.messages.length;
  }

  /**
   * Checks if conversation is empty.
   */
  isEmpty(): boolean {
    return this.props.messages.length === 0;
  }

  /**
   * Generates a title from the first user message.
   */
  generateTitle(): string {
    const firstUserMessage = this.props.messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Conversation';

    const content = firstUserMessage.content;
    return content.length > 50 ? content.substring(0, 47) + '...' : content;
  }
}
