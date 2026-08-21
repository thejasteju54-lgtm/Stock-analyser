import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Clock, Activity, AlertCircle } from 'lucide-react';

interface OutlookAndTimingCardProps {
  report: InvestmentVerdictReport;
}

export const OutlookAndTimingCard: React.FC<OutlookAndTimingCardProps> = ({ report }) => {
  const { shortTermOutlook, longTermOutlook, technicalTiming, behavioralRisks } = report;

  const timingBadge = {
    OPTIMAL_ENTRY: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Favorable Entry Timing' },
    NEUTRAL_ENTRY: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', text: 'Neutral Setup' },
    OVEREXTENDED_ENTRY: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Overextended Short-Term' },
    DOWNTREND_ENTRY: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Downtrend Momentum' },
    TECHNICAL_COUNTER_TREND: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', text: 'Counter-Trend Bounce' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: 'Timing Unassessable' },
  }[technicalTiming.timingStatus];

  return (
    <div
      style={{
        background: '#0c1017',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} className="text-pink-400" />
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
            border: `1px solid ${timingBadge.color}40`,
          }}
        >
          {timingBadge.text}
        </span>
      </div>

      {/* 1-Year vs 5-Year Horizons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {/* 1-Year Outlook */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              1-Year Outlook (FY25/26)
            </span>
            <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>{shortTermOutlook.earningsDirection}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            {shortTermOutlook.businessTrajectory}
          </p>
        </div>

        {/* 5-Year Outlook */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>
              5+ Year Outlook (Terminal Moat)
            </span>
            <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 600 }}>Moat: {longTermOutlook.moatDurability}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
            {longTermOutlook.industryCompetitivePosition}
          </p>
        </div>
      </div>

      {/* Technical Timing Directive */}
      <div style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '6px', padding: '10px 14px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '3px' }}>
          <Activity size={13} /> Technical Timing Execution Directive
        </div>
        <div style={{ fontSize: '11px', color: '#f8fafc' }}>
          {technicalTiming.entryDirective} (Support: {technicalTiming.supportZoneDisplay} • Resistance: {technicalTiming.resistanceZoneDisplay})
        </div>
      </div>

      {/* Behavioral Risk Warning */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px 14px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          <AlertCircle size={12} className="text-slate-400" /> Behavioral Check:
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
          {behavioralRisks.summary}
        </div>
      </div>
    </div>
  );
};
