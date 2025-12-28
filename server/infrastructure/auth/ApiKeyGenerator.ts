import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface GeneratedApiKey {
  key: string;
  keyHash: string;
  keyPrefix: string;
}

export async function generateApiKey(): Promise<GeneratedApiKey> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  
  for (let i = 0; i < 32; i++) {
    randomPart += chars.charAt(crypto.randomInt(chars.length));
  }
  
  const key = `tc_${randomPart}`;
  const keyHash = await bcrypt.hash(key, 10);
  const keyPrefix = key.substring(0, 8);
  
  return { key, keyHash, keyPrefix };
}
