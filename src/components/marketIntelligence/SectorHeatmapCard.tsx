import React from 'react';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { Badge } from '../common/Badge';
import { SectorHeatmapItem } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface SectorHeatmapCardProps {
  sectors: SectorHeatmapItem[];
}

export const SectorHeatmapCard: React.FC<SectorHeatmapCardProps> = ({ sectors }) => {
  return (
    <div
      className="terminal-card"
      id="sector-heatmap-card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sector Performance & News Intensity Heatmap
          </h2>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Sorted by 1D Relative Performance
        </div>
      </div>

      {/* Sector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
        {sectors.map((sec) => {
          const isUp = sec.performance1D >= 0;
          return (
            <div
              key={sec.sector}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--brand-navy)' }}>
                  {sec.sector}
                </span>
                <Badge variant={sec.newsIntensity === 'HIGH' ? 'bullish' : 'neutral'}>
                  News: {sec.newsIntensity}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  5D: {sec.performance5D >= 0 ? '+' : ''}{sec.performance5D}%
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: isUp ? 'var(--color-bullish)' : 'var(--color-bearish)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isUp ? '+' : ''}{sec.performance1D}%
                </span>
              </div>

              {/* Top Movers in Sector */}
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Top Mover:</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {sec.topMovers[0] ? `${sec.topMovers[0].symbol} (+${sec.topMovers[0].changePercent}%)` : 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
