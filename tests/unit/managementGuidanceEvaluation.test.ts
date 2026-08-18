import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';
import { ManagementStatement } from '../../src/domain/management/ManagementDnaTypes';

describe('Phase 8 — Management Guidance & Range Evaluation', () => {
  const baseStatement: ManagementStatement = {
    statementId: 'stmt_test_rev',
    companyId: 'TESTCORP',
    companySymbol: 'TESTCORP',
    managementPerson: 'P. B. Balaji (CFO)',
    role: 'CFO',
    statementDate: 'May 2023',
    periodReferenced: 'FY24',
    sourceDocumentId: 'concall_q4fy23.pdf',
    pageId: 'page_4',
    pageNumber: 4,
    sourceType: 'CONCALL_TRANSCRIPT',
    section: 'Guidance',
    rawStatement: 'For FY24, we expect consolidated revenue growth of 15–20%.',
    normalizedClaim: 'FY24 Revenue growth 15-20%',
    claimCategory: 'REVENUE_OUTLOOK',
    claimStrength: 'QUANTIFIED_GUIDANCE',
    certaintyLevel: 'HIGH_CERTAINTY',
    confidence: 95,
    evidenceReference: {
      documentId: 'concall_q4fy23.pdf',
      documentName: 'concall_q4fy23.pdf',
      pageNumber: 4,
      sourceType: 'PRIMARY_AUDITED_FILING',
      confidence: 95,
    },
  };

  it('correctly classifies outcome within range (17% vs 15-20%) as ACHIEVED', () => {
    const metrics: any[] = [
      {
        metricId: 'calc_rev_growth',
        metricCode: 'REVENUE_GROWTH',
        metricName: 'Revenue Growth YoY',
        category: 'GROWTH',
        period: 'FY24',
        value: 17,
        unit: 'PERCENT',
        formula: '((Revenue FY24 - Revenue FY23) / Revenue FY23) * 100',
        inputFactIds: ['fact_rev_fy24', 'fact_rev_fy23'],
        confidence: 95,
        calculatedAt: new Date().toISOString(),
      },
    ];

    const commitments = ManagementDnaEngine.evaluateCommitmentOutcomes([baseStatement], [], metrics, 'FY24', 'FY23');
    expect(commitments.length).toBe(1);
    expect(commitments[0].status).toBe('ACHIEVED');
    expect(commitments[0].variance).toBeCloseTo(-0.5); // 17 - 17.5
  });

  it('correctly classifies outcome above range (26.6% vs 15-20%) as ABOVE_GUIDANCE without penalty', () => {
    const metrics: any[] = [
      {
        metricId: 'calc_rev_growth',
        metricCode: 'REVENUE_GROWTH',
        metricName: 'Revenue Growth YoY',
        category: 'GROWTH',
        period: 'FY24',
        value: 26.6,
        unit: 'PERCENT',
        formula: '((Revenue FY24 - Revenue FY23) / Revenue FY23) * 100',
        inputFactIds: ['fact_rev_fy24', 'fact_rev_fy23'],
        confidence: 95,
        calculatedAt: new Date().toISOString(),
      },
    ];

    const commitments = ManagementDnaEngine.evaluateCommitmentOutcomes([baseStatement], [], metrics, 'FY24', 'FY23');
    expect(commitments.length).toBe(1);
    expect(commitments[0].status).toBe('ABOVE_GUIDANCE');
    expect(commitments[0].variance).toBeCloseTo(9.1);
  });

  it('correctly classifies outcome below range (10% vs 15-20%) as MISSED', () => {
    const metrics: any[] = [
      {
        metricId: 'calc_rev_growth',
        metricCode: 'REVENUE_GROWTH',
        metricName: 'Revenue Growth YoY',
        category: 'GROWTH',
        period: 'FY24',
        value: 10,
        unit: 'PERCENT',
        formula: '((Revenue FY24 - Revenue FY23) / Revenue FY23) * 100',
        inputFactIds: ['fact_rev_fy24', 'fact_rev_fy23'],
        confidence: 95,
        calculatedAt: new Date().toISOString(),
      },
    ];

    const commitments = ManagementDnaEngine.evaluateCommitmentOutcomes([baseStatement], [], metrics, 'FY24', 'FY23');
    expect(commitments.length).toBe(1);
    expect(commitments[0].status).toBe('MISSED');
  });

  it('preserves UNVERIFIABLE when no metric is present for comparison', () => {
    const commitments = ManagementDnaEngine.evaluateCommitmentOutcomes([baseStatement], [], [], 'FY24', 'FY23');
    expect(commitments.length).toBe(1);
    expect(commitments[0].status).toBe('UNVERIFIABLE');
  });
});
