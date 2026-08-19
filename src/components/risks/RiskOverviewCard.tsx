import React from 'react';
import { RiskMatrixSummary } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ShieldAlert, AlertTriangle, Scale, Activity } from 'lucide-react';

interface RiskOverviewCardProps {
  companySymbol: string;
  summary: RiskMatrixSummary;
}

export const RiskOverviewCard: React.FC<RiskOverviewCardProps> = ({ companySymbol, summary }) => {
  const getRatingVariant = (rating: string) => {
    switch (rating) {
      case 'EXTREME':
      case 'HIGH':
        return 'bearish';
      case 'ELEVATED':
      case 'MODERATE':
        return 'neutral';
      default:
        return 'bullish';
    }
  };

  const getAsymmetryVariant = (asym: string) => {
    switch (asym) {
      case 'HIGHLY_FAVORABLE':
      case 'FAVORABLE':
        return 'bullish';
      case 'BALANCED':
        return 'neutral';
      default:
        return 'bearish';
    }
  };

  return (
    <Card className="risk-overview-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldAlert size={18} stroke="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Risk Matrix & Catalyst Asymmetry
            </h3>
            <Badge variant={getRatingVariant(summary.aggregateRiskRating)}>
              {summary.aggregateRiskRating} RISK
            </Badge>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Company: {companySymbol} | Deduplicated Risks: {summary.deduplicatedRiskCount} (of {summary.totalRisksIdentified} raw flags)
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>RISK / REWARD ASYMMETRY</div>
          <Badge variant={getAsymmetryVariant(summary.asymmetryAssessment)}>
            {summary.asymmetryAssessment.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} stroke="var(--color-error)" /> CRITICAL RISKS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: summary.criticalRiskCount > 0 ? 'var(--color-error)' : 'var(--text-primary)', marginTop: '4px' }}>
            {summary.criticalRiskCount}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} stroke="var(--color-warning)" /> HIGH RISKS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: summary.highRiskCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)', marginTop: '4px' }}>
            {summary.highRiskCount}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> MEDIUM RISKS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {summary.mediumRiskCount}
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Scale size={12} /> NET RATIO (U/D)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: summary.netAsymmetryRatio >= 1.3 ? 'var(--color-success)' : summary.netAsymmetryRatio < 0.8 ? 'var(--color-error)' : 'var(--text-primary)', marginTop: '4px' }}>
            {summary.netAsymmetryRatio}x
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <strong>Scoring Methodology:</strong> {summary.methodologyNote}
      </div>
    </Card>
  );
};
