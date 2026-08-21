/**
 * 02_environmentIsolationGuards.test.ts
 * Phase 18 — Environment Isolation & Cross-Environment Contamination Guards Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';

describe('Environment Isolation Guards Suite', () => {
  it('prevents test defaults and development fallback from silently becoming active in production', () => {
    // Attempt validating production without any explicit values
    const blankProdEnv = { APP_ENV: 'PRODUCTION' };
    const res = ProductionConfig.validateEnvironment(blankProdEnv);

    expect(res.isValid).toBe(false);
    expect(res.config).toBeUndefined();
    // Verify required config flags triggered
    expect(res.issues.length).toBeGreaterThanOrEqual(4);
  });

  it('allows safe development defaults when explicitly running in DEVELOPMENT mode', () => {
    const devEnv = { APP_ENV: 'DEVELOPMENT' };
    const res = ProductionConfig.validateEnvironment(devEnv);

    expect(res.isValid).toBe(true);
    expect(res.config?.APP_ENV).toBe('DEVELOPMENT');
    expect(res.config?.STORAGE_DRIVER).toBe('INDEXED_DB');
  });
});
