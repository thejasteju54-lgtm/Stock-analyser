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
    STRONG: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Strong Downside Protection' },
    MODERATE: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', text: 'Moderate Downside Cushion' },
    WEAK: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Weak Downside Buffer' },
    NONE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'No Downside Floor' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: 'Downside Unassessable' },
  }[scenarios.downsideProtectionStatus];

  return (
    <div
      style={{
        background: '#0c1017',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={16} className="text-violet-400" />
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
            border: `1px solid ${downsideBadge.color}40`,
          }}
        >
          {downsideBadge.text}
        </span>
      </div>

      {/* Scenario Probability Weighted Table */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 14px' }}>Scenario</th>
              <th style={{ padding: '10px 14px' }}>Probability</th>
              <th style={{ padding: '10px 14px' }}>Intrinsic Value</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Price Spread</th>
            </tr>
          </thead>
          <tbody>
            {/* Bear */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#ef4444' }}>BEAR CASE</td>
              <td style={{ padding: '10px 14px', color: '#f8fafc' }}>{scenarios.bearProbabilityPercent}%</td>
              <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#f8fafc' }}>
                ₹{(scenarios.bearValuation || 0).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                {mos.downsideToBearPercent !== null ? `${mos.downsideToBearPercent}%` : 'N/A'}
              </td>
            </tr>

            {/* Base */}
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: 'rgba(56, 189, 248, 0.03)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>BASE CASE</td>
              <td style={{ padding: '10px 14px', color: '#f8fafc' }}>{scenarios.baseProbabilityPercent}%</td>
              <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#38bdf8', fontWeight: 700 }}>
                ₹{(scenarios.baseValuation || 0).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#38bdf8', fontWeight: 600 }}>
                {mos.upsideToBasePercent !== null ? `${mos.upsideToBasePercent > 0 ? '+' : ''}${mos.upsideToBasePercent}%` : 'N/A'}
              </td>
            </tr>

            {/* Bull */}
            <tr>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#10b981' }}>BULL CASE</td>
              <td style={{ padding: '10px 14px', color: '#f8fafc' }}>{scenarios.bullProbabilityPercent}%</td>
              <td style={{ padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', color: '#f8fafc' }}>
                ₹{(scenarios.bullValuation || 0).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '10px 14px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                {mos.upsideToBullPercent !== null ? `+${mos.upsideToBullPercent}%` : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Downside Buffer Context */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
          {scenarios.summary}
        </div>
      </div>
    </div>
  );
};
