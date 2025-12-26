import { Router } from 'express';
import { db } from '../../infrastructure/database/index.js';
import { conversations, messages } from '../../../shared/schema.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { eq, desc, and } from 'drizzle-orm';

export const conversationRouter = Router();

// All routes require authentication
conversationRouter.use(authMiddleware);

// GET /api/conversations - List user's conversations
conversationRouter.get('/', async (req, res) => {
  try {
    const userId = req.user!.sub;

    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: [desc(conversations.updatedAt)],
    });

    res.json({
      conversations: userConversations,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// POST /api/conversations - Create new conversation
conversationRouter.post('/', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { title } = req.body;

    const newConversation = {
      id: crypto.randomUUID(),
      userId,
      title: title || 'New Conversation',
    };

    await db.insert(conversations).values(newConversation);

    res.status(201).json({
      conversation: newConversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/conversations/:id - Get conversation details
conversationRouter.get('/:id', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// GET /api/conversations/:id/messages - Get messages (paginated)
conversationRouter.get('/:id/messages', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages
    const conversationMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: [desc(messages.createdAt)],
      limit,
      offset,
    });

    res.json({
      messages: conversationMessages.reverse(), // Return in chronological order
      pagination: {
        limit,
        offset,
        hasMore: conversationMessages.length === limit,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// PUT /api/conversations/:id - Update conversation title
conversationRouter.put('/:id', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;
    const { title } = req.body;

    // Verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.update(conversations)
      .set({
        title,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(conversations.id, id));

    res.json({
      message: 'Conversation updated',
      conversation: { ...conversation, title },
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// DELETE /api/conversations/:id - Delete conversation
conversationRouter.delete('/:id', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;

    // Verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.conversationId, id));

    // Delete conversation
    await db.delete(conversations).where(eq(conversations.id, id));

    res.json({
      message: 'Conversation deleted',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// POST /api/conversations/:id/clear - Clear messages but keep conversation
conversationRouter.post('/:id/clear', async (req, res) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;

    // Verify conversation belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, id),
        eq(conversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete all messages
    await db.delete(messages).where(eq(messages.conversationId, id));

    // Update conversation timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(conversations.id, id));

    res.json({
      message: 'Conversation cleared',
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});
