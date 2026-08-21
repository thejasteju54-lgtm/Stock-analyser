/**
 * DeploymentRollbackEngine.ts
 * Phase 18 — Zero-Downtime Deployment & Safe Rollback Management.
 * Manages version compatibility checks, rollback validations, and blue-green/canary deployment safety.
 */

export interface DeploymentVersionMetadata {
  version: string;
  gitCommit: string;
  schemaVersion: number;
  deployedAt: string;
  isStable: boolean;
}

export class DeploymentRollbackEngine {
  private static versionHistory: DeploymentVersionMetadata[] = [
    {
      version: '0.1.0',
      gitCommit: 'prod_initial_commit',
      schemaVersion: 4,
      deployedAt: '2026-08-21T00:00:00Z',
      isStable: true,
    },
    {
      version: '0.0.9',
      gitCommit: 'prod_prev_commit',
      schemaVersion: 3,
      deployedAt: '2026-08-20T00:00:00Z',
      isStable: true,
    },
  ];

  public static recordDeployment(metadata: DeploymentVersionMetadata): void {
    this.versionHistory.unshift(metadata);
  }

  public static getPreviousStableVersion(): DeploymentVersionMetadata | undefined {
    return this.versionHistory.find((v, idx) => idx > 0 && v.isStable);
  }

  public static validateRollbackCompatibility(targetVersion: DeploymentVersionMetadata): {
    canRollbackSafely: boolean;
    reason?: string;
  } {
    if (!targetVersion.isStable) {
      return {
        canRollbackSafely: false,
        reason: 'Target rollback version is not marked as stable',
      };
    }

    const current = this.versionHistory[0];
    if (targetVersion.schemaVersion > current.schemaVersion) {
      return {
        canRollbackSafely: false,
        reason: 'Cannot rollback to a version with a higher schema requirement',
      };
    }

    return { canRollbackSafely: true };
  }
}
