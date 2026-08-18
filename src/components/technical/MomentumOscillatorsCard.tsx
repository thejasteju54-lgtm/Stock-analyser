import React from 'react';
import { MomentumAssessment } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Zap } from 'lucide-react';

interface MomentumOscillatorsCardProps {
  momentum: MomentumAssessment;
}

export const MomentumOscillatorsCard: React.FC<MomentumOscillatorsCardProps> = ({
  momentum,
}) => {
  const { rsi, macd, rateOfChange14, momentumRegime } = momentum;

  const getRsiBadge = (zone: string) => {
    if (zone === 'OVERBOUGHT_ZONE') return <Badge variant="warning">ELEVATED MOMENTUM (&gt;70)</Badge>;
    if (zone === 'OVERSOLD_ZONE') return <Badge variant="bullish">OVERSOLD (&lt;30)</Badge>;
    return <Badge variant="neutral">NEUTRAL (30–70)</Badge>;
  };

  const getMacdBadge = (cls: string) => {
    if (cls === 'BULLISH_MOMENTUM') return <Badge variant="bullish">BULLISH MOMENTUM</Badge>;
    if (cls === 'BEARISH_MOMENTUM') return <Badge variant="bearish">BEARISH MOMENTUM</Badge>;
    return <Badge variant="neutral">{cls.replace('_', ' ')}</Badge>;
  };

  return (
    <Card
      title="Momentum Oscillators & Momentum Regime"
      subtitle="Wilder's 14-period RSI, MACD (12,26,9) trend convergence, and Rate of Change."
      icon={<Zap size={16} color="var(--color-primary)" />}
      action={<Badge variant={momentumRegime === 'BULLISH' ? 'bullish' : momentumRegime === 'BEARISH' ? 'bearish' : 'neutral'}>{momentumRegime}</Badge>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* RSI Panel */}
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>RSI (14-Period Wilder)</div>
            {getRsiBadge(rsi.zone)}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: rsi.currentValue && rsi.currentValue > 70 ? 'var(--color-warning)' : rsi.currentValue && rsi.currentValue < 30 ? 'var(--color-bullish)' : 'var(--text-primary)' }}>
            {rsi.currentValue !== null ? rsi.currentValue.toFixed(1) : '—'}
          </div>

          {/* RSI Visual Meter */}
          <div style={{ marginTop: '10px', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, rsi.currentValue || 50))}%`,
                background: rsi.currentValue && rsi.currentValue > 70 ? 'var(--color-warning)' : rsi.currentValue && rsi.currentValue < 30 ? 'var(--color-bullish)' : 'var(--color-primary)',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>0 (Oversold &lt;30)</span>
            <span>50 (Mid)</span>
            <span>100 (Overbought &gt;70)</span>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
            {rsi.historicalElevatedContext}
          </div>
        </div>

        {/* MACD Panel */}
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>MACD (12, 26, 9 EMA)</div>
            {getMacdBadge(macd.momentumClassification)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MACD LINE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {macd.macdLine !== null ? macd.macdLine.toFixed(2) : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SIGNAL LINE</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {macd.signalLine !== null ? macd.signalLine.toFixed(2) : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>HISTOGRAM</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: macd.histogram && macd.histogram >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                {macd.histogram !== null ? macd.histogram.toFixed(2) : '—'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>
            Rate of Change (ROC 14): {rateOfChange14 !== null ? `${rateOfChange14 > 0 ? '+' : ''}${rateOfChange14.toFixed(2)}%` : '—'}
          </div>
        </div>
      </div>
    </Card>
  );
};
