/**
 * ResearchWorkflowEngine.ts
 * Phase 15 — Production Research Workflow State Machine Controller.
 * Enforces valid state transitions and audit logging.
 */

import { ResearchWorkflowState, WorkflowTransitionRecord } from './WorkflowTypes';

export class ResearchWorkflowEngine {
  private static readonly VALID_TRANSITIONS: Record<ResearchWorkflowState, ResearchWorkflowState[]> = {
    DRAFT: ['DATA_COLLECTION', 'BLOCKED', 'ERROR'],
    DATA_COLLECTION: ['DATA_VALIDATION', 'DRAFT', 'BLOCKED', 'ERROR'],
    DATA_VALIDATION: ['ANALYSIS_RUNNING', 'DATA_COLLECTION', 'BLOCKED', 'ERROR'],
    ANALYSIS_RUNNING: ['ANALYSIS_COMPLETE', 'BLOCKED', 'ERROR'],
    ANALYSIS_COMPLETE: ['DECISION_READY', 'ANALYSIS_RUNNING', 'STALE', 'BLOCKED', 'ERROR'],
    DECISION_READY: ['REPORT_GENERATING', 'ANALYSIS_RUNNING', 'STALE', 'BLOCKED', 'ERROR'],
    REPORT_GENERATING: ['REPORT_READY', 'ERROR'],
    REPORT_READY: ['STALE', 'ANALYSIS_RUNNING', 'DATA_COLLECTION', 'REPORT_GENERATING', 'ERROR'],
    STALE: ['DATA_COLLECTION', 'DATA_VALIDATION', 'ANALYSIS_RUNNING', 'ERROR'],
    BLOCKED: ['DATA_COLLECTION', 'DATA_VALIDATION', 'DRAFT', 'ERROR'],
    ERROR: ['DRAFT', 'DATA_COLLECTION', 'DATA_VALIDATION', 'ANALYSIS_RUNNING'],
  };

  /**
   * Evaluates whether a transition from currentState to targetState is permitted.
   */
  public static canTransition(fromState: ResearchWorkflowState, toState: ResearchWorkflowState): boolean {
    if (fromState === toState) return true;
    const allowed = this.VALID_TRANSITIONS[fromState] || [];
    return allowed.includes(toState);
  }

  /**
   * Executes a deterministic transition and returns the transition audit record.
   * Throws an error if the transition is illegal.
   */
  public static transition(
    currentState: ResearchWorkflowState,
    targetState: ResearchWorkflowState,
    trigger: string,
    actor: 'SYSTEM' | 'USER_ANALYST' = 'SYSTEM',
    rationale: string = 'Workflow state transition',
    metadata?: Record<string, unknown>
  ): { newState: ResearchWorkflowState; record: WorkflowTransitionRecord } {
    if (!this.canTransition(currentState, targetState)) {
      throw new Error(
        `Illegal workflow state transition from "${currentState}" to "${targetState}". Allowed transitions: [${(this.VALID_TRANSITIONS[currentState] || []).join(', ')}]`
      );
    }

    const record: WorkflowTransitionRecord = {
      transitionId: `trans_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fromState: currentState,
      toState: targetState,
      trigger,
      timestamp: new Date().toISOString(),
      actor,
      rationale,
      metadata,
    };

    return {
      newState: targetState,
      record,
    };
  }
}
