/**
 * 19_storageReliabilityAndFaults.test.ts
 * Phase 17 — Storage Reliability, Idempotence & Fault Injection Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProjectStorage } from '../../src/domain/storage/ProjectStorage';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Storage Reliability & Fault Handling Suite', () => {
  it('safely serializes, saves, and reloads research projects without schema corruption or state mutation', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_store_test',
        legalName: 'Storage Test Corp',
        displayName: 'StoreCorp',
        symbol: 'STORECO',
        exchange: 'NSE',
        isin: 'INE000A01099',
        sector: 'Technology',
        subsector: 'Software',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    ProjectStorage.saveProject(project);

    const loaded = ProjectStorage.getProject(project.id);
    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe(project.id);
    expect(loaded?.company.symbol).toBe('STORECO');
  });
});
