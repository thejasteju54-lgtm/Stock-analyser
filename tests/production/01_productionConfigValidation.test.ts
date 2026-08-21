/**
 * 01_productionConfigValidation.test.ts
 * Phase 18 — Production Startup Configuration Validation Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';

describe('Production Startup Configuration Validation Suite', () => {
  it('validates a complete and secure production configuration', () => {
    const validProdEnv = {
      APP_ENV: 'PRODUCTION',
      APP_URL: 'https://terminal.indianequity.internal',
      DATABASE_URL: 'postgres://prod_user:prod_pass@pg-primary.internal:5432/equity_db',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: 'prod_master_key_32_bytes_super_secure_key!',
      SESSION_SECRET: 'prod_session_secret_32_bytes_long_random!',
      ALLOWED_ORIGINS: 'https://terminal.indianequity.internal',
      ENABLE_DEBUG_MODE: 'false',
    };

    const res = ProductionConfig.validateEnvironment(validProdEnv);
    expect(res.isValid).toBe(true);
    expect(res.environment).toBe('PRODUCTION');
    expect(res.issues.length).toBe(0);
    expect(res.config?.APP_URL).toBe('https://terminal.indianequity.internal');
  });

  it('fails safely and classifies issues when mandatory production configuration is missing or insecure', () => {
    const insecureEnv = {
      APP_ENV: 'PRODUCTION',
      APP_URL: 'http://insecure-domain.com', // Insecure HTTP
      DATABASE_URL: '', // Missing DB
      ENCRYPTION_KEY: 'short_key', // <32 chars
      SESSION_SECRET: '',
      ALLOWED_ORIGINS: '*', // Wildcard disallowed in prod
      ENABLE_DEBUG_MODE: 'true', // Debug mode disallowed in prod
    };

    const res = ProductionConfig.validateEnvironment(insecureEnv);
    expect(res.isValid).toBe(false);
    expect(res.issues.some((i) => i.category === 'INSECURE_CONFIG')).toBe(true);
    expect(res.issues.some((i) => i.category === 'MISSING_REQUIRED_CONFIG')).toBe(true);
  });
});
