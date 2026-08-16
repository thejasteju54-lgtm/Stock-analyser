import {
  FinancialFact,
  ContradictionRecord,
  DiscrepancyClassification,
} from './FinancialFactTypes';

export class ContradictionDetector {
  /**
   * Compares a list of financial facts and detects contradictions or contextual variances across documents.
   */
  public static detectContradictions(facts: FinancialFact[]): ContradictionRecord[] {
    const contradictions: ContradictionRecord[] = [];
    const seenPairs = new Set<string>();

    // Group facts by metric
    const metricGroups = new Map<string, FinancialFact[]>();
    for (const fact of facts) {
      const key = `${fact.metric}_${fact.reportingPeriod.fiscalYear || fact.reportingPeriod.rawPeriodString || fact.reportingPeriod.periodType}`;
      const group = metricGroups.get(key) || [];
      group.push(fact);
      metricGroups.set(key, group);
    }

    // Compare pairs within each metric + period bucket
    for (const group of metricGroups.values()) {
      if (group.length < 2) continue;

      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const factA = group[i];
          const factB = group[j];

          // Skip comparisons between unavailable/missing facts
          if (factA.value === undefined || factB.value === undefined) continue;

          // Avoid duplicate pair evaluations
          const pairKey = [factA.factId, factB.factId].sort().join('_');
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);

          const analysis = this.analyzePair(factA, factB);
          if (analysis.discrepancyType !== 'MATCH') {
            contradictions.push({
              id: `contradiction_${factA.factId}_${factB.factId}`,
              projectId: factA.projectId,
              metric: factA.metric,
              metricLabel: factA.metricLabel,
              reportingPeriod: factA.reportingPeriod.fiscalYear || factA.reportingPeriod.rawPeriodString || factA.reportingPeriod.periodType,
              discrepancyType: analysis.discrepancyType,
              factA,
              factB,
              difference: analysis.difference,
              percentageDiff: analysis.percentageDiff,
              explanation: analysis.explanation,
              resolutionStatus: analysis.defaultResolutionStatus,
            });
          }
        }
      }
    }

    return contradictions;
  }

  /**
   * Evaluates contextual discrepancy between two financial facts for the same metric & period.
   */
  public static analyzePair(
    factA: FinancialFact,
    factB: FinancialFact
  ): {
    discrepancyType: DiscrepancyClassification;
    difference: number;
    percentageDiff: number;
    explanation: string;
    defaultResolutionStatus: ContradictionRecord['resolutionStatus'];
  } {
    const valA = factA.value ?? 0;
    const valB = factB.value ?? 0;
    const diff = Math.abs(valA - valB);
    const avg = (Math.abs(valA) + Math.abs(valB)) / 2;
    const pctDiff = avg > 0 ? (diff / avg) * 100 : 0;

    // 1. Check Accounting Basis Variance (Consolidated vs Standalone)
    if (factA.accountingBasis !== factB.accountingBasis) {
      return {
        discrepancyType: 'ACCOUNTING_BASIS_VARIANCE',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Accounting basis variance: ${factA.documentName} is ${factA.accountingBasis} (₹${valA} Cr) while ${factB.documentName} is ${factB.accountingBasis} (₹${valB} Cr).`,
        defaultResolutionStatus: 'RESOLVED_CONSOLIDATED',
      };
    }

    // 2. Check Period Variance
    if (factA.reportingPeriod.periodType !== factB.reportingPeriod.periodType) {
      return {
        discrepancyType: 'PERIOD_VARIANCE',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Period type mismatch: ${factA.reportingPeriod.rawPeriodString || factA.reportingPeriod.periodType} vs ${factB.reportingPeriod.rawPeriodString || factB.reportingPeriod.periodType}.`,
        defaultResolutionStatus: 'OPEN',
      };
    }

    // 3. Exact or Negligible Match (<0.05%)
    if (pctDiff < 0.05) {
      return {
        discrepancyType: 'MATCH',
        difference: diff,
        percentageDiff: pctDiff,
        explanation: 'Values match across documents within 0.05% tolerance.',
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 4. Rounding Variance (0.05% - 0.5%)
    if (pctDiff <= 0.5) {
      return {
        discrepancyType: 'ROUNDING_VARIANCE',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Minor rounding variance (${pctDiff.toFixed(2)}% divergence between ₹${valA} Cr and ₹${valB} Cr across publications).`,
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 5. Unit Variance (e.g. Lakhs precision truncation)
    if (factA.originalUnit !== factB.originalUnit && pctDiff < 1.0) {
      return {
        discrepancyType: 'UNIT_VARIANCE',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Unit conversion precision difference between original units ${factA.originalUnit} and ${factB.originalUnit}.`,
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 6. Restatement in Subsequent Annual Report
    if (
      factA.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' &&
      factB.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' &&
      factA.documentName !== factB.documentName &&
      (factA.documentName.includes('AR') || factA.documentName.includes('Annual')) &&
      (factB.documentName.includes('AR') || factB.documentName.includes('Annual'))
    ) {
      return {
        discrepancyType: 'RESTATEMENT',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Financial figure restatement detected between prior annual report (${factA.documentName}) and comparative columns in subsequent report (${factB.documentName}).`,
        defaultResolutionStatus: 'RESOLVED_RESTATED',
      };
    }

    // 7. Primary Filing vs Screenshot Definition Variance
    if (
      (factA.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' && factB.provenanceSourceType === 'SCREENSHOT_DERIVED') ||
      (factA.provenanceSourceType === 'SCREENSHOT_DERIVED' && factB.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED')
    ) {
      const primary = factA.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' ? factA : factB;
      const screenshot = factA.provenanceSourceType === 'SCREENSHOT_DERIVED' ? factA : factB;
      return {
        discrepancyType: 'SOURCE_DEFINITION_VARIANCE',
        difference: Math.round(diff * 100) / 100,
        percentageDiff: Math.round(pctDiff * 100) / 100,
        explanation: `Source definition divergence: Primary filing ${primary.documentName} reported ₹${primary.value} Cr while secondary screenshot ${screenshot.documentName} reported ₹${screenshot.value} Cr.`,
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 8. Material Conflict
    return {
      discrepancyType: 'MATERIAL_CONFLICT',
      difference: Math.round(diff * 100) / 100,
      percentageDiff: Math.round(pctDiff * 100) / 100,
      explanation: `Material conflict (${pctDiff.toFixed(2)}% divergence) between ${factA.documentName} (₹${valA} Cr) and ${factB.documentName} (₹${valB} Cr) requires analyst resolution.`,
      defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
    };
  }
}
