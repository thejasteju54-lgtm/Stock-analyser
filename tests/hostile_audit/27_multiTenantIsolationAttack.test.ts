/**
 * 27_multiTenantIsolationAttack.test.ts
 * Phase 19 — Hostile Multi-Tenant Project Isolation Attack Suite.
 */

import { describe, it, expect } from 'vitest';
import { AuthManager } from '../../src/domain/security/AuthManager';
import { RbacAuthorizationEngine } from '../../src/domain/security/RbacAuthorizationEngine';

describe('Multi-Tenant Isolation Attack Suite', () => {
  it('strictly blocks Tenant B from accessing or modifying Tenant A projects without explicit authorization', () => {
    // 1. Create sessions for two distinct users
    const { session: userA } = AuthManager.createSession('analyst_user_a', 'RESEARCH_ANALYST');
    const { session: userB } = AuthManager.createSession('analyst_user_b', 'RESEARCH_ANALYST');

    // 2. Register project belonging to User A
    RbacAuthorizationEngine.registerProjectOwner('proj_user_a_secret', 'analyst_user_a');

    // 3. User A can read and write
    const authReadA = RbacAuthorizationEngine.authorizeAction(userA, 'PROJECT_READ', 'proj_user_a_secret');
    expect(authReadA.isAuthorized).toBe(true);

    // 4. User B is strictly blocked from reading or writing
    const authReadB = RbacAuthorizationEngine.authorizeAction(userB, 'PROJECT_READ', 'proj_user_a_secret');
    expect(authReadB.isAuthorized).toBe(false);
    expect(authReadB.reason).toBeDefined();

    const authWriteB = RbacAuthorizationEngine.authorizeAction(userB, 'PROJECT_WRITE', 'proj_user_a_secret');
    expect(authWriteB.isAuthorized).toBe(false);
  });
});
