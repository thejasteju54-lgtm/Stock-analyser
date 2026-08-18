import React from 'react';
import { RelativeMultipleItem } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface RelativeValuationCardProps {
  multiples: RelativeMultipleItem[];
}

export const RelativeValuationCard: React.FC<RelativeValuationCardProps> = ({ multiples }) => {
  const getMultipleStatusBadge = (m: RelativeMultipleItem) => {
    switch (m.status) {
      case 'CALCULATED':
        return <Badge variant="neutral">CALCULATED</Badge>;
      case 'NOT_MEANINGFUL':
        return <Badge variant="bearish">NOT MEANINGFUL</Badge>;
      case 'NOT_APPLICABLE':
        return <Badge variant="warning">PROHIBITED (SECTOR)</Badge>;
      default:
        return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
    }
  };

  const formatPremium = (prem: number | null) => {
    if (prem === null) return '—';
    const isPrem = prem > 0;
    const color = isPrem ? '#dc2626' : '#16a34a';
    return (
      <span style={{ color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {isPrem ? `+${prem.toFixed(1)}%` : `${prem.toFixed(1)}%`}
      </span>
    );
  };

  return (
    <Card
      title="Relative Valuation Multiples"
      subtitle="Multiples benchmarked against peer medians and 5-year historical trading bands."
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>MULTIPLE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPANY VALUE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>PEER MEDIAN</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>5Y HISTORICAL</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>VS PEERS</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>VS HISTORY</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {multiples.map((m) => (
              <tr key={m.multipleCode} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div>{m.multipleName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.formula}</div>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>
                  {m.currentValue !== null ? `${m.currentValue.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {m.peerMedian !== null ? `${m.peerMedian.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  {m.historicalMedian !== null ? `${m.historicalMedian.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px' }}>{formatPremium(m.premiumToPeersPercent)}</td>
                <td style={{ padding: '8px 12px' }}>{formatPremium(m.premiumToHistoryPercent)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <div>{getMultipleStatusBadge(m)}</div>
                  {m.statusExplanation && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {m.statusExplanation}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
