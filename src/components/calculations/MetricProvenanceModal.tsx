import React from 'react';
import { CalculatedMetric } from '../../domain/calculations/CalculationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { X, ShieldCheck, FileText, Code2, Layers } from 'lucide-react';

interface MetricProvenanceModalProps {
  metric: CalculatedMetric | null;
  onClose: () => void;
}

export const MetricProvenanceModal: React.FC<MetricProvenanceModalProps> = ({ metric, onClose }) => {
  if (!metric) return null;

  return (
    <div className="fixed inset-0 bg-terminal-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-terminal-card border-terminal-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-terminal-border bg-terminal-dark/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-sm font-bold text-terminal-text uppercase tracking-wider font-mono">
              Calculation Multi-Hop Provenance Audit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-muted hover:text-terminal-text transition-colors p-1 rounded hover:bg-terminal-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Top Metric Summary */}
          <div className="bg-terminal-dark/60 p-3.5 rounded border border-terminal-border/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-terminal-muted uppercase">
                {metric.category.replace('_', ' ')} • {metric.period}
              </span>
              <Badge variant={metric.status === 'CALCULATED' ? 'bullish' : 'warning'}>
                {metric.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-base font-bold text-accent-cyan">{metric.metricName}</div>
            <div className="text-xs text-terminal-muted mt-1">
              Methodology ID: <span className="text-terminal-text">{metric.methodologyId}</span>
            </div>
            <div className="flex items-center space-x-3 mt-2 text-[10px] text-terminal-muted">
              <span>Calculation Version: <span className="text-terminal-text font-bold">{metric.calculationVersion}</span></span>
              <span>Methodology Version: <span className="text-terminal-text font-bold">{metric.methodologyVersion}</span></span>
            </div>
          </div>

          {/* Mathematical Formula Expression */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-terminal-muted text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="font-semibold uppercase tracking-wider">Formula Definition</span>
            </div>
            <div className="bg-terminal-dark/90 p-3 rounded border border-terminal-border/80 text-accent-cyan font-bold font-mono">
              {metric.formulaExpression}
            </div>
          </div>

          {/* Input Facts Provenance Chain */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-terminal-muted text-[11px]">
              <Layers className="w-3.5 h-3.5 text-status-success" />
              <span className="font-semibold uppercase tracking-wider">
                Source Input Facts ({metric.inputFactsSummary.length})
              </span>
            </div>

            {metric.inputFactsSummary.length === 0 ? (
              <div className="p-3 bg-terminal-dark/40 border border-terminal-border/40 rounded text-terminal-muted text-center">
                No input facts resolved for this calculation.
              </div>
            ) : (
              <div className="space-y-2">
                {metric.inputFactsSummary.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-terminal-dark/40 border border-terminal-border/50 rounded space-y-1.5 hover:border-terminal-border transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-terminal-text text-xs">
                        {fact.metricLabel || fact.metric} ({fact.period})
                      </span>
                      <span className="text-accent-cyan font-bold font-mono">
                        {fact.value !== undefined ? `₹${fact.value.toLocaleString()} Cr` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-terminal-muted">
                      <Badge variant="neutral">{fact.accountingBasis}</Badge>
                      <Badge variant="cyan">{fact.unit}</Badge>
                      <span className="text-terminal-muted">ID: {fact.factId}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-terminal-muted pt-1 border-t border-terminal-border/30">
                      <FileText className="w-3 h-3 shrink-0 text-terminal-muted" />
                      <span className="truncate" title={fact.documentName}>
                        {fact.documentName}
                      </span>
                      {fact.pageNumber && (
                        <span className="bg-terminal-border/40 px-1.5 py-0.2 rounded shrink-0">
                          Page {fact.pageNumber}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings and Notes */}
          {metric.warnings && metric.warnings.length > 0 && (
            <div className="p-3 bg-status-warning/10 border border-status-warning/30 rounded text-[11px] text-status-warning space-y-1">
              <div className="font-bold uppercase tracking-wider">Calculation Warnings & Fallbacks:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {metric.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-terminal-dark/60 border-t border-terminal-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-terminal-border/60 hover:bg-terminal-border text-terminal-text rounded text-xs font-mono transition-colors cursor-pointer"
          >
            Close Provenance
          </button>
        </div>
      </Card>
    </div>
  );
};
