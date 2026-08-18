import React from 'react';
import { MaterialNewsAlert, NewsEvent } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Newspaper, Clock, ShieldCheck, Flame } from 'lucide-react';

interface NewsOverviewCardProps {
  companySymbol: string;
  materialAlerts: MaterialNewsAlert[];
  newsEvents: NewsEvent[];
  dataFreshness: {
    latestNewsRetrieved: string;
    industryDataUpdated: string;
    marketContextDate: string;
    isStale: boolean;
  };
  confidenceScore: number;
}

export const NewsOverviewCard: React.FC<NewsOverviewCardProps> = ({
  companySymbol,
  materialAlerts,
  newsEvents,
  dataFreshness,
  confidenceScore,
}) => {
  const tier1Count = newsEvents.filter((e) =>
    e.sourceReferences.some((s) => s.sourceTier === 'TIER_1_PRIMARY')
  ).length;

  const directEventsCount = newsEvents.filter((e) => e.relevance === 'DIRECT_COMPANY').length;
  const ongoingEventsCount = newsEvents.filter((e) => e.eventStatus === 'ONGOING').length;

  return (
    <Card
      title={`${companySymbol} — News Intelligence & External Event Snapshot`}
      subtitle="Multi-outlet verified news stream, primary disclosure corroboration, and material alerts."
      icon={<Newspaper size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant="cyan">{newsEvents.length} VERIFIED EVENTS</Badge>
          <Badge variant={materialAlerts.length > 0 ? 'warning' : 'neutral'}>
            {materialAlerts.length} MATERIAL ALERT{materialAlerts.length !== 1 ? 'S' : ''}
          </Badge>
        </div>
      }
    >
      {/* High-Density Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>DIRECT COMPANY EVENTS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {directEventsCount} / {newsEvents.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Primary Subject Disclosures
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>TIER-1 PRIMARY SOURCING</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} />
            {tier1Count} Events
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            NSE/BSE & Official Gazette
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ACTIVE / ONGOING EVENTS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-warning)' }}>
            {ongoingEventsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Active Investigations & Projects
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CONFIDENCE SCORE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
            {confidenceScore}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-Source Corroboration Depth
          </div>
        </div>
      </div>

      {/* Material Alerts Banner */}
      {materialAlerts.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} />
            HIGH MATERIALITY NEWS ALERTS (Score &ge; 70):
          </div>
          {materialAlerts.map((alert) => (
            <div
              key={alert.alertId}
              style={{
                padding: '10px 14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {alert.headline}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {alert.summary}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Event Date: {alert.eventDate} | Tier: {alert.sourceTier}
                </div>
              </div>
              <Badge variant="warning">{alert.magnitude}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Freshness & Attribution Banner */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', border: '1px dashed var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} color="var(--text-muted)" />
          <span>Latest Feed Retrieved: {new Date(dataFreshness.latestNewsRetrieved).toLocaleDateString()} {new Date(dataFreshness.latestNewsRetrieved).toLocaleTimeString()}</span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Market Context Date: {dataFreshness.marketContextDate}
        </div>
      </div>
    </Card>
  );
};
