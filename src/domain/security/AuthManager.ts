/**
 * AuthManager.ts
 * Phase 18 — Session & Token Security Management.
 * Validates authentication tokens, session lifetime expiry, token replay protection, and secure cookie parameters.
 */

export interface AuthSession {
  sessionId: string;
  userId: string;
  role: 'RESEARCH_ANALYST' | 'SENIOR_RESEARCH_ANALYST' | 'COMPLIANCE_OFFICER' | 'SYSTEM_ADMIN';
  token: string;
  issuedAt: number;
  expiresAt: number;
}

export interface CookieSecurityOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  path: string;
  maxAgeSeconds: number;
}

export class AuthManager {
  private static activeSessions: Map<string, AuthSession> = new Map();
  private static revokedTokens: Set<string> = new Set();
  private static sessionTtlMs: number = 3600000; // 1 hour

  public static createSession(
    userId: string,
    role: AuthSession['role']
  ): { session: AuthSession; cookieOptions: CookieSecurityOptions } {
    const now = Date.now();
    const token = `tok_${userId}_${now}_${Math.random().toString(36).substring(2)}`;
    const sessionId = `sess_${Math.random().toString(36).substring(2)}`;

    const session: AuthSession = {
      sessionId,
      userId,
      role,
      token,
      issuedAt: now,
      expiresAt: now + this.sessionTtlMs,
    };

    this.activeSessions.set(token, session);

    const cookieOptions: CookieSecurityOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/',
      maxAgeSeconds: Math.floor(this.sessionTtlMs / 1000),
    };

    return { session, cookieOptions };
  }

  public static validateToken(token?: string): { isValid: boolean; session?: AuthSession; reason?: string } {
    if (!token) {
      return { isValid: false, reason: 'UNAUTHENTICATED: No authentication token provided' };
    }

    if (this.revokedTokens.has(token)) {
      return { isValid: false, reason: 'TOKEN_REVOKED: Token has been invalidated or replayed' };
    }

    const session = this.activeSessions.get(token);
    if (!session) {
      return { isValid: false, reason: 'INVALID_TOKEN: Session not found' };
    }

    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return { isValid: false, reason: 'SESSION_EXPIRED: Authentication session expired' };
    }

    return { isValid: true, session };
  }

  public static revokeSession(token: string): void {
    this.activeSessions.delete(token);
    this.revokedTokens.add(token);
  }

  public static clear(): void {
    this.activeSessions.clear();
    this.revokedTokens.clear();
  }
}
