/**
 * ResearchOverrideRecord.ts
 * Phase 15 — Analyst Override Ledger & Provenance Schema.
 */

import { PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';

export interface ResearchOverrideRecord {
  overrideId: string;
  actor: string;
  timestamp: string;
  sourcePhase: PhaseNodeId;
  metricOrAssumption: string;
  originalValue: number | string | boolean | null;
  overrideValue: number | string | boolean | null;
  originalStatus: string;
  overrideStatus: string;
  justificationReason: string;
  supportingEvidenceDocumentId?: string;
  affectedPhases: PhaseNodeId[];
  createdAt: string;
}
