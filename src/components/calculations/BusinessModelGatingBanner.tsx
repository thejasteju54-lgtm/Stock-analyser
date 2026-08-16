import React from 'react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Cpu } from 'lucide-react';

interface BusinessModelGatingBannerProps {
  companySymbol: string;
  businessModelCode: string;
  archetype: string;
  totalMetricsCount: number;
  applicableMetricsCount: number;
}

export const BusinessModelGatingBanner: React.FC<BusinessModelGatingBannerProps> = ({
  companySymbol,
  businessModelCode,
  archetype,
  totalMetricsCount,
  applicableMetricsCount,
}) => {
  const isFinancial = archetype === 'LENDING_FINANCIAL' || archetype === 'NON_LENDING_FINANCIAL';

  return (
    <Card className="p-3.5 bg-terminal-card/70 border-terminal-border/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded text-accent-cyan shrink-0 mt-0.5">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-terminal-text uppercase tracking-tight">
              Business Model Gating Active: {companySymbol}
            </span>
            <Badge variant="cyan">{businessModelCode}</Badge>
            <Badge variant="neutral">{archetype}</Badge>
          </div>
          <p className="text-[11px] text-terminal-muted mt-1">
            {isFinancial
              ? 'Financial institution: Industrial leverage ratios (Net Debt/EBITDA, D/E) and Working Capital days are gated as NOT_APPLICABLE.'
              : 'Operating industrial corporate: Full manufacturing working capital cycle (Receivables, Inventory, Payables, CCC) and operating leverage metrics are enabled.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0 bg-terminal-dark/60 px-3 py-1.5 rounded border border-terminal-border/40">
        <div className="text-right">
          <div className="text-[10px] text-terminal-muted uppercase">Applicable Metrics</div>
          <div className="text-sm font-bold text-accent-cyan">
            {applicableMetricsCount} / {totalMetricsCount}
          </div>
        </div>
      </div>
    </Card>
  );
};
