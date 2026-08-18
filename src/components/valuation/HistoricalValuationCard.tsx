import React from 'react';
import { HistoricalValuationRange } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface HistoricalValuationCardProps {
  ranges: HistoricalValuationRange[];
}

export const HistoricalValuationCard: React.FC<HistoricalValuationCardProps> = ({ ranges }) => {
  return (
    <Card
      title="Historical Valuation Bands (3Y & 5Y Point-in-Time)"
      subtitle="Quartile distributions and current percentile position without look-ahead bias."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {ranges.map((r) => (
          <div
            key={`${r.multipleCode}_${r.periodYears}Y`}
            style={{
              padding: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                {r.multipleCode} ({r.periodYears}-Year Band)
              </div>
              <Badge variant={r.status === 'HISTORICAL_DATA_SUFFICIENT' ? 'neutral' : 'warning'}>
                {r.status === 'HISTORICAL_DATA_SUFFICIENT' ? `${r.pointInTimeObservationsCount} Points` : 'LIMITED DATA'}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ padding: '4px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MIN</div>
                <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {r.min !== null ? `${r.min.toFixed(1)}x` : '—'}
                </div>
              </div>
              <div style={{ padding: '4px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MEDIAN</div>
                <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                  {r.median !== null ? `${r.median.toFixed(1)}x` : '—'}
                </div>
              </div>
              <div style={{ padding: '4px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MAX</div>
                <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {r.max !== null ? `${r.max.toFixed(1)}x` : '—'}
                </div>
              </div>
              <div style={{ padding: '4px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CURRENT</div>
                <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
                  {r.current !== null ? `${r.current.toFixed(1)}x` : '—'}
                </div>
              </div>
            </div>

            {r.currentPercentile !== null && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Percentile Rank:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: r.currentPercentile > 75 ? '#dc2626' : r.currentPercentile < 25 ? '#16a34a' : 'var(--text-primary)' }}>
                    {r.currentPercentile}th Percentile
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${r.currentPercentile}%`,
                      background: r.currentPercentile > 75 ? '#dc2626' : r.currentPercentile < 25 ? '#16a34a' : '#0284c7',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
