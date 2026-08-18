import React from 'react';
import { EmbeddedExpectations } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface EmbeddedExpectationsCardProps {
  embedded: EmbeddedExpectations;
}

export const EmbeddedExpectationsCard: React.FC<EmbeddedExpectationsCardProps> = ({ embedded }) => {
  const getComparisonBadge = (status: string) => {
    switch (status) {
      case 'WITHIN_HISTORICAL_RANGE':
      case 'WITHIN_MANAGEMENT_GUIDANCE':
        return <Badge variant="bullish">WITHIN HISTORICAL RANGE</Badge>;
      case 'ABOVE_HISTORICAL_RANGE':
      case 'ABOVE_MANAGEMENT_GUIDANCE':
        return <Badge variant="warning">HIGH HURDLE (ABOVE HISTORY)</Badge>;
      case 'BELOW_HISTORICAL_RANGE':
        return <Badge variant="neutral">CONSERVATIVE (BELOW HISTORY)</Badge>;
      default:
        return <Badge variant="neutral">NOT COMPARABLE</Badge>;
    }
  };

  return (
    <Card
      title="Embedded Growth Expectations ('Perfection Priced In' Analysis)"
      subtitle="Reverse DCF solving for the sustained operational growth and margin hurdle required to justify the current price."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>IMPLIED 5Y REVENUE CAGR</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
            {embedded.impliedRevenueCagr.toFixed(1)}%
          </div>
          <div style={{ marginTop: '6px' }}>{getComparisonBadge(embedded.revenueGrowthComparison)}</div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>IMPLIED EBIT MARGIN</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#7c3aed' }}>
            {embedded.impliedEbitMargin.toFixed(1)}%
          </div>
          <div style={{ marginTop: '6px' }}>{getComparisonBadge(embedded.marginComparison)}</div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>IMPLIED ROCE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {embedded.impliedRoce !== null ? `${embedded.impliedRoce.toFixed(1)}%` : 'NOT ASSESSABLE'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Capital reinvestment efficiency
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>IMPLIED 5Y CUMULATIVE FCF</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
            ₹{embedded.impliedFcf5YearSum.toLocaleString('en-IN')} Cr
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cash delivery requirement
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '12px',
          background: 'rgba(2, 132, 199, 0.05)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
        }}
      >
        <strong>Diagnostic Finding:</strong> {embedded.diagnosticExplanation}
      </div>
    </Card>
  );
};
