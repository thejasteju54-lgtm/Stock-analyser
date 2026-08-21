/**
 * 06_sourceConflictHierarchy.test.ts
 * Phase 19 — Hostile Multi-Source Evidence Conflicts & Hierarchy Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataConflictEngine } from '../../src/domain/dataSources/DataConflictEngine';
import { DataPointCandidate } from '../../src/domain/dataSources/DataSelectionPolicyRegistry';

describe('Source Conflict Hierarchy Suite', () => {
  it('detects numerical disagreements between primary statutory filings and news/secondary sources and records unresolved conflicts', () => {
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

    const candidatePrimary: DataPointCandidate<number> = {
      key,
      sourceId: 'BSE_CORPORATE_DISCLOSURES',
      sourceTier: 'TIER_1_PRIMARY',
      evidenceType: 'AUDITED_STATUTORY',
      publicationDate: '2024-05-15T10:00:00Z',
      retrievedAt: '2024-05-15T10:30:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 95,
      rawPayloadHash: 'hash_primary',
      value: 10500, // Audited PAT
    };

    const candidateSecondary: DataPointCandidate<number> = {
      key,
      sourceId: 'BLOOMBERG_REUTERS_AGGREGATOR',
      sourceTier: 'TIER_2_VERIFIED_SECONDARY',
      evidenceType: 'VERIFIED_DATABASE',
      publicationDate: '2024-05-15T12:00:00Z',
      retrievedAt: '2024-05-15T12:30:00Z',
      verificationStatus: 'VERIFIED',
      reliabilityScore: 85,
      rawPayloadHash: 'hash_sec',
      value: 11200, // Discrepant secondary estimate
    };

    const evaluation = DataConflictEngine.evaluateCandidates([candidatePrimary, candidateSecondary]);
    expect(evaluation.isAssessable).toBe(true);
    expect(evaluation.selected?.sourceTier).toBe('TIER_1_PRIMARY');
    expect(evaluation.selected?.value).toBe(10500);
  });
});
