import React, { useState } from 'react';
import { RiskItem } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Layers, Eye } from 'lucide-react';

interface CrossLayerRiskBreakdownCardProps {
  crossLayerRiskSummary: {
    fundamentalRisks: RiskItem[];
    forensicRisks: RiskItem[];
    managementRisks: RiskItem[];
    valuationRisks: RiskItem[];
    technicalRisks: RiskItem[];
    industryRisks: RiskItem[];
  };
  onSelectRisk: (risk: RiskItem) => void;
}

export const CrossLayerRiskBreakdownCard: React.FC<CrossLayerRiskBreakdownCardProps> = ({
  crossLayerRiskSummary,
  onSelectRisk,
}) => {
  const [activeTab, setActiveTab] = useState<'FORENSIC' | 'MANAGEMENT' | 'VALUATION' | 'TECHNICAL' | 'INDUSTRY' | 'FUNDAMENTAL'>('FORENSIC');

  const getTabRisks = () => {
    switch (activeTab) {
      case 'FORENSIC':
        return crossLayerRiskSummary.forensicRisks;
      case 'MANAGEMENT':
        return crossLayerRiskSummary.managementRisks;
      case 'VALUATION':
        return crossLayerRiskSummary.valuationRisks;
      case 'TECHNICAL':
        return crossLayerRiskSummary.technicalRisks;
      case 'INDUSTRY':
        return crossLayerRiskSummary.industryRisks;
      case 'FUNDAMENTAL':
        return crossLayerRiskSummary.fundamentalRisks;
      default:
        return [];
    }
  };

  const risks = getTabRisks();

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bearish';
      case 'HIGH':
        return 'neutral';
      case 'MEDIUM':
        return 'neutral';
      default:
        return 'bullish';
    }
  };

  return (
    <Card className="cross-layer-risk-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} stroke="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Cross-Layer Risk Decomposition (Phases 5–11)
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['FORENSIC', 'MANAGEMENT', 'VALUATION', 'TECHNICAL', 'INDUSTRY', 'FUNDAMENTAL'] as const).map((tab) => {
            const count = (
              tab === 'FORENSIC' ? crossLayerRiskSummary.forensicRisks.length :
              tab === 'MANAGEMENT' ? crossLayerRiskSummary.managementRisks.length :
              tab === 'VALUATION' ? crossLayerRiskSummary.valuationRisks.length :
              tab === 'TECHNICAL' ? crossLayerRiskSummary.technicalRisks.length :
              tab === 'INDUSTRY' ? crossLayerRiskSummary.industryRisks.length :
              crossLayerRiskSummary.fundamentalRisks.length
            );
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`terminal-btn ${activeTab === tab ? 'terminal-btn-primary' : ''}`}
                style={{ fontSize: '10px', padding: '2px 8px' }}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {risks.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No critical or high-severity risk flags emitted from the {activeTab.toLowerCase()} analytical phase.
          </div>
        ) : (
          risks.map((risk) => (
            <div
              key={risk.riskId}
              onClick={() => onSelectRisk(risk)}
              style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Badge variant={getSeverityBadge(risk.severity)}>
                    {risk.severity} ({risk.netRiskScore}/25)
                  </Badge>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {risk.title}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {risk.description}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Exposure: {risk.measurableExposure} | Velocity: {risk.velocity.replace(/_/g, ' ')} | Net: {risk.netExposure.replace(/_/g, ' ')}
                </div>
              </div>
              <Eye size={14} stroke="var(--color-primary)" style={{ flexShrink: 0 }} />
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
