/**
 * 03_secretRedactionEngine.test.ts
 * Phase 18 — Secret Redaction & Sanitization Suite.
 */

import { describe, it, expect } from 'vitest';
import { SecretRedactionEngine } from '../../src/domain/security/SecretRedactionEngine';

describe('Secret Redaction Engine Suite', () => {
  it('redacts sensitive API keys, bearer tokens, passwords, and DB credentials from text strings', () => {
    const rawLog = 'Connected to postgres://admin:superSecretPassword123@db.prod.internal:5432 with api_key: AIzaSyD9876543210 and Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const sanitized = SecretRedactionEngine.redactString(rawLog);

    expect(sanitized).not.toContain('superSecretPassword123');
    expect(sanitized).not.toContain('AIzaSyD9876543210');
    expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(sanitized).toContain('***REDACTED***');
  });

  it('recursively scrubs secrets from nested JavaScript objects without altering non-sensitive keys', () => {
    const payload = {
      projectId: 'proj_tata_fy24',
      company: 'Tata Motors',
      securityCredentials: {
        apiKey: 'sec_key_xyz_123456789',
        password: 'Password@2026!',
        nestedAuth: {
          privateKey: '-----BEGIN RSA PRIVATE KEY-----MIIEpAIBAAKCAQEA...',
          sessionToken: 'sess_tok_998877665544332211',
        },
      },
      metadata: {
        currency: 'INR',
        exchange: 'NSE',
      },
    };

    const sanitized = SecretRedactionEngine.redactObject(payload);
    expect(sanitized.company).toBe('Tata Motors');
    expect(sanitized.metadata.exchange).toBe('NSE');
    expect(sanitized.securityCredentials.apiKey).toBe('***REDACTED***');
    expect(sanitized.securityCredentials.password).toBe('***REDACTED***');
    expect(sanitized.securityCredentials.nestedAuth.privateKey).toBe('***REDACTED***');
    expect(sanitized.securityCredentials.nestedAuth.sessionToken).toBe('***REDACTED***');
  });
});
