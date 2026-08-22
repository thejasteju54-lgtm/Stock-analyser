import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { BarChart3 } from 'lucide-react';

interface ScenarioAndDownsideCardProps {
  report: InvestmentVerdictReport;
}

export const ScenarioAndDownsideCard: React.FC<ScenarioAndDownsideCardProps> = ({ report }) => {
  const { scenarios, valuationAssessment } = report;
  const mos = valuationAssessment.marginOfSafety;

  const downsideBadge = {
    STRONG: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', text: 'Strong Downside Protection' },
    MODERATE: { color: 'var(--brand-blue)', bg: 'var(--brand-blue-light)', border: 'var(--brand-blue-subtle)', text: 'Moderate Downside Cushion' },
    WEAK: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Weak Downside Buffer' },
    NONE: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'No Downside Floor' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', text: 'Downside Unassessable' },
  }[scenarios.downsideProtectionStatus];

  return (
    <div
      className="terminal-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <BarChart3 size={16} color="var(--brand-blue)" />
          Forward Scenarios & Downside Cushion
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: downsideBadge.color,
            background: downsideBadge.bg,
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${downsideBadge.border}`,
          }}
        >
          {downsideBadge.text}
        </span>
      </div>

      {/* Scenario Probability Weighted Table */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Probability</th>
              <th>Intrinsic Value</th>
              <th className="text-right">Price Spread</th>
            </tr>
          </thead>
          <tbody>
            {/* Bear */}
            <tr>
              <td style={{ fontWeight: 700, color: 'var(--color-warning)' }}>BEAR CASE</td>
              <td className="tabular-nums">{scenarios.bearProbabilityPercent}%</td>
              <td className="tabular-nums" style={{ fontWeight: 600 }}>
                ₹{(scenarios.bearValuation || 0).toLocaleString('en-IN')}
              </td>
              <td className="text-right tabular-nums" style={{ color: 'var(--color-warning)', fontWeight: 700 }}>
                {mos.downsideToBearPercent !== null ? `${mos.downsideToBearPercent}%` : 'N/A'}
              </td>
            </tr>

            {/* Base */}
            <tr style={{ background: 'var(--brand-blue-light)' }}>
              <td style={{ fontWeight: 800, color: 'var(--brand-blue)' }}>BASE CASE</td>
              <td className="tabular-nums" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>{scenarios.baseProbabilityPercent}%</td>
              <td className="tabular-nums" style={{ color: 'var(--brand-blue)', fontWeight: 800 }}>
                ₹{(scenarios.baseValuation || 0).toLocaleString('en-IN')}
              </td>
              <td className="text-right tabular-nums" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>
                {mos.upsideToBasePercent !== null ? `${mos.upsideToBasePercent > 0 ? '+' : ''}${mos.upsideToBasePercent}%` : 'N/A'}
              </td>
            </tr>

            {/* Bull */}
            <tr>
              <td style={{ fontWeight: 700, color: 'var(--color-bullish)' }}>BULL CASE</td>
              <td className="tabular-nums">{scenarios.bullProbabilityPercent}%</td>
              <td className="tabular-nums" style={{ fontWeight: 600 }}>
                ₹{(scenarios.bullValuation || 0).toLocaleString('en-IN')}
              </td>
              <td className="text-right tabular-nums" style={{ color: 'var(--color-bullish)', fontWeight: 700 }}>
                {mos.upsideToBullPercent !== null ? `+${mos.upsideToBullPercent}%` : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Downside Buffer Context */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', marginTop: 'auto' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {scenarios.summary}
        </div>
      </div>
    </div>
  );
};
