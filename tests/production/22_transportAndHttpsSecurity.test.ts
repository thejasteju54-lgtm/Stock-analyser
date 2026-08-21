/**
 * 22_transportAndHttpsSecurity.test.ts
 * Phase 18 — HTTPS & Transport Security Validation Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';

describe('Transport & HTTPS Security Suite', () => {
  it('strictly requires HTTPS in production configuration', () => {
    const httpProd = ProductionConfig.validateEnvironment({
      APP_ENV: 'PRODUCTION',
      APP_URL: 'http://terminal.equity.com',
      DATABASE_URL: 'postgres://u:p@db:5432/d',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: '01234567890123456789012345678901',
      SESSION_SECRET: '01234567890123456789012345678901',
      ALLOWED_ORIGINS: 'https://terminal.equity.com',
    });

    expect(httpProd.isValid).toBe(false);
    expect(httpProd.issues.some((i) => i.message.includes('HTTPS'))).toBe(true);

    const httpsProd = ProductionConfig.validateEnvironment({
      APP_ENV: 'PRODUCTION',
      APP_URL: 'https://terminal.equity.com',
      DATABASE_URL: 'postgres://u:p@db:5432/d',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: '01234567890123456789012345678901',
      SESSION_SECRET: '01234567890123456789012345678901',
      ALLOWED_ORIGINS: 'https://terminal.equity.com',
    });

    expect(httpsProd.isValid).toBe(true);
  });
});
