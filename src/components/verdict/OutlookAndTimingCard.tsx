import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Clock, Activity, AlertCircle } from 'lucide-react';

interface OutlookAndTimingCardProps {
  report: InvestmentVerdictReport;
}

export const OutlookAndTimingCard: React.FC<OutlookAndTimingCardProps> = ({ report }) => {
  const { shortTermOutlook, longTermOutlook, technicalTiming, behavioralRisks } = report;

  const timingBadge = {
    OPTIMAL_ENTRY: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', text: 'Favorable Entry Timing' },
    NEUTRAL_ENTRY: { color: 'var(--brand-blue)', bg: 'var(--brand-blue-light)', border: 'var(--brand-blue-subtle)', text: 'Neutral Setup' },
    OVEREXTENDED_ENTRY: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Overextended Short-Term' },
    DOWNTREND_ENTRY: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Downtrend Momentum' },
    TECHNICAL_COUNTER_TREND: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Counter-Trend Bounce' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', text: 'Timing Unassessable' },
  }[technicalTiming.timingStatus];

  return (
    <div
      className="terminal-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Clock size={16} color="var(--brand-blue)" />
          Forward Horizons, Timing & Behavioral Context
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: timingBadge.color,
            background: timingBadge.bg,
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${timingBadge.border}`,
          }}
        >
          {timingBadge.text}
        </span>
      </div>

      {/* 1-Year vs 5-Year Horizons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* 1-Year Outlook */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase' }}>
              1-Year Outlook (FY25/26)
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-bullish)', fontWeight: 700 }}>{shortTermOutlook.earningsDirection}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--brand-navy)', lineHeight: 1.5, margin: 0 }}>
            {shortTermOutlook.businessTrajectory}
          </p>
        </div>

        {/* 5-Year Outlook */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-indigo)', textTransform: 'uppercase' }}>
              5+ Year Outlook (Terminal Moat)
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-indigo)', fontWeight: 700 }}>Moat: {longTermOutlook.moatDurability}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--brand-navy)', lineHeight: 1.5, margin: 0 }}>
            {longTermOutlook.industryCompetitivePosition}
          </p>
        </div>
      </div>

      {/* Technical Timing Directive */}
      <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-subtle)', borderRadius: '6px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase', marginBottom: '3px' }}>
          <Activity size={13} /> Technical Timing Execution Directive
        </div>
        <div style={{ fontSize: '11px', color: 'var(--brand-navy)' }}>
          {technicalTiming.entryDirective} (Support: {technicalTiming.supportZoneDisplay} • Resistance: {technicalTiming.resistanceZoneDisplay})
        </div>
      </div>

      {/* Behavioral Risk Warning */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 14px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <AlertCircle size={12} /> Behavioral Check:
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {behavioralRisks.summary}
        </div>
      </div>
    </div>
  );
};
