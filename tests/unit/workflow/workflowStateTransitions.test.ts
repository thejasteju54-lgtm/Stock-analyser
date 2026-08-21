import { describe, it, expect } from 'vitest';
import { ResearchWorkflowEngine } from '../../../src/domain/workflow/ResearchWorkflowEngine';

describe('Phase 15 — Workflow State Transitions', () => {
  it('allows valid sequential workflow state transitions', () => {
    let state = 'DRAFT' as const;

    const res1 = ResearchWorkflowEngine.transition(state, 'DATA_COLLECTION', 'ONBOARDING_COMPLETED');
    expect(res1.newState).toBe('DATA_COLLECTION');

    const res2 = ResearchWorkflowEngine.transition(res1.newState, 'DATA_VALIDATION', 'DOCUMENTS_INGESTED');
    expect(res2.newState).toBe('DATA_VALIDATION');

    const res3 = ResearchWorkflowEngine.transition(res2.newState, 'ANALYSIS_RUNNING', 'READINESS_CONFIRMED');
    expect(res3.newState).toBe('ANALYSIS_RUNNING');

    const res4 = ResearchWorkflowEngine.transition(res3.newState, 'ANALYSIS_COMPLETE', 'PIPELINE_EXECUTED');
    expect(res4.newState).toBe('ANALYSIS_COMPLETE');

    const res5 = ResearchWorkflowEngine.transition(res4.newState, 'DECISION_READY', 'VERDICT_SYNTHESIZED');
    expect(res5.newState).toBe('DECISION_READY');

    const res6 = ResearchWorkflowEngine.transition(res5.newState, 'REPORT_GENERATING', 'REPORT_TRIGGERED');
    expect(res6.newState).toBe('REPORT_GENERATING');

    const res7 = ResearchWorkflowEngine.transition(res6.newState, 'REPORT_READY', 'REPORT_PUBLISHED');
    expect(res7.newState).toBe('REPORT_READY');
  });

  it('rejects illegal state transitions and throws informative error', () => {
    expect(() => {
      ResearchWorkflowEngine.transition('DRAFT', 'REPORT_READY', 'ILLEGAL_SKIP');
    }).toThrow(/Illegal workflow state transition/);

    expect(() => {
      ResearchWorkflowEngine.transition('DATA_COLLECTION', 'REPORT_GENERATING', 'ILLEGAL_SKIP');
    }).toThrow(/Illegal workflow state transition/);
  });
});
