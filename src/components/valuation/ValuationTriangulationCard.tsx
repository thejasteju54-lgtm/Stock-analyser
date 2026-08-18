import React from 'react';
import { ValuationTriangulationItem } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface ValuationTriangulationCardProps {
  items: ValuationTriangulationItem[];
  marginOfSafety: {
    vsBearValuePercent: number | null;
    vsBaseValuePercent: number | null;
    vsBullValuePercent: number | null;
    downsideToBearPercent: number | null;
    upsideToBasePercent: number | null;
    upsideToBullPercent: number | null;
  };
  currentPrice: number;
}

export const ValuationTriangulationCard: React.FC<ValuationTriangulationCardProps> = ({
  items,
  marginOfSafety,
  currentPrice,
}) => {
  return (
    <Card
      title="Valuation Triangulation & Multi-Scenario Margin of Safety"
      subtitle="Weighted multi-methodology synthesis and downside/upside asymmetries across Bear, Base, and Bull scenarios."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            METHODOLOGY SYNTHESIS & DYNAMIC WEIGHTS:
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>METHOD</th>
                <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>VALUE / SH</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>WEIGHT</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600 }}>ASSUMPTION INTENSITY</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.methodId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{it.methodName}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    ₹{it.derivedValuePerShare.toFixed(1)}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 700 }}>
                    {it.dynamicWeight}%
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <Badge variant={it.assumptionIntensity === 'LOW' ? 'bullish' : it.assumptionIntensity === 'MEDIUM' ? 'neutral' : 'warning'}>
                      {it.assumptionIntensity} INTENSITY
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            SCENARIO MARGIN OF SAFETY (PRICE: ₹{currentPrice.toFixed(1)}):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>BEAR CASE (MoS)</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: marginOfSafety.vsBearValuePercent && marginOfSafety.vsBearValuePercent >= 0 ? '#16a34a' : '#dc2626' }}>
                {marginOfSafety.vsBearValuePercent !== null ? `${marginOfSafety.vsBearValuePercent > 0 ? '+' : ''}${marginOfSafety.vsBearValuePercent.toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Downside: {marginOfSafety.downsideToBearPercent !== null ? `${marginOfSafety.downsideToBearPercent.toFixed(1)}%` : '—'}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'rgba(2, 132, 199, 0.05)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 600 }}>BASE CASE (MoS)</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: marginOfSafety.vsBaseValuePercent && marginOfSafety.vsBaseValuePercent >= 0 ? '#16a34a' : '#dc2626' }}>
                {marginOfSafety.vsBaseValuePercent !== null ? `${marginOfSafety.vsBaseValuePercent > 0 ? '+' : ''}${marginOfSafety.vsBaseValuePercent.toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Upside: {marginOfSafety.upsideToBasePercent !== null ? `${marginOfSafety.upsideToBasePercent > 0 ? '+' : ''}${marginOfSafety.upsideToBasePercent.toFixed(1)}%` : '—'}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.05)', border: '1px solid rgba(22, 163, 74, 0.2)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>BULL CASE (MoS)</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: marginOfSafety.vsBullValuePercent && marginOfSafety.vsBullValuePercent >= 0 ? '#16a34a' : '#dc2626' }}>
                {marginOfSafety.vsBullValuePercent !== null ? `${marginOfSafety.vsBullValuePercent > 0 ? '+' : ''}${marginOfSafety.vsBullValuePercent.toFixed(1)}%` : '—'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Upside: {marginOfSafety.upsideToBullPercent !== null ? `+${marginOfSafety.upsideToBullPercent.toFixed(1)}%` : '—'}
              </div>
            </div>
          </div>

          <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            *Margin of Safety (MoS) is defined as (Intrinsic Value - Current Price) / Intrinsic Value. A positive MoS indicates the current market price trades below estimated intrinsic value.
          </div>
        </div>
      </div>
    </Card>
  );
};
