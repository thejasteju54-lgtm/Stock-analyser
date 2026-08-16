import React from 'react';
import { FundamentalRedFlag } from '../../domain/analysis/FundamentalHealthTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertOctagon, ExternalLink } from 'lucide-react';

interface RedFlagMatrixCardProps {
  redFlags: FundamentalRedFlag[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const RedFlagMatrixCard: React.FC<RedFlagMatrixCardProps> = ({ redFlags, onInspectEvidence }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="bearish">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="bearish">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="neutral">LOW</Badge>;
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATERIAL_CONCERN':
        return <Badge variant="bearish">MATERIAL CONCERN</Badge>;
      case 'REQUIRES_INVESTIGATION':
        return <Badge variant="warning">REQUIRES INVESTIGATION</Badge>;
      default:
        return <Badge variant="neutral">OBSERVED</Badge>;
    }
  };

  if (redFlags.length === 0) {
    return (
      <Card title="Fundamental Red Flags & Risk Matrix" icon={<AlertOctagon size={14} color="#ef4444" />}>
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          No critical fundamental red flags or financial stress triggers identified in available reporting facts.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`Fundamental Red Flags & Risk Matrix (${redFlags.length})`}
      icon={<AlertOctagon size={14} color="#ef4444" />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {redFlags.map((flag) => (
          <div
            key={flag.redFlagId}
            style={{
              padding: '12px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${flag.severity === 'CRITICAL' || flag.severity === 'HIGH' ? '#ef4444' : '#f59e0b'}`,
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {flag.title}
                </span>
                {flag.requiresForensicReview && (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    LEAD FOR PHASE 7 FORENSICS
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getSeverityBadge(flag.severity)}
                {getStatusBadge(flag.status)}
              </div>
            </div>

            {/* Description */}
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {flag.description}
            </p>

            {/* Signal trigger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '4px 8px',
                borderRadius: '3px',
              }}
            >
              <span>
                <strong>Trigger Signal:</strong> {flag.signal.title}
                {flag.signal.currentValue !== undefined && ` (${flag.signal.currentValue})`}
              </span>

              {flag.evidenceReferences.length > 0 && onInspectEvidence && (
                <button
                  onClick={() => onInspectEvidence(flag.evidenceReferences)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-cyan)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    outline: 'none',
                    fontSize: '11px',
                  }}
                >
                  Inspect Evidence <ExternalLink size={10} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
