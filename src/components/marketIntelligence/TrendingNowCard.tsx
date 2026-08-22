import React from 'react';
import { Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TrendType } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface TrendingStockDef {
  symbol: string;
  displayName: string;
  price: number;
  changePercent: number;
  volumeMultiple: number;
  trendScore: number;
  trendType: TrendType;
  reason: string;
}

export interface TrendingNowCardProps {
  trendingStocks: TrendingStockDef[];
  onAnalyzeStock: (symbol: string) => void;
}

export const TrendingNowCard: React.FC<TrendingNowCardProps> = ({
  trendingStocks,
  onAnalyzeStock,
}) => {
  return (
    <div
      className="terminal-card"
      id="trending-now-card"
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
          <Flame size={16} color="var(--color-warning)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Trending Now & Volume Expansion Scanner
          </h2>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Signals: <strong style={{ color: 'var(--brand-navy)' }}>Volume Shock • Breakouts • News Spikes</strong>
        </div>
      </div>

      {/* Grid of Trending Stocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {trendingStocks.map((stock) => {
          const isUp = stock.changePercent >= 0;
          return (
            <div
              key={stock.symbol}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-navy)' }}>
                    {stock.displayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <code>{stock.symbol}</code>
                  </div>
                </div>

                <Badge variant={stock.trendType === 'POSITIVE' || stock.trendType === 'EVENT_DRIVEN' ? 'bullish' : stock.trendType === 'SPECULATIVE' ? 'warning' : 'neutral'}>
                  {stock.trendType}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  ₹{stock.price.toFixed(1)}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isUp ? 'var(--color-bullish)' : 'var(--color-bearish)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isUp ? '+' : ''}{stock.changePercent.toFixed(1)}%
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                {stock.reason}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span style={{ fontSize: '10px', color: 'var(--brand-blue)', fontWeight: 600 }}>
                  Volume: {stock.volumeMultiple.toFixed(1)}× 20DMA
                </span>
                <button
                  onClick={() => onAnalyzeStock(stock.symbol)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-blue)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Analyze →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <strong>Important:</strong> Trending stocks represent unusual market volume or news activity; they are not inherently positive investments without fundamental corroboration.
      </div>
    </div>
  );
};
