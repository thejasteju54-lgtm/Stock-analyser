/**
 * AssumptionDetailModal.tsx
 * Phase 13 — Deep Assumption Provenance Drawer / Modal.
 * Shows Full Derivation Formulas, 8-Tier Source Categorization, and User Override Workflow.
 */

import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ScenarioAssumption } from '../../domain/scenarios/ScenarioTypes';

interface AssumptionDetailModalProps {
  assumption: ScenarioAssumption | null;
  onClose: () => void;
  onSaveOverride?: (assumptionId: string, newValue: number, rationale: string) => void;
}

export const AssumptionDetailModal: React.FC<AssumptionDetailModalProps> = ({
  assumption,
  onClose,
  onSaveOverride,
}) => {
  if (!assumption) return null;

  const [overrideVal, setOverrideVal] = useState<string>(String(assumption.value));
  const [rationale, setRationale] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleSave = () => {
    const num = parseFloat(overrideVal);
    if (!isNaN(num) && onSaveOverride) {
      onSaveOverride(assumption.assumptionId, num, rationale);
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-100">{assumption.metric}</h3>
              <Badge variant="cyan">{assumption.scenarioId}</Badge>
              <Badge variant="bullish">{assumption.status}</Badge>
            </div>
            <p className="text-xs text-slate-400">Assumption ID: {assumption.assumptionId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Key Metric Facts */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assumed Value</span>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {assumption.value} {assumption.unit}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Historical Baseline</span>
              <span className="text-sm font-mono text-slate-300">
                {assumption.historicalBaseline !== undefined ? `${assumption.historicalBaseline} ${assumption.unit}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Confidence Score</span>
              <span className="text-sm font-mono text-emerald-400 font-semibold">{assumption.confidence}%</span>
            </div>
          </div>

          {/* Derivation / Formula */}
          {assumption.isDerived && assumption.derivationMethod && (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Derivation Formula
              </span>
              <code className="text-cyan-300 font-mono text-xs block bg-slate-900 p-2 rounded border border-slate-800">
                {assumption.derivationMethod.formula}
              </code>
              <p className="text-slate-400 text-[11px] mt-1">{assumption.derivationMethod.description}</p>
            </div>
          )}

          {/* Evidence Provenance */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Source Provenance (Tier: {assumption.sourceType})
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {assumption.sourceReferences.map((ref, i) => (
                <li key={i} className="text-slate-300 font-mono text-[11px]">
                  {ref}
                </li>
              ))}
            </ul>
          </div>

          {/* User Override History if present */}
          {assumption.userOverride && (
            <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">
                  Active User Override
                </span>
                <span className="text-[10px] text-slate-400">{assumption.userOverride.overriddenAt.substring(0, 10)}</span>
              </div>
              <p className="text-slate-200">
                System Value: <span className="font-mono">{assumption.userOverride.systemValue}</span> ➔ User Value:{' '}
                <span className="font-mono font-bold text-amber-300">{assumption.userOverride.userValue}</span> (
                {assumption.userOverride.variancePercent > 0 ? `+${assumption.userOverride.variancePercent}%` : `${assumption.userOverride.variancePercent}%`})
              </p>
              <p className="text-slate-400 italic">"{assumption.userOverride.userRationale}"</p>
            </div>
          )}

          {/* Edit Form */}
          {isEditing ? (
            <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/80 space-y-3">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold block">
                Apply Custom Analyst Override
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">New Value ({assumption.unit})</label>
                  <input
                    type="number"
                    value={overrideVal}
                    onChange={(e) => setOverrideVal(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Analyst Rationale</label>
                  <input
                    type="text"
                    placeholder="Enter explicit investment thesis reason for override..."
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="default" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleSave}>
                  Save Override
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="default" onClick={() => setIsEditing(true)}>
                Modify Assumption
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <Button size="sm" variant="default" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
