/**
 * DatabaseMigrationManager.ts
 * Phase 18 — Database Schema Versioning, Forward Migration & Rollback Strategy.
 * Ensures forward migration ordering, idempotency, and non-destructive rollbacks.
 */

export interface SchemaMigration {
  version: number;
  name: string;
  appliedAt?: string;
  up: () => void;
  down: () => void;
}

export class DatabaseMigrationManager {
  private static currentSchemaVersion: number = 0;
  private static appliedMigrations: SchemaMigration[] = [];

  private static registeredMigrations: SchemaMigration[] = [
    {
      version: 1,
      name: 'v1_initial_research_terminal_schema',
      up: () => {},
      down: () => {},
    },
    {
      version: 2,
      name: 'v2_evidence_explorer_and_snapshots',
      up: () => {},
      down: () => {},
    },
    {
      version: 3,
      name: 'v3_live_data_and_sector_frameworks',
      up: () => {},
      down: () => {},
    },
    {
      version: 4,
      name: 'v4_production_readiness_and_security_hardening',
      up: () => {},
      down: () => {},
    },
  ];

  public static reset(): void {
    this.currentSchemaVersion = 0;
    this.appliedMigrations = [];
  }

  public static runMigrations(): { appliedCount: number; currentVersion: number } {
    let applied = 0;
    for (const m of this.registeredMigrations) {
      if (m.version > this.currentSchemaVersion) {
        m.up();
        m.appliedAt = new Date().toISOString();
        this.appliedMigrations.push(m);
        this.currentSchemaVersion = m.version;
        applied++;
      }
    }
    return {
      appliedCount: applied,
      currentVersion: this.currentSchemaVersion,
    };
  }

  public static rollbackToVersion(targetVersion: number): { rolledBackCount: number; currentVersion: number } {
    let rolledBack = 0;
    const toRollback = [...this.appliedMigrations].reverse();

    for (const m of toRollback) {
      if (m.version > targetVersion) {
        m.down();
        this.appliedMigrations = this.appliedMigrations.filter((app) => app.version !== m.version);
        this.currentSchemaVersion = m.version - 1;
        rolledBack++;
      }
    }

    return {
      rolledBackCount: rolledBack,
      currentVersion: this.currentSchemaVersion,
    };
  }

  public static getCurrentVersion(): number {
    return this.currentSchemaVersion;
  }

  public static getMigrationHistory(): SchemaMigration[] {
    return [...this.appliedMigrations];
  }
}
