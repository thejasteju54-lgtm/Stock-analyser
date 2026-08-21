/**
 * ScenarioInvalidationCard.tsx
 * Phase 13 — Falsifiable Scenario Invalidation Conditions &
 * Phase 12 Thesis Breakers Integration.
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScenarioInvalidationCondition } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioInvalidationCardProps {
  conditions: ScenarioInvalidationCondition[];
}

export const ScenarioInvalidationCard: React.FC<ScenarioInvalidationCardProps> = ({
  conditions,
}) => {
  return (
    <Card
      title="Scenario Invalidation Gates & Falsifiable Triggers"
      subtitle="Measurable boundary conditions linked to Phase 12 Thesis Breakers that would invalidate the active operating scenario."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditions.map((cond) => {
          const isApproaching = cond.status === 'APPROACHING_TRIGGER';
          const isInvalidated = cond.status === 'INVALIDATED';
          const badgeVariant = isInvalidated ? 'bearish' : isApproaching ? 'warning' : 'bullish';

          return (
            <div
              key={cond.conditionId}
              className="p-4 rounded-lg border border-slate-800 bg-slate-900/60 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-200">{cond.metric}</span>
                  <Badge variant={badgeVariant}>{cond.status.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{cond.rationale}</p>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2 rounded border border-slate-800/80 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Threshold</span>
                    <span className="text-xs font-semibold text-rose-400">
                      {String(cond.thresholdValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {String(cond.currentValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Trigger Buffer</span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {cond.distanceToTriggerPercent !== null ? `${cond.distanceToTriggerPercent}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span>Phase 12 Link: {cond.thesisBreakerReferenceId || 'Universal Threshold'}</span>
                <span>Operator: {cond.operator}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
