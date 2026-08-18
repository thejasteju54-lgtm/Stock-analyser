import React from 'react';
import { PeerValuationRecord } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface PeerComparisonCardProps {
  peers: PeerValuationRecord[];
}

export const PeerComparisonCard: React.FC<PeerComparisonCardProps> = ({ peers }) => {
  return (
    <Card
      title="Peer Valuation Benchmarking & Relevance"
      subtitle="Comparables selected via business model similarity, scale, and IQR outlier adjustments."
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPANY / PEER</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>RELEVANCE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>REVENUE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>EBITDA %</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ROCE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>P/E</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>EV/EBITDA</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>P/B</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((p) => (
              <tr
                key={p.peerId}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: p.isOutlierExcluded ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                }}
              >
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.companyName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {p.symbol} • {p.sector} • Date: {p.priceDate}
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.relevanceScore}%</span>
                    <Badge variant={p.relevanceScore >= 80 ? 'bullish' : 'neutral'}>
                      {p.relevanceScore >= 80 ? 'HIGH MATCH' : 'MODERATE'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {p.inclusionRationale}
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>₹{Math.round(p.revenue).toLocaleString('en-IN')} Cr</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{p.ebitdaMargin.toFixed(1)}%</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{p.roce.toFixed(1)}%</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {p.pe !== null ? `${p.pe.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {p.evEbitda !== null ? `${p.evEbitda.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
                  {p.pb !== null ? `${p.pb.toFixed(1)}x` : '—'}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  {p.isOutlierExcluded ? (
                    <div>
                      <Badge variant="bearish">OUTLIER EXCLUDED</Badge>
                      <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '2px' }}>
                        {p.exclusionReason}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="bullish">INCLUDED</Badge>
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
