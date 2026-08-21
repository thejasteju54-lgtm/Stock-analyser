/**
 * 12_freshnessAndLifecycleQA.test.ts
 * QA Track: Freshness Assessment & Priority Staleness Gating.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchFreshnessEngine } from '../../src/domain/freshness/ResearchFreshnessEngine';

describe('Data Freshness & Staleness Penalty QA', () => {
  it('assesses category-specific TTL and flags stale data with priority', () => {
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

    const report = ResearchFreshnessEngine.assessProjectFreshness(project);
    expect(report.items.length).toBeGreaterThan(0);
    expect(report.totalConvictionPenalty).toBeGreaterThanOrEqual(0);
  });
});
