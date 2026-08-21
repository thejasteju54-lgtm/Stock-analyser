/**
 * 04_secretExposureScanner.test.ts
 * Phase 18 — Secret Exposure & Code/Bundle Audit Scanner Suite.
 */

import { describe, it, expect } from 'vitest';
import { SecretExposureScanner } from '../../src/domain/security/SecretExposureScanner';

describe('Secret Exposure Scanner Suite', () => {
  it('flags unredacted credentials matching known secret formats', () => {
    const leakedCode = 'const awsKey = "AKIAIOSFODNN7EXAMPLE"; const gitToken = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";';
    const findings = SecretExposureScanner.scanText(leakedCode, 'test_leak.ts');

    expect(findings.length).toBe(2);
    expect(findings[0].severity).toBe('P0_CRITICAL');
  });

  it('passes clean source code and redacted payloads with zero findings', () => {
    const cleanPayload = {
      project: 'HDFC Bank Research',
      auth: 'Bearer ***REDACTED***',
      status: 'HEALTHY',
    };

    const findings = SecretExposureScanner.auditObject(cleanPayload, 'report.json');
    expect(findings.length).toBe(0);
  });
});
