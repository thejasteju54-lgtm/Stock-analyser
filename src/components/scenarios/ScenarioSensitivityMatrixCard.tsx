/**
 * ScenarioSensitivityMatrixCard.tsx
 * Phase 13 — 2D Interactive Valuation Sensitivity Matrix (Revenue Growth x Margin)
 * and Top Value Drivers Elasticity Ranking.
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TwoWaySensitivityGrid, AssumptionElasticityItem } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioSensitivityMatrixCardProps {
  sensitivityGrid: TwoWaySensitivityGrid;
  elasticityItems: AssumptionElasticityItem[];
}

export const ScenarioSensitivityMatrixCard: React.FC<ScenarioSensitivityMatrixCardProps> = ({
  sensitivityGrid,
  elasticityItems,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 2D Sensitivity Heatmap */}
      <Card
        title="2D Valuation Sensitivity Matrix"
        subtitle={`${sensitivityGrid.rowMetric} vs ${sensitivityGrid.colMetric} (Derived Value Per Share in INR)`}
      >
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-2 text-left bg-slate-950 font-semibold border-b border-slate-800">
                  Growth \ Margin
                </th>
                {sensitivityGrid.colValues.map((colVal, cIdx) => (
                  <th
                    key={cIdx}
                    className={`py-2 px-2 border-b border-slate-800 font-semibold ${
                      cIdx === sensitivityGrid.baseColIndex ? 'text-cyan-400 bg-cyan-950/30' : ''
                    }`}
                  >
                    {colVal}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono divide-y divide-slate-800/60">
              {sensitivityGrid.rowValues.map((rowVal, rIdx) => {
                const isBaseRow = rIdx === sensitivityGrid.baseRowIndex;
                return (
                  <tr key={rIdx} className="hover:bg-slate-800/20">
                    <td className={`py-2 px-3 text-left font-sans font-semibold text-slate-300 ${isBaseRow ? 'text-cyan-400 bg-cyan-950/30' : 'bg-slate-950/60'}`}>
                      {rowVal > 0 ? `+${rowVal}%` : `${rowVal}%`}
                    </td>
                    {sensitivityGrid.colValues.map((_, cIdx) => {
                      const isBaseCol = cIdx === sensitivityGrid.baseColIndex;
                      const isCenter = isBaseRow && isBaseCol;
                      const val = sensitivityGrid.valuationMatrix[rIdx][cIdx];

                      const cellStyle = isCenter
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold ring-1 ring-cyan-400'
                        : isBaseRow || isBaseCol
                        ? 'bg-slate-800/40 text-slate-200'
                        : 'text-slate-300';

                      return (
                        <td key={cIdx} className={`py-2 px-2 ${cellStyle}`}>
                          ₹{val.toLocaleString('en-IN')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Value Drivers Elasticity */}
      <Card
        title="Top Value Drivers & Assumption Elasticity"
        subtitle="Elasticity ranking showing sensitivity of valuation to individual operational levers."
      >
        <div className="space-y-3">
          {elasticityItems.map((item, idx) => {
            const badgeVariant =
              item.impactClassification === 'HIGH_IMPACT'
                ? 'bearish'
                : item.impactClassification === 'MEDIUM_IMPACT'
                ? 'warning'
                : 'cyan';

            return (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-800 bg-slate-900/50 flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">{item.metric}</span>
                    <Badge variant={badgeVariant}>
                      {item.impactClassification.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.valuationElasticityPercent}x Elasticity
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.rationale}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
