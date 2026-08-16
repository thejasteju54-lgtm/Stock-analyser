import React, { useState, useEffect } from 'react';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { ResearchProject } from '../domain/models/ResearchProject';
import { CalculatedMetric } from '../domain/calculations/CalculationTypes';
import { FinancialCalculationEngine } from '../domain/calculations/FinancialCalculationEngine';
import { CALCULATION_VERSION, METHODOLOGY_VERSION } from '../domain/calculations/FormulaRegistry';
import { BusinessModelRegistry } from '../domain/taxonomy/BusinessModelRegistry';
import { CalculatedMetricCard } from '../components/calculations/CalculatedMetricCard';
import { MetricProvenanceModal } from '../components/calculations/MetricProvenanceModal';
import { BusinessModelGatingBanner } from '../components/calculations/BusinessModelGatingBanner';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Calculator,
  Play,
  CheckCircle2,
  TrendingUp,
  Percent,
  CircleDollarSign,
  RotateCcw,
  Scale,
  Clock,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const FinancialCalculationsView: React.FC = () => {
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [metrics, setMetrics] = useState<CalculatedMetric[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectedMetric, setInspectedMetric] = useState<CalculatedMetric | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = () => {
    const activeId = ProjectStorage.getActiveProjectId();
    if (!activeId) return;

    let activeProject = ProjectStorage.getProject(activeId);
    if (!activeProject) return;

    setProject(activeProject);
    const existingMetrics = ProjectStorage.getCalculatedMetricsForProject(activeId);
    setMetrics(existingMetrics);
  };

  const handleRunCalculations = () => {
    if (!project) return;
    setIsCalculating(true);

    setTimeout(() => {
      const facts = project.facts || [];
      const calculated = FinancialCalculationEngine.calculateAllMetrics(
        project.id,
        project.company.symbol,
        project.company.businessModel,
        facts,
        'FY24',
        'FY23'
      );

      setMetrics(calculated);
      ProjectStorage.saveCalculatedMetricsForProject(project.id, calculated);
      setIsCalculating(false);
    }, 200);
  };

  const modelDef = project ? BusinessModelRegistry.getModel(project.company.businessModel) : undefined;
  const archetype = modelDef ? modelDef.economicArchetype : 'OPERATING_INDUSTRIAL';

  const filteredMetrics = metrics.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  const calculatedCount = metrics.filter((m) => m.status === 'CALCULATED').length;
  const missingCount = metrics.filter((m) => m.status === 'MISSING_INPUT').length;
  const nonApplicableCount = metrics.filter((m) => m.status === 'NOT_APPLICABLE').length;

  const categories: Array<{ id: string; label: string; icon: React.ReactNode }> = [
    { id: 'ALL', label: 'All Metrics', icon: <Layers className="w-3 h-3" /> },
    { id: 'GROWTH', label: 'Growth (YoY)', icon: <TrendingUp className="w-3 h-3" /> },
    { id: 'MARGINS', label: 'Margins', icon: <Percent className="w-3 h-3" /> },
    { id: 'CASH_FLOW_QUALITY', label: 'Cash Flow Quality', icon: <CircleDollarSign className="w-3 h-3" /> },
    { id: 'RETURNS', label: 'Returns (ROE/ROCE)', icon: <RotateCcw className="w-3 h-3" /> },
    { id: 'LEVERAGE', label: 'Leverage & Solvency', icon: <Scale className="w-3 h-3" /> },
    { id: 'WORKING_CAPITAL', label: 'Working Capital', icon: <Clock className="w-3 h-3" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-terminal-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-terminal-text tracking-tight uppercase">
              Deterministic Financial Calculation Engine
            </h1>
            <Badge variant="cyan">Phase 5 Active</Badge>
          </div>
          <p className="text-xs text-terminal-muted mt-1 font-mono">
            Pure deterministic mathematical arithmetic with zero-denominator protection, business model gating, and multi-hop provenance tracing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-2 font-mono text-[10px] text-terminal-muted bg-terminal-card/80 px-2.5 py-1 rounded border border-terminal-border">
            <span>CALC: <span className="text-accent-cyan font-bold">{CALCULATION_VERSION}</span></span>
            <span>•</span>
            <span>METH: <span className="text-terminal-text font-bold">{METHODOLOGY_VERSION}</span></span>
          </div>
          <button
            id="run-calculations-btn"
            onClick={handleRunCalculations}
            disabled={isCalculating}
            className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-terminal-dark font-mono text-xs font-bold rounded shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isCalculating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isCalculating ? 'Computing Metrics...' : 'Run Calculation Engine'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Total Registered Metrics</span>
            <Calculator className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold text-terminal-text font-mono">{metrics.length}</div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Across 6 Analytical Categories
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Calculated Output</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
          </div>
          <div className="text-xl font-bold text-status-success font-mono">{calculatedCount}</div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Audited & Provenance Bound
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Missing / Incomplete Inputs</span>
            <Layers className="w-3.5 h-3.5 text-status-warning" />
          </div>
          <div className="text-xl font-bold text-status-warning font-mono">{missingCount}</div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Missing Source Line Items
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Business Model Gated</span>
            <Scale className="w-3.5 h-3.5 text-terminal-muted" />
          </div>
          <div className="text-xl font-bold text-terminal-muted font-mono">{nonApplicableCount}</div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Not Applicable for Archetype
          </span>
        </Card>
      </div>

      {/* Business Model Gating Active Banner */}
      {project && (
        <BusinessModelGatingBanner
          companySymbol={project.company.symbol}
          businessModelCode={project.company.businessModel}
          archetype={archetype}
          totalMetricsCount={metrics.length}
          applicableMetricsCount={metrics.length - nonApplicableCount}
        />
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-1 border-b border-terminal-border pb-2 overflow-x-auto font-mono text-xs">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded text-xs transition-colors flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 font-bold'
                  : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-card/50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Grid */}
      {metrics.length === 0 ? (
        <div className="p-12 text-center bg-terminal-card/40 border border-terminal-border/40 rounded space-y-3 font-mono">
          <Calculator className="w-8 h-8 text-terminal-muted mx-auto" />
          <h3 className="text-sm font-bold text-terminal-text uppercase">Calculation Engine Idle</h3>
          <p className="text-xs text-terminal-muted max-w-md mx-auto">
            Click "Run Calculation Engine" above to execute deterministic formulas across ingested reported facts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMetrics.map((metric) => (
            <CalculatedMetricCard
              key={metric.metricId}
              metric={metric}
              onInspect={(m) => setInspectedMetric(m)}
            />
          ))}
        </div>
      )}

      {/* Multi-Hop Provenance Modal */}
      {inspectedMetric && (
        <MetricProvenanceModal
          metric={inspectedMetric}
          onClose={() => setInspectedMetric(null)}
        />
      )}
    </div>
  );
};
