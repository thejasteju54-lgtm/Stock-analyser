/**
 * 12_restatementSupersession.test.ts
 * Phase 19 — Hostile Financial Restatements & Supersession Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSelectionPolicyRegistry, DataPointCandidate } from '../../src/domain/dataSources/DataSelectionPolicyRegistry';

describe('Financial Restatements & Supersession Suite', () => {
  it('prefers newer restated official filings over older as-reported filings for the exact same canonical datapoint key', () => {
    const key = {
      companyId: 'comp_tata',
      securityId: 'TATAMOTORS',
      metric: 'PAT',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      periodType: 'ANNUAL_FY' as const,
      statementBasis: 'CONSOLIDATED' as const,
      currency: 'INR' as const,
      unit: 'INR_CRORE' as const,
      adjustmentBasis: 'RAW_AS_REPORTED' as const,
    };

    const asReported: DataPointCandidate<number> = {
      key,
      value: 10000,
      sourceId: 'BSE_XBRL_FILING_V1',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-15T10:00:00Z',
      retrievedAt: '2024-05-15T11:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 95,
      rawPayloadHash: 'hash_v1',
    };

    const restated: DataPointCandidate<number> = {
      key,
      value: 9800, // Restated in FY25 annual report
      sourceId: 'BSE_XBRL_FILING_V2',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2025-05-20T10:00:00Z', // Newer publication date
      retrievedAt: '2025-05-20T11:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 98,
      rawPayloadHash: 'hash_v2',
    };

    const result = DataSelectionPolicyRegistry.selectBestCandidate([asReported, restated]);
    expect(result.selected).toBeDefined();
    expect(result.selected?.value).toBe(9800);
    expect(result.selected?.sourceId).toBe('BSE_XBRL_FILING_V2');
  });
});
