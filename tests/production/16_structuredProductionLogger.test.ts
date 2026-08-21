/**
 * 16_structuredProductionLogger.test.ts
 * Phase 18 — Structured JSON Production Logger Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionLogger } from '../../src/domain/observability/ProductionLogger';

describe('Structured Production Logger Suite', () => {
  beforeEach(() => {
    ProductionLogger.clearBuffer();
  });

  it('outputs structured log entries with timestamps, log levels, correlation IDs, and automatic secret redaction', () => {
    ProductionLogger.setLogLevel('INFO');
    ProductionLogger.info('RESEARCH_PIPELINE', 'Pipeline execution completed for project with api_key: AIzaSyD1234567890', {
      requestId: 'req_abc123',
      projectId: 'proj_tata_01',
      durationMs: 42,
      metadata: {
        token: 'bearer super_secret_jwt_token',
        company: 'Tata Motors',
      },
    });

    const logs = ProductionLogger.getBuffer();
    expect(logs.length).toBe(1);
    expect(logs[0].level).toBe('INFO');
    expect(logs[0].component).toBe('RESEARCH_PIPELINE');
    expect(logs[0].requestId).toBe('req_abc123');
    expect(logs[0].durationMs).toBe(42);

    // Verify secret redaction inside log messages & metadata
    expect(logs[0].message).not.toContain('AIzaSyD1234567890');
    expect(logs[0].message).toContain('***REDACTED***');
    expect(logs[0].metadata?.token).toBe('***REDACTED***');
    expect(logs[0].metadata?.company).toBe('Tata Motors');
  });

  it('filters out DEBUG logs when minimum log level is configured as INFO in production', () => {
    ProductionLogger.setLogLevel('INFO');
    ProductionLogger.debug('CACHE_MANAGER', 'Cache hit on key xyz');

    const logs = ProductionLogger.getBuffer();
    expect(logs.length).toBe(0);
  });
});
