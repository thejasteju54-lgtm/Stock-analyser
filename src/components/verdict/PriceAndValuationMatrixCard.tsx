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
    ADEQUATE: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Adequate MoS' },
    LIMITED: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Limited MoS' },
    NONE: { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', label: 'No Margin of Safety' },
    NEGATIVE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Negative MoS (Extended)' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', label: 'MoS Unassessable' },
  }[mos.status];

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
          <TrendingUp size={16} className="text-sky-400" />
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
            border: `1px solid ${mosColors.color}40`,
          }}
        >
          {mosColors.label}
        </span>
      </div>

      {/* Primary 3-Metric Hero Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {/* Sourced Market Price */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Current Price</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            ₹{marketPrice.price.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            Source: {marketPrice.sourceTier} • {marketPrice.freshnessStatus}
          </div>
        </div>

        {/* Intrinsic Fair Value Base */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Base Intrinsic Value</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            ₹{(valuationAssessment.triangulatedBasePrice || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            Triangulated DCF & Multiples
          </div>
        </div>

        {/* Margin of Safety Actual */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Actual MoS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: mosColors.color, fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            {mos.actualMarginOfSafetyPercent !== null ? `${mos.actualMarginOfSafetyPercent > 0 ? '+' : ''}${mos.actualMarginOfSafetyPercent}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
            Req: {mos.requiredMarginOfSafetyPercent}% ({mos.archetypeApplied})
          </div>
        </div>
      </div>

      {/* Scenario Valuation Range Bar */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Scenario Valuation Spectrum</span>
          <span style={{ color: '#64748b' }}>Bear vs Base vs Bull</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>BEAR ({scenarios.bearProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.bearValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#f87171' }}>
              {mos.downsideToBearPercent !== null ? `${mos.downsideToBearPercent}% downside` : ''}
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>BASE ({scenarios.baseProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.baseValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#38bdf8' }}>
              {mos.upsideToBasePercent !== null ? `${mos.upsideToBasePercent > 0 ? '+' : ''}${mos.upsideToBasePercent}% upside` : ''}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>BULL ({scenarios.bullProbabilityPercent}%)</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{(scenarios.bullValuation || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#34d399' }}>
              {mos.upsideToBullPercent !== null ? `+${mos.upsideToBullPercent}% upside` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Interesting Price Bracket & Expected Value */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginTop: 'auto' }}>
        {/* Interesting Entry Bracket */}
        <div style={{ background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={13} />
            Interesting Price Range
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            {ip.displayRange}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
            Entry zone satisfying {ip.impliedMarginOfSafetyPercent}% Margin of Safety requirement.
          </div>
        </div>

        {/* Probability-Weighted Expected Value */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Expected Scenario Value</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: scenarios.expectedValueStatus === 'CALCULATED' ? '#f8fafc' : '#64748b', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
            {scenarios.expectedScenarioValue ? `₹${scenarios.expectedScenarioValue.toLocaleString('en-IN')}` : 'NOT_ASSESSABLE'}
          </div>
          <div style={{ fontSize: '10px', color: scenarios.areProbabilitiesPlaceholders ? '#f59e0b' : '#64748b', marginTop: '4px' }}>
            {scenarios.areProbabilitiesPlaceholders ? 'Gated: Probabilities are placeholders' : 'Σ(Prob × Valuation)'}
          </div>
        </div>
      </div>
    </div>
  );
};
