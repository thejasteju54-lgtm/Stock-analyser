import React from 'react';
import { Globe, ShieldCheck, Clock, TrendingUp, TrendingDown, Layers, ChevronDown } from 'lucide-react';
import { Badge } from '../common/Badge';
import { MarketIndexData, MarketBreadth, UniverseType } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface MarketOverviewHeaderProps {
  date: string;
  asOfTime: string;
  universe: UniverseType;
  onUniverseChange: (u: UniverseType) => void;
  indices: MarketIndexData[];
  breadth: MarketBreadth;
}

export const MarketOverviewHeader: React.FC<MarketOverviewHeaderProps> = ({
  date,
  asOfTime,
  universe,
  onUniverseChange,
  indices,
  breadth,
}) => {
  return (
    <div
      className="terminal-card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      {/* Top Banner: Status, Date, Universe & Disclaimer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'var(--brand-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-blue)',
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
              Daily Market Intelligence & Opportunity Scanner
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{date}</span>
              <span>•</span>
              <Clock size={11} />
              <span>{asOfTime}</span>
              <span>•</span>
              <Badge variant="bullish">MARKET CLOSED</Badge>
            </div>
          </div>
        </div>

        {/* Universe Selector & Disclaimer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Layers size={13} color="var(--brand-blue)" />
            <span>Universe:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={universe}
                onChange={(e) => onUniverseChange(e.target.value as UniverseType)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '4px 24px 4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--brand-navy)',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="NSE_500">NSE 500 Eligible Universe</option>
                <option value="NIFTY_50">Nifty 50 Large Caps</option>
                <option value="NIFTY_MIDCAP_100">Nifty Midcap 100</option>
                <option value="NIFTY_SMALLCAP_100">Nifty Smallcap 100</option>
                <option value="CUSTOM_WATCHLIST">Custom Watchlist</option>
              </select>
              <ChevronDown size={11} style={{ position: 'absolute', right: '6px', top: '7px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
            Deterministic Evidence Engine
          </Badge>
        </div>
      </div>

      {/* Market Indices & Breadth Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {/* Indices */}
        {indices.map((idx) => {
          const isUp = idx.changePercent >= 0;
          return (
            <div
              key={idx.name}
              style={{
                background: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>{idx.name}</div>
                <div className="tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
                  {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isUp ? 'var(--color-bullish)' : 'var(--color-bearish)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '2px',
                  }}
                >
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </div>
                <div className="tabular-nums" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {isUp ? '+' : ''}{idx.change.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Market Breadth */}
        <div
          style={{
            background: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>Market Breadth</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--color-bullish)', fontWeight: 700 }}>
                ▲ {breadth.advancers}
              </span>
              <span style={{ color: 'var(--color-bearish)', fontWeight: 700 }}>
                ▼ {breadth.decliners}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ● {breadth.unchanged}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '10px', color: 'var(--text-muted)' }}>
            <div>52W Highs: <strong style={{ color: 'var(--color-bullish)' }}>{breadth.highs52W}</strong></div>
            <div>52W Lows: <strong style={{ color: 'var(--color-bearish)' }}>{breadth.lows52W}</strong></div>
          </div>
        </div>
      </div>

      {/* Mandatory Institutional Disclaimer */}
      <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-muted)' }}>
        <strong>Analyst Notice:</strong> Opportunity Scores reflect current verified fundamental, technical, valuation, and catalyst signals. They are not guaranteed return forecasts or automated BUY recommendations.
      </div>
    </div>
  );
};
