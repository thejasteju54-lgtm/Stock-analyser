import { describe, it, expect } from 'vitest';
import { ThesisBreakerDecisionPolicy } from '../../../src/domain/verdict/ThesisBreakerDecisionPolicy';
import { ThesisBreaker } from '../../../src/domain/risks/CatalystRiskTypes';

describe('Phase 14 — ThesisBreakerDecisionPolicy', () => {
  it('identifies safe thesis breaker environments', () => {
    const breaker: ThesisBreaker = {
      breakerId: 'tb_1',
      premise: 'EBITDA Margin must remain above 12.0%',
      invalidationCondition: 'EBITDA Margin < 12.0%',
      metric: 'EBITDA Margin',
      operator: 'LESS_THAN',
      thresholdValue: 12.0,
      thresholdType: 'PERCENTAGE',
      evaluationPeriod: 'FY24',
      baselineValue: 14.5,
      currentValue: 14.2,
      bufferMarginPercent: 18.3,
      currentStatus: 'SAFE',
      sourceReferences: ['Annual Report FY24'],
      sourceDate: '2024-05-30',
      dataDate: '2024-03-31',
      retrievedAt: new Date().toISOString(),
      freshnessStatus: 'CURRENT',
      monitoringFrequency: 'QUARTERLY',
      recommendationImpactSignal: {
        suggestedVerdictAction: 'NEUTRAL_MONITORING',
        severity: 'MODERATE',
        rationale: 'Margin is within safe buffer.',
      },
      supportingEvidence: [],
    };

    const { assessment, activeBlockers } = ThesisBreakerDecisionPolicy.evaluateThesisBreakers({
      phase12Breakers: [breaker],
    });

    expect(assessment.overallBreakerState).toBe('SAFE');
    expect(assessment.overridingActionRequired).toBe(false);
    expect(activeBlockers.length).toBe(0);
  });

  it('differentiates single-period trigger breach from persistent thesis invalidation', () => {
    const singleBreach: ThesisBreaker = {
      breakerId: 'tb_single',
      premise: 'Quarterly Volume Growth must exceed 5%',
      invalidationCondition: 'Volume Growth < 5%',
      metric: 'Volume Growth',
      operator: 'LESS_THAN',
      thresholdValue: 5.0,
      thresholdType: 'PERCENTAGE',
      evaluationPeriod: 'Q2FY25',
      baselineValue: 8.0,
      currentValue: 3.5,
      bufferMarginPercent: -30.0,
      currentStatus: 'BREACHED',
      sourceReferences: ['Q2 Earnings'],
      sourceDate: '2024-10-30',
      dataDate: '2024-09-30',
      retrievedAt: new Date().toISOString(),
      freshnessStatus: 'CURRENT',
      monitoringFrequency: 'QUARTERLY',
      recommendationImpactSignal: {
        suggestedVerdictAction: 'ELEVATE_RISK_CONVICTION',
        severity: 'HIGH',
        rationale: 'Single-period slowdown due to festive shift.',
      },
      supportingEvidence: [],
    };

    const singleResult = ThesisBreakerDecisionPolicy.evaluateThesisBreakers({
      phase12Breakers: [singleBreach],
    });

    expect(singleResult.assessment.overallBreakerState).toBe('TRIGGER_BREACHED');
    expect(singleResult.assessment.overridingActionRequired).toBe(false); // Does not force immediate AVOID
    expect(singleResult.activeBlockers.length).toBe(1);

    const structuralInvalidation: ThesisBreaker = {
      ...singleBreach,
      breakerId: 'tb_structural',
      premise: 'Structural export market access preservation',
      currentStatus: 'BREACHED',
      recommendationImpactSignal: {
        suggestedVerdictAction: 'REVIEW_FOR_DOWNGRADE',
        severity: 'CRITICAL',
        rationale: 'Persistent structural tariff elimination has invalidated overseas export business model.',
      },
    };

    const structuralResult = ThesisBreakerDecisionPolicy.evaluateThesisBreakers({
      phase12Breakers: [structuralInvalidation],
    });

    expect(structuralResult.assessment.overallBreakerState).toBe('THESIS_INVALIDATED');
    expect(structuralResult.assessment.overridingActionRequired).toBe(true); // Forces immediate AVOID override
    expect(structuralResult.activeBlockers[0].severity).toBe('CRITICAL');
  });
});
