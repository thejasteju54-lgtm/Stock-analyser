import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Zap, AlertTriangle } from 'lucide-react';

interface CatalystsRisksBreakersCardProps {
  report: InvestmentVerdictReport;
}

export const CatalystsRisksBreakersCard: React.FC<CatalystsRisksBreakersCardProps> = ({ report }) => {
  const { topCatalysts, topRisks, thesisBreakers } = report;

  const tbBadge = {
    SAFE: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', text: 'All Breakers Safe' },
    APPROACHING_TRIGGER: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Breaker Approaching Trigger' },
    TRIGGER_BREACHED: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Trigger Breached (Review)' },
    THESIS_INVALIDATED: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Thesis Invalidated (AVOID)' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', text: 'Breakers Unassessable' },
  }[thesisBreakers.overallBreakerState];

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
          <Zap size={16} color="var(--brand-blue)" />
          Catalysts, Key Risks & Thesis Breakers
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: tbBadge.color,
            background: tbBadge.bg,
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${tbBadge.border}`,
          }}
        >
          {tbBadge.text}
        </span>
      </div>

      {/* Grid of Top Catalysts vs Top Risks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Top 3 Catalysts */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bullish)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={13} /> Top 3 Value Catalysts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topCatalysts.slice(0, 3).map((cat) => (
              <div key={cat.catalystId} style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-navy)' }}>
                    #{cat.rank} {cat.title}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-bullish)', background: 'var(--color-bullish-bg)', padding: '1px 5px', borderRadius: '3px' }}>
                    {cat.expectedHorizon}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{cat.evidence}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Risks */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bearish)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} /> Top 3 Key Risks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRisks.slice(0, 3).map((risk) => (
              <div key={risk.riskId} style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-navy)' }}>
                    #{risk.rank} {risk.title}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-bearish)', background: 'var(--color-bearish-bg)', padding: '1px 5px', borderRadius: '3px' }}>
                    Score: {risk.netRiskScore}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{risk.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thesis Breaker Watch Sentinel */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 14px', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Thesis Breaker Triggers</span>
          <span style={{ color: 'var(--text-muted)' }}>Monitoring Floor</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {thesisBreakers.breakers.slice(0, 2).map((tb) => (
            <div key={tb.breakerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: 'var(--brand-navy)' }}>• {tb.premise}: <strong>{tb.metric} {tb.operator} {String(tb.threshold)}</strong></span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: tb.status === 'SAFE' ? 'var(--color-bullish)' : 'var(--color-warning)' }}>
                {tb.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
