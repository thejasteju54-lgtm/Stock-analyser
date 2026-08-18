import React from 'react';
import { DcfSensitivityMatrix } from '../../domain/valuation/ValuationTypes';
import { Card } from '../common/Card';

interface DcfSensitivityCardProps {
  matrix: DcfSensitivityMatrix;
  currentPrice: number;
}

export const DcfSensitivityCard: React.FC<DcfSensitivityCardProps> = ({ matrix, currentPrice }) => {
  return (
    <Card
      title="2D DCF Sensitivity Matrix"
      subtitle="Intrinsic value per share sensitivity across discount rate (WACC) and perpetual terminal growth rate (g)."
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>
                WACC \ g (Growth)
              </th>
              {matrix.terminalGrowthRange.map((g, gIdx) => (
                <th
                  key={gIdx}
                  style={{
                    padding: '8px 12px',
                    fontWeight: 700,
                    color: gIdx === matrix.baseGrowthIndex ? '#0284c7' : 'var(--text-secondary)',
                    background: gIdx === matrix.baseGrowthIndex ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                  }}
                >
                  {g.toFixed(1)}% {gIdx === matrix.baseGrowthIndex ? '(Base)' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.waccRange.map((wacc, wIdx) => (
              <tr key={wIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td
                  style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: wIdx === matrix.baseWaccIndex ? '#0284c7' : 'var(--text-primary)',
                    background: wIdx === matrix.baseWaccIndex ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
                  }}
                >
                  {wacc.toFixed(1)}% {wIdx === matrix.baseWaccIndex ? '(Base WACC)' : ''}
                </td>
                {matrix.terminalGrowthRange.map((_, gIdx) => {
                  const val = matrix.valuesPerShare[wIdx][gIdx];
                  const isBase = wIdx === matrix.baseWaccIndex && gIdx === matrix.baseGrowthIndex;
                  const isDiscount = val >= currentPrice;

                  return (
                    <td
                      key={gIdx}
                      style={{
                        padding: '8px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: isBase ? 800 : 600,
                        fontSize: isBase ? '13px' : '12px',
                        background: isBase
                          ? 'rgba(22, 163, 74, 0.15)'
                          : isDiscount
                          ? 'rgba(22, 163, 74, 0.04)'
                          : 'rgba(239, 68, 68, 0.04)',
                        color: isBase ? '#15803d' : isDiscount ? '#16a34a' : '#dc2626',
                        border: isBase ? '2px solid #16a34a' : '1px solid var(--border-subtle)',
                      }}
                    >
                      ₹{val.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right' }}>
        *Highlighted cell indicates Base Case DCF valuation per share relative to current market price ₹{currentPrice.toFixed(1)}.
      </div>
    </Card>
  );
};
