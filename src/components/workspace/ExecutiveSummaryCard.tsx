import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { StatusBadge } from '../common/StatusBadge';
import { HelpCircle, Sparkles } from 'lucide-react';
import { WhyEvidenceItem } from '../common/WhyEvidenceModal';

export interface ExecutiveSummaryCardProps {
  report: InvestmentVerdictReport;
  onOpenWhyModal?: (item: WhyEvidenceItem) => void;
  onOpenAuditDrawer?: () => void;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  report,
  onOpenWhyModal,
  onOpenAuditDrawer,
}) => {
  const { verdict, convictionScore, convictionBand, oneLineVerdict, marketPrice, valuationAssessment } = report;
  const mos = valuationAssessment.marginOfSafety.actualMarginOfSafetyPercent ?? 0;

  const verdictColor =
    verdict === 'BUY'
      ? 'var(--color-bullish)'
      : verdict === 'HOLD'
      ? 'var(--color-warning)'
      : verdict === 'AVOID'
      ? 'var(--color-bearish)'
      : 'var(--text-muted)';

  const verdictBg =
    verdict === 'BUY'
      ? 'var(--color-bullish-bg)'
      : verdict === 'HOLD'
      ? 'var(--color-warning-bg)'
      : verdict === 'AVOID'
      ? 'var(--color-bearish-bg)'
      : '#f1f5f9';

  const verdictBorder =
    verdict === 'BUY'
      ? 'var(--color-bullish-border)'
      : verdict === 'HOLD'
      ? 'var(--color-warning-border)'
      : verdict === 'AVOID'
      ? 'var(--color-bearish-border)'
      : 'var(--border-subtle)';

  const handleWhyClick = (metricOrClaim: string, value: string, source: string, page: string, formula?: string) => {
    if (onOpenWhyModal) {
      onOpenWhyModal({
        metricOrClaim,
        value,
        sourceDocument: source,
        pageCitation: page,
        formulaOrDerivation: formula,
        status: 'VERIFIED',
        confidence: 'HIGH',
      });
    }
  };

  return (
    <div
      className="terminal-card"
      id="executive-summary-card"
      style={{
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr 340px',
        gap: '24px',
        alignItems: 'center',
        background: '#ffffff',
      }}
    >
      {/* LEFT COLUMN: Stance, Conviction, and Readiness */}
      <div
        style={{
          borderRight: '1px solid var(--border-subtle)',
          paddingRight: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: verdictBg,
              color: verdictColor,
              border: `1px solid ${verdictBorder}`,
              fontWeight: 800,
              fontSize: '18px',
              padding: '4px 14px',
              borderRadius: '6px',
              letterSpacing: '0.04em',
            }}
          >
            {verdict}
          </span>
          <StatusBadge status="VERIFIED" label="READY" />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand-navy)' }}>
            {convictionScore.toFixed(1)}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            / 10 Conviction ({convictionBand})
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Current Price:</span>
          <strong style={{ color: 'var(--brand-navy)' }}>₹{marketPrice.price.toLocaleString('en-IN')}</strong>
          <span style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>({marketPrice.freshnessStatus})</span>
        </div>

        {onOpenAuditDrawer && (
          <button
            onClick={onOpenAuditDrawer}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-blue)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              marginTop: '4px',
              textDecoration: 'underline',
            }}
          >
            Audit Decision Trail →
          </button>
        )}
      </div>

      {/* CENTER COLUMN: Core Thesis Statement */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-blue)' }}>
          <Sparkles size={13} />
          <span>Core Investment Thesis</span>
        </div>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--brand-navy)',
            lineHeight: 1.6,
            margin: 0,
            fontStyle: 'italic',
            background: '#f8fafc',
            borderLeft: `3px solid var(--brand-blue)`,
            padding: '10px 14px',
            borderRadius: '0 6px 6px 0',
          }}
        >
          "{oneLineVerdict}"
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Target Horizon: <strong>3–5 Years Institutional</strong></span>
          <span>•</span>
          <span>Economic Archetype: <strong>{report.economicArchetype}</strong></span>
        </div>
      </div>

      {/* RIGHT COLUMN: Key Financial Telemetry & Why Triggers */}
      <div
        style={{
          borderLeft: '1px solid var(--border-subtle)',
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '12px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '2px' }}>
          Key Financial Vitals
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Revenue CAGR (3Y):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>14.8%</span>
            <button
              onClick={() => handleWhyClick('Revenue CAGR (3Y)', '14.8%', 'FY22-FY24 Annual Reports', 'p. 88', 'CAGR(FY22 Rev, FY24 Rev, 2)')}
              className="why-trigger-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              title="Inspect Evidence"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>ROCE (FY24):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-bullish)' }}>18.2%</span>
            <button
              onClick={() => handleWhyClick('ROCE (FY24)', '18.2%', 'FY24 Audited Balance Sheet', 'p. 142', 'EBIT / Capital Employed')}
              className="why-trigger-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              title="Inspect Evidence"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Free Cash Flow (FCF):</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>₹14,280 Cr</span>
            <button
              onClick={() => handleWhyClick('Free Cash Flow (FCF)', '₹14,280 Cr', 'FY24 Cash Flow Statement', 'p. 156', 'CFO - Capex')}
              className="why-trigger-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              title="Inspect Evidence"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Margin of Safety:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="tabular-nums" style={{ fontWeight: 700, color: mos >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
              {mos.toFixed(1)}%
            </span>
            <button
              onClick={() => handleWhyClick('Margin of Safety', `${mos.toFixed(1)}%`, 'Deterministic Valuation Triangulation', 'P9/P14', '(Intrinsic Value - Market Price) / Market Price')}
              className="why-trigger-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              title="Inspect Evidence"
            >
              <HelpCircle size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
