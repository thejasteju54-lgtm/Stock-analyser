import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, Clock, CheckCircle2 } from 'lucide-react';

interface FinalVerdictBannerCardProps {
  report: InvestmentVerdictReport;
  onOpenAuditDrawer: () => void;
}

export const FinalVerdictBannerCard: React.FC<FinalVerdictBannerCardProps> = ({
  report,
  onOpenAuditDrawer,
}) => {
  const { verdict, convictionScore, convictionBand, decisionConfidenceScore, oneLineVerdict, marketPrice } = report;

  const verdictStyles = {
    BUY: {
      bg: 'var(--color-bullish-bg)',
      border: '1px solid var(--color-bullish-border)',
      badgeBg: 'var(--color-bullish)',
      badgeColor: '#ffffff',
      text: 'var(--color-bullish)',
      icon: <CheckCircle2 size={24} color="var(--color-bullish)" />,
      tag: 'STRONG INVESTMENT CANDIDATE',
    },
    HOLD: {
      bg: 'var(--color-warning-bg)',
      border: '1px solid var(--color-warning-border)',
      badgeBg: 'var(--color-warning)',
      badgeColor: '#ffffff',
      text: 'var(--color-warning)',
      icon: <AlertTriangle size={24} color="var(--color-warning)" />,
      tag: 'BALANCED RISK / REWARD',
    },
    AVOID: {
      bg: 'var(--color-bearish-bg)',
      border: '1px solid var(--color-bearish-border)',
      badgeBg: 'var(--color-bearish)',
      badgeColor: '#ffffff',
      text: 'var(--color-bearish)',
      icon: <XCircle size={24} color="var(--color-bearish)" />,
      tag: 'ELEVATED RISK / CAPITAL HAZARD',
    },
    DECISION_NOT_ASSESSABLE: {
      bg: '#f1f5f9',
      border: '1px solid var(--border-subtle)',
      badgeBg: '#64748b',
      badgeColor: '#ffffff',
      text: 'var(--text-muted)',
      icon: <HelpCircle size={24} color="var(--text-muted)" />,
      tag: 'INSUFFICIENT VERIFIED EVIDENCE',
    },
  }[verdict] || {
    bg: '#f1f5f9',
    border: '1px solid var(--border-subtle)',
    badgeBg: '#64748b',
    badgeColor: '#ffffff',
    text: 'var(--text-muted)',
    icon: <HelpCircle size={24} color="var(--text-muted)" />,
    tag: 'UNASSESSABLE',
  };

  const confidencePercent = Math.min(100, Math.max(0, convictionScore * 10));

  return (
    <div
      className="terminal-card"
      style={{
        background: '#ffffff',
        border: verdictStyles.border,
        borderRadius: '8px',
        padding: '22px 24px',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        {/* Left Section: Verdict Badge, Symbol & One-Line Thesis */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span
              style={{
                background: verdictStyles.badgeBg,
                color: verdictStyles.badgeColor,
                fontWeight: 800,
                fontSize: '20px',
                padding: '4px 16px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
                boxShadow: 'var(--shadow-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {verdict}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: verdictStyles.text,
                background: verdictStyles.bg,
                padding: '4px 10px',
                borderRadius: '4px',
                border: verdictStyles.border,
              }}
            >
              {verdictStyles.tag}
            </span>
          </div>

          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--brand-navy)',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}
          >
            {report.companyName} ({report.companySymbol}) • {report.sector}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--brand-navy)',
              lineHeight: 1.6,
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '6px',
              borderLeft: `4px solid ${verdictStyles.badgeBg}`,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            "{oneLineVerdict}"
          </p>

          {/* Telemetry Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              marginTop: '14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} /> As of: <strong style={{ color: 'var(--brand-navy)' }}>{report.asOfDate}</strong>
            </span>
            <span>•</span>
            <span>
              Price: <strong style={{ color: 'var(--brand-navy)' }}>₹{marketPrice.price.toLocaleString('en-IN')}</strong> ({marketPrice.freshnessStatus})
            </span>
            <span>•</span>
            <span>
              Archetype: <strong style={{ color: 'var(--brand-blue)' }}>{report.economicArchetype}</strong>
            </span>
            <span>•</span>
            <span>
              Snapshot: <code style={{ color: 'var(--color-indigo)' }}>{report.auditTrail.snapshot.snapshotId.substring(0, 14)}</code>
            </span>
          </div>
        </div>

        {/* Right Section: Decision Confidence Score Meter & Audit Trigger */}
        <div
          style={{
            flex: '0 0 280px',
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Decision Confidence
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: convictionBand === 'VERY_HIGH' || convictionBand === 'HIGH' ? 'var(--color-bullish)' : convictionBand === 'MODERATE' ? 'var(--color-warning)' : 'var(--color-bearish)',
                }}
              >
                {convictionBand}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
              <span className="tabular-nums" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {decisionConfidenceScore.toFixed(1)}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>/ 10.0</span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: `${confidencePercent}%`,
                  height: '100%',
                  background:
                    convictionScore >= 7.0
                      ? 'var(--color-bullish)'
                      : convictionScore >= 5.0
                      ? 'var(--color-warning)'
                      : 'var(--color-bearish)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
              Confidence reflects certainty in decision soundness based on statutory evidence, not guaranteed returns.
            </p>
          </div>

          <button
            onClick={onOpenAuditDrawer}
            className="terminal-btn terminal-btn-secondary"
            style={{
              marginTop: '14px',
              width: '100%',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={14} />
            Inspect Decision Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
