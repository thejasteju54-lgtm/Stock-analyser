import React, { useState } from 'react';
import { CatalystEvent, UpcomingEvent, NewsRisk } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Zap, Calendar } from 'lucide-react';

interface CatalystsAndRisksCardProps {
  catalysts: CatalystEvent[];
  upcomingEvents: UpcomingEvent[];
  newsRisks: NewsRisk[];
}

export const CatalystsAndRisksCard: React.FC<CatalystsAndRisksCardProps> = ({
  catalysts,
  upcomingEvents,
  newsRisks,
}) => {
  const [activeTab, setActiveTab] = useState<'CATALYSTS' | 'UPCOMING' | 'RISKS'>('CATALYSTS');

  return (
    <Card
      title="External Catalysts, Upcoming Events & Risk Engine"
      subtitle="Structured catalyst milestones, forward calendar dates without date fabrication, and prioritized external risk factors."
      icon={<Zap size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('CATALYSTS')}
            className={`terminal-btn terminal-btn-sm ${activeTab === 'CATALYSTS' ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '11px' }}
          >
            Catalysts ({catalysts.length})
          </button>
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`terminal-btn terminal-btn-sm ${activeTab === 'UPCOMING' ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '11px' }}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('RISKS')}
            className={`terminal-btn terminal-btn-sm ${activeTab === 'RISKS' ? 'terminal-btn-primary' : ''}`}
            style={{ fontSize: '11px' }}
          >
            External Risks ({newsRisks.length})
          </button>
        </div>
      }
    >
      {/* 1. Catalysts Tab */}
      {activeTab === 'CATALYSTS' && (
        <div>
          {catalysts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No positive catalyst events currently logged.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {catalysts.map((cat) => (
                <div
                  key={cat.catalystId}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge variant="bullish">{cat.category.replace('_', ' ')}</Badge>
                    <Badge variant="neutral">{cat.status}</Badge>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.event}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {cat.businessImpact}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>Channel: <strong style={{ color: 'var(--text-primary)' }}>{cat.financialChannel}</strong></span>
                    <span>Confidence: <strong>{cat.confidence}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Upcoming Events Tab */}
      {activeTab === 'UPCOMING' && (
        <div>
          {upcomingEvents.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No verified upcoming calendar events scheduled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingEvents.map((ue) => (
                <div
                  key={ue.eventId}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ue.description}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Type: {ue.eventType} | Precision: {ue.datePrecision}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                      {ue.expectedDate}
                    </div>
                    <Badge variant="neutral">{ue.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. External Risks Tab */}
      {activeTab === 'RISKS' && (
        <div>
          {newsRisks.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No material external risks identified from media streams.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {newsRisks.map((risk) => (
                <div
                  key={risk.riskId}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge variant={risk.severity === 'CRITICAL' ? 'bearish' : 'warning'}>
                      {risk.riskCategory.replace('_', ' ')}
                    </Badge>
                    <Badge variant="neutral">{risk.horizon}</Badge>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {risk.evidence}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Channel: {risk.businessChannel} &rarr; {risk.financialChannel}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>Severity: <strong style={{ color: risk.severity === 'CRITICAL' ? 'var(--color-bearish)' : 'var(--color-warning)' }}>{risk.severity}</strong></span>
                    <span>Confidence: <strong>{risk.confidence}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
