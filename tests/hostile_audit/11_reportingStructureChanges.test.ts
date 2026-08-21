/**
 * 11_reportingStructureChanges.test.ts
 * Phase 19 — Hostile Reporting Structure Changes & Comparability Breaks Suite.
 */

import { describe, it, expect } from 'vitest';
import { CorporateActionEngine } from '../../src/domain/dataSources/CorporateActionEngine';
import { CorporateActionRecord } from '../../src/domain/dataSources/DataSourceTypes';

describe('Reporting Structure Changes Suite', () => {
  it('correctly calculates split adjustment factors for historical sessions prior to corporate actions', () => {
    const actions: CorporateActionRecord[] = [
      {
        actionId: 'act_split_1',
        companyId: 'comp_tata',
        symbol: 'TATAMOTORS',
        actionType: 'STOCK_SPLIT',
        announcementDate: '2024-04-10',
        exDate: '2024-05-01',
        effectiveDate: '2024-05-01',
        multiplier: 2.0, // 2:1 split
        source: 'BSE_OFFICIAL',
        sourceTier: 'TIER_1_PRIMARY',
        verificationStatus: 'VERIFIED',
      },
    ];

    // Session before split
    const factorBefore = CorporateActionEngine.computeSplitAdjustmentFactor(actions, '2024-04-01');
    expect(factorBefore).toBe(0.5); // Historical prices adjusted by 1/2

    // Session after split
    const factorAfter = CorporateActionEngine.computeSplitAdjustmentFactor(actions, '2024-05-15');
    expect(factorAfter).toBe(1.0);
  });
});
