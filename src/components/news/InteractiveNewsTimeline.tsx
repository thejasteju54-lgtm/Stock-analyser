import React, { useState } from 'react';
import { NewsEvent, ImpactDirection } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Calendar, Filter, ExternalLink } from 'lucide-react';

interface InteractiveNewsTimelineProps {
  events: NewsEvent[];
  onSelectEventSources: (event: NewsEvent) => void;
}

export type TimeWindowFilter = '24H' | '7D' | '30D' | '90D' | '6M' | '1Y' | 'ALL';

export const InteractiveNewsTimeline: React.FC<InteractiveNewsTimelineProps> = ({
  events,
  onSelectEventSources,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindowFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'ALL' && e.eventCategory !== selectedCategory) return false;
    if (selectedImpact !== 'ALL' && e.impactAssessment.direction !== selectedImpact) return false;
    return true;
  });

  const getImpactBadge = (dir: ImpactDirection) => {
    if (dir === 'POSITIVE') return <Badge variant="bullish">POSITIVE</Badge>;
    if (dir === 'NEGATIVE') return <Badge variant="bearish">NEGATIVE</Badge>;
    if (dir === 'MIXED') return <Badge variant="warning">MIXED</Badge>;
    return <Badge variant="neutral">NEUTRAL</Badge>;
  };

  const getCorroborationBadge = (status: string) => {
    if (status === 'PRIMARY_CONFIRMED') return <Badge variant="bullish">PRIMARY CONFIRMED</Badge>;
    if (status === 'MULTI_SOURCE_CONFIRMED') return <Badge variant="cyan">MULTI-SOURCE CONFIRMED</Badge>;
    if (status === 'CONFLICTING') return <Badge variant="bearish">CONFLICTING SOURCES</Badge>;
    return <Badge variant="neutral">{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card
      title="Point-in-Time Event Timeline & Verified Media Stream"
      subtitle="Interactive chronological event stream with multi-window filters, financial impact channels, and primary source provenance."
      icon={<Calendar size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['24H', '7D', '30D', '90D', '6M', '1Y', 'ALL'] as TimeWindowFilter[]).map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`terminal-btn terminal-btn-sm ${timeWindow === w ? 'terminal-btn-primary' : ''}`}
              style={{ fontSize: '10px', padding: '2px 8px' }}
            >
              {w}
            </button>
          ))}
        </div>
      }
    >
      {/* Category & Impact Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <Filter size={12} />
          <span>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="ORDER_WIN">Order Wins & Contracts</option>
            <option value="RESULTS">Results & Earnings</option>
            <option value="CAPEX">Capex & Expansions</option>
            <option value="REGULATORY">Regulatory & Policy</option>
            <option value="COMMODITY">Commodity & Inputs</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>Impact:</span>
          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
            }}
          >
            <option value="ALL">All Impacts</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEGATIVE">Negative</option>
            <option value="MIXED">Mixed</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No events match the selected timeline and category filters.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.eventId}
              style={{
                padding: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Event Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {event.eventDate || event.publicationDate.split('T')[0]}
                    </span>
                    <Badge variant="neutral">{event.eventDatePrecision}</Badge>
                    <Badge variant={event.eventStatus === 'ONGOING' ? 'warning' : 'neutral'}>
                      {event.eventStatus}
                    </Badge>
                    <Badge variant="cyan">{event.eventCategory.replace('_', ' ')}</Badge>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {event.headline}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  {getImpactBadge(event.impactAssessment.direction)}
                  {getCorroborationBadge(event.corroborationStatus)}
                </div>
              </div>

              {/* Summary */}
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {event.summary}
              </p>

              {/* Financial Channels & Intermediate Causal Explanation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Financial Channels:</span>
                  {event.impactAssessment.financialChannels.map((ch) => (
                    <span key={ch} style={{ padding: '1px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '3px', fontSize: '10px', color: 'var(--text-primary)' }}>
                      {ch}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Materiality: <strong>{event.confidence}/100</strong>
                  </span>
                  <button
                    onClick={() => onSelectEventSources(event)}
                    className="terminal-btn terminal-btn-sm"
                    style={{ fontSize: '10px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={10} />
                    Inspect Sources ({event.sourceReferences.length})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
