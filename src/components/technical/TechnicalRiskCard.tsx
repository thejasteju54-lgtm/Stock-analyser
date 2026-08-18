import React from 'react';
import { TechnicalRiskAssessment, MarketCycleAssessment } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ShieldAlert, AlertOctagon, CheckCircle2, RotateCcw } from 'lucide-react';

interface TechnicalRiskCardProps {
  technicalRisk: TechnicalRiskAssessment;
  marketCycle: MarketCycleAssessment;
}

export const TechnicalRiskCard: React.FC<TechnicalRiskCardProps> = ({
  technicalRisk,
  marketCycle,
}) => {
  const getRiskBadge = (level: string) => {
    if (level === 'LOW') return <Badge variant="bullish">LOW FRAGILITY</Badge>;
    if (level === 'MODERATE') return <Badge variant="neutral">MODERATE FRAGILITY</Badge>;
    if (level === 'HIGH') return <Badge variant="warning">HIGH FRAGILITY</Badge>;
    if (level === 'EXTREME') return <Badge variant="bearish">EXTREME FRAGILITY</Badge>;
    return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
  };

  return (
    <Card
      title="Technical Risk Matrix & Market Cycle Phase"
      subtitle="Setup fragility score, invalidating trigger thresholds, and Wyckoff market cycle classification."
      icon={<ShieldAlert size={16} color="var(--color-primary)" />}
      action={getRiskBadge(technicalRisk.level)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* Market Cycle Phase */}
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>MARKET CYCLE PHASE</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
            {marketCycle.phase.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
            {marketCycle.rationale}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {marketCycle.supportingSignals.map((sig, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={12} color="var(--color-bullish)" />
                {sig}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Fragility Score */}
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>SETUP FRAGILITY SCORE</div>
          <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: technicalRisk.riskScore > 50 ? 'var(--color-bearish)' : 'var(--color-primary)' }}>
            {technicalRisk.riskScore} / 100
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {technicalRisk.definition}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {technicalRisk.riskFactors.map((factor, idx) => (
              <div key={idx} style={{ fontSize: '10px', color: 'var(--color-warning)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <AlertOctagon size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invalidating Conditions */}
      <div style={{ padding: '10px 12px', background: 'var(--bg-primary)', border: '1px dashed var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RotateCcw size={12} />
          Technical Invalidation Conditions:
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
          {technicalRisk.invalidatingConditions.map((cond, idx) => (
            <li key={idx}>{cond}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};
