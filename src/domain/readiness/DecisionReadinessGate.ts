/**
 * DecisionReadinessGate.ts
 * Phase 15 — Pre-Verdict Decision Readiness Gate.
 * Evaluates whether sufficient evidence exists to generate a final investment verdict.
 */

import { ResearchProject } from '../models/ResearchProject';
import { MarketPriceSourcePolicy } from '../verdict/MarketPriceSourcePolicy';

export interface DecisionReadinessReport {
  isReadyForDecision: boolean;
  gateStatus: 'PASSED' | 'WARNINGS_PRESENT' | 'BLOCKED';
  blockers: string[];
  warnings: string[];
  checkedAt: string;
}

export class DecisionReadinessGate {
  /**
   * Validates whether a project satisfies all mandatory criteria to synthesize a Phase 14 investment verdict.
   */
  public static evaluateDecisionReadiness(project: ResearchProject): DecisionReadinessReport {
    const blockers: string[] = [];
    const warnings: string[] = [];

    // 1. Current Market Price Check & Freshness
    const marketPrice = project.valuationAnalysis?.marketSnapshot.currentPrice;
    const priceDate = project.valuationAnalysis?.marketSnapshot.priceDate || new Date().toISOString().split('T')[0];

    if (marketPrice === undefined || marketPrice === null || marketPrice <= 0) {
      blockers.push('Current market price is missing; valuation comparison and decision gating cannot proceed.');
    } else {
      const priceSnapshot = MarketPriceSourcePolicy.resolveMarketPrice({
        symbol: project.company.symbol,
        price: marketPrice,
        priceDate,
      });
      const freshness = priceSnapshot.freshnessStatus;
      if (freshness === 'CRITICALLY_STALE') {
        blockers.push('Market price is critically stale (> 5 calendar days); final price-relative decision must be gated.');
      } else if (freshness === 'STALE') {
        warnings.push('Market price is stale (> 48 hours); conviction penalty (-1.5) will be applied.');
      }
    }

    // 2. Fundamental & Calculation Check
    const hasFacts = (project.facts?.length || 0) > 0;
    const hasMetrics = (project.calculatedMetrics?.length || 0) > 0;

    if (!hasFacts || !hasMetrics) {
      blockers.push('Audited financial statements and deterministic metrics are required for investment verdict.');
    }

    // 3. Forensic Assessment Check
    if (project.forensicAnalysis) {
      const riskTier = (project.forensicAnalysis as any).overallForensicRiskTier || (project.forensicAnalysis as any).forensicRiskTier;
      if (riskTier === 'CRITICAL') {
        warnings.push('Critical forensic override present: verdict will enforce deterministic AVOID with high decision certainty.');
      }
    }

    const isReadyForDecision = blockers.length === 0;
    const gateStatus: DecisionReadinessReport['gateStatus'] =
      blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'WARNINGS_PRESENT' : 'PASSED';

    return {
      isReadyForDecision,
      gateStatus,
      blockers,
      warnings,
      checkedAt: new Date().toISOString(),
    };
  }
}
