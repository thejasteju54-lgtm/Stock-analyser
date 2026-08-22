import React, { useState } from 'react';
import { X, Search, Zap, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AutomatedResearchOrchestrator, ResearchProgressStage, AutomatedResearchReport, ResearchExecutionMode } from '../../domain/dataAcquisition/AutomatedResearchOrchestrator';
import { ResearchProject } from '../../domain/models/ResearchProject';

export interface AutomatedResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResearchComplete?: (project: ResearchProject) => void;
}

export const AutomatedResearchModal: React.FC<AutomatedResearchModalProps> = ({
  isOpen,
  onClose,
  onResearchComplete,
}) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<ResearchExecutionMode>('DEEP_RESEARCH');
  const [isRunning, setIsRunning] = useState(false);
  const [stages, setStages] = useState<ResearchProgressStage[]>([]);
  const [report, setReport] = useState<AutomatedResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartResearch = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setError(null);
    setReport(null);
    setStages([]);

    try {
      const result = await AutomatedResearchOrchestrator.executeAutomatedResearch(
        query,
        mode,
        (stage) => {
          setStages((prev) => {
            const existingIndex = prev.findIndex((s) => s.stageIndex === stage.stageIndex);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = stage;
              return updated;
            }
            return [...prev, stage];
          });
        }
      );
      setReport(result);
      if (onResearchComplete) {
        onResearchComplete(result.project);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during automated research');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '18px',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'var(--brand-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
                One-Click Automated Internet Research
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Multi-source discovery, document intake, financial reconciliation & evidence graph
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Input & Mode Selector */}
        {!report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Enter company name, ticker, or ISIN (e.g. BEL, Tata Motors, 500049)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleStartResearch()}
                  disabled={isRunning}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                disabled={!query.trim() || isRunning}
                icon={isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                onClick={handleStartResearch}
              >
                {isRunning ? 'Researching...' : 'Research Company'}
              </Button>
            </div>

            {/* Quick Suggestions & Mode Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Quick Search:</span>
                <span
                  onClick={() => setQuery('BEL')}
                  style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  BEL
                </span>
                <span>•</span>
                <span
                  onClick={() => setQuery('Tata Motors')}
                  style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Tata Motors
                </span>
                <span>•</span>
                <span
                  onClick={() => setQuery('HDFC Bank')}
                  style={{ color: 'var(--brand-blue)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  HDFC Bank
                </span>
              </div>

              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '5px', padding: '2px' }}>
                <button
                  onClick={() => setMode('FAST_RESEARCH')}
                  style={{
                    background: mode === 'FAST_RESEARCH' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: mode === 'FAST_RESEARCH' ? 700 : 500,
                    cursor: 'pointer',
                    color: mode === 'FAST_RESEARCH' ? 'var(--brand-navy)' : 'var(--text-muted)',
                  }}
                >
                  Fast Research
                </button>
                <button
                  onClick={() => setMode('DEEP_RESEARCH')}
                  style={{
                    background: mode === 'DEEP_RESEARCH' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: mode === 'DEEP_RESEARCH' ? 700 : 500,
                    cursor: 'pointer',
                    color: mode === 'DEEP_RESEARCH' ? 'var(--brand-navy)' : 'var(--text-muted)',
                  }}
                >
                  Deep Research (Full 10Y)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Execution Stages */}
        {stages.length > 0 && !report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Autonomous Ingestion Progress</span>
              <span>{stages.filter((s) => s.status === 'COMPLETED').length} / 10 Stages Complete</span>
            </div>

            {stages.map((stage) => (
              <div key={stage.stageIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                {stage.status === 'COMPLETED' ? (
                  <CheckCircle2 size={15} color="var(--color-bullish)" />
                ) : (
                  <RefreshCw size={14} color="var(--brand-blue)" className="animate-spin" />
                )}
                <span style={{ fontWeight: 600, color: 'var(--brand-navy)', minWidth: '180px' }}>
                  {stage.stageName}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {stage.description}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-bearish)', fontSize: '12px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Completion Report Screen */}
        {report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={20} color="var(--color-bullish)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--brand-navy)' }}>
                  Automated Research Complete for {report.companyName} ({report.symbol})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Evidence completeness score: <strong>{report.completenessPercent}%</strong> • Reconciliation: <Badge variant="bullish">{report.reconciliationStatus}</Badge>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Documents Discovered</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>{report.documentsDiscovered}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Audited Annual Reports</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Financial Metrics Ingested</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>{report.financialMetricsReconciled}</div>
                <div style={{ fontSize: '10px', color: 'var(--brand-blue)' }}>10Y Consolidated Statements</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Evidence Graph Lineage</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)' }}>{report.evidenceGraphNodes} Nodes</div>
                <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>100% Provenance Preserved</div>
              </div>
            </div>

            {/* Footer Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={14} />}
                onClick={onClose}
              >
                Open Research Workspace
              </Button>
            </div>
          </div>
        )}

        {/* Source Connectivity Badges */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={12} color="var(--brand-blue)" />
            <span>Permitted Sources:</span>
            <Badge variant="cyan">NSE / BSE</Badge>
            <Badge variant="neutral">Screener.in</Badge>
            <Badge variant="neutral">Tickertape</Badge>
            <Badge variant="neutral">Moneycontrol</Badge>
          </div>
          <span>Anti-Hallucination: <strong style={{ color: 'var(--color-bullish)' }}>ACTIVE</strong></span>
        </div>
      </div>
    </div>
  );
};
