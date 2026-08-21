/**
 * 14_ssrfProtectionPolicy.test.ts
 * Phase 18 — SSRF Protection & Network Boundary Policy Suite.
 */

import { describe, it, expect } from 'vitest';
import { SsrfProtectionPolicy } from '../../src/domain/security/SsrfProtectionPolicy';

describe('SSRF Protection Policy Suite', () => {
  it('allows safe external HTTPS endpoints for authorized stock exchanges and financial portals', () => {
    const validUrl = 'https://api.nseindia.com/api/reports/filings';
    const res = SsrfProtectionPolicy.validateUrl(validUrl);
    expect(res.isAllowed).toBe(true);
  });

  it('blocks loopback, localhost, 127.0.0.1, private RFC 1918 subnets, and cloud metadata endpoints', () => {
    expect(SsrfProtectionPolicy.validateUrl('http://localhost:8080/admin').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('http://127.0.0.1:5432').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('http://10.0.0.5/api').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('http://192.168.1.1/router').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('http://172.16.0.1/secrets').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('http://169.254.169.254/latest/meta-data/').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('file:///etc/passwd').isAllowed).toBe(false);
    expect(SsrfProtectionPolicy.validateUrl('javascript:alert(1)').isAllowed).toBe(false);
  });
});
