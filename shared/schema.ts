// Schema switcher - exports the appropriate schema based on DATABASE_URL
// Both schemas export identical table structures and types

const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');

// Re-export from the appropriate dialect
export * from './schema.sqlite.js';

// Note: The actual schema used at runtime is determined in database/index.ts
// This file provides type definitions that work for both dialects
// since both SQLite and PostgreSQL schemas export the same types
