/**
 * AI Provider Port
 *
 * Interface for AI model operations.
 * Infrastructure layer provides concrete implementation (Ollama, OpenAI, etc.)
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
}

export interface GenerateStreamOptions {
  messages: AIMessage[];
  personalityMode?: string;
  userName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateOptions {
  messages: AIMessage[];
  personalityMode?: string;
  userName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface IAIProvider {
  /**
   * Generates a streaming response from the AI model.
   */
  generateStream(options: GenerateStreamOptions): AsyncGenerator<AIStreamChunk, void>;

  /**
   * Generates a complete response from the AI model.
   */
  generate(options: GenerateOptions): Promise<string>;

  /**
   * Selects the appropriate model based on criteria.
   */
  selectModel(length: 'brief' | 'moderate' | 'detailed'): string;
}
