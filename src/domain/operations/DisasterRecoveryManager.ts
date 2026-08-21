/**
 * DisasterRecoveryManager.ts
 * Phase 18 — Cryptographic Backup, Restore Verification & Disaster Recovery.
 * Generates verified backup bundles with SHA-256 manifests and tests point-in-time state recovery.
 */

import { ResearchProject } from '../models/ResearchProject';
import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';

export interface BackupBundle {
  backupId: string;
  createdAt: string;
  projectCount: number;
  payloads: Record<string, string>;
  manifestChecksum: string;
}

export interface RestoreResult {
  isSuccess: boolean;
  restoredProjects: ResearchProject[];
  restoredCount: number;
  durationMs: number;
  error?: string;
}

export class DisasterRecoveryManager {
  public static createBackup(projects: ResearchProject[]): BackupBundle {
    const payloads: Record<string, string> = {};

    for (const p of projects) {
      payloads[p.id] = CanonicalJsonSerializer.canonicalize(p);
    }

    const manifestJson = CanonicalJsonSerializer.canonicalize({
      projectCount: projects.length,
      payloads,
    });

    const manifestChecksum = CanonicalJsonSerializer.sha256(manifestJson);

    return {
      backupId: `bak_${Date.now()}`,
      createdAt: new Date().toISOString(),
      projectCount: projects.length,
      payloads,
      manifestChecksum,
    };
  }

  public static restoreBackup(bundle: BackupBundle): RestoreResult {
    const start = performance.now();

    // Verify manifest checksum integrity
    const computedManifest = CanonicalJsonSerializer.canonicalize({
      projectCount: bundle.projectCount,
      payloads: bundle.payloads,
    });

    const computedChecksum = CanonicalJsonSerializer.sha256(computedManifest);
    if (computedChecksum !== bundle.manifestChecksum) {
      return {
        isSuccess: false,
        restoredProjects: [],
        restoredCount: 0,
        durationMs: performance.now() - start,
        error: 'BACKUP_CORRUPTED: Manifest checksum mismatch during restore verification',
      };
    }

    const restoredProjects: ResearchProject[] = [];
    for (const payload of Object.values(bundle.payloads)) {
      try {
        const proj = JSON.parse(payload) as ResearchProject;
        restoredProjects.push(proj);
      } catch (e) {
        return {
          isSuccess: false,
          restoredProjects: [],
          restoredCount: 0,
          durationMs: performance.now() - start,
          error: `CORRUPT_PROJECT_PAYLOAD: ${(e as Error).message}`,
        };
      }
    }

    return {
      isSuccess: true,
      restoredProjects,
      restoredCount: restoredProjects.length,
      durationMs: performance.now() - start,
    };
  }
}
