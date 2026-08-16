import React from 'react';
import { FundamentalStrength, WatchItem } from '../../domain/analysis/FundamentalHealthTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle2, Eye, ExternalLink } from 'lucide-react';

interface StrengthsAndWatchItemsCardProps {
  strengths: FundamentalStrength[];
  watchItems: WatchItem[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const StrengthsAndWatchItemsCard: React.FC<StrengthsAndWatchItemsCardProps> = ({
  strengths,
  watchItems,
  onInspectEvidence,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
      {/* Strengths Card */}
      <Card
        title={`Verified Fundamental Strengths (${strengths.length})`}
        icon={<CheckCircle2 size={14} color="#10b981" />}
      >
        {strengths.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No prominent fundamental strengths identified in the target reporting period.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {strengths.map((str) => (
              <div
                key={str.strengthId}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '3px solid #10b981',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {str.title}
                  </span>
                  <Badge variant="cyan">{str.category}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {str.description}
                </p>
                {str.evidenceReferences.length > 0 && onInspectEvidence && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                    <button
                      onClick={() => onInspectEvidence(str.evidenceReferences)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-cyan)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: 0,
                        outline: 'none',
                        fontSize: '11px',
                      }}
                    >
                      Source Citations <ExternalLink size={10} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Watch Items Card */}
      <Card
        title={`Monitoring Watch Items (${watchItems.length})`}
        icon={<Eye size={14} color="#f59e0b" />}
      >
        {watchItems.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No specific operational watch items currently flagged.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {watchItems.map((item) => (
              <div
                key={item.watchItemId}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  <Badge variant="warning">{item.currentValue}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {item.description}
                </p>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '4px 6px',
                    borderRadius: '3px',
                    marginTop: '2px',
                  }}
                >
                  <strong>Reason to Monitor:</strong> {item.reasonForMonitoring}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
