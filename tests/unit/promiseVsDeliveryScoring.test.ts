import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine, MINIMUM_ELIGIBLE_COMMITMENTS } from '../../src/domain/management/ManagementDnaEngine';
import { ManagementCommitment, COMMITMENT_MATERIALITY_WEIGHTS } from '../../src/domain/management/ManagementDnaTypes';

describe('Phase 8 — Deterministic Execution Credibility Scoring', () => {
  const createMockCommitment = (
    id: string,
    status: ManagementCommitment['status'],
    materiality: ManagementCommitment['materiality'] = 'MEDIUM',
    attribution: ManagementCommitment['outcomeAttribution'] = 'MANAGEMENT_CONTROLLED'
  ): ManagementCommitment => ({
    commitmentId: id,
    statementId: `stmt_${id}`,
    companyId: 'TESTCORP',
    managementPerson: 'Management',
    commitmentType: 'GUIDANCE',
    commitmentText: 'Mock target commitment',
    targetMetric: 'Metric',
    targetPeriod: 'FY24',
    commitmentStrength: 'QUANTIFIED_GUIDANCE',
    certaintyLevel: 'HIGH_CERTAINTY',
    materiality,
    materialityWeight: COMMITMENT_MATERIALITY_WEIGHTS[materiality],
    status,
    outcomeAttribution: attribution,
    reasonCodes: attribution === 'EXTERNAL_FACTOR' ? ['EXTERNAL_FACTOR'] : [],
    reasonVerificationStatus: 'SUPPORTED',
    isRevised: false,
    revisedGuidanceHistory: [],
    outcomeMetricIds: [],
    outcomeFactIds: [],
    evidenceReferences: [],
    confidence: 95,
  });

  it('enforces minimum sample size threshold (<3 commitments -> NOT_ASSESSABLE)', () => {
    const commitments: ManagementCommitment[] = [
      createMockCommitment('c1', 'ACHIEVED', 'HIGH'),
      createMockCommitment('c2', 'ACHIEVED', 'MEDIUM'),
    ];

    const result = ManagementDnaEngine.calculateExecutionCredibility(commitments);
    expect(result.isAssessable).toBe(false);
    expect(result.ratingTier).toBe('NOT_ASSESSABLE');
    expect(result.credibilityScore).toBeNull();
    expect(result.totalEligibleCommitments).toBe(2);
    expect(result.minimumRequiredCommitments).toBe(MINIMUM_ELIGIBLE_COMMITMENTS);
  });

  it('calculates deterministic weighted score for 3+ eligible commitments', () => {
    const commitments: ManagementCommitment[] = [
      createMockCommitment('c1', 'ACHIEVED', 'HIGH'), // weight 4, points 1.0 -> 4.0
      createMockCommitment('c2', 'ABOVE_GUIDANCE', 'STRATEGIC'), // weight 6, points 1.0 -> 6.0
      createMockCommitment('c3', 'ACHIEVED', 'MEDIUM'), // weight 2, points 1.0 -> 2.0
    ];

    const result = ManagementDnaEngine.calculateExecutionCredibility(commitments);
    expect(result.isAssessable).toBe(true);
    expect(result.credibilityScore).toBe(100);
    expect(result.ratingTier).toBe('VERY_HIGH');
  });

  it('weights strategic misses appropriately vs minor misses', () => {
    const commitments: ManagementCommitment[] = [
      createMockCommitment('c1', 'ACHIEVED', 'LOW'), // weight 1, pts 1.0 -> 1.0
      createMockCommitment('c2', 'ACHIEVED', 'LOW'), // weight 1, pts 1.0 -> 1.0
      createMockCommitment('c3', 'MISSED', 'STRATEGIC'), // weight 6, pts 0.0 -> 0.0
    ];
    // Total pts = 2, Total wt = 8 -> 2/8 = 25%

    const result = ManagementDnaEngine.calculateExecutionCredibility(commitments);
    expect(result.isAssessable).toBe(true);
    expect(result.credibilityScore).toBe(25);
    expect(result.ratingTier).toBe('LOW');
  });

  it('scores documented external factor misses neutrally (0.5x credit)', () => {
    const commitments: ManagementCommitment[] = [
      createMockCommitment('c1', 'ACHIEVED', 'HIGH'), // weight 4, pts 1.0 -> 4.0
      createMockCommitment('c2', 'ACHIEVED', 'MEDIUM'), // weight 2, pts 1.0 -> 2.0
      createMockCommitment('c3', 'MISSED', 'HIGH', 'EXTERNAL_FACTOR'), // weight 4, pts 0.5 -> 2.0
    ];
    // Total pts = 4 + 2 + 2 = 8, Total wt = 4 + 2 + 4 = 10 -> 80%

    const result = ManagementDnaEngine.calculateExecutionCredibility(commitments);
    expect(result.isAssessable).toBe(true);
    expect(result.credibilityScore).toBe(80);
    expect(result.missedDueToExternalFactorsCount).toBe(1);
    expect(result.ratingTier).toBe('HIGH');
  });
});
