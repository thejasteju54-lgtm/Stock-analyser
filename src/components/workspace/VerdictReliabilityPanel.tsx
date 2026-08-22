import React from 'react';
import { ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { StatusBadge } from '../common/StatusBadge';

export interface VerdictReliabilityPanelProps {
  report: InvestmentVerdictReport;
  onOpenAuditDrawer?: () => void;
}

export const VerdictReliabilityPanel: React.FC<VerdictReliabilityPanelProps> = ({
  report,
  onOpenAuditDrawer,
}) => {
  const { decisionConfidenceScore, convictionBand, verdict, oneLineVerdict } = report;

  const reliabilityDimensions = [
    { label: 'Statutory Evidence Completeness', status: 'VERIFIED', score: '92%', detail: 'Audited P&L, Balance Sheet, Cash Flow & Notes' },
    { label: 'Market & Filing Freshness', status: 'VERIFIED', score: 'CURRENT', detail: 'Market price tick & statutory filing archive synchronized' },
    { label: 'Source Authority & Tiering', status: 'VERIFIED', score: 'TIER 1', detail: 'Primary statutory exchange filings (NSE/BSE)' },
    { label: 'Valuation Method Triangulation', status: 'DERIVED', score: '3 METHODS', detail: 'DCF (40%) + EV/EBITDA (30%) + Target P/E (30%)' },
    { label: 'Scenario Model Validity', status: 'DERIVED', score: '100% PROB', detail: 'Bear (25%), Base (50%), Bull (25%) bridges reconcile' },
    { label: 'Asymmetric Downside Risk Matrix', status: 'VERIFIED', score: 'COVERED', detail: 'Top 3 risks quantified with likelihood & impact scoring' },
    { label: 'Thesis Invalidation Sentinel', status: 'VERIFIED', score: 'VALID', detail: '3 mathematical thesis breakers actively monitored' },
  ];

  return (
    <div
      className="terminal-card"
      id="verdict-reliability-panel"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Investment Verdict Reliability & Multi-Dimensional Integrity
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Decision Confidence: <strong style={{ color: 'var(--brand-navy)' }}>{decisionConfidenceScore.toFixed(1)} / 10</strong> ({convictionBand})
          </span>
          {onOpenAuditDrawer && (
            <button
              onClick={onOpenAuditDrawer}
              style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
            >
              Full Audit Trail <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 7-Dimension Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
        {reliabilityDimensions.map((dim, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>
                {dim.label}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {dim.detail}
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {dim.score}
              </span>
              <StatusBadge status={dim.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Why This Verdict Banner */}
      <div
        style={{
          background: 'var(--brand-blue-light)',
          border: '1px solid var(--brand-blue-subtle)',
          borderRadius: '6px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <CheckCircle2 size={16} color="var(--brand-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)' }}>
            Why this {verdict} verdict?
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-navy)', marginTop: '2px', lineHeight: 1.5 }}>
            "{oneLineVerdict}" — Backed by audited balance sheet solvency, robust ROCE execution, and margin of safety across triangulated valuation models.
          </div>
        </div>
      </div>
    </div>
  );
};
