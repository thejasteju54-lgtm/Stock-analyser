import React from 'react';
import { TrendAssessment, MarketStructure } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Compass, GitCommit } from 'lucide-react';

interface TrendStructureCardProps {
  trend: TrendAssessment;
  structure: MarketStructure;
}

export const TrendStructureCard: React.FC<TrendStructureCardProps> = ({
  trend,
  structure,
}) => {
  const getBadge = (val: string) => {
    if (val.includes('UPTREND') || val.includes('BULLISH')) return <Badge variant="bullish">{val.replace('_', ' ')}</Badge>;
    if (val.includes('DOWNTREND') || val.includes('BEARISH')) return <Badge variant="bearish">{val.replace('_', ' ')}</Badge>;
    return <Badge variant="neutral">{val.replace('_', ' ')}</Badge>;
  };

  return (
    <Card
      title="Trend Hierarchy & Market Structure Progression"
      subtitle="Point-in-time trend determination across primary, intermediate, and short-term horizons."
      icon={<Compass size={16} color="var(--color-primary)" />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>PRIMARY TREND (Long Term)</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trend.primaryTrend.replace('_', ' ')}
            </div>
            {getBadge(trend.primaryTrend)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Confidence: {trend.trendConfidence}%
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>INTERMEDIATE TREND (50 DMA)</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trend.intermediateTrend.replace('_', ' ')}
            </div>
            {getBadge(trend.intermediateTrend)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Slope: {trend.trendSlope}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>SHORT-TERM TREND (20 DMA)</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trend.shortTermTrend.replace('_', ' ')}
            </div>
            {getBadge(trend.shortTermTrend)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tactical Momentum Filter
          </div>
        </div>
      </div>

      {/* Structural Swings Breakdown */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitCommit size={14} color="var(--color-primary)" />
          Swing Progression & High/Low Sequence
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HIGHER HIGHS (HH)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)' }}>
              {structure.higherHighsCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HIGHER LOWS (HL)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)' }}>
              {structure.higherLowsCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LOWER HIGHS (LH)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bearish)' }}>
              {structure.lowerHighsCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LOWER LOWS (LL)</div>
            <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bearish)' }}>
              {structure.lowerLowsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Structure Breaks Events */}
      {structure.structureBreaks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>RECENT STRUCTURE BREAKS:</div>
          {structure.structureBreaks.map((sb) => (
            <div key={sb.breakId} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>{sb.description}</div>
              <Badge variant={sb.type.includes('BULL') ? 'bullish' : 'bearish'}>{sb.type.replace('_', ' ')}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
