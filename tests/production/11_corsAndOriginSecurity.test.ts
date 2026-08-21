/**
 * 11_corsAndOriginSecurity.test.ts
 * Phase 18 — CORS Policy & Origin Whitelist Validation Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';

describe('CORS Policy & Origin Whitelist Suite', () => {
  it('validates allowed CORS origin list and strictly disallows wildcard origins in production', () => {
    const validConfig = ProductionConfig.validateEnvironment({
      APP_ENV: 'PRODUCTION',
      APP_URL: 'https://terminal.indianequity.internal',
      DATABASE_URL: 'postgres://user:pass@host:5432/db',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: '01234567890123456789012345678901',
      SESSION_SECRET: '01234567890123456789012345678901',
      ALLOWED_ORIGINS: 'https://terminal.indianequity.internal,https://analytics.internal',
    });

    expect(validConfig.isValid).toBe(true);
    expect(validConfig.config?.ALLOWED_ORIGINS).toEqual([
      'https://terminal.indianequity.internal',
      'https://analytics.internal',
    ]);

    const wildcardConfig = ProductionConfig.validateEnvironment({
      APP_ENV: 'PRODUCTION',
      APP_URL: 'https://terminal.indianequity.internal',
      DATABASE_URL: 'postgres://user:pass@host:5432/db',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: '01234567890123456789012345678901',
      SESSION_SECRET: '01234567890123456789012345678901',
      ALLOWED_ORIGINS: '*',
    });

    expect(wildcardConfig.isValid).toBe(false);
    expect(wildcardConfig.issues.some((i) => i.category === 'INSECURE_CONFIG')).toBe(true);
  });
});
