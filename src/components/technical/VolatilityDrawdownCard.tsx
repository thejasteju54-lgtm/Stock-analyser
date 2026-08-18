import React from 'react';
import { VolatilityRegime } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Activity } from 'lucide-react';

interface VolatilityDrawdownCardProps {
  volatility: VolatilityRegime;
}

export const VolatilityDrawdownCard: React.FC<VolatilityDrawdownCardProps> = ({
  volatility,
}) => {
  const getRegimeBadge = (reg: string) => {
    if (reg === 'LOW') return <Badge variant="bullish">LOW VOLATILITY</Badge>;
    if (reg === 'NORMAL') return <Badge variant="neutral">NORMAL VOLATILITY</Badge>;
    if (reg === 'ELEVATED') return <Badge variant="warning">ELEVATED VOLATILITY</Badge>;
    if (reg === 'EXTREME') return <Badge variant="bearish">EXTREME VOLATILITY</Badge>;
    return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
  };

  return (
    <Card
      title="Volatility Regime & Historical Drawdown Metrics"
      subtitle="Wilder's ATR (14), 52-week trading bounds, and trailing maximum drawdown."
      icon={<Activity size={16} color="var(--color-primary)" />}
      action={getRegimeBadge(volatility.regime)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ATR (14-PERIOD)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ₹{volatility.atr14 !== null ? volatility.atr14.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            ATR %: {volatility.atrPercent !== null ? `${volatility.atrPercent.toFixed(2)}%` : '—'}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>52-WEEK HIGH</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ₹{volatility.high52Week !== null ? volatility.high52Week.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Distance: {volatility.distance52wHighPercent !== null ? `${volatility.distance52wHighPercent.toFixed(1)}%` : '—'}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>52-WEEK LOW</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ₹{volatility.low52Week !== null ? volatility.low52Week.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Distance: {volatility.distance52wLowPercent !== null ? `+${volatility.distance52wLowPercent.toFixed(1)}%` : '—'}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>MAX DRAWDOWN</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: volatility.maxHistoricalDrawdownPercent && volatility.maxHistoricalDrawdownPercent < -25 ? 'var(--color-bearish)' : 'var(--text-primary)' }}>
            {volatility.maxHistoricalDrawdownPercent !== null ? `${volatility.maxHistoricalDrawdownPercent.toFixed(1)}%` : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Trailing 250 sessions peak-to-trough
          </div>
        </div>
      </div>
    </Card>
  );
};
