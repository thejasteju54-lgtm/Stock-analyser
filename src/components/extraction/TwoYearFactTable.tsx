import React, { useState } from 'react';
import { TwoYearReconciliationRecord, FinancialFact } from '../../domain/extraction/FinancialFactTypes';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface TwoYearFactTableProps {
  records: TwoYearReconciliationRecord[];
  fy1Label: string; // e.g. 'FY23'
  fy0Label: string; // e.g. 'FY24'
  onInspectFact: (fact: FinancialFact) => void;
}

export const TwoYearFactTable: React.FC<TwoYearFactTableProps> = ({
  records,
  fy1Label,
  fy0Label,
  onInspectFact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: Array<{ key: string; label: string }> = [
    { key: 'ALL', label: 'All Statements' },
    { key: 'INCOME_STATEMENT', label: 'Income Statement' },
    { key: 'BALANCE_SHEET', label: 'Balance Sheet' },
    { key: 'CASH_FLOW', label: 'Cash Flow' },
    { key: 'OWNERSHIP', label: 'Shareholding' },
    { key: 'SEGMENT_DATA', label: 'Segment Data' },
  ];

  const filteredRecords = records.filter(
    (r) => selectedCategory === 'ALL' || r.category === selectedCategory
  );

  const formatValue = (fact?: FinancialFact): string => {
    if (!fact) return '—';
    if (fact.availabilityStatus !== 'AVAILABLE' || fact.value === undefined) {
      return fact.availabilityStatus;
    }
    if (fact.unit === 'PERCENT') {
      return `${fact.value.toFixed(2)}%`;
    }
    if (fact.unit === 'PER_SHARE') {
      return `₹${fact.value.toFixed(2)}`;
    }
    return `₹${fact.value.toLocaleString()} Cr`;
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Category Tabs */}
      <div className="flex items-center space-x-1 border-b border-terminal-border pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap ${
              selectedCategory === cat.key
                ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 font-bold'
                : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-card/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* High Density Table */}
      <div className="bg-terminal-card/60 border border-terminal-border rounded overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-terminal-dark/90 border-b border-terminal-border text-[11px] text-terminal-muted uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Financial Metric</th>
                <th className="py-2.5 px-3 font-semibold text-right">{fy1Label} (Base)</th>
                <th className="py-2.5 px-3 font-semibold text-right">{fy0Label} (Current)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Basis</th>
                <th className="py-2.5 px-3 font-semibold">Comparability & Provenance Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/40 text-xs">
              {filteredRecords.map((r, idx) => {
                const activeFact = r.fy0Fact || r.fy1Fact;

                return (
                  <tr
                    key={`${r.category}_${r.metric}_${idx}`}
                    className="hover:bg-terminal-card/90 transition-colors"
                  >
                    {/* Metric Name */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-terminal-text">
                        {r.metricLabel}
                      </div>
                      <div className="text-[10px] text-terminal-muted">
                        {r.metric}
                      </div>
                    </td>

                    {/* FY-1 Value */}
                    <td className="py-2.5 px-3 text-right font-mono text-terminal-text font-bold">
                      {r.fy1Fact ? (
                        <button
                          onClick={() => onInspectFact(r.fy1Fact!)}
                          className="hover:text-accent-cyan hover:underline cursor-pointer"
                          title="Click to view FY-1 source provenance"
                        >
                          {formatValue(r.fy1Fact)}
                        </button>
                      ) : (
                        <span className="text-terminal-muted font-normal">Not Found</span>
                      )}
                    </td>

                    {/* FY-0 Value */}
                    <td className="py-2.5 px-3 text-right font-mono text-accent-cyan font-bold">
                      {r.fy0Fact ? (
                        <button
                          onClick={() => onInspectFact(r.fy0Fact!)}
                          className="hover:text-accent-cyan hover:underline cursor-pointer"
                          title="Click to view FY-0 source provenance"
                        >
                          {formatValue(r.fy0Fact)}
                        </button>
                      ) : (
                        <span className="text-terminal-muted font-normal">Not Found</span>
                      )}
                    </td>

                    {/* Accounting Basis */}
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant={r.accountingBasis === 'CONSOLIDATED' ? 'cyan' : 'warning'}>
                        {r.accountingBasis}
                      </Badge>
                    </td>

                    {/* Comparability & Provenance Trigger */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          {r.isComparable ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-status-warning shrink-0" />
                          )}
                          <span
                            className={
                              r.isComparable ? 'text-terminal-muted' : 'text-status-warning font-medium'
                            }
                          >
                            {r.comparabilityNotes || 'Verified'}
                          </span>
                        </div>

                        {activeFact && (
                          <button
                            onClick={() => onInspectFact(activeFact)}
                            className="px-2 py-0.5 bg-terminal-border/60 hover:bg-accent-cyan/20 hover:text-accent-cyan text-terminal-muted rounded text-[10px] font-medium flex items-center space-x-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
