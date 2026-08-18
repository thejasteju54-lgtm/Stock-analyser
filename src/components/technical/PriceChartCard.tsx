import React, { useState } from 'react';
import { OHLCVCandle, MovingAverageRegime, SupportResistanceZone, BreakoutEvent } from '../../domain/technical/TechnicalTypes';
import { Card } from '../common/Card';
import { Layers } from 'lucide-react';

interface PriceChartCardProps {
  candles: OHLCVCandle[];
  movingAverages: MovingAverageRegime;
  zones: SupportResistanceZone[];
  breakouts?: BreakoutEvent[];
  companySymbol: string;
}

export const PriceChartCard: React.FC<PriceChartCardProps> = ({
  candles,
  movingAverages,
  zones,
  breakouts = [],
  companySymbol,
}) => {
  const [show20Dma, setShow20Dma] = useState(true);
  const [show50Dma, setShow50Dma] = useState(true);
  const [show200Dma, setShow200Dma] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Take the latest 60 candles for crisp display
  const displayCandles = candles.slice(-60);
  if (displayCandles.length === 0) {
    return (
      <Card title="Interactive Price & Volume Chart">
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No candle data available.
        </div>
      </Card>
    );
  }

  const width = 800;
  const height = 320;
  const padding = { top: 20, right: 60, bottom: 60, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const volumeHeight = 50;
  const priceChartHeight = chartHeight - volumeHeight - 10;

  const minPrice = Math.min(...displayCandles.map((c) => c.low));
  const maxPrice = Math.max(...displayCandles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1.0;

  const maxVolume = Math.max(...displayCandles.map((c) => c.volume || 1));

  const getX = (index: number) => padding.left + (index / (displayCandles.length - 1 || 1)) * chartWidth;
  const getY = (price: number) => padding.top + priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight;
  const getVolY = (vol: number) => padding.top + chartHeight - (vol / (maxVolume || 1)) * volumeHeight;

  return (
    <Card
      title={`${companySymbol} — Interactive Price & Volume Chart`}
      subtitle="Candlestick price action with multi-timeframe moving averages, volume bars, and support/resistance zones."
      icon={<Layers size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShow20Dma(!show20Dma)}
            className={`terminal-btn terminal-btn-sm ${show20Dma ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            20 DMA {show20Dma ? '✓' : ''}
          </button>
          <button
            onClick={() => setShow50Dma(!show50Dma)}
            className={`terminal-btn terminal-btn-sm ${show50Dma ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            50 DMA {show50Dma ? '✓' : ''}
          </button>
          <button
            onClick={() => setShow200Dma(!show200Dma)}
            className={`terminal-btn terminal-btn-sm ${show200Dma ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            200 DMA {show200Dma ? '✓' : ''}
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`terminal-btn terminal-btn-sm ${showZones ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            S/R Zones {showZones ? '✓' : ''}
          </button>
          {breakouts.length > 0 && (
            <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
              {breakouts.length} Breakout{breakouts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      }
    >
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'var(--bg-primary)', borderRadius: '4px' }}>
          {/* S/R Zones */}
          {showZones &&
            zones.map((zone) => {
              const y1 = getY(zone.upperBound);
              const y2 = getY(zone.lowerBound);
              const h = Math.max(4, Math.abs(y2 - y1));
              const color = zone.type === 'SUPPORT' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
              const stroke = zone.type === 'SUPPORT' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
              return (
                <g key={zone.zoneId}>
                  <rect
                    x={padding.left}
                    y={Math.min(y1, y2)}
                    width={chartWidth}
                    height={h}
                    fill={color}
                    stroke={stroke}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={padding.left + chartWidth + 5}
                    y={Math.min(y1, y2) + h / 2 + 3}
                    fill={zone.type === 'SUPPORT' ? 'var(--color-bullish)' : 'var(--color-bearish)'}
                    fontSize="9px"
                    fontFamily="var(--font-mono)"
                  >
                    {zone.type} ₹{zone.midPrice}
                  </text>
                </g>
              );
            })}

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const p = minPrice + ratio * priceRange;
            const y = getY(p);
            return (
              <g key={ratio}>
                <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border-subtle)" strokeDasharray="2 2" />
                <text x={padding.left + chartWidth + 5} y={y + 3} fill="var(--text-muted)" fontSize="9px" fontFamily="var(--font-mono)">
                  ₹{p.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Candles */}
          {displayCandles.map((c, i) => {
            const x = getX(i);
            const isBull = c.close >= c.open;
            const color = isBull ? 'var(--color-bullish)' : 'var(--color-bearish)';
            const bodyY = getY(Math.max(c.open, c.close));
            const bodyHeight = Math.max(2, Math.abs(getY(c.open) - getY(c.close)));
            const wickY1 = getY(c.high);
            const wickY2 = getY(c.low);

            // Volume bar
            const volY = getVolY(c.volume);
            const volHeight = padding.top + chartHeight - volY;

            return (
              <g key={`${c.timestamp}-${i}`}>
                {/* Volume Bar */}
                <rect
                  x={x - 3}
                  y={volY}
                  width={6}
                  height={volHeight}
                  fill={isBull ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                />
                {/* Wick */}
                <line x1={x} y1={wickY1} x2={x} y2={wickY2} stroke={color} strokeWidth={1} />
                {/* Candle Body */}
                <rect
                  x={x - 4}
                  y={bodyY}
                  width={8}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                />
              </g>
            );
          })}

          {/* 20 DMA Line */}
          {show20Dma && (
            <path
              d={displayCandles
                .map((_c, i) => {
                  const val = movingAverages.items.find((m) => m.period === 20)?.value;
                  if (!val) return '';
                  const x = getX(i);
                  const y = getY(val);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={1.5}
            />
          )}

          {/* 50 DMA Line */}
          {show50Dma && (
            <path
              d={displayCandles
                .map((_c, i) => {
                  const val = movingAverages.items.find((m) => m.period === 50)?.value;
                  if (!val) return '';
                  const x = getX(i);
                  const y = getY(val);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
          )}

          {/* 200 DMA Line */}
          {show200Dma && (
            <path
              d={displayCandles
                .map((_c, i) => {
                  const val = movingAverages.items.find((m) => m.period === 200)?.value;
                  if (!val) return '';
                  const x = getX(i);
                  const y = getY(val);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#ec4899"
              strokeWidth={2}
            />
          )}
        </svg>
      </div>

      {/* Legend & MA Summary */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px', display: 'inline-block' }}></span>
          20 DMA: ₹{movingAverages.items.find((m) => m.period === 20)?.value?.toFixed(2) || '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
          50 DMA: ₹{movingAverages.items.find((m) => m.period === 50)?.value?.toFixed(2) || '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', background: '#ec4899', borderRadius: '2px', display: 'inline-block' }}></span>
          200 DMA: ₹{movingAverages.items.find((m) => m.period === 200)?.value?.toFixed(2) || '—'}
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          Showing latest {displayCandles.length} sessions
        </div>
      </div>
    </Card>
  );
};
