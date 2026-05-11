import crypto from 'crypto';

// AES-256-GCM encryption for chat messages
// Key is derived from ENCRYPTION_SECRET env var
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || 'wesal-chat-encryption-key-2024';
  // Derive a 32-byte key from the secret using SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a text message using AES-256-GCM
 * Returns: base64 encoded string (iv:authTag:ciphertext)
 */
export function encryptMessage(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Format: base64(iv + authTag + ciphertext)
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  } catch {
    // If encryption fails, return original text (graceful degradation)
    return plaintext;
  }
}

/**
 * Decrypt a message encrypted with encryptMessage
 * Returns: original plaintext string
 */
export function decryptMessage(encryptedBase64: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedBase64, 'base64');

    // Extract IV, auth tag, and ciphertext
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    // If decryption fails, return original (might not be encrypted)
    return encryptedBase64;
  }
}

/**
 * Check if a string appears to be encrypted (base64 with sufficient length)
 */
export function isEncrypted(text: string): boolean {
  if (!text || text.length < 50) return false;
  try {
    const buf = Buffer.from(text, 'base64');
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}
