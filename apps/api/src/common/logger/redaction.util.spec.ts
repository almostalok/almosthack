import { isSensitiveField, redactSensitiveData } from './redaction.util';

describe('Redaction Utility (S7)', () => {
  describe('isSensitiveField', () => {
    it('should identify sensitive field names', () => {
      expect(isSensitiveField('password')).toBe(true);
      expect(isSensitiveField('user_password')).toBe(true);
      expect(isSensitiveField('accessToken')).toBe(true);
      expect(isSensitiveField('refreshToken')).toBe(true);
      expect(isSensitiveField('authorization')).toBe(true);
      expect(isSensitiveField('apiKey')).toBe(true);
      expect(isSensitiveField('secret')).toBe(true);
      expect(isSensitiveField('cookie')).toBe(true);
      expect(isSensitiveField('set-cookie')).toBe(true);
    });

    it('should allow non-sensitive field names', () => {
      expect(isSensitiveField('username')).toBe(false);
      expect(isSensitiveField('email')).toBe(false);
      expect(isSensitiveField('hackathonId')).toBe(false);
      expect(isSensitiveField('title')).toBe(false);
      expect(isSensitiveField('status')).toBe(false);
    });
  });

  describe('redactSensitiveData', () => {
    it('should redact sensitive properties in nested objects', () => {
      const input = {
        id: '123',
        username: 'alice',
        password: 'superSecretPassword!',
        auth: {
          accessToken: 'jwt.token.here',
          refreshToken: 'refresh.token.here',
          provider: 'github',
        },
        meta: {
          apiKey: 'pk_live_12345678',
          notes: 'Public notes',
        },
      };

      const result = redactSensitiveData(input);

      expect(result.id).toBe('123');
      expect(result.username).toBe('alice');
      expect(result.password).toBe('[REDACTED]');
      expect(result.auth.accessToken).toBe('[REDACTED]');
      expect(result.auth.refreshToken).toBe('[REDACTED]');
      expect(result.auth.provider).toBe('github');
      expect(result.meta.apiKey).toBe('[REDACTED]');
      expect(result.meta.notes).toBe('Public notes');
    });

    it('should redact Bearer tokens in string values', () => {
      const result = redactSensitiveData('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz');
      expect(result).toBe('[REDACTED]');
    });

    it('should handle arrays with sensitive items', () => {
      const input = [
        { name: 'user1', token: 'secret1' },
        { name: 'user2', token: 'secret2' },
      ];

      const result = redactSensitiveData(input);
      expect(result[0].token).toBe('[REDACTED]');
      expect(result[1].token).toBe('[REDACTED]');
      expect(result[0].name).toBe('user1');
    });

    it('should safely handle primitives and null values', () => {
      expect(redactSensitiveData(null)).toBeNull();
      expect(redactSensitiveData(undefined)).toBeUndefined();
      expect(redactSensitiveData(12345)).toBe(12345);
      expect(redactSensitiveData(true)).toBe(true);
    });
  });
});
