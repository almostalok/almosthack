/**
 * Centralized sensitive data redaction utility.
 * Recursively masks sensitive fields such as passwords, tokens, secrets, API keys, cookies, etc.
 */

export const SENSITIVE_FIELD_NAMES: Set<string> = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'sessiontoken',
  'authorization',
  'cookie',
  'set-cookie',
  'secret',
  'jwtsecret',
  'sessionsecret',
  'encryptionkey',
  'apikey',
  'clientsecret',
  'privatekey',
  'credential',
  'credentials',
]);

const REDACTED_PLACEHOLDER = '[REDACTED]';

/**
 * Checks whether a given property name is considered sensitive.
 */
export function isSensitiveField(fieldName: string): boolean {
  const normalized = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const sensitive of SENSITIVE_FIELD_NAMES) {
    if (normalized === sensitive || normalized.includes(sensitive)) {
      return true;
    }
  }
  return false;
}

/**
 * Deeply redacts sensitive keys from an object, array, or primitive.
 */
export function redactSensitiveData<T = unknown>(data: T, depth = 0): T {
  if (depth > 10 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // Check if string looks like an authorization header or bearer token
    if (/^bearer\s+[a-zA-Z0-9_.-]+/i.test(data)) {
      return REDACTED_PLACEHOLDER as unknown as T;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1)) as unknown as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (isSensitiveField(key)) {
        result[key] = REDACTED_PLACEHOLDER;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = redactSensitiveData(value, depth + 1);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }

  return data;
}
