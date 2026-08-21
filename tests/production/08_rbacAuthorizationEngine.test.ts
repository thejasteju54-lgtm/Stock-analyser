/**
 * 08_rbacAuthorizationEngine.test.ts
 * Phase 18 — Role-Based Access Control & Multi-Tenant Isolation Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RbacAuthorizationEngine } from '../../src/domain/security/RbacAuthorizationEngine';
import { AuthManager } from '../../src/domain/security/AuthManager';

describe('RBAC Authorization Engine Suite', () => {
  beforeEach(() => {
    RbacAuthorizationEngine.clear();
    AuthManager.clear();
  });

  it('permits authorized roles to execute assigned research actions', () => {
    const { session: analystSession } = AuthManager.createSession('analyst_1', 'RESEARCH_ANALYST');
    RbacAuthorizationEngine.registerProjectOwner('proj_101', 'analyst_1');

    const readAuth = RbacAuthorizationEngine.authorizeAction(analystSession, 'PROJECT_READ', 'proj_101');
    expect(readAuth.isAuthorized).toBe(true);

    const execAuth = RbacAuthorizationEngine.authorizeAction(analystSession, 'ANALYSIS_EXECUTE', 'proj_101');
    expect(execAuth.isAuthorized).toBe(true);
  });

  it('blocks unauthorized access between distinct user research projects and forbids restricted actions', () => {
    const { session: userA } = AuthManager.createSession('user_a', 'RESEARCH_ANALYST');
    AuthManager.createSession('user_b', 'RESEARCH_ANALYST');

    RbacAuthorizationEngine.registerProjectOwner('proj_secret_b', 'user_b');

    // User A attempts to access User B's project
    const crossAccess = RbacAuthorizationEngine.authorizeAction(userA, 'PROJECT_READ', 'proj_secret_b');
    expect(crossAccess.isAuthorized).toBe(false);
    expect(crossAccess.reason).toContain('UNAUTHORIZED_PROJECT_ACCESS');

    // Research analyst attempts admin-only configuration action
    const adminAction = RbacAuthorizationEngine.authorizeAction(userA, 'ADMIN_CONFIGURE');
    expect(adminAction.isAuthorized).toBe(false);
    expect(adminAction.reason).toContain('FORBIDDEN');
  });
});
