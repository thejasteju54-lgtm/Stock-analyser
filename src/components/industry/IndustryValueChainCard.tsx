import React from 'react';
import { ValueChainStage } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { GitCommit } from 'lucide-react';

interface IndustryValueChainCardProps {
  valueChain: ValueChainStage[];
}

export const IndustryValueChainCard: React.FC<IndustryValueChainCardProps> = ({
  valueChain,
}) => {
  return (
    <Card
      title="Sector Value Chain Mapping & Profit Pool Capture"
      subtitle="5-Stage industry value chain showing company positioning, profit pool share, upstream raw material dependencies, and downstream distribution risks."
      icon={<GitCommit size={16} color="var(--color-primary)" />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {valueChain.map((stage, idx) => (
          <div
            key={stage.stageId}
            style={{
              padding: '14px',
              background: stage.isCompanyPresent ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)',
              border: stage.isCompanyPresent ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                STAGE {idx + 1}
              </span>
              {stage.isCompanyPresent ? (
                <Badge variant="cyan">COMPANY ACTIVE</Badge>
              ) : (
                <Badge variant="neutral">EXTERNAL</Badge>
              )}
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {stage.stageName.replace(/_/g, ' ')}
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {stage.description}
            </div>

            {/* Estimated Margin Capture */}
            {stage.marginCaptureEstimatedPercent !== undefined && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                Est. Stage EBITDA Pool: <strong style={{ color: 'var(--color-bullish)' }}>{stage.marginCaptureEstimatedPercent}%</strong>
              </div>
            )}

            {/* Upstream / Downstream risks */}
            {stage.upstreamRisks.length > 0 && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--color-warning)' }}>Upstream Risk:</span> {stage.upstreamRisks[0]}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
