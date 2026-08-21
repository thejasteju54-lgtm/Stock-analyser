/**
 * 20_disasterRecoveryAndBackup.test.ts
 * Phase 18 — Cryptographic Backup, Restore & Disaster Recovery Suite.
 */

import { describe, it, expect } from 'vitest';
import { DisasterRecoveryManager } from '../../src/domain/operations/DisasterRecoveryManager';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Disaster Recovery & Backup Suite', () => {
  it('creates cryptographic backup bundles and restores them with bit-level fidelity', () => {
    const project1 = createResearchProject({
      company: {
        id: 'comp_dr_1',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile',
        subsector: 'Commercial Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const project2 = createResearchProject({
      company: {
        id: 'comp_dr_2',
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

    const backup = DisasterRecoveryManager.createBackup([project1, project2]);
    expect(backup.projectCount).toBe(2);
    expect(backup.manifestChecksum.length).toBe(64);

    const restoreRes = DisasterRecoveryManager.restoreBackup(backup);
    expect(restoreRes.isSuccess).toBe(true);
    expect(restoreRes.restoredCount).toBe(2);
    expect(restoreRes.restoredProjects[0].company.symbol).toBe('TATAMOTORS');
    expect(restoreRes.restoredProjects[1].company.symbol).toBe('HDFCBANK');
  });

  it('rejects tampered or corrupted backup manifests during disaster recovery', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_dr_corrupt',
        legalName: 'Infosys Limited',
        displayName: 'Infosys',
        symbol: 'INFY',
        exchange: 'NSE',
        isin: 'INE009A01021',
        sector: 'Information Technology',
        subsector: 'IT Services',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const backup = DisasterRecoveryManager.createBackup([project]);
    // Tamper with payload
    backup.payloads[project.id] = JSON.stringify({ corrupted: true });

    const restoreRes = DisasterRecoveryManager.restoreBackup(backup);
    expect(restoreRes.isSuccess).toBe(false);
    expect(restoreRes.error).toContain('BACKUP_CORRUPTED');
  });
});
