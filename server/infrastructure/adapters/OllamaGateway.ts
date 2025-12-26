/**
 * OllamaGateway - Handles communication with Ollama API
 *
 * Uses Mistral Instruct format for Dark Planet models:
 * [INST] user message [/INST] assistant response
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaConfig {
  baseUrl: string;
  apiKey: string;
  generalModel: string;
  longFormModel: string;
}

export interface GenerateOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export class OllamaGateway {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  /**
   * Build the prompt in Mistral Instruct format
   * Format: [INST] message [/INST]
   */
  private buildMistralPrompt(messages: ChatMessage[]): string {
    let prompt = '';
    let systemPrompt = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        // Include system prompt in first user message if exists
        if (systemPrompt && prompt === '') {
          prompt += `[INST] ${systemPrompt}\n\n${msg.content} [/INST]`;
          systemPrompt = ''; // Clear after first use
        } else {
          prompt += `[INST] ${msg.content} [/INST]`;
        }
      } else if (msg.role === 'assistant') {
        prompt += ` ${msg.content}`;
      }
    }

    return prompt;
  }

  /**
   * Generate a non-streaming response
   */
  async generate(options: GenerateOptions): Promise<string> {
    const { model, messages, temperature = 0.8, maxTokens = 1000 } = options;

    const prompt = this.buildMistralPrompt(messages);

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.response;
  }

  /**
   * Generate a streaming response using chat endpoint
   * Returns an async generator that yields text chunks
   */
  async *generateStream(options: GenerateOptions): AsyncGenerator<string, void, unknown> {
    const { model, messages, temperature = 0.8, maxTokens = 1000 } = options;

    // Use the chat endpoint for better streaming support
    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        options: {
          temperature,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Test connection to Ollama
   */
  async testConnection(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const models = data.models?.map((m: { name: string }) => m.name) || [];
      return { success: true, models };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    const response = await fetch(`${this.config.baseUrl}/api/tags`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.status}`);
    }

    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  }

  /**
   * Select the appropriate model based on response length
   */
  selectModel(length: 'brief' | 'moderate' | 'detailed', useLongFormForDetailed: boolean): string {
    if (length === 'detailed' && useLongFormForDetailed) {
      return this.config.longFormModel;
    }
    return this.config.generalModel;
  }
}

// Singleton instance
let ollamaGateway: OllamaGateway | null = null;

export function getOllamaGateway(): OllamaGateway {
  if (!ollamaGateway) {
    ollamaGateway = new OllamaGateway({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      apiKey: process.env.OLLAMA_API_KEY || '',
      generalModel: process.env.OLLAMA_GENERAL_MODEL || 'darkplanet-general:latest',
      longFormModel: process.env.OLLAMA_LONGFORM_MODEL || 'dolphin-mixtral:latest',
    });
  }
  return ollamaGateway;
}
