import React from 'react';
import { CalculatedMetric } from '../../domain/calculations/CalculationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

interface CalculatedMetricCardProps {
  metric: CalculatedMetric;
  onInspect: (metric: CalculatedMetric) => void;
}

export const CalculatedMetricCard: React.FC<CalculatedMetricCardProps> = ({ metric, onInspect }) => {
  const getStatusBadgeVariant = (status: CalculatedMetric['status']): 'bullish' | 'warning' | 'bearish' | 'cyan' | 'neutral' => {
    switch (status) {
      case 'CALCULATED':
        return 'bullish';
      case 'NOT_CALCULABLE':
        return 'warning';
      case 'MISSING_INPUT':
        return 'neutral';
      case 'INVALID_INPUT':
      case 'INCOMPATIBLE_INPUTS':
        return 'bearish';
      case 'NOT_APPLICABLE':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const formatValue = (m: CalculatedMetric): string => {
    if (m.status !== 'CALCULATED' || m.value === undefined) {
      return m.status.replace('_', ' ');
    }

    if (m.unit === 'PERCENT') {
      return `${m.value > 0 ? '+' : ''}${m.value.toFixed(2)}%`;
    }
    if (m.unit === 'INR_CRORE') {
      return `₹${m.value.toLocaleString()} Cr`;
    }
    if (m.unit === 'DAYS') {
      return `${m.value.toFixed(1)} Days`;
    }
    if (m.unit === 'RATIO') {
      return `${m.value.toFixed(2)}x`;
    }
    if (m.unit === 'PER_SHARE') {
      return `₹${m.value.toFixed(2)}`;
    }
    return `${m.value}`;
  };

  return (
    <Card className="p-3.5 bg-terminal-card/80 border-terminal-border hover:border-terminal-border/90 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-[10px] text-terminal-muted font-mono uppercase tracking-wider block">
              {metric.category.replace('_', ' ')} • {metric.period}
            </span>
            <h4 className="text-xs font-bold text-terminal-text mt-0.5">{metric.metricName}</h4>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <Badge variant={getStatusBadgeVariant(metric.status)}>
              {metric.status === 'CALCULATED' && metric.growthStatus
                ? metric.growthStatus.replace('_', ' ')
                : metric.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div
            className={`text-lg font-bold font-mono ${
              metric.status === 'CALCULATED'
                ? metric.value !== undefined && metric.value < 0 && metric.category !== 'WORKING_CAPITAL'
                  ? 'text-status-warning'
                  : 'text-accent-cyan'
                : 'text-terminal-muted text-xs uppercase'
            }`}
          >
            {formatValue(metric)}
          </div>
          <span className="text-[10px] font-mono text-terminal-muted bg-terminal-dark/60 px-1.5 py-0.5 rounded border border-terminal-border/40">
            {metric.methodologyVersion}
          </span>
        </div>

        <div className="mt-2 text-[10px] font-mono text-terminal-muted bg-terminal-dark/40 p-1.5 rounded border border-terminal-border/30 truncate" title={metric.formulaExpression}>
          <span className="text-terminal-text/60">Formula: </span>
          {metric.formulaExpression}
        </div>

        {metric.warnings && metric.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {metric.warnings.map((w, idx) => (
              <div key={idx} className="flex items-center space-x-1 text-[10px] text-status-warning font-mono">
                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate" title={w}>
                  {w}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-terminal-border/40 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-[10px] text-terminal-muted font-mono">
          <ShieldCheck className="w-3 h-3 text-status-success shrink-0" />
          <span>{metric.inputFactIds.length} Provenance Inputs</span>
        </div>
        <button
          onClick={() => onInspect(metric)}
          className="px-2 py-1 bg-terminal-border/60 hover:bg-accent-cyan/20 hover:text-accent-cyan text-terminal-text rounded text-[10px] font-mono font-medium flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>Audit Provenance</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    </Card>
  );
};
