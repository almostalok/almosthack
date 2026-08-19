import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class GitHubCredentialService {
  private readonly logger = new Logger(GitHubCredentialService.name);
  private readonly encryptionKey: Buffer;

  constructor() {
    const rawKey =
      process.env.ENCRYPTION_KEY ||
      process.env.SESSION_SECRET ||
      process.env.JWT_SECRET ||
      'almosthack-dev-default-encryption-secret-key-32bytes';

    // Derive strict 32-byte key using SHA-256 digest
    this.encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Encrypts a raw GitHub access token using authenticated AES-256-GCM.
   * Format returned: `ivHex:cipherHex:tagHex`
   */
  public encryptToken(plainTextToken: string): string {
    if (!plainTextToken || typeof plainTextToken !== 'string') {
      throw new Error('Invalid token provided for encryption.');
    }

    const iv = crypto.randomBytes(12); // 96-bit nonce for AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainTextToken, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
  }

  /**
   * Decrypts an authenticated AES-256-GCM encrypted token.
   * Expects format: `ivHex:cipherHex:tagHex`
   */
  public decryptToken(encryptedString: string): string {
    if (!encryptedString || typeof encryptedString !== 'string') {
      throw new Error('Invalid encrypted credential string provided.');
    }

    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted credential format.');
    }

    const [ivHex, cipherHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(cipherHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
