/**
 * 05_persistenceEngineReadiness.test.ts
 * Phase 18 — Enterprise Storage & Persistence Readiness Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PersistenceEngine } from '../../src/domain/storage/PersistenceEngine';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Persistence Engine Readiness Suite', () => {
  beforeEach(() => {
    PersistenceEngine.clear();
  });

  it('performs atomic saves with cryptographic checksums and reloads verified projects', async () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_persist',
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

    const saveRes = await PersistenceEngine.saveProjectAtomic(project);
    expect(saveRes.isSuccess).toBe(true);
    expect(saveRes.checksum).toBeDefined();

    const loadRes = PersistenceEngine.getProject(project.id);
    expect(loadRes.isSuccess).toBe(true);
    expect(loadRes.data?.company.symbol).toBe('TATAMOTORS');
    expect(loadRes.checksum).toBe(saveRes.checksum);
  });

  it('handles database connection outages and timeouts gracefully without silent data loss', async () => {
    const project = createResearchProject({
      company: {
        id: 'comp_hdfc_persist',
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

    PersistenceEngine.setSimulateOutage(true);
    const saveRes = await PersistenceEngine.saveProjectAtomic(project);
    expect(saveRes.isSuccess).toBe(false);
    expect(saveRes.error).toContain('STORAGE_UNAVAILABLE');
    expect(PersistenceEngine.getStatus()).toBe('UNAVAILABLE');

    PersistenceEngine.setSimulateOutage(false);
    expect(PersistenceEngine.getStatus()).toBe('HEALTHY');
  });
});
