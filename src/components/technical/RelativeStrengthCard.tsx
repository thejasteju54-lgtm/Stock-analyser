import React from 'react';
import { RelativeStrengthAssessment } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface RelativeStrengthCardProps {
  relativeStrength: RelativeStrengthAssessment;
}

export const RelativeStrengthCard: React.FC<RelativeStrengthCardProps> = ({
  relativeStrength,
}) => {
  const getBadge = (cls: string) => {
    if (cls === 'OUTPERFORMING') return <Badge variant="bullish">OUTPERFORMING</Badge>;
    if (cls === 'UNDERPERFORMING') return <Badge variant="bearish">UNDERPERFORMING</Badge>;
    if (cls === 'IN_LINE') return <Badge variant="neutral">IN LINE</Badge>;
    return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
  };

  const { broadMarketComparison, sectorComparison, diagnosticNotes } = relativeStrength;

  return (
    <Card
      title="Relative Strength Benchmarking (Alpha Matrix)"
      subtitle="Relative performance comparisons against NIFTY 50 and Sector Index across 1M, 3M, 6M, and 1Y."
      icon={<TrendingUp size={16} color="var(--color-primary)" />}
    >
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>BENCHMARK</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TYPE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>1M ALPHA</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>3M ALPHA</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>6M ALPHA</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>1Y ALPHA</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>CLASSIFICATION</th>
            </tr>
          </thead>
          <tbody>
            {/* Broad Market (NIFTY 50) */}
            {broadMarketComparison ? (
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {broadMarketComparison.benchmarkName} ({broadMarketComparison.benchmarkSymbol})
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Broad Market</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: broadMarketComparison.relativeReturn1M && broadMarketComparison.relativeReturn1M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {broadMarketComparison.relativeReturn1M !== null ? `${broadMarketComparison.relativeReturn1M > 0 ? '+' : ''}${broadMarketComparison.relativeReturn1M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: broadMarketComparison.relativeReturn3M && broadMarketComparison.relativeReturn3M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {broadMarketComparison.relativeReturn3M !== null ? `${broadMarketComparison.relativeReturn3M > 0 ? '+' : ''}${broadMarketComparison.relativeReturn3M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: broadMarketComparison.relativeReturn6M && broadMarketComparison.relativeReturn6M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {broadMarketComparison.relativeReturn6M !== null ? `${broadMarketComparison.relativeReturn6M > 0 ? '+' : ''}${broadMarketComparison.relativeReturn6M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: broadMarketComparison.relativeReturn1Y && broadMarketComparison.relativeReturn1Y > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {broadMarketComparison.relativeReturn1Y !== null ? `${broadMarketComparison.relativeReturn1Y > 0 ? '+' : ''}${broadMarketComparison.relativeReturn1Y.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px' }}>{getBadge(broadMarketComparison.classification)}</td>
              </tr>
            ) : (
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>NIFTY 50</td>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Broad Market</td>
                <td colSpan={5} style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Benchmark data unavailable.</td>
              </tr>
            )}

            {/* Sector Benchmark */}
            {sectorComparison ? (
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {sectorComparison.benchmarkName} ({sectorComparison.benchmarkSymbol})
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Sector Benchmark</td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: sectorComparison.relativeReturn1M && sectorComparison.relativeReturn1M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {sectorComparison.relativeReturn1M !== null ? `${sectorComparison.relativeReturn1M > 0 ? '+' : ''}${sectorComparison.relativeReturn1M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: sectorComparison.relativeReturn3M && sectorComparison.relativeReturn3M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {sectorComparison.relativeReturn3M !== null ? `${sectorComparison.relativeReturn3M > 0 ? '+' : ''}${sectorComparison.relativeReturn3M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: sectorComparison.relativeReturn6M && sectorComparison.relativeReturn6M > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {sectorComparison.relativeReturn6M !== null ? `${sectorComparison.relativeReturn6M > 0 ? '+' : ''}${sectorComparison.relativeReturn6M.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: sectorComparison.relativeReturn1Y && sectorComparison.relativeReturn1Y > 0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                  {sectorComparison.relativeReturn1Y !== null ? `${sectorComparison.relativeReturn1Y > 0 ? '+' : ''}${sectorComparison.relativeReturn1Y.toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '8px 12px' }}>{getBadge(sectorComparison.classification)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {diagnosticNotes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {diagnosticNotes.map((note, idx) => (
            <div key={idx} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={12} />
              {note}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
