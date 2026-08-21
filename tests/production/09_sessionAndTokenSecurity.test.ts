/**
 * 09_sessionAndTokenSecurity.test.ts
 * Phase 18 — Session Security, Token Expiry & Cookie Guard Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthManager } from '../../src/domain/security/AuthManager';

describe('Session & Token Security Suite', () => {
  beforeEach(() => {
    AuthManager.clear();
  });

  it('generates secure session tokens with HttpOnly, Secure, and SameSite=Strict cookie options', () => {
    const { session, cookieOptions } = AuthManager.createSession('analyst_42', 'SENIOR_RESEARCH_ANALYST');

    expect(session.token.startsWith('tok_')).toBe(true);
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.secure).toBe(true);
    expect(cookieOptions.sameSite).toBe('Strict');

    const validation = AuthManager.validateToken(session.token);
    expect(validation.isValid).toBe(true);
    expect(validation.session?.userId).toBe('analyst_42');
  });

  it('rejects revoked tokens and prevents replay attacks', () => {
    const { session } = AuthManager.createSession('analyst_99', 'RESEARCH_ANALYST');

    AuthManager.revokeSession(session.token);
    const validation = AuthManager.validateToken(session.token);
    expect(validation.isValid).toBe(false);
    expect(validation.reason).toContain('TOKEN_REVOKED');
  });
});
