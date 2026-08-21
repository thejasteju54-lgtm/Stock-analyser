/**
 * 06_canonicalDataPointMatching.test.ts
 * Phase 16 — Canonical DataPoint Key Isolation & Scope Enforcement.
 */

import { describe, it, expect } from 'vitest';
import {
  CanonicalDataPointKey,
  generateCanonicalDataPointKey,
} from '../../../src/domain/dataSources/DataSourceTypes';
import {
  DataPointCandidate,
  DataSelectionPolicyRegistry,
} from '../../../src/domain/dataSources/DataSelectionPolicyRegistry';

describe('Canonical DataPoint Matching (Phase 16)', () => {
  const baseKey: CanonicalDataPointKey = {
    companyId: 'comp_tatamotors',
    securityId: 'INE155A01022',
    metric: 'PAT',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    currency: 'INR',
    unit: 'INR_CRORE',
    adjustmentBasis: 'RAW_AS_REPORTED',
  };

  it('generates deterministic string keys', () => {
    const keyStr = generateCanonicalDataPointKey(baseKey);
    expect(keyStr).toBe(
      'COMP_TATAMOTORS::INE155A01022::PAT::2023-04-01::2024-03-31::ANNUAL_FY::CONSOLIDATED::INR::INR_CRORE::RAW_AS_REPORTED'
    );
  });

  it('prevents FY2024 PAT from competing against Q1 FY2025 PAT', () => {
    const candidateA: DataPointCandidate<number> = {
      key: baseKey,
      value: 27628,
      sourceId: 'MCA_XBRL_FINANCIALS',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T12:00:00Z',
      retrievedAt: '2024-05-10T12:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 98,
      rawPayloadHash: 'hash_a',
    };

    const q1Key: CanonicalDataPointKey = {
      ...baseKey,
      periodStart: '2024-04-01',
      periodEnd: '2024-06-30',
      periodType: 'QUARTERLY',
    };

    const candidateB: DataPointCandidate<number> = {
      key: q1Key,
      value: 5500,
      sourceId: 'BSE_CORPORATE_DISCLOSURES',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'UNAUDITED_DISCLOSURE',
      publicationDate: '2024-07-28T12:00:00Z', // Newer publication date!
      retrievedAt: '2024-07-28T12:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 95,
      rawPayloadHash: 'hash_b',
    };

    // Attempting to evaluate candidates with different keys MUST throw an incompatibility error
    expect(() => {
      DataSelectionPolicyRegistry.selectBestCandidate([candidateA, candidateB]);
    }).toThrow(/Incompatible CanonicalDataPointKey mismatch/);
  });

  it('prevents Standalone vs Consolidated from competing', () => {
    const standaloneKey: CanonicalDataPointKey = {
      ...baseKey,
      statementBasis: 'STANDALONE',
    };

    const candConsolidated: DataPointCandidate<number> = {
      key: baseKey,
      value: 27628,
      sourceId: 'SRC1',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T12:00:00Z',
      retrievedAt: '2024-05-10T12:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 98,
      rawPayloadHash: 'hash_1',
    };

    const candStandalone: DataPointCandidate<number> = {
      key: standaloneKey,
      value: 8200,
      sourceId: 'SRC2',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-10T12:00:00Z',
      retrievedAt: '2024-05-10T12:00:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 98,
      rawPayloadHash: 'hash_2',
    };

    expect(() => {
      DataSelectionPolicyRegistry.selectBestCandidate([candConsolidated, candStandalone]);
    }).toThrow(/Incompatible CanonicalDataPointKey mismatch/);
  });
});
