import React from 'react';
import { ManagementDnaProfile } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ManagementDnaCardProps {
  profile: ManagementDnaProfile;
}

export const ManagementDnaCard: React.FC<ManagementDnaCardProps> = ({ profile }) => {
  const getDimensionStatusBadge = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return <Badge variant="bullish">EXCELLENT</Badge>;
      case 'SOLID':
        return <Badge variant="bullish">SOLID</Badge>;
      case 'MIXED':
        return <Badge variant="warning">MIXED</Badge>;
      case 'CONCERN':
        return <Badge variant="bearish">CONCERN</Badge>;
      default:
        return <Badge variant="neutral">INSUFFICIENT DATA</Badge>;
    }
  };

  return (
    <Card
      title="Management DNA Profile & Behavioral Disciplines"
      action={<Badge variant="cyan">7 DISCIPLINE DIMENSIONS</Badge>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 7 Dimensions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {profile.dimensions.map((dim, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dim.dimensionName}
                </span>
                {getDimensionStatusBadge(dim.status)}
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                {dim.observableBehaviorSummary}
              </p>
              {dim.supportingEvidencePoints.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  {dim.supportingEvidencePoints.map((pt, pidx) => (
                    <li key={pidx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Strengths & Watch Items Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {/* Strengths */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                Observed Execution Strengths
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {profile.strengths.map((str, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>
                  {str}
                </li>
              ))}
            </ul>
          </div>

          {/* Watch Items */}
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="#f59e0b" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                Operational Watch Items
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {profile.watchItems.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Future Monitoring Checklist */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={14} color="#0284c7" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Investor Monitoring Checklist for Future Disclosures
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {profile.monitoringChecklistForFutureDisclosures.map((chk, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>
                {chk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
