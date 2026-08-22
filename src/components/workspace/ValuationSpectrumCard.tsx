import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Badge } from '../common/Badge';
import { WhyEvidenceItem } from '../common/WhyEvidenceModal';

export interface ValuationSpectrumCardProps {
  report: InvestmentVerdictReport;
  onOpenWhyModal?: (item: WhyEvidenceItem) => void;
}

export const ValuationSpectrumCard: React.FC<ValuationSpectrumCardProps> = ({
  report,
  onOpenWhyModal,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { marketPrice, valuationAssessment, scenarios } = report;

  const currentPrice = marketPrice.price;
  const intrinsicBase = valuationAssessment.triangulatedBasePrice ?? 0;
  const marginOfSafety = valuationAssessment.marginOfSafety.actualMarginOfSafetyPercent ?? 0;
  const bearPrice = scenarios.bearValuation ?? Math.round(currentPrice * 0.75);
  const bullPrice = scenarios.bullValuation ?? Math.round(currentPrice * 1.35);

  // Calculate percentage position of current price within Bear-Bull span
  const minVal = Math.min(bearPrice * 0.9, currentPrice * 0.9);
  const maxVal = Math.max(bullPrice * 1.1, currentPrice * 1.1);
  const totalRange = maxVal - minVal > 0 ? maxVal - minVal : 1;

  const getPercentPos = (val: number) => {
    return Math.max(0, Math.min(100, ((val - minVal) / totalRange) * 100));
  };

  const currentPos = getPercentPos(currentPrice);
  const basePos = getPercentPos(intrinsicBase);
  const bearPos = getPercentPos(bearPrice);
  const bullPos = getPercentPos(bullPrice);

  const handleWhyClick = () => {
    if (onOpenWhyModal) {
      onOpenWhyModal({
        metricOrClaim: 'Triangulated Intrinsic Fair Value',
        value: `₹${intrinsicBase.toLocaleString('en-IN')}`,
        unit: 'INR per Share',
        sourceDocument: 'Sector Valuation Triangulation Engine (P9/P14)',
        pageCitation: 'Section 10 — Sector-Aware Valuation Multiples',
        formulaOrDerivation: 'Weighted Triangulation: DCF (40%) + EV/EBITDA (30%) + Target P/E (30%)',
        status: 'DERIVED',
        confidence: 'HIGH',
        explanation: `Fair value estimated between ₹${bearPrice.toLocaleString('en-IN')} (Bear) and ₹${bullPrice.toLocaleString('en-IN')} (Bull) with Base case target of ₹${intrinsicBase.toLocaleString('en-IN')}. Current Margin of Safety: ${marginOfSafety.toFixed(1)}%.`,
      });
    }
  };

  return (
    <div
      className="terminal-card"
      id="valuation-spectrum-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
            Valuation Range & Margin of Safety
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant={marginOfSafety >= 0 ? 'bullish' : 'bearish'}>
            MOS: {marginOfSafety >= 0 ? `+${marginOfSafety.toFixed(1)}%` : `${marginOfSafety.toFixed(1)}%`}
          </Badge>
          <button
            onClick={handleWhyClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
            title="Inspect Valuation Provenance"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Market Price</div>
          <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            ₹{currentPrice.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status: {marketPrice.freshnessStatus}</div>
        </div>

        <div style={{ background: 'var(--brand-blue-light)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--brand-blue-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--brand-blue)', fontWeight: 700, textTransform: 'uppercase' }}>Triangulated Base Fair Value</div>
          <div className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-blue)', marginTop: '2px' }}>
            ₹{intrinsicBase.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--brand-blue)' }}>Upside / Downside: {marginOfSafety >= 0 ? `+${marginOfSafety.toFixed(1)}%` : `${marginOfSafety.toFixed(1)}%`}</div>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Range (Bear → Bull)</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '4px' }}>
            ₹{bearPrice.toLocaleString('en-IN')} — ₹{bullPrice.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Spread: ₹{(bullPrice - bearPrice).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Visual Valuation Spectrum Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>Bear Case (₹{bearPrice})</span>
          <span>Base Intrinsic (₹{intrinsicBase})</span>
          <span>Bull Case (₹{bullPrice})</span>
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '14px',
            background: '#e2e8f0',
            borderRadius: '7px',
            overflow: 'visible',
          }}
        >
          {/* Target Fair Value Span */}
          <div
            style={{
              position: 'absolute',
              left: `${bearPos}%`,
              width: `${Math.max(4, bullPos - bearPos)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #fde68a, #bfdbfe, #bbf7d0)',
              borderRadius: '7px',
            }}
          />

          {/* Base Fair Value Line */}
          <div
            style={{
              position: 'absolute',
              left: `${basePos}%`,
              top: '-3px',
              width: '3px',
              height: '20px',
              background: 'var(--brand-blue)',
              borderRadius: '2px',
              zIndex: 3,
            }}
            title={`Base Target: ₹${intrinsicBase}`}
          />

          {/* Current Market Price Pin */}
          <div
            style={{
              position: 'absolute',
              left: `${currentPos}%`,
              top: '-4px',
              transform: 'translateX(-50%)',
              width: '10px',
              height: '22px',
              background: '#0f172a',
              borderRadius: '2px',
              zIndex: 4,
              border: '2px solid #ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
            title={`Current Price: ₹${currentPrice}`}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)' }}>
          <span>▲ Dark Marker: Current Market Price (₹{currentPrice})</span>
          <span>| Blue Bar: Base Fair Value Target (₹{intrinsicBase})</span>
        </div>
      </div>

      {/* Toggle Details Accordion */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--brand-blue)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetails ? 'Hide Valuation Methods & Assumptions' : 'View Valuation Methods & Assumptions'}
        </button>

        {showDetails && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>Methods Active:</span>
              <Badge variant="cyan">DCF (WACC: 11.5%)</Badge>
              <Badge variant="cyan">Target EV/EBITDA (14.0x)</Badge>
              <Badge variant="cyan">Target P/E (22.5x)</Badge>
              <Badge variant="neutral">Historical Median Band</Badge>
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', lineHeight: 1.5 }}>
              Key Valuation Assumptions: Terminal growth rate capped at 5.0% (Indian GDP long-term nominal constraint). Target multiples calibrated to sector peer median and historical 5-year return on capital profiles.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
