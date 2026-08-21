/**
 * WorkflowTypes.ts
 * Phase 15 — Production Research Workflow State Machine & Phase Execution Schemas.
 */

import { PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';

export type ResearchWorkflowState =
  | 'DRAFT'
  | 'DATA_COLLECTION'
  | 'DATA_VALIDATION'
  | 'ANALYSIS_RUNNING'
  | 'ANALYSIS_COMPLETE'
  | 'DECISION_READY'
  | 'REPORT_GENERATING'
  | 'REPORT_READY'
  | 'STALE'
  | 'ERROR'
  | 'BLOCKED';

export interface WorkflowTransitionRecord {
  transitionId: string;
  fromState: ResearchWorkflowState;
  toState: ResearchWorkflowState;
  trigger: string;
  timestamp: string;
  actor: 'SYSTEM' | 'USER_ANALYST';
  rationale: string;
  metadata?: Record<string, unknown>;
}

export type PhaseExecutionStatus =
  | 'NOT_STARTED'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETE'
  | 'STALE'
  | 'BLOCKED'
  | 'ERROR';

export interface PhaseExecutionResult {
  phaseId: PhaseNodeId;
  status: PhaseExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  inputHash: string;
  outputHash: string;
  isCached: boolean;
  errorDetails?: string;
  warningCount: number;
}

export interface ResearchRunMetrics {
  totalRunDurationMs: number;
  phaseMetrics: Record<string, { durationMs: number; status: PhaseExecutionStatus; isCached: boolean }>;
  documentCount: number;
  evidenceCount: number;
  staleEvidenceCount: number;
  recalculatedPhaseCount: number;
  cachedPhaseCount: number;
  executedAt: string;
}
