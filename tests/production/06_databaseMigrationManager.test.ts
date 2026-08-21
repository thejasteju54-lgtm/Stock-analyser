/**
 * 06_databaseMigrationManager.test.ts
 * Phase 18 — Database Schema Versioning & Forward Migration Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseMigrationManager } from '../../src/domain/storage/DatabaseMigrationManager';

describe('Database Migration Manager Suite', () => {
  beforeEach(() => {
    DatabaseMigrationManager.reset();
  });

  it('applies forward migrations sequentially and tracks schema versioning', () => {
    expect(DatabaseMigrationManager.getCurrentVersion()).toBe(0);

    const res = DatabaseMigrationManager.runMigrations();
    expect(res.appliedCount).toBe(4);
    expect(res.currentVersion).toBe(4);

    // Idempotent re-run
    const reRun = DatabaseMigrationManager.runMigrations();
    expect(reRun.appliedCount).toBe(0);
    expect(reRun.currentVersion).toBe(4);
  });

  it('supports safe non-destructive rollbacks to a previous schema version', () => {
    DatabaseMigrationManager.runMigrations();
    expect(DatabaseMigrationManager.getCurrentVersion()).toBe(4);

    const rollbackRes = DatabaseMigrationManager.rollbackToVersion(2);
    expect(rollbackRes.rolledBackCount).toBe(2);
    expect(rollbackRes.currentVersion).toBe(2);
    expect(DatabaseMigrationManager.getCurrentVersion()).toBe(2);
  });
});
