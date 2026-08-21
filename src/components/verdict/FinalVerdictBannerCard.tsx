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
      bg: 'rgba(16, 185, 129, 0.08)',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      badgeBg: '#10b981',
      badgeColor: '#07090e',
      text: '#10b981',
      icon: <CheckCircle2 size={28} className="text-emerald-400" />,
      tag: 'STRONG INVESTMENT CANDIDATE',
    },
    HOLD: {
      bg: 'rgba(245, 158, 11, 0.08)',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      badgeBg: '#f59e0b',
      badgeColor: '#07090e',
      text: '#f59e0b',
      icon: <AlertTriangle size={28} className="text-amber-400" />,
      tag: 'BALANCED RISK / REWARD',
    },
    AVOID: {
      bg: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      badgeBg: '#ef4444',
      badgeColor: '#ffffff',
      text: '#ef4444',
      icon: <XCircle size={28} className="text-rose-400" />,
      tag: 'ELEVATED RISK / CAPITAL HAZARD',
    },
    DECISION_NOT_ASSESSABLE: {
      bg: 'rgba(100, 116, 139, 0.08)',
      border: '1px solid rgba(100, 116, 139, 0.35)',
      badgeBg: '#64748b',
      badgeColor: '#ffffff',
      text: '#94a3b8',
      icon: <HelpCircle size={28} className="text-slate-400" />,
      tag: 'INSUFFICIENT VERIFIED EVIDENCE',
    },
  }[verdict] || {
    bg: 'rgba(100, 116, 139, 0.08)',
    border: '1px solid rgba(100, 116, 139, 0.35)',
    badgeBg: '#64748b',
    badgeColor: '#ffffff',
    text: '#94a3b8',
    icon: <HelpCircle size={28} className="text-slate-400" />,
    tag: 'UNASSESSABLE',
  };

  const confidencePercent = Math.min(100, Math.max(0, convictionScore * 10));

  return (
    <div
      style={{
        background: '#0c1017',
        border: verdictStyles.border,
        borderRadius: '8px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '320px',
          height: '100%',
          background: verdictStyles.bg,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        {/* Left Section: Verdict Badge, Symbol & One-Line Thesis */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span
              style={{
                background: verdictStyles.badgeBg,
                color: verdictStyles.badgeColor,
                fontWeight: 800,
                fontSize: '22px',
                padding: '6px 18px',
                borderRadius: '6px',
                letterSpacing: '0.05em',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
              fontSize: '18px',
              fontWeight: 600,
              color: '#f8fafc',
              marginBottom: '10px',
              lineHeight: 1.4,
            }}
          >
            {report.companyName} ({report.companySymbol}) • {report.sector}
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#cbd5e1',
              lineHeight: 1.6,
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '12px 16px',
              borderRadius: '6px',
              borderLeft: `4px solid ${verdictStyles.badgeBg}`,
              fontStyle: 'italic',
            }}
          >
            "{oneLineVerdict}"
          </p>

          {/* Telemetry Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '16px',
              fontSize: '12px',
              color: '#94a3b8',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} className="text-slate-400" /> As of: <strong>{report.asOfDate}</strong>
            </span>
            <span>•</span>
            <span>
              Price: <strong style={{ color: '#f8fafc' }}>₹{marketPrice.price.toLocaleString('en-IN')}</strong> ({marketPrice.freshnessStatus})
            </span>
            <span>•</span>
            <span>
              Archetype: <strong style={{ color: '#38bdf8' }}>{report.economicArchetype}</strong>
            </span>
            <span>•</span>
            <span>
              Snapshot ID: <code style={{ color: '#a78bfa' }}>{report.auditTrail.snapshot.snapshotId.substring(0, 14)}</code>
            </span>
          </div>
        </div>

        {/* Right Section: Decision Confidence Score Meter & Audit Trigger */}
        <div
          style={{
            flex: '0 0 280px',
            background: 'rgba(18, 24, 38, 0.7)',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                Decision Confidence
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: convictionBand === 'VERY_HIGH' || convictionBand === 'HIGH' ? '#10b981' : convictionBand === 'MODERATE' ? '#f59e0b' : '#ef4444',
                }}
              >
                {convictionBand}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
                {decisionConfidenceScore.toFixed(1)}
              </span>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ 10.0</span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#1e293b',
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
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : convictionScore >= 5.0
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              Confidence reflects certainty in decision soundness based on statutory evidence, not guaranteed financial returns.
            </p>
          </div>

          <button
            onClick={onOpenAuditDrawer}
            style={{
              marginTop: '16px',
              width: '100%',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s',
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
