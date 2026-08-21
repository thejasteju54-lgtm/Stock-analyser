/**
 * 08_unresolvedConflictStrictNotAssessable.test.ts
 * Phase 16 — Strict Non-Fabrication & Conflict Propagation Verification.
 */

import { describe, it, expect } from 'vitest';
import { CanonicalDataPointKey } from '../../../src/domain/dataSources/DataSourceTypes';
import { DataPointCandidate } from '../../../src/domain/dataSources/DataSelectionPolicyRegistry';
import { DataConflictEngine } from '../../../src/domain/dataSources/DataConflictEngine';

describe('Unresolved Conflict Strict Non-Fabrication (Phase 16)', () => {
  const testKey: CanonicalDataPointKey = {
    companyId: 'comp_tatamotors',
    securityId: 'INE155A01022',
    metric: 'EBITDA',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    currency: 'INR',
    unit: 'INR_CRORE',
    adjustmentBasis: 'RAW_AS_REPORTED',
  };

  it('propagates NOT_ASSESSABLE without guessing a conservative lower bound when sources conflict', () => {
    const cand1: DataPointCandidate<number> = {
      key: testKey,
      value: 69428,
      sourceId: 'SOURCE_NSE_DISCLOSURE',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T10:00:00Z',
      retrievedAt: '2024-05-10T10:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 95,
      rawPayloadHash: 'hash_1',
    };

    const cand2: DataPointCandidate<number> = {
      key: testKey,
      value: 60000, // Material discrepancy (>13%)
      sourceId: 'SOURCE_BSE_DISCLOSURE',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T10:00:00Z', // Same official publication date!
      retrievedAt: '2024-05-10T10:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 95,
      rawPayloadHash: 'hash_2',
    };

    const evaluation = DataConflictEngine.evaluateCandidates([cand1, cand2]);

    expect(evaluation.isAssessable).toBe(false);
    expect(evaluation.selected).toBeNull();
    expect(evaluation.conflictRecord?.resolutionStatus).toBe('UNRESOLVED_MATERIAL_CONFLICT');
    expect(evaluation.conflictRecord?.explanation).toContain('Material conflict between simultaneous Tier 1 primary sources');
  });
});
