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
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '92vw',
          height: '100%',
          background: '#ffffff',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-glass)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="var(--brand-blue)" />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Decision Audit Trail & Provenance
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Reproducible execution trace for {report.companySymbol}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Snapshot Identity Bar */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Execution Snapshot Metadata
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Policy Version:</span>{' '}
                <strong style={{ color: 'var(--brand-navy)' }}>{snapshot.policyVersion}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Decision Rule:</span>{' '}
                <strong style={{ color: 'var(--color-bullish)' }}>{snapshot.appliedDecisionRuleId}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Snapshot ID:</span>{' '}
                <code style={{ color: 'var(--color-indigo)' }}>{snapshot.snapshotId.substring(0, 16)}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Checksum:</span>{' '}
                <code style={{ color: 'var(--brand-blue)' }}>{snapshot.reproducibilityChecksum}</code>
              </div>
            </div>
          </div>

          {/* Active Decision Blockers */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="var(--color-warning)" />
              Active Decision Blockers ({activeBlockers.length})
            </div>

            {activeBlockers.length === 0 ? (
              <div style={{ background: 'var(--color-bullish-bg)', border: '1px solid var(--color-bullish-border)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: 'var(--color-bullish)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Zero active decision blockers. Full BUY/HOLD eligibility intact.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeBlockers.map((blk) => (
                  <div key={blk.blockerId} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bearish)' }}>{blk.type}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-warning)', fontWeight: 600 }}>{blk.currentStatus}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--brand-navy)' }}>{blk.requiredResolution}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Source: {blk.sourcePhase}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* What Would Change the Verdict? */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} color="var(--brand-blue)" />
              What Would Change the Verdict? (Transition Triggers)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {changeConditions.potentialTransitions.map((t, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '4px' }}>
                    <span>{t.fromVerdict}</span>
                    <span>→</span>
                    <span style={{ color: t.toVerdict === 'BUY' ? 'var(--color-bullish)' : t.toVerdict === 'HOLD' ? 'var(--color-warning)' : 'var(--color-bearish)' }}>
                      {t.toVerdict}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>Threshold: {t.threshold}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-navy)' }}>{t.conditionDescription}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Layer Conflict Resolutions */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="var(--color-indigo)" />
              Cross-Layer Contradictions & Audit Resolutions ({auditTrail.conflictAudit.length})
            </div>

            {auditTrail.conflictAudit.length === 0 ? (
              <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-subtle)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: 'var(--brand-blue)' }}>
                Zero cross-layer contradictions extracted across filings.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditTrail.conflictAudit.map((cnf) => (
                  <div key={cnf.conflictId} style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{cnf.metric}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-bullish)', fontWeight: 700 }}>{cnf.resolutionStatus}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cnf.resolutionReason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: '#ffffff', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="terminal-btn terminal-btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
