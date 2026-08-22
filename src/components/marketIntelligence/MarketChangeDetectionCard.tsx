import React from 'react';
import { History, ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { DailyOpportunityItem } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface MarketChangeDetectionCardProps {
  opportunities: DailyOpportunityItem[];
}

export const MarketChangeDetectionCard: React.FC<MarketChangeDetectionCardProps> = ({ opportunities }) => {
  return (
    <div
      className="terminal-card"
      id="market-change-detection-card"
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
          <History size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            What Changed Since Yesterday? (Ranking Delta Explainer)
          </h2>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Comparing <strong>22 Aug 2026</strong> vs <strong>21 Aug 2026</strong>
        </div>
      </div>

      {/* Changes List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {opportunities.map((item) => {
          const delta = item.rankDeltaFromYesterday;
          if (!delta) return null;

          return (
            <div
              key={item.symbol}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <div
                style={{
                  marginTop: '2px',
                  color: delta.type === 'UP' || delta.type === 'NEW_ENTRY' ? 'var(--color-bullish)' : delta.type === 'DOWN' ? 'var(--color-bearish)' : 'var(--text-muted)',
                }}
              >
                {delta.type === 'UP' ? (
                  <ArrowUpRight size={18} />
                ) : delta.type === 'DOWN' ? (
                  <ArrowDownRight size={18} />
                ) : delta.type === 'NEW_ENTRY' ? (
                  <PlusCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-navy)' }}>
                    #{item.rank} {item.displayName} (<code>{item.symbol}</code>)
                  </span>
                  <Badge variant={delta.type === 'UP' ? 'bullish' : delta.type === 'NEW_ENTRY' ? 'cyan' : 'neutral'}>
                    {delta.type === 'UP' ? `▲ +${delta.places} Places` : delta.type === 'DOWN' ? `▼ -${delta.places} Places` : delta.type}
                  </Badge>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  <strong>Driver:</strong> {delta.reason}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
