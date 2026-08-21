/**
 * ResearchChangeDetectionEngine.ts
 * Phase 15 — Research Snapshot Change Detection & Verdict Transition Explainer.
 */

import { ResearchSnapshot, DecisionChangeSummary, SnapshotDeltaFactor, SnapshotComparisonReport } from './SnapshotTypes';

export class ResearchChangeDetectionEngine {
  /**
   * Compares Snapshot A (earlier) vs Snapshot B (later) and generates deterministic change summaries.
   */
  public static compareSnapshots(snapshotA: ResearchSnapshot, snapshotB: ResearchSnapshot): SnapshotComparisonReport {
    const isVerdictChanged = snapshotA.decision !== snapshotB.decision;
    const changedFactors: SnapshotDeltaFactor[] = [];

    // 1. Price Change Delta
    let priceDeltaPercent: number | null = null;
    if (snapshotA.marketPrice !== null && snapshotB.marketPrice !== null && snapshotA.marketPrice > 0) {
      priceDeltaPercent = Number((((snapshotB.marketPrice - snapshotA.marketPrice) / snapshotA.marketPrice) * 100).toFixed(2));
      if (Math.abs(priceDeltaPercent) >= 5) {
        changedFactors.push({
          category: 'PRICE',
          factorName: 'Market Price Movement',
          previousValue: `₹${snapshotA.marketPrice}`,
          newValue: `₹${snapshotB.marketPrice}`,
          impactOnDecision: priceDeltaPercent > 0 ? 'DOWNGRADE' : 'UPGRADE', // Higher price reduces MoS
          explanation: `Market price shifted by ${priceDeltaPercent > 0 ? '+' : ''}${priceDeltaPercent}%.`,
        });
      }
    }

    // 2. Intrinsic Valuation Delta
    let fairValueDeltaPercent: number | null = null;
    if (snapshotA.intrinsicBaseValue !== null && snapshotB.intrinsicBaseValue !== null && snapshotA.intrinsicBaseValue > 0) {
      fairValueDeltaPercent = Number(
        (((snapshotB.intrinsicBaseValue - snapshotA.intrinsicBaseValue) / snapshotA.intrinsicBaseValue) * 100).toFixed(2)
      );
      if (Math.abs(fairValueDeltaPercent) >= 5) {
        changedFactors.push({
          category: 'VALUATION',
          factorName: 'Base Fair Value Re-anchoring',
          previousValue: `₹${snapshotA.intrinsicBaseValue}`,
          newValue: `₹${snapshotB.intrinsicBaseValue}`,
          impactOnDecision: fairValueDeltaPercent > 0 ? 'UPGRADE' : 'DOWNGRADE',
          explanation: `Intrinsic fair value updated by ${fairValueDeltaPercent > 0 ? '+' : ''}${fairValueDeltaPercent}%.`,
        });
      }
    }

    // 3. Margin of Safety Delta
    if (snapshotA.marginOfSafetyPercent !== null && snapshotB.marginOfSafetyPercent !== null) {
      const mosDelta = snapshotB.marginOfSafetyPercent - snapshotA.marginOfSafetyPercent;
      if (Math.abs(mosDelta) >= 5) {
        changedFactors.push({
          category: 'VALUATION',
          factorName: 'Margin of Safety Buffer',
          previousValue: `${snapshotA.marginOfSafetyPercent.toFixed(1)}%`,
          newValue: `${snapshotB.marginOfSafetyPercent.toFixed(1)}%`,
          impactOnDecision: mosDelta > 0 ? 'UPGRADE' : 'DOWNGRADE',
          explanation: `Actual Margin of Safety changed from ${snapshotA.marginOfSafetyPercent.toFixed(1)}% to ${snapshotB.marginOfSafetyPercent.toFixed(1)}%.`,
        });
      }
    }

    // 4. Decision Transition Summary Synthesis
    let transitionReasonSummary = 'No material change in investment verdict or underlying evidence drivers.';
    if (isVerdictChanged) {
      if (snapshotA.decision === 'BUY' && snapshotB.decision === 'HOLD') {
        transitionReasonSummary = `Verdict transitioned from BUY to HOLD due to valuation gate: ${
          changedFactors.map((f) => f.explanation).join(' ') || 'Margin of safety compressed below required threshold.'
        }`;
      } else if (snapshotA.decision === 'HOLD' && snapshotB.decision === 'BUY') {
        transitionReasonSummary = `Verdict upgraded from HOLD to BUY due to improved margin of safety and verified operational execution.`;
      } else if (snapshotB.decision === 'AVOID') {
        transitionReasonSummary = `Verdict transitioned to AVOID due to elevated risk triggers or structural thesis invalidation.`;
      } else {
        transitionReasonSummary = `Verdict transitioned from ${snapshotA.decision} to ${snapshotB.decision}. Key drivers: ${changedFactors
          .map((f) => f.factorName)
          .join(', ')}.`;
      }
    }

    const decisionChange: DecisionChangeSummary = {
      fromSnapshotId: snapshotA.snapshotId,
      toSnapshotId: snapshotB.snapshotId,
      fromVerdict: snapshotA.decision,
      toVerdict: snapshotB.decision,
      isVerdictChanged,
      fromConviction: snapshotA.convictionScore,
      toConviction: snapshotB.convictionScore,
      priceDeltaPercent,
      fairValueDeltaPercent,
      changedFactors,
      transitionReasonSummary,
    };

    return {
      snapshotA,
      snapshotB,
      decisionChange,
      comparedAt: new Date().toISOString(),
    };
  }
}
