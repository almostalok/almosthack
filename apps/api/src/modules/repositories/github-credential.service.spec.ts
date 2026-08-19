import { GitHubCredentialService } from './github-credential.service';

describe('GitHubCredentialService (AES-256-GCM Token Encryption)', () => {
  let service: GitHubCredentialService;

  beforeEach(() => {
    service = new GitHubCredentialService();
  });

  it('should successfully encrypt and decrypt a raw GitHub token', () => {
    const rawToken = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = service.encryptToken(rawToken);

    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(rawToken);
    expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);

    const decrypted = service.decryptToken(encrypted);
    expect(decrypted).toBe(rawToken);
  });

  it('should produce unique ciphertexts for identical tokens due to random IVs', () => {
    const rawToken = 'ghp_same_token_value_for_testing';
    const encrypted1 = service.encryptToken(rawToken);
    const encrypted2 = service.encryptToken(rawToken);

    expect(encrypted1).not.toBe(encrypted2);
    expect(service.decryptToken(encrypted1)).toBe(rawToken);
    expect(service.decryptToken(encrypted2)).toBe(rawToken);
  });

  it('should fail decryption if auth tag or ciphertext is tampered with', () => {
    const rawToken = 'ghp_secret_token_123';
    const encrypted = service.encryptToken(rawToken);
    const [ivHex, cipherHex, tagHex] = encrypted.split(':');

    // Tamper cipherHex
    const tamperedCipher = cipherHex.substring(0, cipherHex.length - 2) + '00';
    const tamperedEncrypted = `${ivHex}:${tamperedCipher}:${tagHex}`;

    expect(() => service.decryptToken(tamperedEncrypted)).toThrow();
  });

  it('should throw error for invalid or malformed encrypted string', () => {
    expect(() => service.decryptToken('invalid-encrypted-string')).toThrow();
    expect(() => service.decryptToken('')).toThrow();
  });
});
