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
   * Clean model output by removing common artifacts
   * Llama-3 models sometimes add end-of-turn or prompt artifacts
   */
  private cleanOutput(text: string): string {
    return text
      .replace(/<\|eot_id\|>/g, '')         // Llama-3 end of turn
      .replace(/<\|end_of_text\|>/g, '')     // Llama-3 end of text
      .replace(/<\|start_header_id\|>.*?<\|end_header_id\|>/g, '') // Header artifacts
      .replace(/\s*<\s*$/g, '')              // Trailing < with optional whitespace
      .replace(/\s*\|\s*\d+\s*\|\s*$/g, '') // Trailing | 1234 | artifacts
      .replace(/\s*\[INST\]?\s*$/g, '')      // Trailing [INST] or [INST
      .replace(/\s*\[\/INST\]?\s*$/g, '')    // Trailing [/INST] or [/INST
      .replace(/\s*<\/s>?\s*$/g, '')        // Trailing </s>
      .trim();
  }

  /**
   * Build the prompt in Llama-3 Instruct format
   * Format: <|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n
   */
  private buildLlama3Prompt(messages: ChatMessage[]): string {
    let prompt = '<|begin_of_text|>';

    for (const msg of messages) {
      prompt += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>`;
    }

    prompt += '<|start_header_id|>assistant<|end_header_id|>\n\n';
    return prompt;
  }

  /**
   * Generate a non-streaming response
   */
  async generate(options: GenerateOptions): Promise<string> {
    const { model, messages, temperature = 0.8, maxTokens = 1000 } = options;

    const prompt = this.buildLlama3Prompt(messages);

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

    const data = await response.json() as { response: string };
    return this.cleanOutput(data.response);
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

    // Buffer to hold pending content that might be trailing artifacts
    let pendingBuffer = '';

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
              const content = data.message.content;
              
              // Add to pending buffer
              pendingBuffer += content;
              
              // Only yield if we're reasonably sure it's not a trailing artifact
              // Dark Planet / Mistral artifacts often appear at the very end
              // We'll keep a small buffer and clean it at the end
              if (pendingBuffer.length > 20) {
                const toYield = pendingBuffer.slice(0, -20);
                pendingBuffer = pendingBuffer.slice(-20);
                yield toYield;
              }
            }
            
            if (data.done && pendingBuffer) {
              const cleaned = this.cleanOutput(pendingBuffer);
              if (cleaned) {
                yield cleaned;
              }
              pendingBuffer = '';
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
      
      // Final cleanup of any pending buffer at stream end
      if (pendingBuffer) {
        const cleaned = this.cleanOutput(pendingBuffer);
        if (cleaned) {
          yield cleaned;
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

      const data = await response.json() as { models?: Array<{ name: string }> };
      const models = data.models?.map((m) => m.name) || [];
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

    const data = await response.json() as { models?: Array<{ name: string }> };
    return data.models?.map((m) => m.name) || [];
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
      generalModel: process.env.OLLAMA_GENERAL_MODEL || 'darkplanet',
      longFormModel: process.env.OLLAMA_LONGFORM_MODEL || 'darkplanet',
    });
  }
  return ollamaGateway;
}
