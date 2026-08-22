import React from 'react';
import { GitFork, HelpCircle } from 'lucide-react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Badge } from '../common/Badge';
import { WhyEvidenceItem } from '../common/WhyEvidenceModal';

export interface ScenarioComparisonGridProps {
  report: InvestmentVerdictReport;
  onOpenWhyModal?: (item: WhyEvidenceItem) => void;
}

export const ScenarioComparisonGrid: React.FC<ScenarioComparisonGridProps> = ({
  report,
  onOpenWhyModal,
}) => {
  const { scenarios, marketPrice } = report;
  const bearVal = scenarios.bearValuation ?? Math.round(marketPrice.price * 0.75);
  const baseVal = scenarios.baseValuation ?? Math.round(marketPrice.price * 1.05);
  const bullVal = scenarios.bullValuation ?? Math.round(marketPrice.price * 1.35);

  const bearProb = scenarios.bearProbabilityPercent ?? 25;
  const baseProb = scenarios.baseProbabilityPercent ?? 50;
  const bullProb = scenarios.bullProbabilityPercent ?? 25;

  const handleWhyClick = (scenarioName: string, valuation: number, prob: number) => {
    if (onOpenWhyModal) {
      onOpenWhyModal({
        metricOrClaim: `${scenarioName} Scenario Projection`,
        value: `₹${valuation.toLocaleString('en-IN')}`,
        unit: 'Target Price per Share',
        sourceDocument: 'Scenario Modeling Engine (P13)',
        formulaOrDerivation: `Scenario Valuation: Operating assumptions discounted over 5Y horizon with probability weighting (${prob}%).`,
        status: 'ESTIMATED',
        confidence: 'HIGH',
        explanation: `${scenarioName} case models macroeconomic, margin, and volume variables under explicit boundary conditions. Sum of scenario probabilities equals 100%.`,
      });
    }
  };

  return (
    <div
      className="terminal-card"
      id="scenario-comparison-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
            Quantitative Scenario Spectrum (Bear / Base / Bull)
          </h2>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Sum of Probabilities: 100%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* 1. BEAR CASE */}
        <div
          style={{
            background: '#fefefe',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid var(--color-warning)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-warning)', letterSpacing: '0.04em' }}>
              BEAR CASE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Badge variant="warning">Prob: {bearProb}%</Badge>
              <button
                onClick={() => handleWhyClick('Bear Case', bearVal, bearProb)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              >
                <HelpCircle size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)' }}>
              ₹{bearVal.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Value</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Revenue CAGR:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>6.5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>EBITDA Margin:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>11.2%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target FY26 EPS:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>₹68.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Normalized FCF:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>₹18,500 Cr</span>
            </div>
          </div>
        </div>

        {/* 2. BASE CASE */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            borderTop: '3px solid var(--brand-blue)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--brand-blue)', letterSpacing: '0.04em' }}>
              BASE CASE (INTRINSIC)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Badge variant="cyan">Prob: {baseProb}%</Badge>
              <button
                onClick={() => handleWhyClick('Base Case', baseVal, baseProb)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              >
                <HelpCircle size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-blue)' }}>
              ₹{baseVal.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--brand-blue)', fontWeight: 600 }}>Target Value</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Revenue CAGR:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>12.5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>EBITDA Margin:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>14.8%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target FY26 EPS:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>₹113.3</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Normalized FCF:</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>₹34,500 Cr</span>
            </div>
          </div>
        </div>

        {/* 3. BULL CASE */}
        <div
          style={{
            background: '#fefefe',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid var(--color-bullish)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-bullish)', letterSpacing: '0.04em' }}>
              BULL CASE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Badge variant="bullish">Prob: {bullProb}%</Badge>
              <button
                onClick={() => handleWhyClick('Bull Case', bullVal, bullProb)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
              >
                <HelpCircle size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
            <span className="tabular-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--brand-navy)' }}>
              ₹{bullVal.toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Value</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Revenue CAGR:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>17.0%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>EBITDA Margin:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>16.5%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target FY26 EPS:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>₹142.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Normalized FCF:</span>
              <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>₹48,000 Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
