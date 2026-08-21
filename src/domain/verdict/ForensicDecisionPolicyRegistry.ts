/**
 * ForensicDecisionPolicyRegistry.ts
 * Phase 14 — Deterministic Policy Registry for Forensic Decision Adjustments & Blockers.
 */

import { ForensicAnalysisReport } from '../forensics/ForensicAnalysisTypes';
import {
  ForensicDecisionAdjustment,
  DecisionBlocker,
} from './VerdictTypes';

export class ForensicDecisionPolicyRegistry {
  /**
   * Evaluates Phase 7 forensic findings and determines the decision adjustment state.
   */
  public static evaluateForensicDecision(
    report?: ForensicAnalysisReport
  ): {
    adjustment: ForensicDecisionAdjustment;
    activeBlockers: DecisionBlocker[];
  } {
    if (!report || !report.findings) {
      return {
        adjustment: {
          forensicState: 'NOT_ASSESSABLE',
          severityAdjustmentApplied: false,
          requiredMoSBufferPercent: 0,
          activeRedFlagCount: 0,
          criticalRedFlagCount: 0,
          cashDivergenceRatio: null,
          confidenceCap: 5.0,
          decisionImpactSummary: 'Forensic analysis data is missing or incomplete.',
        },
        activeBlockers: [],
      };
    }

    const findings = report.findings;
    const criticalFindings = findings.filter(
      (f) => f.severity === 'CRITICAL' && f.status !== 'RESOLVED'
    );
    const highFindings = findings.filter(
      (f) => f.severity === 'HIGH' && f.status !== 'RESOLVED'
    );
    const watchFindings = findings.filter(
      (f) =>
        (f.severity === 'MEDIUM' || f.severity === 'HIGH') &&
        (f.status === 'POTENTIAL_CONCERN' || f.status === 'REQUIRES_INVESTIGATION')
    );

    const activeRedFlagCount = criticalFindings.length + highFindings.length + watchFindings.length;
    const criticalRedFlagCount = criticalFindings.length;

    // Check for Critical Override Conditions:
    // 1. Confirmed fraud probe / regulatory action
    // 2. Auditor resignation citing lack of information / accounting disputes
    // 3. Severe related-party siphoning or confirmed material restatement
    const hasCriticalOverride = criticalFindings.some((f) => {
      const code = f.signal?.toUpperCase() || '';
      const title = f.title?.toUpperCase() || '';
      return (
        code.includes('AUDITOR_RESIGNATION') ||
        code.includes('FRAUD') ||
        code.includes('RESTATEMENT_MATERIAL') ||
        code.includes('SIPHONING') ||
        title.includes('AUDITOR RESIGNATION') ||
        title.includes('FRAUD') ||
        title.includes('RESTATEMENT')
      );
    });

    const now = new Date().toISOString();
    const activeBlockers: DecisionBlocker[] = [];

    if (hasCriticalOverride || criticalRedFlagCount >= 2) {
      const blocker: DecisionBlocker = {
        blockerId: `blk_forensic_crit_${Date.now()}`,
        type: 'CRITICAL_FORENSIC',
        severity: 'CRITICAL',
        sourcePhase: 'PHASE_7_FORENSICS',
        evidenceReferences: criticalFindings.map((f) => f.findingId),
        requiredResolution:
          'Statutory independent forensic audit clean-chit and formal regulatory clearance.',
        currentStatus: 'ACTIVE',
        createdAt: now,
      };
      activeBlockers.push(blocker);

      return {
        adjustment: {
          forensicState: 'CRITICAL_OVERRIDE',
          severityAdjustmentApplied: true,
          requiredMoSBufferPercent: 0,
          activeRedFlagCount,
          criticalRedFlagCount,
          cashDivergenceRatio: null,
          confidenceCap: 10.0, // Fixed 10/10 decision certainty to AVOID
          decisionImpactSummary:
            'Critical forensic red flags identified. Automatic overriding AVOID applied.',
        },
        activeBlockers,
      };
    }

    if (criticalRedFlagCount === 1) {
      const blocker: DecisionBlocker = {
        blockerId: `blk_forensic_sev_${Date.now()}`,
        type: 'CRITICAL_FORENSIC',
        severity: 'HIGH',
        sourcePhase: 'PHASE_7_FORENSICS',
        evidenceReferences: criticalFindings.map((f) => f.findingId),
        requiredResolution:
          'Clarification of critical finding through verified audited statutory disclosures.',
        currentStatus: 'ACTIVE',
        createdAt: now,
      };
      activeBlockers.push(blocker);

      return {
        adjustment: {
          forensicState: 'SEVERE_CONCERN',
          severityAdjustmentApplied: true,
          requiredMoSBufferPercent: 10.0,
          activeRedFlagCount,
          criticalRedFlagCount,
          cashDivergenceRatio: null,
          confidenceCap: 4.0,
          decisionImpactSummary:
            'Severe forensic concern identified. Disqualifies BUY; enforces AVOID or strict HOLD.',
        },
        activeBlockers,
      };
    }

    if (highFindings.length >= 3) {
      const blocker: DecisionBlocker = {
        blockerId: `blk_forensic_mat_${Date.now()}`,
        type: 'CRITICAL_FORENSIC',
        severity: 'MODERATE',
        sourcePhase: 'PHASE_7_FORENSICS',
        evidenceReferences: highFindings.map((f) => f.findingId),
        requiredResolution:
          'Reconciliation of multiple high-severity forensic anomalies across reporting periods.',
        currentStatus: 'ACTIVE',
        createdAt: now,
      };
      activeBlockers.push(blocker);

      return {
        adjustment: {
          forensicState: 'MATERIAL_CONCERN',
          severityAdjustmentApplied: true,
          requiredMoSBufferPercent: 5.0,
          activeRedFlagCount,
          criticalRedFlagCount: 0,
          cashDivergenceRatio: null,
          confidenceCap: 5.5,
          decisionImpactSummary:
            'Material forensic concerns present. Disqualifies BUY; enforces HOLD fallback.',
        },
        activeBlockers,
      };
    }

    if (highFindings.length > 0 || watchFindings.length >= 2) {
      return {
        adjustment: {
          forensicState: 'WATCH',
          severityAdjustmentApplied: true,
          requiredMoSBufferPercent: 3.0,
          activeRedFlagCount,
          criticalRedFlagCount: 0,
          cashDivergenceRatio: null,
          confidenceCap: 8.0,
          decisionImpactSummary:
            'Forensic watch items noted with operational context. BUY eligible with +3.0% MoS buffer.',
        },
        activeBlockers,
      };
    }

    // Clean forensic profile
    return {
      adjustment: {
        forensicState: 'NO_MATERIAL_CONCERN',
        severityAdjustmentApplied: false,
        requiredMoSBufferPercent: 0.0,
        activeRedFlagCount,
        criticalRedFlagCount: 0,
        cashDivergenceRatio: null,
        confidenceCap: 10.0,
        decisionImpactSummary: 'Clean forensic profile with no material accounting red flags.',
      },
      activeBlockers,
    };
  }
}
