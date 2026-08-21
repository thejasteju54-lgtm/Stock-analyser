import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Zap, AlertTriangle } from 'lucide-react';

interface CatalystsRisksBreakersCardProps {
  report: InvestmentVerdictReport;
}

export const CatalystsRisksBreakersCard: React.FC<CatalystsRisksBreakersCardProps> = ({ report }) => {
  const { topCatalysts, topRisks, thesisBreakers } = report;

  const tbBadge = {
    SAFE: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'All Breakers Safe' },
    APPROACHING_TRIGGER: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Breaker Approaching Trigger' },
    TRIGGER_BREACHED: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', text: 'Trigger Breached (Review)' },
    THESIS_INVALIDATED: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: 'Thesis Invalidated (AVOID)' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: 'Breakers Unassessable' },
  }[thesisBreakers.overallBreakerState];

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
          <Zap size={16} className="text-amber-400" />
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
            border: `1px solid ${tbBadge.color}40`,
          }}
        >
          {tbBadge.text}
        </span>
      </div>

      {/* Grid of Top Catalysts vs Top Risks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        {/* Top 3 Catalysts */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={13} /> Top 3 Value Catalysts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topCatalysts.slice(0, 3).map((cat) => (
              <div key={cat.catalystId} style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                    #{cat.rank} {cat.title}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                    {cat.expectedHorizon}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{cat.evidence}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 Risks */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} /> Top 3 Key Risks
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRisks.slice(0, 3).map((risk) => (
              <div key={risk.riskId} style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                    #{risk.rank} {risk.title}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                    Score: {risk.netRiskScore}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{risk.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thesis Breaker Watch Sentinel */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px 14px', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Thesis Breaker Triggers</span>
          <span style={{ color: '#64748b' }}>Monitoring Floor</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {thesisBreakers.breakers.slice(0, 2).map((tb) => (
            <div key={tb.breakerId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span style={{ color: '#cbd5e1' }}>• {tb.premise}: <strong>{tb.metric} {tb.operator} {String(tb.threshold)}</strong></span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: tb.status === 'SAFE' ? '#10b981' : '#f59e0b' }}>
                {tb.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
