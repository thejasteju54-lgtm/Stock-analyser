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
   * Evaluates contextual discrepancy between two financial facts using Contextual Priority Architecture.
   * Contextual compatibility is evaluated BEFORE applying numerical divergence heuristics.
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
    const roundedDiff = Math.round(diff * 100) / 100;
    const roundedPctDiff = Math.round(pctDiff * 100) / 100;

    // =========================================================================
    // LAYER 1: CONTEXTUAL COMPATIBILITY CHECKS (Priority over numerical diff)
    // =========================================================================

    // 1. Company Identity Mismatch
    if (factA.companySymbol && factB.companySymbol && factA.companySymbol !== factB.companySymbol) {
      return {
        discrepancyType: 'UNRESOLVED',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Company entity mismatch: Comparing ${factA.companySymbol} (${factA.documentName}) with ${factB.companySymbol} (${factB.documentName}).`,
        defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
      };
    }

    // 2. Metric Identity Mismatch
    if (factA.metric !== factB.metric) {
      return {
        discrepancyType: 'SOURCE_DEFINITION_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Metric identity mismatch: Comparing ${factA.metricLabel} against ${factB.metricLabel}.`,
        defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
      };
    }

    // 3. Reporting Period & Fiscal Year Mismatch (Annual vs Quarterly / Period Year)
    const periodA = factA.reportingPeriod;
    const periodB = factB.reportingPeriod;
    const isDifferentPeriodType = periodA.periodType !== periodB.periodType;
    const isDifferentFY = periodA.fiscalYear && periodB.fiscalYear && periodA.fiscalYear !== periodB.fiscalYear;
    const isDifferentQuarter = periodA.quarter && periodB.quarter && periodA.quarter !== periodB.quarter;

    if (isDifferentPeriodType || isDifferentFY || isDifferentQuarter) {
      return {
        discrepancyType: 'PERIOD_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Period mismatch: ${periodA.rawPeriodString || periodA.fiscalYear || periodA.periodType} vs ${periodB.rawPeriodString || periodB.fiscalYear || periodB.periodType}.`,
        defaultResolutionStatus: 'OPEN',
      };
    }

    // 4. Accounting Basis Variance (Consolidated vs Standalone)
    // Even if numerical divergence is massive (e.g. 50,000 Cr), this is an accounting basis variance.
    if (factA.accountingBasis !== factB.accountingBasis) {
      return {
        discrepancyType: 'ACCOUNTING_BASIS_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Accounting basis variance: ${factA.documentName} is ${factA.accountingBasis} (₹${valA} Cr) while ${factB.documentName} is ${factB.accountingBasis} (₹${valB} Cr).`,
        defaultResolutionStatus: 'RESOLVED_CONSOLIDATED',
      };
    }

    // 5. Restatement in Subsequent Audited Reports
    // When both are primary filings for the same reporting period, but one comes from a subsequent fiscal year's filing or contains restatement keywords
    const extractDocYear = (docName: string): number | null => {
      const match = docName.match(/FY(\d{2,4})/i) || docName.match(/20(\d{2})/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num < 100 ? 2000 + num : num;
      }
      return null;
    };

    const docYearA = extractDocYear(factA.documentName);
    const docYearB = extractDocYear(factB.documentName);
    const isSubsequentDocYear = docYearA !== null && docYearB !== null && docYearA !== docYearB;
    const hasRestatementKeyword =
      factA.documentName.toLowerCase().includes('restate') ||
      factB.documentName.toLowerCase().includes('restate') ||
      (factA.sourceReference.tableHeader && factA.sourceReference.tableHeader.toLowerCase().includes('restate')) ||
      (factB.sourceReference.tableHeader && factB.sourceReference.tableHeader.toLowerCase().includes('restate'));

    const isDocADifferentFromDocB = factA.documentId !== factB.documentId || factA.documentName !== factB.documentName;
    const isBothPrimary =
      factA.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' &&
      factB.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED';

    if (isDocADifferentFromDocB && isBothPrimary && (isSubsequentDocYear || hasRestatementKeyword) && pctDiff > 0.05) {
      return {
        discrepancyType: 'RESTATEMENT',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Financial figure restatement detected between prior annual report (${factA.documentName}) and comparative columns in subsequent report (${factB.documentName}).`,
        defaultResolutionStatus: 'RESOLVED_RESTATED',
      };
    }

    // 6. Currency Mismatch
    const currA = factA.normalizedCurrency || factA.originalCurrency;
    const currB = factB.normalizedCurrency || factB.originalCurrency;
    if (currA && currB && currA !== currB) {
      return {
        discrepancyType: 'UNIT_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Currency mismatch: ${currA} vs ${currB}. Foreign currency must not be silently reconciled without explicit conversion metadata.`,
        defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
      };
    }

    // 7. Unit Mismatch & Unit Conversion Precision Variance
    if (factA.originalUnit !== factB.originalUnit) {
      // If original units differed (e.g. Lakhs vs Crores) and the values differ slightly due to truncation
      if (pctDiff < 2.0) {
        return {
          discrepancyType: 'UNIT_VARIANCE',
          difference: roundedDiff,
          percentageDiff: roundedPctDiff,
          explanation: `Unit conversion precision difference between original units ${factA.originalUnit} and ${factB.originalUnit}.`,
          defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
        };
      }
    }

    // 8. Source Type & Definition Divergence (Primary Filing vs Screenshot / Third-party)
    const isScreenshotA = factA.provenanceSourceType === 'SCREENSHOT_DERIVED';
    const isScreenshotB = factB.provenanceSourceType === 'SCREENSHOT_DERIVED';
    if ((!isScreenshotA && isScreenshotB) || (isScreenshotA && !isScreenshotB)) {
      const primary = isScreenshotA ? factB : factA;
      const screenshot = isScreenshotA ? factA : factB;
      return {
        discrepancyType: 'SOURCE_DEFINITION_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Source definition divergence: Primary filing ${primary.documentName} reported ₹${primary.value} Cr while secondary screenshot ${screenshot.documentName} reported ₹${screenshot.value} Cr.`,
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // =========================================================================
    // LAYER 2: NUMERICAL DIVERGENCE HEURISTICS (Only evaluated within same context)
    // =========================================================================

    // 9. Exact / Negligible Match (<0.05% tolerance)
    if (pctDiff < 0.05) {
      return {
        discrepancyType: 'MATCH',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: 'Values match across documents within 0.05% tolerance.',
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 10. Rounding Variance (0.05% - 0.5%)
    if (pctDiff <= 0.5) {
      return {
        discrepancyType: 'ROUNDING_VARIANCE',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Minor rounding variance (${pctDiff.toFixed(2)}% divergence between ₹${valA} Cr and ₹${valB} Cr across publications).`,
        defaultResolutionStatus: 'RESOLVED_PREFER_PRIMARY',
      };
    }

    // 11. Genuine Material Conflict vs Unresolved
    // Check if both sources are high confidence, verified primary facts with identical context
    const isHighConfidenceA = factA.confidence >= 80 && factA.verificationStatus === 'VERIFIED';
    const isHighConfidenceB = factB.confidence >= 80 && factB.verificationStatus === 'VERIFIED';
    const isSameExtractionMethod = factA.extractionMethod === factB.extractionMethod;

    if (isHighConfidenceA && isHighConfidenceB && isSameExtractionMethod) {
      return {
        discrepancyType: 'MATERIAL_CONFLICT',
        difference: roundedDiff,
        percentageDiff: roundedPctDiff,
        explanation: `Material conflict (${pctDiff.toFixed(2)}% divergence) between verified sources ${factA.documentName} (₹${valA} Cr) and ${factB.documentName} (₹${valB} Cr) requires analyst resolution.`,
        defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
      };
    }

    // 12. Unresolved Discrepancy
    // When reasons for divergence cannot be deterministically proved, do not force MATERIAL_CONFLICT
    return {
      discrepancyType: 'UNRESOLVED',
      difference: roundedDiff,
      percentageDiff: roundedPctDiff,
      explanation: `Unresolved discrepancy (${pctDiff.toFixed(2)}% divergence) between ${factA.documentName} (₹${valA} Cr) and ${factB.documentName} (₹${valB} Cr). Confidence, extraction method, or context is insufficient to determine definitive classification.`,
      defaultResolutionStatus: 'REQUIRES_ANALYST_CHOICE',
    };
  }
}
