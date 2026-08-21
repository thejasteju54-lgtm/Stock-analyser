/**
 * SnapshotTypes.ts
 * Phase 15 — Immutable Research Snapshot & Change Detection Schemas.
 */

import { InvestmentVerdict } from '../verdict/VerdictTypes';
import { PhaseExecutionStatus } from '../workflow/WorkflowTypes';

export interface ResearchSnapshot {
  snapshotId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  createdAt: string;
  dataCutoffDate: string;
  codeVersion: string;
  gitCommit: string;
  buildId: string;
  schemaVersion: string;
  analysisVersion: string;
  policyVersions: Record<string, string>;
  documentVersions: Array<{ documentId: string; version: number; hash: string }>;
  phaseStatuses: Record<string, PhaseExecutionStatus>;
  decision: InvestmentVerdict;
  convictionScore: number;
  convictionBand: string;
  marketPrice: number | null;
  marketPriceStatus: string;
  intrinsicBaseValue: number | null;
  marginOfSafetyPercent: number | null;
  scenarioSummary: {
    bearValuation: number | null;
    baseValuation: number | null;
    bullValuation: number | null;
    expectedScenarioValue: number | null;
    areProbabilitiesPlaceholders: boolean;
    probabilityStatus: string;
  };
  hash: string; // 64 hex characters
  inputHash: string; // 64 hex characters
  outputHash: string; // 64 hex characters
  parentSnapshotId?: string;
  analystNotes?: string;
}

export interface SnapshotDeltaFactor {
  category: 'VALUATION' | 'FORENSIC' | 'MANAGEMENT' | 'RISK' | 'THESIS_BREAKER' | 'EARNINGS' | 'PRICE';
  factorName: string;
  previousValue: string | number | null;
  newValue: string | number | null;
  impactOnDecision: 'UPGRADE' | 'DOWNGRADE' | 'NEUTRAL';
  explanation: string;
}

export interface DecisionChangeSummary {
  fromSnapshotId: string;
  toSnapshotId: string;
  fromVerdict: InvestmentVerdict;
  toVerdict: InvestmentVerdict;
  isVerdictChanged: boolean;
  fromConviction: number;
  toConviction: number;
  priceDeltaPercent: number | null;
  fairValueDeltaPercent: number | null;
  changedFactors: SnapshotDeltaFactor[];
  transitionReasonSummary: string;
}

export interface SnapshotComparisonReport {
  snapshotA: ResearchSnapshot;
  snapshotB: ResearchSnapshot;
  decisionChange: DecisionChangeSummary;
  comparedAt: string;
}
