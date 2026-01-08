import { Request, Response } from 'express';
import { z } from 'zod';
import { SendMessage, SendMessageOutput, GetConversationHistory } from '../../application/use-cases/chat/index.js';
import { ValidationError } from '../../domain/errors/ValidationError.js';
import { InsufficientCreditsError } from '../../domain/errors/InsufficientCreditsError.js';

// Validation schemas
const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(10000),
  preferences: z.object({
    length: z.enum(['brief', 'moderate', 'detailed']).optional(),
    style: z.enum(['casual', 'thoughtful', 'creative']).optional(),
  }).optional(),
  personalityMode: z.enum([
    'nurturing', 'playful', 'dominant',
    'filthy_sexy', 'intimate_companion', 'intellectual_muse'
  ]).optional(),
  storeLocally: z.boolean().optional(),
  newChat: z.boolean().optional(),
});

const historySchema = z.object({
  conversationId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

/**
 * ChatController
 *
 * Thin presentation layer controller for chat endpoints.
 * Handles SSE streaming setup and delegates to use cases.
 */
export class ChatController {
  constructor(
    private readonly sendMessage: SendMessage,
    private readonly getConversationHistory: GetConversationHistory
  ) {}

  /**
   * POST /api/chat
   * SSE streaming endpoint
   */
  async chat(req: Request, res: Response): Promise<void> {
    try {
      const body = chatSchema.parse(req.body);
      const userId = (req as any).user?.sub;

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      // Stream the response
      const generator = this.sendMessage.execute({
        userId,
        conversationId: body.conversationId,
        message: body.message,
        personalityMode: body.personalityMode,
        isNewChat: body.newChat,
        storeLocally: body.storeLocally,
      });

      let output: SendMessageOutput | undefined;
      for await (const chunk of generator) {
        if (chunk.type === 'text') {
          // Map internal 'text' type to contract 'token' type for SSE
          res.write(`data: ${JSON.stringify({ type: 'token', content: chunk.content })}\n\n`);
        } else if (chunk.type === 'error') {
          res.write(`data: ${JSON.stringify({ type: 'error', error: chunk.content })}\n\n`);
        }
      }

      // Get the final result - generator returns SendMessageOutput after completion
      const result = await generator.next();
      output = result.value as SendMessageOutput | undefined;

      // Send done event
      res.write(`data: ${JSON.stringify({
        type: 'done',
        conversationId: output?.conversationId,
        userMessageId: output?.userMessageId,
        assistantMessageId: output?.assistantMessageId,
      })}\n\n`);

      res.end();
    } catch (error) {
      this.handleStreamError(res, error);
    }
  }

  /**
   * GET /api/conversations
   * GET /api/conversations/:id/messages
   */
  async history(req: Request, res: Response): Promise<void> {
    try {
      const query = historySchema.parse(req.query);
      const userId = (req as any).user?.sub;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await this.getConversationHistory.execute({
        userId,
        conversationId: query.conversationId,
        limit: query.limit,
        offset: query.offset,
      });

      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Maps domain errors to HTTP responses for regular endpoints.
   */
  private handleError(res: Response, error: unknown): void {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
      return;
    }

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: error.message,
        code: error.code,
        field: error.field,
      });
      return;
    }

    if (error instanceof InsufficientCreditsError) {
      res.status(403).json({
        errorCode: error.code,
        error: 'Credits exhausted',
        message: error.message,
        credits: error.currentCredits,
        maxCredits: error.maxCredits,
        resetsAt: error.resetsAt?.toISOString(),
      });
      return;
    }

    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }

  /**
   * Maps domain errors to SSE error events.
   */
  private handleStreamError(res: Response, error: unknown): void {
    if (error instanceof InsufficientCreditsError) {
      res.status(403).json({
        errorCode: error.code,
        error: 'Credits exhausted',
        message: error.message,
        credits: error.currentCredits,
        maxCredits: error.maxCredits,
        resetsAt: error.resetsAt?.toISOString(),
      });
      return;
    }

    // For other errors, send as SSE error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })}\n\n`);
    res.end();
  }
}
