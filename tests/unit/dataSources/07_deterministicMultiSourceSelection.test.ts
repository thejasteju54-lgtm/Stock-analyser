/**
 * 07_deterministicMultiSourceSelection.test.ts
 * Phase 16 — Deterministic Multi-Source Selection & Order Independence Verification.
 */

import { describe, it, expect } from 'vitest';
import {
  CanonicalDataPointKey,
} from '../../../src/domain/dataSources/DataSourceTypes';
import {
  DataPointCandidate,
  DataSelectionPolicyRegistry,
} from '../../../src/domain/dataSources/DataSelectionPolicyRegistry';

describe('Deterministic Multi-Source Selection (Phase 16)', () => {
  const testKey: CanonicalDataPointKey = {
    companyId: 'comp_tatamotors',
    securityId: 'INE155A01022',
    metric: 'NET_DEBT',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    currency: 'INR',
    unit: 'INR_CRORE',
    adjustmentBasis: 'RAW_AS_REPORTED',
  };

  const candA: DataPointCandidate<number> = {
    key: testKey,
    value: 100,
    sourceId: 'SOURCE_A_BLOOMBERG',
    sourceTier: 'TIER_2_VERIFIED_SECONDARY',
    evidenceType: 'VERIFIED_DATABASE',
    publicationDate: '2024-05-15T00:00:00Z',
    retrievedAt: '2024-05-15T01:00:00Z',
    verificationStatus: 'VERIFIED',
    reliabilityScore: 85,
    rawPayloadHash: 'hash_a',
  };

  const candB: DataPointCandidate<number> = {
    key: testKey,
    value: 100,
    sourceId: 'SOURCE_B_REUTERS',
    sourceTier: 'TIER_2_VERIFIED_SECONDARY',
    evidenceType: 'VERIFIED_DATABASE',
    publicationDate: '2024-05-15T00:00:00Z',
    retrievedAt: '2024-05-15T01:00:00Z',
    verificationStatus: 'VERIFIED',
    reliabilityScore: 85,
    rawPayloadHash: 'hash_b',
  };

  const candC: DataPointCandidate<number> = {
    key: testKey,
    value: 130, // Outlier
    sourceId: 'SOURCE_C_MEDIA',
    sourceTier: 'TIER_2_VERIFIED_SECONDARY',
    evidenceType: 'SECONDARY_MEDIA',
    publicationDate: '2024-05-15T00:00:00Z',
    retrievedAt: '2024-05-15T01:00:00Z',
    verificationStatus: 'VERIFIED',
    reliabilityScore: 70,
    rawPayloadHash: 'hash_c',
  };

  it('selects consensus cluster when evaluating 3 candidates (A=100, B=100, C=130)', () => {
    const res = DataSelectionPolicyRegistry.selectBestCandidate([candA, candB, candC]);
    expect(res.status).toBe('RESOLVED_CONSENSUS');
    expect(res.selected?.value).toBe(100);
  });

  it('produces identical output regardless of input array permutation', () => {
    const perm1 = [candA, candB, candC];
    const perm2 = [candC, candA, candB];
    const perm3 = [candB, candC, candA];
    const perm4 = [candC, candB, candA];

    const res1 = DataSelectionPolicyRegistry.selectBestCandidate(perm1);
    const res2 = DataSelectionPolicyRegistry.selectBestCandidate(perm2);
    const res3 = DataSelectionPolicyRegistry.selectBestCandidate(perm3);
    const res4 = DataSelectionPolicyRegistry.selectBestCandidate(perm4);

    expect(res1.status).toBe(res2.status);
    expect(res2.status).toBe(res3.status);
    expect(res3.status).toBe(res4.status);

    expect(res1.selected?.value).toBe(100);
    expect(res2.selected?.value).toBe(100);
    expect(res3.selected?.value).toBe(100);
    expect(res4.selected?.value).toBe(100);
  });

  it('strictly prefers Tier 1 Primary statutory filing over fresher Tier 2 secondary estimates', () => {
    const tier1Candidate: DataPointCandidate<number> = {
      key: testKey,
      value: 95,
      sourceId: 'MCA_XBRL_PRIMARY',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T00:00:00Z',
      retrievedAt: '2024-05-10T00:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 99,
      rawPayloadHash: 'hash_t1',
    };

    const fresherTier2: DataPointCandidate<number> = {
      ...candA,
      publicationDate: '2024-06-01T00:00:00Z', // Much newer
      value: 120,
    };

    const res = DataSelectionPolicyRegistry.selectBestCandidate([fresherTier2, tier1Candidate]);
    expect(res.status).toBe('RESOLVED_AUTHORITATIVE');
    expect(res.selected?.sourceTier).toBe('TIER_1_PRIMARY');
    expect(res.selected?.value).toBe(95);
  });
});
