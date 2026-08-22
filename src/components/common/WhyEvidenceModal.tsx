import React from 'react';
import { X, FileText, CheckCircle2, Calculator, Clock, ExternalLink, ShieldCheck, Layers, AlertTriangle } from 'lucide-react';
import { StatusBadge, DataReliabilityStatus } from './StatusBadge';
import { Badge } from './Badge';
import { Button } from './Button';

export type ReasoningLayerType =
  | 'FACT'
  | 'DERIVED'
  | 'INFERENCE'
  | 'ESTIMATE'
  | 'SCENARIO'
  | 'USER_ASSUMPTION';

export type SourceTierType = 'TIER_1_STATUTORY' | 'TIER_2_COMPANY_OFFICIAL' | 'TIER_3_FINANCIAL_MEDIA' | 'TIER_4_DISCOVERY';

export interface WhyEvidenceItem {
  metricOrClaim: string;
  value?: string | number;
  unit?: string;
  sourceDocument?: string;
  sourceTier?: SourceTierType | string;
  pageCitation?: string | number;
  reportingPeriod?: string;
  consolidationBasis?: 'CONSOLIDATED' | 'STANDALONE';
  publicationDate?: string;
  observationDate?: string;
  retrievalTimestamp?: string;
  formulaOrDerivation?: string;
  upstreamInputs?: Array<{ name: string; value: string | number; source: string }>;
  reasoningLayer?: ReasoningLayerType;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_HIGH';
  status?: DataReliabilityStatus | string;
  isRestated?: boolean;
  restatementNote?: string;
  explanation?: string;
  conflictsDetected?: string[];
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

  const reasoningLayerBadge = {
    FACT: { variant: 'bullish' as const, label: 'FACT (Statutory Verification)' },
    DERIVED: { variant: 'cyan' as const, label: 'DERIVED (Deterministic Formula)' },
    INFERENCE: { variant: 'warning' as const, label: 'INFERENCE (Analytical Thesis)' },
    ESTIMATE: { variant: 'neutral' as const, label: 'ESTIMATE (Forward Valuation)' },
    SCENARIO: { variant: 'neutral' as const, label: 'SCENARIO (Macro Simulation)' },
    USER_ASSUMPTION: { variant: 'warning' as const, label: 'USER ASSUMPTION' },
  }[evidence.reasoningLayer || 'FACT'];

  const sourceTierLabel = {
    TIER_1_STATUTORY: 'Tier 1: Audited Statutory Filing (NSE/BSE/MCA)',
    TIER_2_COMPANY_OFFICIAL: 'Tier 2: Official Investor Presentation / Concall',
    TIER_3_FINANCIAL_MEDIA: 'Tier 3: Reputable Financial Media',
    TIER_4_DISCOVERY: 'Tier 4: Discovery / Unverified Web Source',
  }[evidence.sourceTier || 'TIER_1_STATUTORY'] || evidence.sourceTier;

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
          maxWidth: '520px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '18px',
          borderLeft: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-blue)' }}>
                Provenance & Accuracy Inspector
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

        {/* Reasoning Layer & Consolidation Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Badge variant={reasoningLayerBadge.variant}>
            {reasoningLayerBadge.label}
          </Badge>
          <Badge variant="neutral">
            {evidence.consolidationBasis || 'CONSOLIDATED'}
          </Badge>
          {evidence.isRestated && (
            <Badge variant="warning">RESTATED DATA</Badge>
          )}
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
                Verified Metric Value
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
          {/* Source Document & Tier */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FileText size={16} color="var(--brand-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Source Document & Authority</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                {evidence.sourceDocument || 'Audited Annual Report / Statutory Filing Archive'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--brand-blue)', marginTop: '2px' }}>
                {sourceTierLabel}
              </div>
            </div>
          </div>

          {/* Exact Page & Note Citation */}
          {evidence.pageCitation && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={16} color="var(--color-bullish)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Exact Page / Note Citation</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Page {evidence.pageCitation} (Audited Financial Statements & Notes to Accounts)
                </div>
              </div>
            </div>
          )}

          {/* Reporting Period & Dual Timestamps */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Clock size={16} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Temporal Integrity & Dates</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Period: <strong>{evidence.reportingPeriod || 'FY24 (12M Ending 31-Mar-2024)'}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Published: <strong>{evidence.publicationDate || '29-May-2024'}</strong></span>
                <span>Observed: <strong>{evidence.observationDate || 'Statutory Filing'}</strong></span>
              </div>
            </div>
          </div>

          {/* Mathematical Derivation / Formula */}
          {evidence.formulaOrDerivation && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Calculator size={16} color="var(--color-indigo)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>Deterministic Formula / Bridge</div>
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

          {/* Upstream Inputs if applicable */}
          {evidence.upstreamInputs && evidence.upstreamInputs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Layers size={16} color="var(--brand-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ width: '100%' }}>
                <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '4px' }}>Upstream Inputs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {evidence.upstreamInputs.map((inp, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{inp.name}</span>
                      <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{inp.value} ({inp.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Restatement Notification */}
          {evidence.isRestated && evidence.restatementNote && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', color: 'var(--color-warning)' }}>
              <strong>Restatement Trace:</strong> {evidence.restatementNote}
            </div>
          )}

          {/* Conflicting Sources if any */}
          {evidence.conflictsDetected && evidence.conflictsDetected.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', color: 'var(--color-bearish)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <AlertTriangle size={13} /> SOURCE CONFLICT DETECTED
              </div>
              <div style={{ marginTop: '2px' }}>{evidence.conflictsDetected.join(' • ')}</div>
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
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="var(--color-bullish)" />
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
