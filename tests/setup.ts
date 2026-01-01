import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.ADMIN_UI_PASSWORD = process.env.ADMIN_UI_PASSWORD || 'test-admin-password';
process.env.FUNNEL_API_SECRET = process.env.FUNNEL_API_SECRET || 'test-funnel-secret';
process.env.NODE_ENV = 'test';

jest.setTimeout(30000);
