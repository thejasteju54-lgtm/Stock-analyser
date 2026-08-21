/**
 * 10_apiSecurityGuard.test.ts
 * Phase 18 — API Payload Bounds, ID Validation & Stack Trace Protection Suite.
 */

import { describe, it, expect } from 'vitest';
import { ApiSecurityGuard } from '../../src/domain/security/ApiSecurityGuard';

describe('API Security Guard Suite', () => {
  it('blocks oversized request payloads exceeding 1MB limits', () => {
    const validSize = ApiSecurityGuard.validatePayloadSize(50000);
    expect(validSize.isValid).toBe(true);

    const oversized = ApiSecurityGuard.validatePayloadSize(2 * 1024 * 1024);
    expect(oversized.isValid).toBe(false);
    expect(oversized.errorCode).toBe('PAYLOAD_TOO_LARGE');
  });

  it('sanitizes internal errors and removes stack traces before exposing messages to clients', () => {
    const internalError = new Error('Database connection failed at pg-pool.js:145 in node_modules/pg');
    const sanitized = ApiSecurityGuard.sanitizeErrorMessage(internalError);

    expect(sanitized).not.toContain('node_modules');
    expect(sanitized).not.toContain('pg-pool.js');
    expect(sanitized).toBe('An unexpected error occurred during processing. Reference standard error code.');
  });

  it('validates resource identifiers and prevents path traversal or SQL injection patterns', () => {
    expect(ApiSecurityGuard.validateIdentifier('proj_tatamotors_fy24')).toBe(true);
    expect(ApiSecurityGuard.validateIdentifier('comp_hdfc_bank')).toBe(true);

    expect(ApiSecurityGuard.validateIdentifier('../../../etc/passwd')).toBe(false);
    expect(ApiSecurityGuard.validateIdentifier("proj_1' OR '1'='1")).toBe(false);
  });
});
