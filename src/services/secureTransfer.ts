import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM

// Ideally, derive this from a secure secret vault.
const DEFAULT_SECRET = process.env.SECURE_TRANSFER_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');

export function encrypt<T = any>(data: T, secret: string = DEFAULT_SECRET): { iv: string; authTag: string; payload: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(secret.slice(0, KEY_LENGTH), 'utf-8');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    payload: encrypted.toString('hex'),
  };
}

export function decrypt<T = any>(packet: { iv: string; authTag: string; payload: string }, secret: string = DEFAULT_SECRET): T {
  const { iv, authTag, payload } = packet;
  const key = Buffer.from(secret.slice(0, KEY_LENGTH), 'utf-8');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8')) as T;
} 