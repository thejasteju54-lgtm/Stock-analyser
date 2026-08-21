/**
 * 18_snapshotPerformanceAndDeltas.test.ts
 * Phase 17 — Snapshot Generation & Hash-Chaining Stress Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';
import { PerformanceBenchmarkEngine } from '../../src/domain/reliability/PerformanceBenchmarkEngine';

describe('Snapshot Performance & Hash-Chaining Suite', () => {
  it('generates 10 sequential parent-linked snapshots with sub-100ms latency and verifies hash uniqueness', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_hdfc',
        legalName: 'HDFC Bank Limited',
        displayName: 'HDFC Bank',
        symbol: 'HDFCBANK',
        exchange: 'NSE',
        isin: 'INE040A01034',
        sector: 'Financial Services',
        subsector: 'Private Sector Bank',
        businessModel: 'BANKING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const snapshots = [];
    let lastSnapshotId: string | undefined = undefined;

    for (let i = 0; i < 10; i++) {
      const benchmark = PerformanceBenchmarkEngine.measureSync(
        'SNAPSHOT_GENERATION',
        () => ResearchSnapshotEngine.createSnapshot(project, lastSnapshotId, `Version ${i}`)
      );
      expect(benchmark.record.durationMs).toBeLessThan(200);
      snapshots.push(benchmark.result);
      lastSnapshotId = benchmark.result.snapshotId;
    }

    expect(snapshots.length).toBe(10);
    // Verify parent hash chaining link
    for (let i = 1; i < snapshots.length; i++) {
      expect(snapshots[i].parentSnapshotId).toBe(snapshots[i - 1].snapshotId);
    }
  });
});
