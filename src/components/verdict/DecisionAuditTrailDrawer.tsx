import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { X, ShieldCheck, CheckCircle2, RefreshCw, FileText, Lock } from 'lucide-react';

interface DecisionAuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: InvestmentVerdictReport;
}

export const DecisionAuditTrailDrawer: React.FC<DecisionAuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen) return null;

  const { auditTrail, changeConditions, activeBlockers } = report;
  const snapshot = auditTrail.snapshot;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '600px',
          maxWidth: '90vw',
          height: '100%',
          background: '#0c1017',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#121824',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} className="text-sky-400" />
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Decision Audit Trail & Provenance
              </h2>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Reproducible execution trace for {report.companySymbol}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Snapshot Identity Bar */}
          <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Execution Snapshot Metadata
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Policy Version:</span>{' '}
                <strong style={{ color: '#f8fafc' }}>{snapshot.policyVersion}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Decision Rule:</span>{' '}
                <strong style={{ color: '#34d399' }}>{snapshot.appliedDecisionRuleId}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Snapshot ID:</span>{' '}
                <code style={{ color: '#a78bfa' }}>{snapshot.snapshotId.substring(0, 16)}</code>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Checksum:</span>{' '}
                <code style={{ color: '#38bdf8' }}>{snapshot.reproducibilityChecksum}</code>
              </div>
            </div>
          </div>

          {/* Active Decision Blockers */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} className="text-amber-400" />
              Active Decision Blockers ({activeBlockers.length})
            </div>

            {activeBlockers.length === 0 ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Zero active decision blockers. Full BUY/HOLD eligibility intact.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeBlockers.map((blk) => (
                  <div key={blk.blockerId} style={{ background: '#121824', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>{blk.type}</span>
                      <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>{blk.currentStatus}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{blk.requiredResolution}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Source: {blk.sourcePhase}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Would Change the Verdict? */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className="text-cyan-400" />
              What Would Change the Verdict? (Transition Triggers)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {changeConditions.potentialTransitions.map((t, idx) => (
                <div key={idx} style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                    <span>{t.fromVerdict}</span>
                    <span>→</span>
                    <span style={{ color: t.toVerdict === 'BUY' ? '#10b981' : t.toVerdict === 'HOLD' ? '#f59e0b' : '#ef4444' }}>
                      {t.toVerdict}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>Threshold: {t.threshold}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{t.conditionDescription}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Layer Conflict Resolutions */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} className="text-violet-400" />
              Cross-Layer Contradictions & Audit Resolutions ({auditTrail.conflictAudit.length})
            </div>

            {auditTrail.conflictAudit.length === 0 ? (
              <div style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#38bdf8' }}>
                Zero cross-layer contradictions extracted across filings.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditTrail.conflictAudit.map((cnf) => (
                  <div key={cnf.conflictId} style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cnf.metric}</span>
                      <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>{cnf.resolutionStatus}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{cnf.resolutionReason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', background: '#121824', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#38bdf8',
              color: '#07090e',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
