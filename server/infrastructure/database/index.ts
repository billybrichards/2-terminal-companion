import path from 'path';
import fs from 'fs';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL || 'file:./data/companion.db';
const isPostgres = DATABASE_URL.startsWith('postgres');

// Database instance - will be set by initializeDatabase()
// Using 'any' type since the actual type depends on the database driver
let db: any = null;

async function initializeDatabase(): Promise<void> {
  if (db !== null) return; // Already initialized

  if (isPostgres) {
    // PostgreSQL setup
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const schema = await import('../../../shared/schema.postgres.js');

    const pool = new Pool({
      connectionString: DATABASE_URL,
    });

    db = drizzle(pool, { schema });

    console.log('Initializing PostgreSQL database...');

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        storage_preference TEXT DEFAULT 'cloud',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_admin BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS companion_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        name TEXT NOT NULL DEFAULT 'Aura',
        default_gender TEXT DEFAULT 'female',
        custom_gender_text TEXT,
        default_length TEXT DEFAULT 'moderate',
        default_style TEXT DEFAULT 'thoughtful',
        brief_tokens INTEGER DEFAULT 500,
        moderate_tokens INTEGER DEFAULT 1000,
        detailed_tokens INTEGER DEFAULT 2000,
        brief_instruction TEXT DEFAULT 'Keep your responses concise and to the point, typically 1-3 sentences.',
        moderate_instruction TEXT DEFAULT 'Provide balanced responses with enough detail to be helpful, typically 2-4 paragraphs.',
        detailed_instruction TEXT DEFAULT 'Give comprehensive, in-depth responses with thorough explanations and examples.',
        casual_instruction TEXT DEFAULT 'Use a warm, friendly, and conversational tone. Be approachable and relaxed.',
        thoughtful_instruction TEXT DEFAULT 'Be reflective, empathetic, and considerate. Take time to deeply understand and respond with care.',
        creative_instruction TEXT DEFAULT 'Be imaginative, expressive, and open to exploring ideas in unique ways. Use vivid language and creative analogies.',
        system_prompt_template TEXT NOT NULL DEFAULT 'You are {{companion_name}}, a compassionate AI companion.',
        general_model TEXT DEFAULT 'darkplanet-general:latest',
        long_form_model TEXT DEFAULT 'dolphin-mixtral:latest',
        temperature DOUBLE PRECISION DEFAULT 0.8,
        use_long_form_for_detailed BOOLEAN DEFAULT TRUE,
        welcome_title TEXT DEFAULT 'WELCOME TO TERMINAL COMPANION',
        welcome_message TEXT DEFAULT 'This is your private, judgment-free terminal for meaningful conversation.',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_context (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id),
        summary TEXT NOT NULL,
        key_facts TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        refresh_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        gender TEXT,
        custom_gender TEXT,
        preferred_length TEXT DEFAULT 'moderate',
        preferred_style TEXT DEFAULT 'thoughtful',
        theme_hue INTEGER DEFAULT 220,
        use_orange_accent BOOLEAN DEFAULT FALSE,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_feedback (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `);

    // Insert default companion config if not exists
    const result = await pool.query('SELECT id FROM companion_config WHERE id = $1', ['default']);
    if (result.rows.length === 0) {
      await pool.query(`
        INSERT INTO companion_config (id, name, system_prompt_template) VALUES ($1, $2, $3)
      `, ['default', 'Aura', `You are {{companion_name}}, a compassionate, judgment-free AI companion designed for meaningful adult conversations. You provide emotional support, intellectual engagement, and creative exploration in a private, safe environment.

Core principles:
- Be empathetic, understanding, and non-judgmental
- Maintain context and remember previous parts of the conversation
- Provide thoughtful, authentic responses
- Create a safe space for open expression
- Respect the user's privacy and confidentiality

Your identity:
{{gender_persona}}

Current response preferences:
- Length: {{length_instruction}}
- Style: {{style_instruction}}

Adapt your responses to match these preferences while maintaining your empathetic and supportive nature.`]);
      console.log('Created default companion config');
    }

    console.log('PostgreSQL database initialized successfully');
  } else {
    // SQLite setup
    const Database = (await import('better-sqlite3')).default;
    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    const schema = await import('../../../shared/schema.sqlite.js');

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'companion.db');
    const sqlite = new Database(dbPath);

    // Enable WAL mode for better concurrent access
    sqlite.pragma('journal_mode = WAL');

    db = drizzle(sqlite, { schema });

    console.log('Initializing SQLite database...');

    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        storage_preference TEXT DEFAULT 'cloud',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_admin INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS companion_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        name TEXT NOT NULL DEFAULT 'Aura',
        default_gender TEXT DEFAULT 'female',
        custom_gender_text TEXT,
        default_length TEXT DEFAULT 'moderate',
        default_style TEXT DEFAULT 'thoughtful',
        brief_tokens INTEGER DEFAULT 500,
        moderate_tokens INTEGER DEFAULT 1000,
        detailed_tokens INTEGER DEFAULT 2000,
        brief_instruction TEXT DEFAULT 'Keep your responses concise and to the point, typically 1-3 sentences.',
        moderate_instruction TEXT DEFAULT 'Provide balanced responses with enough detail to be helpful, typically 2-4 paragraphs.',
        detailed_instruction TEXT DEFAULT 'Give comprehensive, in-depth responses with thorough explanations and examples.',
        casual_instruction TEXT DEFAULT 'Use a warm, friendly, and conversational tone. Be approachable and relaxed.',
        thoughtful_instruction TEXT DEFAULT 'Be reflective, empathetic, and considerate. Take time to deeply understand and respond with care.',
        creative_instruction TEXT DEFAULT 'Be imaginative, expressive, and open to exploring ideas in unique ways. Use vivid language and creative analogies.',
        system_prompt_template TEXT NOT NULL DEFAULT 'You are {{companion_name}}, a compassionate AI companion.',
        general_model TEXT DEFAULT 'darkplanet-general:latest',
        long_form_model TEXT DEFAULT 'dolphin-mixtral:latest',
        temperature REAL DEFAULT 0.8,
        use_long_form_for_detailed INTEGER DEFAULT 1,
        welcome_title TEXT DEFAULT 'WELCOME TO TERMINAL COMPANION',
        welcome_message TEXT DEFAULT 'This is your private, judgment-free terminal for meaningful conversation.',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_context (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id),
        summary TEXT NOT NULL,
        key_facts TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        refresh_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
        gender TEXT,
        custom_gender TEXT,
        preferred_length TEXT DEFAULT 'moderate',
        preferred_style TEXT DEFAULT 'thoughtful',
        theme_hue INTEGER DEFAULT 220,
        use_orange_accent INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_feedback (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    `);

    // Insert default companion config if not exists
    const configExists = sqlite.prepare('SELECT id FROM companion_config WHERE id = ?').get('default');
    if (!configExists) {
      sqlite.prepare(`
        INSERT INTO companion_config (id, name, system_prompt_template) VALUES (?, ?, ?)
      `).run('default', 'Aura', `You are {{companion_name}}, a compassionate, judgment-free AI companion designed for meaningful adult conversations. You provide emotional support, intellectual engagement, and creative exploration in a private, safe environment.

Core principles:
- Be empathetic, understanding, and non-judgmental
- Maintain context and remember previous parts of the conversation
- Provide thoughtful, authentic responses
- Create a safe space for open expression
- Respect the user's privacy and confidentiality

Your identity:
{{gender_persona}}

Current response preferences:
- Length: {{length_instruction}}
- Style: {{style_instruction}}

Adapt your responses to match these preferences while maintaining your empathetic and supportive nature.`);
      console.log('Created default companion config');
    }

    console.log('SQLite database initialized successfully');
  }
}

// Export a proxy that forwards to the actual db instance
// This allows routes to import 'db' at module load time,
// before initializeDatabase() is called
const dbProxy = new Proxy({} as any, {
  get(target, prop) {
    if (db === null) {
      throw new Error('Database not initialized. Ensure initializeDatabase() is called before using db.');
    }
    return (db as any)[prop];
  },
});

export { dbProxy as db, initializeDatabase };
