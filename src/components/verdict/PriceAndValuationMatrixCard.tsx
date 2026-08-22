import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { TrendingUp, Sparkles } from 'lucide-react';

interface PriceAndValuationMatrixCardProps {
  report: InvestmentVerdictReport;
}

export const PriceAndValuationMatrixCard: React.FC<PriceAndValuationMatrixCardProps> = ({ report }) => {
  const { marketPrice, valuationAssessment, scenarios } = report;
  const mos = valuationAssessment.marginOfSafety;
  const ip = valuationAssessment.interestingPrice;

  const mosColors = {
    ADEQUATE: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', label: 'Adequate MoS' },
    LIMITED: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', label: 'Limited MoS' },
    NONE: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', label: 'No Margin of Safety' },
    NEGATIVE: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', label: 'Negative MoS (Extended)' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', label: 'MoS Unassessable' },
  }[mos.status];

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
          <TrendingUp size={16} color="var(--brand-blue)" />
          Price, Valuation & Margin of Safety
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: mosColors.color,
            background: mosColors.bg,
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${mosColors.border}`,
          }}
        >
          {mosColors.label}
        </span>
      </div>

      {/* Primary 3-Metric Hero Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {/* Sourced Market Price */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Price</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
            ₹{marketPrice.price.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Source: {marketPrice.sourceTier} • {marketPrice.freshnessStatus}
          </div>
        </div>

        {/* Intrinsic Fair Value Base */}
        <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--brand-blue)', textTransform: 'uppercase', fontWeight: 700 }}>Base Intrinsic Value</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-blue)', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
            ₹{(valuationAssessment.triangulatedBasePrice || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--brand-blue)', marginTop: '2px' }}>
            Triangulated DCF & Multiples
          </div>
        </div>

        {/* Margin of Safety Actual */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Actual MoS</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: mosColors.color, fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
            {mos.actualMarginOfSafetyPercent !== null ? `${mos.actualMarginOfSafetyPercent > 0 ? '+' : ''}${mos.actualMarginOfSafetyPercent}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Req: {mos.requiredMarginOfSafetyPercent}% ({mos.archetypeApplied})
          </div>
        </div>
      </div>

      {/* Scenario Valuation Range Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-navy)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Scenario Valuation Spectrum</span>
          <span style={{ color: 'var(--text-muted)' }}>Bear vs Base vs Bull</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-warning)', fontWeight: 700 }}>BEAR ({scenarios.bearProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.bearValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-warning)' }}>
              {mos.downsideToBearPercent !== null ? `${mos.downsideToBearPercent}% downside` : ''}
            </div>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--brand-blue)', fontWeight: 700 }}>BASE ({scenarios.baseProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.baseValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--brand-blue)' }}>
              {mos.upsideToBasePercent !== null ? `${mos.upsideToBasePercent > 0 ? '+' : ''}${mos.upsideToBasePercent}% upside` : ''}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-bullish)', fontWeight: 700 }}>BULL ({scenarios.bullProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.bullValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>
              {mos.upsideToBullPercent !== null ? `+${mos.upsideToBullPercent}% upside` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Interesting Price Bracket & Expected Value */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
        {/* Interesting Entry Bracket */}
        <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={13} />
            Interesting Price Range
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            {ip.displayRange}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Entry zone satisfying {ip.impliedMarginOfSafetyPercent}% Margin of Safety.
          </div>
        </div>

        {/* Probability-Weighted Expected Value */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Scenario Value</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            {scenarios.expectedScenarioValue ? `₹${scenarios.expectedScenarioValue.toLocaleString('en-IN')}` : 'NOT_ASSESSABLE'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Σ(Probability × Target Value)
          </div>
        </div>
      </div>
    </div>
  );
};
