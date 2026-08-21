/**
 * DecisionConflictPolicyRegistry.ts
 * Phase 14 — Deterministic Cross-Layer Discrepancy & Conflict Resolution Policy.
 */

import { DecisionConflict, ConflictResolutionStatus } from './VerdictTypes';
import { ContradictionRecord } from '../extraction/FinancialFactTypes';

export class DecisionConflictPolicyRegistry {
  /**
   * Resolves contradictions extracted in Phase 4 or identified across analytical layers.
   */
  public static evaluateAndResolveConflicts(
    contradictions: ContradictionRecord[] = []
  ): {
    resolvedConflicts: DecisionConflict[];
    unresolvedCount: number;
    hasBlockingCriticalConflict: boolean;
  } {
    const resolvedConflicts: DecisionConflict[] = contradictions.map((c, index) => {
      const metric = c.factA.metric;
      const isMaterial = c.discrepancyType === 'MATERIAL_CONFLICT' || Math.abs(c.percentageDiff || 0) > 10.0;

      let resolutionStatus: ConflictResolutionStatus = 'UNRESOLVED';
      let resolutionReason = 'Cross-layer variance detected with conflicting evidentiary weight.';
      let preferredEvidence: string | undefined = undefined;

      // Tier 1: Primary Audited Statutory Filing vs Secondary Sources
      const isAPrimary = c.factA.documentName?.toUpperCase().includes('ANNUAL_REPORT') || c.factA.documentName?.toUpperCase().includes('AUDIT');
      const isBPrimary = c.factB.documentName?.toUpperCase().includes('ANNUAL_REPORT') || c.factB.documentName?.toUpperCase().includes('AUDIT');

      if (isAPrimary && !isBPrimary) {
        resolutionStatus = 'RESOLVED_BY_PRIMARY_SOURCE';
        resolutionReason = 'Resolved in favor of Fact A (Audited Annual Report / Statutory Filing).';
        preferredEvidence = `Fact A (${c.factA.factId}): ${c.factA.value} ${c.factA.unit}`;
      } else if (!isAPrimary && isBPrimary) {
        resolutionStatus = 'RESOLVED_BY_PRIMARY_SOURCE';
        resolutionReason = 'Resolved in favor of Fact B (Audited Annual Report / Statutory Filing).';
        preferredEvidence = `Fact B (${c.factB.factId}): ${c.factB.value} ${c.factB.unit}`;
      } else {
        // Tier 2: Fresher Data Priority
        const dateA = new Date(c.factA.extractedAt || 0).getTime();
        const dateB = new Date(c.factB.extractedAt || 0).getTime();
        const diffHours = Math.abs(dateA - dateB) / (1000 * 60 * 60);

        if (diffHours > 720) { // > 30 days fresher
          resolutionStatus = 'RESOLVED_BY_FRESHER_DATA';
          if (dateA > dateB) {
            resolutionReason = 'Resolved in favor of Fact A due to material timestamp freshness.';
            preferredEvidence = `Fact A (${c.factA.factId}): ${c.factA.value} ${c.factA.unit}`;
          } else {
            resolutionReason = 'Resolved in favor of Fact B due to material timestamp freshness.';
            preferredEvidence = `Fact B (${c.factB.factId}): ${c.factB.value} ${c.factB.unit}`;
          }
        } else if (!isMaterial) {
          // Tier 3: Non-Material Rounding / Policy
          resolutionStatus = 'NOT_MATERIAL';
          resolutionReason = 'Variance is immaterial (< 5% or minor rounding discrepancy).';
        } else {
          // Tier 4: Conservative Estimation Policy for Valuation Inputs
          resolutionStatus = 'RESOLVED_BY_POLICY';
          const valA = typeof c.factA.value === 'number' ? c.factA.value : 0;
          const valB = typeof c.factB.value === 'number' ? c.factB.value : 0;
          const conservativeVal = Math.min(valA, valB);
          resolutionReason = `Resolved using conservative lower-bound estimation (${conservativeVal}).`;
          preferredEvidence = `Conservative Bound: ${conservativeVal} ${c.factA.unit}`;
        }
      }

      return {
        conflictId: c.id || `cnf_${index}_${Date.now()}`,
        sourceLayers: [c.factA.documentName || 'Document A', c.factB.documentName || 'Document B'],
        metric,
        conflictingValues: [
          {
            source: c.factA.documentName || 'Document A',
            value: c.factA.value ?? 0,
            period: typeof c.factA.reportingPeriod === 'object' ? c.factA.reportingPeriod.fiscalYear || 'N/A' : String(c.factA.reportingPeriod || 'N/A'),
            date: c.factA.extractedAt || '',
            tier: isAPrimary ? 1 : 2,
          },
          {
            source: c.factB.documentName || 'Document B',
            value: c.factB.value ?? 0,
            period: typeof c.factB.reportingPeriod === 'object' ? c.factB.reportingPeriod.fiscalYear || 'N/A' : String(c.factB.reportingPeriod || 'N/A'),
            date: c.factB.extractedAt || '',
            tier: isBPrimary ? 1 : 2,
          },
        ],
        preferredEvidence,
        resolutionStatus,
        resolutionReason,
        confidence: 80,
        isMaterial,
      };
    });

    const unresolvedCount = resolvedConflicts.filter(
      (c) => c.resolutionStatus === 'UNRESOLVED' && c.isMaterial
    ).length;

    return {
      resolvedConflicts,
      unresolvedCount,
      hasBlockingCriticalConflict: unresolvedCount > 2,
    };
  }
}
