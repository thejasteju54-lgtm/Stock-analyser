/**
 * 12_securityHeadersConfig.test.ts
 * Phase 18 — Enterprise HTTP Security Headers Suite.
 */

import { describe, it, expect } from 'vitest';
import { SecurityHeadersConfig } from '../../src/domain/security/SecurityHeadersConfig';

describe('HTTP Security Headers Suite', () => {
  it('provides complete production security headers including HSTS, CSP, X-Frame-Options, and X-Content-Type-Options', () => {
    const headers = SecurityHeadersConfig.getProductionHeaders();

    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');

    const validation = SecurityHeadersConfig.validateHeaders(headers as unknown as Record<string, string>);
    expect(validation.isValid).toBe(true);
    expect(validation.missingHeaders.length).toBe(0);
  });
});
