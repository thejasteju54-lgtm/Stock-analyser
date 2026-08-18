import React, { useState } from 'react';
import { DcfScenario } from '../../domain/valuation/ValuationTypes';
import { Card } from '../common/Card';

interface DcfScenarioCardProps {
  scenarios: Record<'BEAR' | 'BASE' | 'BULL', DcfScenario>;
  waccBridge: { costOfEquity: number; costOfDebt: number; taxRate: number; wacc: number };
  currentPrice: number;
}

export const DcfScenarioCard: React.FC<DcfScenarioCardProps> = ({
  scenarios,
  waccBridge,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'BEAR' | 'BASE' | 'BULL'>('BASE');
  const activeScenario = scenarios[activeTab];

  return (
    <Card
      title="Intrinsic Valuation — FCFF DCF Scenarios"
      subtitle="5-year explicit free cash flow projections, CAPM WACC, and Gordon Growth terminal value."
      action={
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '4px' }}>
          {(['BEAR', 'BASE', 'BULL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: activeTab === tab ? 700 : 500,
                border: 'none',
                borderRadius: '3px',
                background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {tab} CASE
            </button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>5Y REVENUE CAGR</div>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {activeScenario.revenueCagr.toFixed(1)}%
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>EBIT MARGIN</div>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {activeScenario.terminalEbitMargin.toFixed(1)}%
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>DISCOUNT RATE (WACC)</div>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#7c3aed' }}>
            {activeScenario.wacc.toFixed(1)}%
          </div>
        </div>

        <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>TERMINAL GROWTH (g)</div>
          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {activeScenario.terminalGrowthRate.toFixed(1)}%
          </div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.3)', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 600 }}>INTRINSIC VALUE / SHARE</div>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#15803d' }}>
            ₹{activeScenario.valuePerShare.toFixed(1)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          PROJECTED CASH FLOWS (YEAR 1 TO YEAR 5) & TERMINAL VALUE:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
          {activeScenario.projectedCashFlows.map((cf, idx) => (
            <div key={idx} style={{ padding: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>YR {idx + 1} FCFF</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{Math.round(cf)} Cr</div>
            </div>
          ))}
          <div style={{ padding: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TERMINAL VAL</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>₹{Math.round(activeScenario.terminalValue)} Cr</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '11px' }}>
        <span>
          <strong>WACC Bridge:</strong> Ke {waccBridge.costOfEquity}% (CAPM Rf 7.1%, Beta 1.05, ERP 6.0%) + Kd(post-tax) {waccBridge.costOfDebt}%
        </span>
        <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: activeScenario.marginOfSafetyPercent >= 0 ? '#16a34a' : '#dc2626' }}>
          Margin of Safety: {activeScenario.marginOfSafetyPercent >= 0 ? `+${activeScenario.marginOfSafetyPercent}%` : `${activeScenario.marginOfSafetyPercent}%`} vs ₹{currentPrice.toFixed(1)} Price
        </span>
      </div>
    </Card>
  );
};
