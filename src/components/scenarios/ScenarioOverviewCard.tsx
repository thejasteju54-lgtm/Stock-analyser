/**
 * ScenarioOverviewCard.tsx
 * Phase 13 — Overview of Base, Bull, and Bear Scenarios with Probabilities,
 * Horizon Confidences, Growth Rates, Valuation Intervals, and Switcher Toggle.
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScenarioType, ScenarioReport } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioOverviewCardProps {
  report: ScenarioReport;
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
}

export const ScenarioOverviewCard: React.FC<ScenarioOverviewCardProps> = ({
  report,
  activeScenario,
  onSelectScenario,
}) => {
  const scenarios: ScenarioType[] = ['BASE', 'BULL', 'BEAR'];

  return (
    <Card
      title="Forward Scenario Distribution & Valuation Outlook"
      subtitle="Evidence-backed 3-state operating scenarios with deterministic probability policies and justifiable valuation intervals."
      action={
        <div className="flex items-center gap-2">
          <Badge
            variant={
              report.overallModelConfidence === 'HIGH'
                ? 'bullish'
                : report.overallModelConfidence === 'MEDIUM'
                ? 'cyan'
                : 'warning'
            }
          >
            Model Confidence: {report.overallModelConfidence}
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((type) => {
          const sc = report.scenarios[type];
          const isSelected = activeScenario === type;
          const borderClass = isSelected
            ? type === 'BULL'
              ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-900/20'
              : type === 'BEAR'
              ? 'border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-900/20'
              : 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-900/20'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

          const badgeVariant = type === 'BULL' ? 'bullish' : type === 'BEAR' ? 'bearish' : 'cyan';

          return (
            <div
              key={type}
              onClick={() => onSelectScenario(type)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${borderClass}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-100 tracking-wide">{sc.scenarioTitle}</span>
                  <Badge variant={badgeVariant}>
                    {sc.isDisplayPlaceholder ? '33.3% (Placeholder)' : `${sc.probabilityPercent}% Probability`}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{sc.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">3Y Rev CAGR</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {report.comparison.revenueCagr3Yr[type]}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">EBITDA Margin</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {sc.marginProjection.ebitdaMarginPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Justified Valuation</span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {sc.valuationRange.valueIntervalDisplay}
                  </span>
                </div>
                <button
                  type="button"
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                    isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'Active View' : 'Select View'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
