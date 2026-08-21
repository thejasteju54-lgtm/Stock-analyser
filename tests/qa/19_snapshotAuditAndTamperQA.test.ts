/**
 * 19_snapshotAuditAndTamperQA.test.ts
 * QA Track: Snapshot Hash-Chaining & Tamper Detection.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';
import { ResearchAuditLog } from '../../src/domain/audit/ResearchAuditLog';

describe('Snapshot Audit & Tamper Detection QA', () => {
  it('creates immutable snapshots and detects any tampering in the audit chain', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial & Passenger Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const snapshot = ResearchSnapshotEngine.createSnapshot(project);
    expect(snapshot.snapshotId).toBeDefined();
    expect(snapshot.hash.length).toBe(64);

    const auditLog = new ResearchAuditLog();
    auditLog.appendEvent('USER_ANALYST', 'SNAPSHOT_CREATED', {
      snapshotId: snapshot.snapshotId,
      verdict: 'BUY',
    });

    const verification = auditLog.verifyAuditChain();
    expect(verification.isValid).toBe(true);
    expect(verification.eventCount).toBe(1);
  });
});
