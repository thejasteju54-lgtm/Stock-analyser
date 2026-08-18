import { describe, it, expect } from 'vitest';
import { ManagementCommitment } from '../../src/domain/management/ManagementDnaTypes';

describe('Phase 8 — Separation of Management-Stated vs Verified Reason', () => {
  it('preserves separate fields for management stated reason vs verified reason', () => {
    const commitment: ManagementCommitment = {
      commitmentId: 'cmt_miss_test',
      statementId: 'stmt_1',
      companyId: 'TESTCORP',
      managementPerson: 'CEO',
      commitmentType: 'GUIDANCE',
      commitmentText: 'Target revenue growth of 20%',
      targetMetric: 'Revenue Growth',
      targetPeriod: 'FY24',
      commitmentStrength: 'QUANTIFIED_GUIDANCE',
      certaintyLevel: 'HIGH_CERTAINTY',
      materiality: 'HIGH',
      materialityWeight: 4,
      status: 'MISSED',
      actualOutcomeValue: 8,
      outcomeAttribution: 'EXTERNAL_FACTOR',
      managementStatedReason: 'Sudden regulatory ban on key component imports caused production halts.',
      reasonCodes: ['REGULATORY_CHANGE', 'EXTERNAL_FACTOR'],
      evidenceSupportedReason: 'Ministry of Heavy Industries notification dated Oct 2023 mandated immediate import freeze.',
      reasonVerificationStatus: 'SUPPORTED',
      isRevised: false,
      revisedGuidanceHistory: [],
      outcomeMetricIds: ['calc_rev_growth'],
      outcomeFactIds: ['fact_rev_fy24'],
      evidenceReferences: [],
      confidence: 95,
    };

    expect(commitment.managementStatedReason).not.toEqual(commitment.evidenceSupportedReason);
    expect(commitment.reasonVerificationStatus).toBe('SUPPORTED');
    expect(commitment.reasonCodes).toContain('REGULATORY_CHANGE');
    expect(commitment.outcomeMetricIds).toContain('calc_rev_growth');
  });
});
