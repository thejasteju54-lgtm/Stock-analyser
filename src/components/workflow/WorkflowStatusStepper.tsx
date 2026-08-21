/**
 * WorkflowStatusStepper.tsx
 * Phase 15 — Research Workflow State Machine Visual Stepper.
 */

import React from 'react';
import { ResearchWorkflowState } from '../../domain/workflow/WorkflowTypes';
import { CheckCircle2, AlertCircle, Clock, PlayCircle, ShieldCheck } from 'lucide-react';

interface WorkflowStatusStepperProps {
  currentState: ResearchWorkflowState;
  onStateTransition?: (targetState: ResearchWorkflowState) => void;
}

const STEPS: { state: ResearchWorkflowState; label: string; description: string }[] = [
  { state: 'DRAFT', label: '1. Onboarded', description: 'Company identified' },
  { state: 'DATA_COLLECTION', label: '2. Intake', description: 'Documents uploaded' },
  { state: 'DATA_VALIDATION', label: '3. Validated', description: 'Completeness verified' },
  { state: 'ANALYSIS_RUNNING', label: '4. Pipeline', description: 'Executing Phase 5–13' },
  { state: 'DECISION_READY', label: '5. Verdict', description: 'Phase 14 synthesis' },
  { state: 'REPORT_READY', label: '6. Published', description: 'Report delivered' },
];

export const WorkflowStatusStepper: React.FC<WorkflowStatusStepperProps> = ({ currentState }) => {
  const getStepStatus = (stepState: ResearchWorkflowState, _idx: number) => {
    const stateOrder: ResearchWorkflowState[] = [
      'DRAFT',
      'DATA_COLLECTION',
      'DATA_VALIDATION',
      'ANALYSIS_RUNNING',
      'ANALYSIS_COMPLETE',
      'DECISION_READY',
      'REPORT_GENERATING',
      'REPORT_READY',
    ];

    const currentIdx = stateOrder.indexOf(currentState);
    const stepTargetIdx = stateOrder.indexOf(stepState);

    if (currentState === 'ERROR') return 'error';
    if (currentState === 'BLOCKED') return 'blocked';
    if (currentState === 'STALE') return 'stale';

    if (currentIdx > stepTargetIdx) return 'completed';
    if (currentIdx === stepTargetIdx || (stepState === 'DECISION_READY' && currentState === 'ANALYSIS_COMPLETE')) return 'current';
    return 'upcoming';
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Workflow Lifecycle State
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Status:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background:
                currentState === 'REPORT_READY' || currentState === 'DECISION_READY'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : currentState === 'BLOCKED' || currentState === 'ERROR'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'rgba(56, 189, 248, 0.2)',
              color:
                currentState === 'REPORT_READY' || currentState === 'DECISION_READY'
                  ? '#34d399'
                  : currentState === 'BLOCKED' || currentState === 'ERROR'
                  ? '#f87171'
                  : '#38bdf8',
            }}
          >
            {currentState}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', position: 'relative' }}>
        {STEPS.map((step, idx) => {
          const status = getStepStatus(step.state, idx);
          return (
            <div
              key={step.state}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderRadius: '6px',
                background: status === 'current' ? 'rgba(30, 41, 59, 0.8)' : '#1e293b',
                border: status === 'current' ? '1px solid #38bdf8' : '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                {status === 'completed' ? (
                  <CheckCircle2 size={14} color="#10b981" />
                ) : status === 'current' ? (
                  <PlayCircle size={14} color="#38bdf8" />
                ) : status === 'error' || status === 'blocked' ? (
                  <AlertCircle size={14} color="#ef4444" />
                ) : (
                  <Clock size={14} color="#64748b" />
                )}
                <span style={{ fontSize: '11px', fontWeight: 700, color: status === 'current' ? '#38bdf8' : status === 'completed' ? '#f8fafc' : '#94a3b8' }}>
                  {step.label}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{step.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
