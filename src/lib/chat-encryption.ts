import crypto from 'crypto';

// AES-256-GCM encryption for chat messages
// Key is derived from ENCRYPTION_SECRET env var
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:v1:';

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is required');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a text message using AES-256-GCM
 * Returns: base64 encoded string with prefix to identify encrypted content
 */
export function encryptMessage(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, authTag, encrypted]);
    return PREFIX + combined.toString('base64');
  } catch (error) {
    console.error('[ENCRYPTION] Failed to encrypt message - NOT storing plaintext:', error);
    throw new Error('Message encryption failed');
  }
}

/**
 * Decrypt a message encrypted with encryptMessage
 * Returns: original plaintext string
 */
export function decryptMessage(cipherText: string): string {
  try {
    let base64Data = cipherText;

    // Handle both prefixed and non-prefixed formats (backwards compatibility)
    if (cipherText.startsWith(PREFIX)) {
      base64Data = cipherText.slice(PREFIX.length);
    } else {
      // For old format without prefix, check if it looks like base64
      // If it doesn't start with our prefix, it's probably not encrypted
      // or it's plain text - return as is
      if (cipherText.length < 20) return cipherText;
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(base64Data, 'base64');

    // Check minimum viable length for IV + authTag + at least 1 byte ciphertext
    const minLen = IV_LENGTH + AUTH_TAG_LENGTH + 1;
    if (combined.length < minLen) return cipherText;

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    // If decryption fails, return original (might not be encrypted or be plain text)
    return cipherText;
  }
}

/**
 * Check if a string is encrypted content
 * New format uses 'enc:v1:' prefix for reliable detection
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  // New format has explicit prefix
  if (text.startsWith(PREFIX)) return true;
  // Old format: base64 with minimum length check (backwards compat)
  if (text.length < 50) return false;
  try {
    const buf = Buffer.from(text, 'base64');
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Check if stored content needs migration from old format
 */
export function needsMigration(text: string): boolean {
  if (!text) return false;
  // If it's encrypted but doesn't have the prefix, it's old format
  if (!text.startsWith(PREFIX) && text.length >= 50) {
    try {
      const buf = Buffer.from(text, 'base64');
      return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
    } catch {
      return false;
    }
  }
  return false;
}
