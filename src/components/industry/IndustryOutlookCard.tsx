import React from 'react';
import { IndustryOutlook } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Compass } from 'lucide-react';

interface IndustryOutlookCardProps {
  industryOutlook: IndustryOutlook;
}

export const IndustryOutlookCard: React.FC<IndustryOutlookCardProps> = ({
  industryOutlook,
}) => {
  const renderHorizon = (title: string, data: typeof industryOutlook.shortTerm, horizonLabel: string) => (
    <div
      style={{
        padding: '14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
          {title} ({horizonLabel})
        </span>
        <Badge variant="cyan">Confidence: {data.confidence}%</Badge>
      </div>

      <div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>KEY DRIVERS:</div>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {data.drivers.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      <div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>HORIZON RISKS:</div>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--color-warning)' }}>
          {data.risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>Assumption: {data.assumptions[0]}</span>
      </div>
    </div>
  );

  return (
    <Card
      title="3-Horizon Multi-Timeframe Industry Outlook"
      subtitle="Evidence-backed forward outlook spanning Short-Term (0-1Y), Medium-Term (1-3Y), and Long-Term (3-5Y) structural trajectories."
      icon={<Compass size={16} color="var(--color-primary)" />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {renderHorizon('Short-Term Outlook', industryOutlook.shortTerm, '0–12 Months')}
        {renderHorizon('Medium-Term Outlook', industryOutlook.mediumTerm, '1–3 Years')}
        {renderHorizon('Long-Term Outlook', industryOutlook.longTerm, '3–5+ Years')}
      </div>

      <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <strong>Synthesis Narrative:</strong> {industryOutlook.overallNarrative}
      </div>
    </Card>
  );
};
