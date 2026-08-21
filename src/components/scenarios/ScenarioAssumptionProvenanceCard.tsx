/**
 * ScenarioAssumptionProvenanceCard.tsx
 * Phase 13 — 8-Tier Assumption Provenance Ledger with Audit Trail,
 * Derivation Traces, and Modal Inspector Triggers.
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScenarioAssumption } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioAssumptionProvenanceCardProps {
  assumptions: ScenarioAssumption[];
  onInspectAssumption: (assumption: ScenarioAssumption) => void;
}

export const ScenarioAssumptionProvenanceCard: React.FC<ScenarioAssumptionProvenanceCardProps> = ({
  assumptions,
  onInspectAssumption,
}) => {
  const getSourceBadgeVariant = (sourceType: string): 'bullish' | 'cyan' | 'warning' | 'bearish' => {
    switch (sourceType) {
      case 'COMPANY_DISCLOSURE':
      case 'HISTORICAL_DATA':
        return 'bullish';
      case 'INDUSTRY_DATA':
      case 'MANAGEMENT_GUIDANCE':
        return 'cyan';
      case 'CATALYST_RISK_SIGNAL':
      case 'MODEL_DERIVED':
        return 'warning';
      case 'USER_DEFINED':
        return 'bearish';
      default:
        return 'cyan';
    }
  };

  return (
    <Card
      title="Scenario Assumptions & Evidence Provenance"
      subtitle="8-tier hierarchy tracking verified company disclosures, historical baselines, and model derivations."
    >
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-4">Metric Assumption</th>
              <th className="py-2.5 px-3 text-right">Projected Value</th>
              <th className="py-2.5 px-3 text-right">Historical Median</th>
              <th className="py-2.5 px-4">Source Tier</th>
              <th className="py-2.5 px-4">Evidence Citations</th>
              <th className="py-2.5 px-3 text-center">Confidence</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans text-slate-200">
            {assumptions.map((a) => (
              <tr key={a.assumptionId} className="hover:bg-slate-800/30">
                <td className="py-2.5 px-4 font-medium text-slate-100">{a.metric}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-400">
                  {a.value} {a.unit}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                  {a.historicalBaseline !== undefined ? `${a.historicalBaseline} ${a.unit}` : '—'}
                </td>
                <td className="py-2.5 px-4">
                  <Badge variant={getSourceBadgeVariant(a.sourceType)}>
                    {a.sourceType.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="py-2.5 px-4 text-slate-300 truncate max-w-xs" title={a.sourceReferences.join('; ')}>
                  {a.sourceReferences[0] || 'Model Baseline'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="font-mono text-[11px] text-slate-300">{a.confidence}%</span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onInspectAssumption(a)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium px-2 py-0.5 rounded border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/60 transition-colors"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
