import React from 'react';
import { CrossLayerSensitivityItem } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Link2, ArrowRight, Eye } from 'lucide-react';

interface CrossLayerSensitivityCardProps {
  sensitivities: CrossLayerSensitivityItem[];
}

export const CrossLayerSensitivityCard: React.FC<CrossLayerSensitivityCardProps> = ({
  sensitivities,
}) => {
  const getPhaseColor = (targetPhase: string) => {
    switch (targetPhase) {
      case 'PHASE_5_FINANCIALS':
        return 'var(--color-primary)';
      case 'PHASE_6_HEALTH':
        return 'var(--color-bullish)';
      case 'PHASE_7_FORENSICS':
        return 'var(--color-bearish)';
      case 'PHASE_8_MANAGEMENT':
        return 'var(--color-purple)';
      case 'PHASE_9_VALUATION':
        return 'var(--color-cyan)';
      case 'PHASE_10_TECHNICAL':
        return 'var(--color-warning)';
      default:
        return 'var(--text-secondary)';
    }
  };

  return (
    <Card
      title="Decoupled Cross-Layer Sensitivity & Observation Links"
      subtitle="Connecting verified external shocks and industry drivers to financial, forensic, management, valuation, and technical analysis layers without mutating underlying historical facts."
      icon={<Link2 size={16} color="var(--color-primary)" />}
      action={
        <Badge variant="cyan">
          <Eye size={10} style={{ marginRight: '4px' }} />
          OBSERVATION ONLY (ZERO MUTATION)
        </Badge>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sensitivities.map((item) => (
          <div
            key={item.linkageId}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: getPhaseColor(item.targetPhase),
                    padding: '2px 6px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {item.targetPhase.replace('_', ' ')}
                </span>
                <ArrowRight size={12} color="var(--text-muted)" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Channel: {item.financialChannel}
                </span>
              </div>
              <Badge variant="neutral">{item.status}</Badge>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Shock Trigger: {item.shockEventHeadline}
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {item.observationNote}
            </p>

            {item.correlationContext && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {item.correlationContext}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
