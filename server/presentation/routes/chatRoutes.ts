import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../infrastructure/database/index.js';
import { companionConfig, conversations, messages, userPreferences, users, systemPrompts } from '../../../shared/schema.js';
import { getOllamaGateway, ChatMessage } from '../../infrastructure/adapters/OllamaGateway.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
import { jwtAdapter } from '../../infrastructure/auth/JWTAdapter.js';
import { eq, desc, count, and } from 'drizzle-orm';
import { ANPLEXA_DEFAULT_PROMPT, buildSystemPromptWithName } from '../../config/anplexaPrompt.js';
import { PersonalityMode, buildPersonalityOverlay, isValidPersonalityMode, DEFAULT_PERSONALITY_MODE } from '../../config/personalityProfiles.js';

const FREE_MESSAGE_LIMIT = 3;

/**
 * Get the active system prompt from the database, with user's name injected
 */
async function getActiveSystemPrompt(userId?: string): Promise<string> {
  const activePrompt = await db.query.systemPrompts.findFirst({
    where: eq(systemPrompts.isActive, true),
  });
  
  let basePrompt = activePrompt?.content || ANPLEXA_DEFAULT_PROMPT;
  
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (user?.chatName) {
      basePrompt = buildSystemPromptWithName(basePrompt, user.chatName);
    }
  }
  
  return basePrompt;
}

/**
 * Build the complete system prompt with personality overlay
 */
async function buildCompleteSystemPrompt(
  userId?: string,
  personalityModeOverride?: PersonalityMode
): Promise<string> {
  const basePrompt = await getActiveSystemPrompt(userId);
  
  // Determine personality mode: override > user preference > default
  let personalityMode: PersonalityMode = DEFAULT_PERSONALITY_MODE;
  let userName: string | undefined;
  
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (user) {
      userName = user.chatName || undefined;
      if (personalityModeOverride && isValidPersonalityMode(personalityModeOverride)) {
        personalityMode = personalityModeOverride;
      } else if ((user as any).personalityMode && isValidPersonalityMode((user as any).personalityMode)) {
        personalityMode = (user as any).personalityMode as PersonalityMode;
      }
    }
  } else if (personalityModeOverride && isValidPersonalityMode(personalityModeOverride)) {
    personalityMode = personalityModeOverride;
  }
  
  // Build the personality overlay
  const overlay = buildPersonalityOverlay(personalityMode, userName);
  
  // Combine base prompt with personality overlay
  return `${basePrompt}\n\n${overlay}`;
}

export const chatRouter = Router();

// Validation schemas
const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(10000),
  preferences: z.object({
    length: z.enum(['brief', 'moderate', 'detailed']).optional(),
    style: z.enum(['casual', 'thoughtful', 'creative']).optional(),
  }).optional(),
  personalityMode: z.enum(['nurturing', 'playful', 'dominant']).optional(),
  storeLocally: z.boolean().optional(),
  newChat: z.boolean().optional(),
});

function buildNewChatIceBreakerPrompt(name: string, userMessage: string): string {
  return `[Context: ${name} just opened a new chat and said "${userMessage}". This is their first message to you. They want to find a genuine companion. Give a warm, human, natural ice-breaker response - not too long - to keep things flowing naturally. Make it feel like you're genuinely happy to meet them.]`;
}

// Gender persona templates
const genderPersonas: Record<string, string> = {
  male: 'You identify as male and use he/him pronouns. Embody a masculine perspective while remaining empathetic and supportive.',
  female: 'You identify as female and use she/her pronouns. Embody a feminine perspective while remaining empathetic and supportive.',
  'non-binary': 'You identify as non-binary and use they/them pronouns. Embody a gender-neutral perspective while remaining empathetic and supportive.',
};

/**
 * Build the system prompt from companion config and user preferences
 */
async function buildSystemPrompt(
  config: typeof companionConfig.$inferSelect,
  length: 'brief' | 'moderate' | 'detailed',
  style: 'casual' | 'thoughtful' | 'creative',
  userGender?: string | null,
  customGender?: string | null
): Promise<string> {
  // Get length instruction
  const lengthInstructions: Record<string, string> = {
    brief: config.briefInstruction || 'Keep your responses concise.',
    moderate: config.moderateInstruction || 'Provide balanced responses.',
    detailed: config.detailedInstruction || 'Give comprehensive responses.',
  };

  // Get style instruction
  const styleInstructions: Record<string, string> = {
    casual: config.casualInstruction || 'Be warm and friendly.',
    thoughtful: config.thoughtfulInstruction || 'Be reflective and empathetic.',
    creative: config.creativeInstruction || 'Be imaginative and expressive.',
  };

  // Determine gender persona
  const gender = userGender || config.defaultGender || 'female';
  let genderPersona = genderPersonas[gender];
  if (gender === 'custom' && (customGender || config.customGenderText)) {
    const customText = customGender || config.customGenderText;
    genderPersona = `You identify as ${customText}. Embody this identity authentically while remaining empathetic and supportive.`;
  }

  // Replace placeholders in template
  let prompt = config.systemPromptTemplate;
  prompt = prompt.replace(/\{\{companion_name\}\}/g, config.name || 'Aura');
  prompt = prompt.replace(/\{\{gender_persona\}\}/g, genderPersona || '');
  prompt = prompt.replace(/\{\{length_instruction\}\}/g, lengthInstructions[length]);
  prompt = prompt.replace(/\{\{style_instruction\}\}/g, styleInstructions[style]);

  return prompt;
}

/**
 * Get token limit for response length
 */
function getTokenLimit(config: typeof companionConfig.$inferSelect, length: 'brief' | 'moderate' | 'detailed'): number {
  switch (length) {
    case 'brief': return config.briefTokens || 500;
    case 'moderate': return config.moderateTokens || 1000;
    case 'detailed': return config.detailedTokens || 2000;
    default: return 1000;
  }
}

// GET /api/chat/config - Get companion config for UI
chatRouter.get('/config', async (req, res) => {
  try {
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    if (!config) {
      return res.status(404).json({ error: 'Companion not configured' });
    }

    res.json({
      name: config.name,
      defaultGender: config.defaultGender,
      defaultLength: config.defaultLength,
      defaultStyle: config.defaultStyle,
      welcomeTitle: config.welcomeTitle,
      welcomeMessage: config.welcomeMessage,
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// POST /api/chat - Send message and get streaming response
chatRouter.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const body = chatSchema.parse(req.body);
    const userId = req.user?.sub;
    const storeLocally = body.storeLocally || false;
    const isNewChat = body.newChat || false;

    // Get user info for new chat ice-breaker
    let user: any = null;
    if (userId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }

    // Check message limit for free users (resets weekly) - skip for newChat ice-breakers
    if (userId && user && !isNewChat) {
      if ((user as any).subscriptionStatus !== 'subscribed') {
        // Calculate start of current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - diffToMonday);
        weekStart.setHours(0, 0, 0, 0);
        
        // Calculate next week reset date
        const nextReset = new Date(weekStart);
        nextReset.setDate(weekStart.getDate() + 7);

        // Count user's messages from this week only
        const userConversations = await db.query.conversations.findMany({
          where: eq(conversations.userId, userId),
        });
        
        let totalMessages = 0;
        for (const conv of userConversations) {
          const convMessages = await db.query.messages.findMany({
            where: and(
              eq(messages.conversationId, conv.id),
              eq(messages.role, 'user')
            ),
          });
          // Count only messages from this week
          totalMessages += convMessages.filter((m: any) => 
            new Date(m.createdAt) >= weekStart
          ).length;
        }

        if (totalMessages >= FREE_MESSAGE_LIMIT) {
          return res.status(403).json({
            error: 'Message limit reached',
            message: 'All used up, please subscribe for unlimited messages and audio. Your limit will reset next week.',
            limit: FREE_MESSAGE_LIMIT,
            used: totalMessages,
            resetsAt: nextReset.toISOString(),
          });
        }
      }
    }

    // Get companion config
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    if (!config) {
      return res.status(500).json({ error: 'Companion not configured' });
    }

    // Get user preferences if authenticated
    let userPrefs = null;
    if (userId) {
      userPrefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
    }

    // Determine response preferences
    const length = body.preferences?.length || userPrefs?.preferredLength || config.defaultLength || 'moderate';
    const style = body.preferences?.style || userPrefs?.preferredStyle || config.defaultStyle || 'thoughtful';

    // Get or create conversation (only if not storing locally)
    let conversationId = body.conversationId;
    if (!storeLocally && userId && !conversationId) {
      // For new chat, use a generic title; otherwise use the message
      const title = isNewChat 
        ? 'New Conversation' 
        : body.message.substring(0, 50) + (body.message.length > 50 ? '...' : '');
      const newConversation = {
        id: jwtAdapter.generateId(),
        userId,
        title,
      };
      await db.insert(conversations).values(newConversation);
      conversationId = newConversation.id;
    }

    // Get conversation history (last 10 messages for context)
    let conversationHistory: ChatMessage[] = [];
    if (!storeLocally && conversationId) {
      const recentMessages = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: 10,
      });

      conversationHistory = recentMessages.reverse().map((m: typeof recentMessages[number]) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));
    }

    // Get the complete system prompt with personality overlay
    const systemPrompt = await buildCompleteSystemPrompt(
      userId,
      body.personalityMode as PersonalityMode | undefined
    );

    // Determine the actual message to send to the AI
    let actualMessage = body.message;
    let isHiddenIceBreaker = false;
    
    // For new chat with user name set, use ice-breaker prompt (hidden from user)
    // This wraps the user's message with context to help AI give a natural ice-breaker response
    if (isNewChat && user?.chatName) {
      actualMessage = buildNewChatIceBreakerPrompt(user.chatName, body.message);
      isHiddenIceBreaker = true;
    }

    // Build messages array
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: actualMessage },
    ];

    // Store user message - for ice-breaker, store the original user message (not the wrapped prompt)
    let userMessageId: string | undefined;
    if (!storeLocally && conversationId) {
      userMessageId = jwtAdapter.generateId();
      await db.insert(messages).values({
        id: userMessageId,
        conversationId,
        role: 'user',
        content: body.message,  // Store original message, not the ice-breaker wrapper
      });
    }

    // Select model based on length
    const ollama = getOllamaGateway();
    const model = ollama.selectModel(
      length as 'brief' | 'moderate' | 'detailed',
      config.useLongFormForDetailed ?? true
    );
    const maxTokens = getTokenLimit(config, length as 'brief' | 'moderate' | 'detailed');

    // Set up SSE response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Stream the response
    let fullResponse = '';
    try {
      for await (const chunk of ollama.generateStream({
        model,
        messages: chatMessages,
        temperature: config.temperature || 0.8,
        maxTokens,
      })) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
      }

      // Store assistant message (if not local mode)
      let assistantMessageId: string | undefined;
      if (!storeLocally && conversationId) {
        assistantMessageId = jwtAdapter.generateId();
        await db.insert(messages).values({
          id: assistantMessageId,
          conversationId,
          role: 'assistant',
          content: fullResponse,
        });

        // Update conversation timestamp
        await db.update(conversations)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(conversations.id, conversationId));
      }

      // Send done event
      res.write(`data: ${JSON.stringify({
        type: 'done',
        conversationId,
        userMessageId,
        assistantMessageId,
        isNewChat: isHiddenIceBreaker,
      })}\n\n`);

    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Stream failed',
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// POST /api/chat/non-streaming - Send message and get full response
chatRouter.post('/non-streaming', optionalAuthMiddleware, async (req, res) => {
  try {
    const body = chatSchema.parse(req.body);
    const userId = req.user?.sub;
    const isNewChat = body.newChat || false;

    // Get user info for new chat ice-breaker
    let user: any = null;
    if (userId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }

    // Get companion config
    const config = await db.query.companionConfig.findFirst({
      where: eq(companionConfig.id, 'default'),
    });

    if (!config) {
      return res.status(500).json({ error: 'Companion not configured' });
    }

    // Get user preferences if authenticated
    let userPrefs = null;
    if (userId) {
      userPrefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
    }

    // Determine response preferences
    const length = body.preferences?.length || userPrefs?.preferredLength || config.defaultLength || 'moderate';
    const style = body.preferences?.style || userPrefs?.preferredStyle || config.defaultStyle || 'thoughtful';

    // Get the complete system prompt with personality overlay
    const systemPrompt = await buildCompleteSystemPrompt(userId);

    // Determine the actual message to send to the AI
    let actualMessage = body.message;
    let isHiddenIceBreaker = false;
    
    // For new chat with user name set, use ice-breaker prompt (hidden from user)
    // This wraps the user's message with context to help AI give a natural ice-breaker response
    if (isNewChat && user?.chatName) {
      actualMessage = buildNewChatIceBreakerPrompt(user.chatName, body.message);
      isHiddenIceBreaker = true;
    }

    // Build messages array
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: actualMessage },
    ];

    // Select model and generate response
    const ollama = getOllamaGateway();
    const model = ollama.selectModel(
      length as 'brief' | 'moderate' | 'detailed',
      config.useLongFormForDetailed ?? true
    );
    const maxTokens = getTokenLimit(config, length as 'brief' | 'moderate' | 'detailed');

    const response = await ollama.generate({
      model,
      messages: chatMessages,
      temperature: config.temperature || 0.8,
      maxTokens,
    });

    res.json({
      response,
      model,
      length,
      style,
      isNewChat: isHiddenIceBreaker,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});
