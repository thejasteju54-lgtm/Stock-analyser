/**
 * 18_dataIntegrityAndProvenanceQA.test.ts
 * QA Track: Non-Silent Data Mutations & Provenance Preservation.
 */

import { describe, it, expect } from 'vitest';
import { DataConflictEngine } from '../../src/domain/dataSources/DataConflictEngine';
import { DataPointCandidate } from '../../src/domain/dataSources/DataSelectionPolicyRegistry';
import { CanonicalDataPointKey } from '../../src/domain/dataSources/DataSourceTypes';

describe('Data Integrity & Provenance QA', () => {
  it('strictly flags unreconciled >2.5% discrepancies between Tier 1 sources as NOT_ASSESSABLE without guessing', () => {
    const key: CanonicalDataPointKey = {
      companyId: 'comp_tatamotors',
      securityId: 'INE155A01022',
      metric: 'REVENUE',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      periodType: 'ANNUAL_FY',
      statementBasis: 'CONSOLIDATED',
      currency: 'INR',
      unit: 'INR_CRORE',
      adjustmentBasis: 'RAW_AS_REPORTED',
    };

    const candidates: DataPointCandidate<number>[] = [
      {
        key,
        value: 10000,
        sourceId: 'PROVIDER_NSE',
        sourceTier: 'TIER_1_PRIMARY',
        evidenceType: 'AUDITED_STATUTORY',
        publicationDate: '2024-05-15T10:00:00Z',
        retrievedAt: '2024-05-15T11:00:00Z',
        verificationStatus: 'VERIFIED',
        reliabilityScore: 99,
        rawPayloadHash: 'hash_123',
      },
      {
        key,
        value: 11000, // 10% discrepancy
        sourceId: 'PROVIDER_BSE',
        sourceTier: 'TIER_1_PRIMARY',
        evidenceType: 'AUDITED_STATUTORY',
        publicationDate: '2024-05-15T10:00:00Z',
        retrievedAt: '2024-05-15T11:00:00Z',
        verificationStatus: 'VERIFIED',
        reliabilityScore: 99,
        rawPayloadHash: 'hash_456',
      },
    ];

    const result = DataConflictEngine.evaluateCandidates(candidates, 0.5);
    expect(result.isAssessable).toBe(false);
    expect(result.selected).toBeNull();
    expect(result.conflictRecord).toBeDefined();
    expect(result.conflictRecord?.resolutionStatus).toBe('UNRESOLVED_MATERIAL_CONFLICT');
  });
});
