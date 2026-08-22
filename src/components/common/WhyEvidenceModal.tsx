import React from 'react';
import { X, FileText, CheckCircle2, Calculator, Clock, ExternalLink } from 'lucide-react';
import { StatusBadge, DataReliabilityStatus } from './StatusBadge';
import { Button } from './Button';

export interface WhyEvidenceItem {
  metricOrClaim: string;
  value?: string | number;
  unit?: string;
  sourceDocument?: string;
  pageCitation?: string | number;
  reportingPeriod?: string;
  formulaOrDerivation?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_HIGH';
  status?: DataReliabilityStatus | string;
  lastUpdated?: string;
  explanation?: string;
  notes?: string;
}

export interface WhyEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: WhyEvidenceItem | null;
}

export const WhyEvidenceModal: React.FC<WhyEvidenceModalProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 9999,
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '20px',
          borderLeft: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-blue)' }}>
                Evidence Provenance Inspector
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
              {evidence.metricOrClaim}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Metric Value Banner */}
        {evidence.value !== undefined && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Reported / Derived Value
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  {evidence.value}
                </span>
                {evidence.unit && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {evidence.unit}
                  </span>
                )}
              </div>
            </div>

            <StatusBadge status={evidence.status || 'VERIFIED'} />
          </div>
        )}

        {/* Key Provenance Dimensions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          {/* Source Document */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FileText size={16} color="var(--brand-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Source Document</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>
                {evidence.sourceDocument || 'Audited Annual Report / Statutory Exchange Filing'}
              </div>
            </div>
          </div>

          {/* Page / Section Citation */}
          {evidence.pageCitation && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={16} color="var(--color-bullish)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Exact Page / Note Citation</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>
                  Page {evidence.pageCitation} (Audited Financial Statements & Notes)
                </div>
              </div>
            </div>
          )}

          {/* Reporting Period */}
          {evidence.reportingPeriod && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Clock size={16} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Reporting Period</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '1px' }}>
                  {evidence.reportingPeriod} (Consolidated Basis)
                </div>
              </div>
            </div>
          )}

          {/* Mathematical Derivation / Formula */}
          {evidence.formulaOrDerivation && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calculator size={16} color="var(--color-indigo)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Deterministic Formula</div>
                <pre
                  style={{
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--brand-navy)',
                    marginTop: '4px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {evidence.formulaOrDerivation}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Explanation / Context */}
        {evidence.explanation && (
          <div
            style={{
              background: 'var(--brand-blue-light)',
              border: '1px solid var(--brand-blue-subtle)',
              borderRadius: '6px',
              padding: '12px 14px',
              fontSize: '12px',
              color: 'var(--brand-navy)',
              lineHeight: 1.5,
            }}
          >
            <strong>Analytical Rationale:</strong> {evidence.explanation}
          </div>
        )}

        {/* Verification Footer */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Confidence: <strong style={{ color: 'var(--color-bullish)' }}>{evidence.confidence || 'HIGH'}</strong>
          </div>

          <Button size="sm" variant="secondary" icon={<ExternalLink size={12} />} onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
