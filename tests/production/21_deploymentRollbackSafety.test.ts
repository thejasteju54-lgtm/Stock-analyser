/**
 * 21_deploymentRollbackSafety.test.ts
 * Phase 18 — Deployment Rollback Safety & Version Compatibility Suite.
 */

import { describe, it, expect } from 'vitest';
import { DeploymentRollbackEngine } from '../../src/domain/operations/DeploymentRollbackEngine';

describe('Deployment Rollback Safety Suite', () => {
  it('validates rollback targets and ensures schema compatibility before initiating rollbacks', () => {
    const prevVersion = DeploymentRollbackEngine.getPreviousStableVersion();
    expect(prevVersion).toBeDefined();

    if (prevVersion) {
      const compat = DeploymentRollbackEngine.validateRollbackCompatibility(prevVersion);
      expect(compat.canRollbackSafely).toBe(true);
    }
  });

  it('rejects rollbacks to unstable versions or higher schema requirements', () => {
    const unstableVersion = {
      version: '0.0.9-beta',
      gitCommit: 'abc',
      schemaVersion: 5, // higher schema requirement
      deployedAt: '2026-08-20',
      isStable: false,
    };

    const compat = DeploymentRollbackEngine.validateRollbackCompatibility(unstableVersion);
    expect(compat.canRollbackSafely).toBe(false);
  });
});
