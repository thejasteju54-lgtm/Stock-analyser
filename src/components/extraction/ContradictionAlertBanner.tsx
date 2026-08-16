import React from 'react';
import { ContradictionRecord } from '../../domain/extraction/FinancialFactTypes';
import { Badge } from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

interface ContradictionAlertBannerProps {
  contradictions: ContradictionRecord[];
  onResolve: (id: string, resolution: ContradictionRecord['resolutionStatus']) => void;
  onInspectFact: (fact: any) => void;
}

export const ContradictionAlertBanner: React.FC<ContradictionAlertBannerProps> = ({
  contradictions,
  onResolve,
  onInspectFact,
}) => {
  if (!contradictions || contradictions.length === 0) return null;

  const openContradictions = contradictions.filter((c) => c.resolutionStatus === 'OPEN' || c.resolutionStatus === 'REQUIRES_ANALYST_CHOICE');

  const getDiscrepancyBadgeVariant = (type: ContradictionRecord['discrepancyType']): 'warning' | 'bearish' | 'cyan' | 'neutral' => {
    switch (type) {
      case 'MATERIAL_CONFLICT':
        return 'bearish';
      case 'RESTATEMENT':
        return 'cyan';
      case 'ACCOUNTING_BASIS_VARIANCE':
        return 'warning';
      case 'SOURCE_DEFINITION_VARIANCE':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="bg-terminal-card/80 border border-status-warning/40 rounded p-4 mb-4 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-status-warning animate-pulse" />
          <div>
            <h3 className="font-bold text-terminal-text uppercase tracking-wide">
              Cross-Source Evidence Discrepancy Sentinel ({openContradictions.length} Active / {contradictions.length} Total)
            </h3>
            <p className="text-[11px] text-terminal-muted">
              Anti-hallucination layer preserves all conflicting reported facts for analyst verification.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {contradictions.map((c) => {
          const isResolved = c.resolutionStatus !== 'OPEN' && c.resolutionStatus !== 'REQUIRES_ANALYST_CHOICE';

          return (
            <div
              key={c.id}
              className={`p-3 rounded border transition-all ${
                isResolved
                  ? 'bg-terminal-dark/40 border-terminal-border/60 opacity-70'
                  : 'bg-terminal-dark/90 border-status-warning/30 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={getDiscrepancyBadgeVariant(c.discrepancyType)}>
                    {c.discrepancyType.replace(/_/g, ' ')}
                  </Badge>
                  <span className="font-bold text-terminal-text text-sm">
                    {c.metricLabel} ({c.reportingPeriod})
                  </span>
                </div>
                <div className="text-[11px] text-terminal-muted">
                  Status:{' '}
                  <span className={isResolved ? 'text-status-success font-semibold' : 'text-status-warning font-semibold'}>
                    {c.resolutionStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-terminal-text mb-3 leading-relaxed">
                {c.explanation}
              </p>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div
                  onClick={() => onInspectFact(c.factA)}
                  className="p-2.5 bg-terminal-card/60 border border-terminal-border rounded hover:border-accent-cyan cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-terminal-muted uppercase mb-1">
                    <span>Source A ({c.factA.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' ? 'Primary' : 'Screenshot'})</span>
                    <span>{c.factA.accountingBasis}</span>
                  </div>
                  <div className="text-base font-bold text-terminal-text">
                    ₹{c.factA.value?.toLocaleString()} Cr
                  </div>
                  <div className="text-[10px] text-terminal-muted truncate mt-0.5">
                    {c.factA.documentName} (p.{c.factA.pageNumber || '1'})
                  </div>
                </div>

                <div
                  onClick={() => onInspectFact(c.factB)}
                  className="p-2.5 bg-terminal-card/60 border border-terminal-border rounded hover:border-accent-cyan cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-terminal-muted uppercase mb-1">
                    <span>Source B ({c.factB.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' ? 'Primary' : 'Screenshot'})</span>
                    <span>{c.factB.accountingBasis}</span>
                  </div>
                  <div className="text-base font-bold text-terminal-text">
                    ₹{c.factB.value?.toLocaleString()} Cr
                  </div>
                  <div className="text-[10px] text-terminal-muted truncate mt-0.5">
                    {c.factB.documentName} (p.{c.factB.pageNumber || '1'})
                  </div>
                </div>
              </div>

              {/* Action Resolution Buttons */}
              {!isResolved && (
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-terminal-border/50">
                  <span className="text-[10px] text-terminal-muted mr-2">Resolve As:</span>
                  {c.discrepancyType === 'RESTATEMENT' && (
                    <button
                      onClick={() => onResolve(c.id, 'RESOLVED_RESTATED')}
                      className="px-2.5 py-1 bg-accent-purple/20 hover:bg-accent-purple/40 text-accent-purple border border-accent-purple/40 rounded text-[11px] font-medium transition-colors"
                    >
                      Accept Restated Figure
                    </button>
                  )}
                  {c.discrepancyType === 'ACCOUNTING_BASIS_VARIANCE' && (
                    <button
                      onClick={() => onResolve(c.id, 'RESOLVED_CONSOLIDATED')}
                      className="px-2.5 py-1 bg-accent-cyan/20 hover:bg-accent-cyan/40 text-accent-cyan border border-accent-cyan/40 rounded text-[11px] font-medium transition-colors"
                    >
                      Keep Consolidated Basis
                    </button>
                  )}
                  <button
                    onClick={() => onResolve(c.id, 'RESOLVED_PREFER_PRIMARY')}
                    className="px-2.5 py-1 bg-status-success/20 hover:bg-status-success/40 text-status-success border border-status-success/40 rounded text-[11px] font-medium transition-colors"
                  >
                    Prefer Primary Filing
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
