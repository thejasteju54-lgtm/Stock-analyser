import React from 'react';
import { ThesisBreaker, BreakerStatus } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Target, AlertOctagon, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ThesisBreakersCardProps {
  thesisBreakers: ThesisBreaker[];
}

export const ThesisBreakersCard: React.FC<ThesisBreakersCardProps> = ({ thesisBreakers }) => {
  const getStatusBadge = (status: BreakerStatus) => {
    switch (status) {
      case 'SAFE':
        return (
          <Badge variant="bullish">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={11} /> SAFE
            </span>
          </Badge>
        );
      case 'APPROACHING_TRIGGER':
        return (
          <Badge variant="neutral">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <AlertTriangle size={11} stroke="var(--color-warning)" /> APPROACHING
            </span>
          </Badge>
        );
      case 'BREACHED':
        return (
          <Badge variant="bearish">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <AlertOctagon size={11} stroke="var(--color-error)" /> BREACHED
            </span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <HelpCircle size={11} /> NOT ASSESSABLE
            </span>
          </Badge>
        );
    }
  };

  return (
    <Card className="thesis-breakers-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} stroke="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Falsifiable Thesis Breakers & Invalidation Triggers ({thesisBreakers.length})
          </h3>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Strict Falsification Test Gate (Pre-Verdict Boundary)
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="terminal-table" style={{ width: '100%', fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '22%' }}>Investment Premise</th>
              <th style={{ textAlign: 'left', width: '26%' }}>Invalidation Condition</th>
              <th style={{ textAlign: 'left', width: '14%' }}>Threshold Trigger</th>
              <th style={{ textAlign: 'right', width: '12%' }}>Current Metric</th>
              <th style={{ textAlign: 'center', width: '12%' }}>Breach Status</th>
              <th style={{ textAlign: 'left', width: '14%' }}>Advisory Signal</th>
            </tr>
          </thead>
          <tbody>
            {thesisBreakers.map((tb) => (
              <tr key={tb.breakerId}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tb.premise}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {tb.invalidationCondition}
                </td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {tb.metric} {tb.operator === 'LESS_THAN' ? '<' : tb.operator === 'GREATER_THAN' ? '>' : '='} {String(tb.thresholdValue)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {tb.currentValue !== null ? String(tb.currentValue) : 'N/A'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {getStatusBadge(tb.currentStatus)}
                </td>
                <td>
                  <span style={{ fontSize: '10px', color: tb.currentStatus === 'BREACHED' ? 'var(--color-error)' : 'var(--text-muted)' }}>
                    {tb.recommendationImpactSignal.suggestedVerdictAction.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
