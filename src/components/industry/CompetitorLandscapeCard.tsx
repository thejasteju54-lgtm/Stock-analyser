import React from 'react';
import { IndustryCompetitor, CompanyIndustryPosition } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Users } from 'lucide-react';

interface CompetitorLandscapeCardProps {
  companySymbol: string;
  competitors: IndustryCompetitor[];
  companyPosition: CompanyIndustryPosition;
}

export const CompetitorLandscapeCard: React.FC<CompetitorLandscapeCardProps> = ({
  companySymbol,
  competitors,
  companyPosition,
}) => {
  return (
    <Card
      title="Peer Competitor Benchmarking & Relative Moat Assessment"
      subtitle="Audited financial comparisons across operating peers with reporting period disclosure and verified market share tracking."
      icon={<Users size={16} color="var(--color-primary)" />}
      action={
        <Badge variant="cyan">
          RELATIVE POSITION: {companyPosition.marketPosition}
        </Badge>
      }
    >
      {/* Company Position Summary */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GROWTH VS SECTOR</span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-bullish)' }}>{companyPosition.growthRelativeToIndustry}</div>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MARGIN VS PEERS</span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{companyPosition.marginRelativeToPeers}</div>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ROCE VS PEERS</span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-bullish)' }}>{companyPosition.ROCERelativeToPeers}</div>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PRICING POWER</span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>{companyPosition.pricingPower}</div>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong>Moat Rationale:</strong> {companyPosition.competitiveAdvantage}
        </div>
      </div>

      {/* Competitors Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 6px' }}>Company</th>
              <th style={{ padding: '8px 6px' }}>Market Focus</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Revenue (Cr)</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>YoY Growth</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>EBITDA %</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>ROE %</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>ROCE %</th>
              <th style={{ padding: '8px 6px', textAlign: 'right' }}>Market Share</th>
              <th style={{ padding: '8px 6px' }}>Period</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp) => (
              <tr
                key={comp.companyId}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: comp.symbol === companySymbol ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                }}
              >
                <td style={{ padding: '8px 6px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {comp.name}
                  {comp.periodMismatchFlag && (
                    <span title="Reporting period mismatch" style={{ marginLeft: '4px', color: 'var(--color-warning)' }}>*</span>
                  )}
                </td>
                <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{comp.marketPosition}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {comp.revenue ? `₹${comp.revenue.toLocaleString('en-IN')}` : 'N/A'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)' }}>
                  {comp.growth !== null ? `${comp.growth}%` : 'N/A'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {comp.margin !== null ? `${comp.margin}%` : 'N/A'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {comp.ROE !== null ? `${comp.ROE}%` : 'N/A'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  {comp.ROCE !== null ? `${comp.ROCE}%` : 'N/A'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {comp.marketShare !== null ? `${comp.marketShare}%` : 'NOT_ASSESSABLE'}
                </td>
                <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{comp.revenuePeriod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
