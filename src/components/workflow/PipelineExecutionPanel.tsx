/**
 * PipelineExecutionPanel.tsx
 * Phase 15 — Pipeline Execution & Phase Stepper Control Panel.
 */

import React from 'react';
import { Cpu, Play, RefreshCw, CheckCircle, Clock, Zap } from 'lucide-react';
import { PipelineExecutionReport } from '../../domain/orchestration/ResearchPipelineOrchestrator';

interface PipelineExecutionPanelProps {
  executionReport?: PipelineExecutionReport;
  isRunning?: boolean;
  onRunFullPipeline: () => void;
  onRunIncrementalPipeline: () => void;
}

const PHASES_LIST = [
  { id: 'PHASE_5_CALCULATIONS', label: 'Phase 5: Financial Metrics' },
  { id: 'PHASE_6_FUNDAMENTAL', label: 'Phase 6: Fundamental Health' },
  { id: 'PHASE_7_FORENSIC', label: 'Phase 7: Forensic Accounting' },
  { id: 'PHASE_8_MANAGEMENT', label: 'Phase 8: Management DNA' },
  { id: 'PHASE_9_VALUATION', label: 'Phase 9: Sector Valuation' },
  { id: 'PHASE_10_TECHNICAL', label: 'Phase 10: Technical Structure' },
  { id: 'PHASE_11_NEWS_INDUSTRY', label: 'Phase 11: News & Industry' },
  { id: 'PHASE_12_CATALYSTS_RISKS', label: 'Phase 12: Catalysts & Risks' },
  { id: 'PHASE_13_SCENARIOS', label: 'Phase 13: Scenario Modeling' },
  { id: 'PHASE_14_VERDICT', label: 'Phase 14: Investment Verdict' },
];

export const PipelineExecutionPanel: React.FC<PipelineExecutionPanelProps> = ({
  executionReport,
  isRunning = false,
  onRunFullPipeline,
  onRunIncrementalPipeline,
}) => {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Analytical Pipeline Orchestration (Phases 5–14)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onRunIncrementalPipeline}
            disabled={isRunning}
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={12} className={isRunning ? 'spin' : ''} />
            Incremental Refresh
          </button>
          <button
            onClick={onRunFullPipeline}
            disabled={isRunning}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={12} />
            Run Full Pipeline
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {PHASES_LIST.map((phase) => {
          const res = executionReport ? (executionReport.phaseResults as any)[phase.id] : undefined;
          const isComplete = res?.status === 'COMPLETE';
          const isCached = res?.isCached;

          return (
            <div
              key={phase.id}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                {phase.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: isComplete ? '#34d399' : '#94a3b8',
                  }}
                >
                  {isComplete ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {isComplete ? (isCached ? 'CACHED' : 'EXECUTED') : 'READY'}
                </span>
                {isCached && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '9px', color: '#38bdf8' }}>
                    <Zap size={9} /> reused
                  </span>
                )}
                {!isCached && res?.durationMs !== undefined && (
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{res.durationMs}ms</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
