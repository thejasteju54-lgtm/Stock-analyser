import React from 'react';
import { Radio } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface EventRadarItem {
  symbol: string;
  company: string;
  eventType: string;
  headline: string;
  date: string;
  materiality: 'HIGH' | 'MEDIUM';
  source: string;
  sourceTier: number;
}

export interface EventsRadarCardProps {
  events: EventRadarItem[];
  onAnalyzeStock: (symbol: string) => void;
}

export const EventsRadarCard: React.FC<EventsRadarCardProps> = ({ events, onAnalyzeStock }) => {
  return (
    <div
      className="terminal-card"
      id="events-radar-card"
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
          <Radio size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Today's Material Corporate Events & Order Radar
          </h2>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Prioritizing <strong style={{ color: 'var(--brand-navy)' }}>Tier 1 Statutory Filings & Direct Disclosures</strong>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {events.map((evt, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-navy)' }}>
                    {evt.company} (<code>{evt.symbol}</code>)
                  </span>
                  <Badge variant="cyan">{evt.eventType.replace('_', ' ')}</Badge>
                  <Badge variant={evt.sourceTier === 1 ? 'bullish' : 'neutral'}>
                    Tier {evt.sourceTier} Source
                  </Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 600 }}>
                  {evt.headline}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  Source: {evt.source} • Date: {evt.date}
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => onAnalyzeStock(evt.symbol)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--brand-blue)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Analyze Impact →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
