/**
 * ThesisBreakerDecisionPolicy.ts
 * Phase 14 — Deterministic Policy for Thesis Breakers & Invalidation Analysis.
 */

import { ThesisBreaker } from '../risks/CatalystRiskTypes';
import { ScenarioInvalidationCondition } from '../scenarios/ScenarioTypes';
import {
  ThesisBreakerDecisionAssessment,
  ThesisBreakerDecisionItem,
  ThesisBreakerDecisionStatus,
  DecisionBlocker,
} from './VerdictTypes';

export class ThesisBreakerDecisionPolicy {
  /**
   * Evaluates Phase 12 thesis breakers and Phase 13 scenario invalidation conditions.
   */
  public static evaluateThesisBreakers(params: {
    phase12Breakers?: ThesisBreaker[];
    phase13Conditions?: ScenarioInvalidationCondition[];
  }): {
    assessment: ThesisBreakerDecisionAssessment;
    activeBlockers: DecisionBlocker[];
  } {
    const p12Breakers = params.phase12Breakers || [];
    const p13Conditions = params.phase13Conditions || [];
    const items: ThesisBreakerDecisionItem[] = [];
    const activeBlockers: DecisionBlocker[] = [];
    const now = new Date().toISOString();

    let breachedCount = 0;
    let invalidatedCount = 0;
    let approachingCount = 0;

    // Process Phase 12 Thesis Breakers
    p12Breakers.forEach((b) => {
      let status: ThesisBreakerDecisionStatus = 'SAFE';
      let isPersistent = false;

      if (b.currentStatus === 'BREACHED') {
        // Distinguish persistent vs single-period breach:
        // If monitoring frequency is quarterly and notes or period indicate multi-period failure, mark INVALIDATED
        const premiseUpper = b.premise?.toUpperCase() || '';
        const rationaleUpper = b.recommendationImpactSignal?.rationale?.toUpperCase() || '';
        const isStructural =
          premiseUpper.includes('STRUCTURAL') ||
          rationaleUpper.includes('STRUCTURAL') ||
          rationaleUpper.includes('PERSISTENT') ||
          b.recommendationImpactSignal?.severity === 'CRITICAL';

        if (isStructural) {
          status = 'THESIS_INVALIDATED';
          isPersistent = true;
          invalidatedCount++;

          activeBlockers.push({
            blockerId: `blk_tb_inv_${b.breakerId}`,
            type: 'THESIS_INVALIDATION',
            severity: 'CRITICAL',
            sourcePhase: 'PHASE_12_CATALYSTS_RISKS',
            evidenceReferences: b.sourceReferences || [],
            requiredResolution: `Re-establishment of core thesis premise: ${b.premise}`,
            currentStatus: 'ACTIVE',
            createdAt: now,
          });
        } else {
          status = 'TRIGGER_BREACHED';
          breachedCount++;

          activeBlockers.push({
            blockerId: `blk_tb_brk_${b.breakerId}`,
            type: 'THESIS_INVALIDATION',
            severity: 'HIGH',
            sourcePhase: 'PHASE_12_CATALYSTS_RISKS',
            evidenceReferences: b.sourceReferences || [],
            requiredResolution: `Metric recovery above threshold (${b.thresholdValue}) in subsequent reporting period.`,
            currentStatus: 'ACTIVE',
            createdAt: now,
          });
        }
      } else if (b.currentStatus === 'APPROACHING_TRIGGER') {
        status = 'APPROACHING_TRIGGER';
        approachingCount++;
      } else if (b.currentStatus === 'NOT_ASSESSABLE') {
        status = 'NOT_ASSESSABLE';
      }

      items.push({
        breakerId: b.breakerId,
        premise: b.premise,
        metric: b.metric,
        operator: b.operator,
        threshold: b.thresholdValue,
        currentValue: b.currentValue,
        status,
        distanceToTriggerPercent: b.bufferMarginPercent ?? null,
        isPersistentBreach: isPersistent,
        recommendationImpact: b.recommendationImpactSignal?.rationale || 'Thesis condition monitored.',
      });
    });

    // Process Phase 13 Scenario Invalidation Conditions
    p13Conditions.forEach((c) => {
      let status: ThesisBreakerDecisionStatus = 'SAFE';
      let isPersistent = false;

      if (c.status === 'INVALIDATED') {
        status = 'THESIS_INVALIDATED';
        isPersistent = true;
        invalidatedCount++;

        // Add blocker if not already present
        if (!activeBlockers.some((blk) => blk.blockerId === `blk_scen_inv_${c.conditionId}`)) {
          activeBlockers.push({
            blockerId: `blk_scen_inv_${c.conditionId}`,
            type: 'THESIS_INVALIDATION',
            severity: 'CRITICAL',
            sourcePhase: 'PHASE_13_SCENARIOS',
            evidenceReferences: [c.thesisBreakerReferenceId || c.conditionId],
            requiredResolution: `Re-alignment of scenario trajectory with Base case expectations.`,
            currentStatus: 'ACTIVE',
            createdAt: now,
          });
        }
      } else if (c.status === 'APPROACHING_TRIGGER') {
        status = 'APPROACHING_TRIGGER';
        approachingCount++;
      }

      items.push({
        breakerId: c.conditionId,
        premise: `Scenario Invalidation: ${c.scenarioType} Case ${c.metric}`,
        metric: c.metric,
        operator: c.operator,
        threshold: c.thresholdValue,
        currentValue: c.currentValue,
        status,
        distanceToTriggerPercent: c.distanceToTriggerPercent,
        isPersistentBreach: isPersistent,
        recommendationImpact: c.rationale || 'Scenario assumption validity check.',
      });
    });

    const overallBreakerState: ThesisBreakerDecisionStatus =
      invalidatedCount > 0
        ? 'THESIS_INVALIDATED'
        : breachedCount > 0
        ? 'TRIGGER_BREACHED'
        : approachingCount > 0
        ? 'APPROACHING_TRIGGER'
        : 'SAFE';

    return {
      assessment: {
        overallBreakerState,
        breachedCount,
        invalidatedCount,
        approachingCount,
        breakers: items,
        overridingActionRequired: invalidatedCount > 0,
      },
      activeBlockers,
    };
  }
}
