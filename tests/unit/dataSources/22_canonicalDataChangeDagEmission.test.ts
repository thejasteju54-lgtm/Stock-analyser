/**
 * 22_canonicalDataChangeDagEmission.test.ts
 * Phase 16 — Canonical Data Change & Phase 15 DAG Integration Verification.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { LiveResearchRefreshOrchestrator } from '../../../src/domain/dataSources/LiveResearchRefreshOrchestrator';

describe('Canonical Data Change DAG Emission (Phase 16)', () => {
  it('emits data change into Phase 15 DAG and triggers surgical downstream recalculation', () => {
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
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-30T00:00:00Z',
      },
    });

    const result = LiveResearchRefreshOrchestrator.processLiveUpdate(
      project,
      'MARKET_PRICE_TICK',
      ['rawPrice', 'splitAdjustedPrice']
    );

    expect(result.affectedPhases).toContain('PHASE_10_TECHNICAL');
    expect(result.affectedPhases).toContain('PHASE_14_VERDICT');
    expect(result.affectedPhases).toContain('PHASE_15_REPORT');
    expect(result.executionReport.executedPhases.length).toBeGreaterThan(0);
  });
});
