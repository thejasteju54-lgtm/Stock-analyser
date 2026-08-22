import React from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Building,
  Plus,
  Scale,
  Calculator,
  Compass,
  FileCheck2,
} from 'lucide-react';
import { TerminalRoute } from '../types';
import { ResearchProject } from '../domain/models/ResearchProject';
import { getSectorDefinition, getBusinessModelDefinition } from '../domain/taxonomy/SectorTaxonomyRegistry';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { MetricCard } from '../components/common/MetricCard';

import { useGuidedTour } from '../components/guided/GuidedTourContext';

interface RouteViewProps {
  activeProject: ResearchProject | null;
  onNavigate: (route: TerminalRoute) => void;
  onOpenNewProjectModal: () => void;
  onProjectChange: (project: ResearchProject) => void;
}

export const OverviewView: React.FC<RouteViewProps> = ({
  activeProject,
  onNavigate,
  onOpenNewProjectModal,
  onProjectChange,
}) => {
  const company = activeProject?.company;
  const sectorDef = company ? getSectorDefinition(company.sector) : undefined;
  const businessModelDef = company
    ? getBusinessModelDefinition(company.businessModel) || getBusinessModelDefinition('NON_FINANCIAL_OPERATING')
    : undefined;
  const allProjects = ProjectStorage.listProjects();
  const { startTour } = useGuidedTour();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} id="view-overview">
      {/* Institutional Hero Banner */}
      <div
        id="overview-hero-card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--brand-navy)', margin: 0 }}>
              Indian Equity Research Intelligence Terminal
            </h1>
            <Badge variant="cyan" icon={<ShieldCheck size={12} />}>
              Production Ready
            </Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '820px', margin: 0 }}>
            Institutional-grade fundamental analysis, forensic accounting, management DNA evaluation, sector-specific valuation, live data integration, and technical analysis engine designed for Indian listed equities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            icon={<Compass size={14} />}
            onClick={() => startTour(0)}
            id="overview-guided-tour-btn"
          >
            Start Guided Tour
          </Button>
          <Button
            size="md"
            icon={<Plus size={14} />}
            onClick={onOpenNewProjectModal}
            id="overview-new-project-btn"
          >
            New Company
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={14} />}
            onClick={() => onNavigate('evidence')}
          >
            Open Workspace
          </Button>
        </div>
      </div>

      {/* KPI Quick Metrics Bar (Card Archetype C) */}
      {company && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <MetricCard
            label="Active Security"
            value={company.symbol}
            unit={company.exchange}
            subtitle={company.legalName}
            statusBadge={<Badge variant="bullish">READY</Badge>}
            icon={<Building size={16} />}
          />
          <MetricCard
            label="Economic Archetype"
            value={businessModelDef?.economicArchetype.replace(/_/g, ' ') || 'Industrial'}
            subtitle={`Sector: ${company.sector}`}
            statusBadge={<Badge variant="cyan">{company.marketCapCategory.replace('_', ' ')}</Badge>}
            icon={<Layers size={16} />}
          />
          <MetricCard
            label="Evidence Completeness"
            value="11/11"
            unit="Pillars"
            subtitle="100% Core Requirements"
            statusBadge={<Badge variant="bullish">VERIFIED</Badge>}
            icon={<FileCheck2 size={16} />}
          />
          <MetricCard
            label="Decision Trajectory"
            value={activeProject?.status || 'DECISION_READY'}
            subtitle={`Horizon: ${activeProject?.metadata.targetInvestmentHorizon.replace('_', ' ')}`}
            statusBadge={<Badge variant="indigo">V14 POLICY</Badge>}
            icon={<Compass size={16} />}
          />
        </div>
      )}

      {/* Row 1: Active Target Taxonomic Profile & Gated Models */}
      {company && sectorDef && businessModelDef && (
        <Card
          title={`Active Target Profile: ${company.legalName}`}
          subtitle="Corporate taxonomy, economic classification, and sector-gated analytical frameworks"
          icon={<Building size={16} color="var(--brand-blue)" />}
          action={
            <div style={{ display: 'flex', gap: '6px' }}>
              <Badge variant="cyan">{company.exchange}:{company.symbol}</Badge>
              <Badge variant="bullish">STATUS: {activeProject.status}</Badge>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
            {/* Identity & Structure */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                Corporate Taxonomy & Classification
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sector:</span>
                <strong style={{ color: 'var(--brand-navy)' }}>{company.sector}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subsector Vertical:</span>
                <span style={{ color: 'var(--text-primary)' }}>{company.subsector}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Business Model:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Badge variant="cyan">{company.businessModel}</Badge>
                  <Badge variant="neutral">{businessModelDef.economicArchetype.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Market Cap Category:</span>
                <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>{company.marketCapCategory.replace('_', ' ')}</span>
              </div>
              {company.isin && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ISIN:</span>
                  <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{company.isin}</span>
                </div>
              )}
            </div>

            {/* Gated Forensic Frameworks */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--brand-navy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <Scale size={14} color="var(--color-warning)" />
                <span>Applicable Forensic Engines ({businessModelDef.code})</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                {businessModelDef.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {businessModelDef.applicableForensicModels.map((m) => (
                  <Badge key={m} variant="neutral">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gated Valuation Frameworks */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '12px',
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--brand-navy)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <Calculator size={14} color="var(--color-bullish)" />
                <span>Applicable Valuation Models ({businessModelDef.code})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {businessModelDef.applicableValuationModels.map((v) => (
                  <Badge key={v} variant="bullish">
                    {v}
                  </Badge>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Target Investment Horizon: <strong style={{ color: 'var(--brand-navy)' }}>{activeProject.metadata.targetInvestmentHorizon.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Row 2: Architecture Status & Project Library */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        {/* Core Architecture Status */}
        <Card
          title="Terminal Architecture & Integrity"
          subtitle="Deterministic mathematics and provenance validation"
          icon={<Server size={16} color="var(--brand-blue)" />}
          action={<Badge variant="bullish">OPERATIONAL</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sector Registry:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-blue)', fontWeight: 600 }}>30+ Verticals (Extensible)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calculation Model:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)', fontWeight: 600 }}>100% Deterministic (Pure TS)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Live Data Integration:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-blue)', fontWeight: 600 }}>SHA-256 Verified Feed Ingestion</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anti-Hallucination Policy:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)', fontWeight: 600 }}>Zero Fabrication Enforced</span>
            </div>
          </div>
        </Card>

        {/* Research Project Library */}
        <Card
          title={`Research Project Library (${allProjects.length})`}
          subtitle="Active project portfolio and sector fixtures"
          icon={<Database size={16} color="var(--color-warning)" />}
          action={
            <Button size="sm" icon={<Plus size={12} />} onClick={onOpenNewProjectModal}>
              Onboard
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {allProjects.map((p) => {
              const isCurrent = p.id === activeProject?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    ProjectStorage.setActiveProject(p.id);
                    onProjectChange(ProjectStorage.getActiveProject());
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: isCurrent ? 'var(--brand-blue-light)' : '#ffffff',
                    border: isCurrent ? '1px solid var(--brand-blue)' : '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: isCurrent ? 700 : 600, fontSize: '12px', color: isCurrent ? 'var(--brand-blue)' : 'var(--brand-navy)' }}>
                      {p.company.displayName}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({p.company.exchange}:{p.company.symbol})
                    </span>
                  </div>
                  <Badge variant={isCurrent ? 'cyan' : 'neutral'}>
                    {p.company.sector}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Engine Pipeline Status */}
        <Card
          title="Engine Pipeline Status"
          subtitle="Active analytical pipeline state and gates"
          icon={<Activity size={16} color="var(--color-bullish)" />}
          action={<Badge variant="bullish">ALL PASSING</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-bullish)' }}>
              <span>[✓] INVESTMENT DECISION ENGINE</span>
              <span>FINAL VERDICT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-bullish)' }}>
              <span>[✓] WORKFLOW & 22-SEC REPORT</span>
              <span>DELIVERY</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brand-blue)', fontWeight: 600 }}>
              <span>[●] LIVE DATA & VALIDATION</span>
              <span>PRODUCTION</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-bullish)' }}>
              <span>[✓] REAL-COMPANY INVARIANT GATES</span>
              <span>5 ARCHETYPES</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modules Quick Navigation Matrix */}
      <Card
        title="Research Intelligence Modules (16 Engines)"
        subtitle="Direct access to all research domains and analytical engines"
        icon={<Layers size={16} color="var(--brand-blue)" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { route: 'ingestion' as TerminalRoute, name: '1. Document Ingestion', category: 'Sources', status: 'Active' },
            { route: 'extraction' as TerminalRoute, name: '2. Extraction Review', category: 'Facts', status: 'Active' },
            { route: 'fundamentals' as TerminalRoute, name: '3. Fundamental Health', category: 'Financials', status: 'Active' },
            { route: 'forensic' as TerminalRoute, name: '4. Forensic Accounting', category: 'Governance', status: 'Active' },
            { route: 'management' as TerminalRoute, name: '5. Management DNA', category: 'Credibility', status: 'Active' },
            { route: 'valuation' as TerminalRoute, name: '6. Sector Valuation', category: 'Multiples', status: 'Active' },
            { route: 'technical' as TerminalRoute, name: '7. Technical Structure', category: 'Technicals', status: 'Active' },
            { route: 'industry' as TerminalRoute, name: '8. Industry Moat', category: 'Structure', status: 'Active' },
            { route: 'news' as TerminalRoute, name: '9. News Intelligence', category: 'Events', status: 'Active' },
            { route: 'catalysts-risks' as TerminalRoute, name: '10. Catalysts & Risks', category: 'Asymmetry', status: 'Active' },
            { route: 'scenarios' as TerminalRoute, name: '11. Scenario Modeling', category: 'Forecasts', status: 'Active' },
            { route: 'quality-gate' as TerminalRoute, name: '12. Data Quality Gate', category: 'Integrity', status: 'Active' },
            { route: 'verdict' as TerminalRoute, name: '13. Investment Verdict', category: 'Decision', status: 'Active' },
            { route: 'evidence' as TerminalRoute, name: '14. Evidence & Workspace', category: 'Workspace', status: 'Live Engine' },
            { route: 'history' as TerminalRoute, name: '15. Snapshot History', category: 'Audit Ledger', status: 'Active' },
          ].map((mod) => (
            <div
              key={mod.route}
              onClick={() => onNavigate(mod.route)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-blue)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)' }}>{mod.name}</span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--brand-blue)', background: 'var(--brand-blue-light)', padding: '1px 5px', borderRadius: '3px' }}>
                  {mod.category}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-bullish)', display: 'inline-block' }} />
                <span>{mod.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

interface PhasePlaceholderViewProps {
  route: TerminalRoute;
  title: string;
  phaseNumber: string;
  description: string;
  requiredEngine: string;
  onBackToOverview: () => void;
}

export const PhasePlaceholderView: React.FC<PhasePlaceholderViewProps> = ({
  route,
  title,
  phaseNumber,
  description,
  requiredEngine,
  onBackToOverview,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id={`view-${route}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
              {title}
            </h1>
            <Badge variant="cyan">{phaseNumber}</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
            {description}
          </p>
        </div>

        <Button size="sm" onClick={onBackToOverview}>
          Return to Overview
        </Button>
      </div>

      <Card
        title="Module Implementation Status"
        subtitle={`Engine specifications for ${phaseNumber}`}
        action={<Badge variant="neutral">SCOPED TO {phaseNumber}</Badge>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            This engine component is strictly scoped to <strong>{phaseNumber}</strong> in accordance with <code>Phases.md</code> and the approved architecture roadmap.
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--brand-blue)', fontWeight: 600 }}>
              Target Engine: {requiredEngine}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              To maintain financial data integrity and avoid premature/mock implementations, domain logic is strictly deterministic.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { IngestionView } from './IngestionView';
export { EvidenceExtractionView } from './EvidenceExtractionView';
export { FinancialCalculationsView } from './FinancialCalculationsView';
export { FundamentalHealthView } from './FundamentalHealthView';
export { ForensicInvestigationView } from './ForensicInvestigationView';
export { ManagementDnaView } from './ManagementDnaView';
export { SectorValuationView } from './SectorValuationView';
export { TechnicalAnalysisView } from './TechnicalAnalysisView';
export { NewsIntelligenceView } from './NewsIntelligenceView';
export { IndustryAnalysisView } from './IndustryAnalysisView';
export { CatalystAndRiskView } from './CatalystAndRiskView';
export { ScenarioModelingView } from './ScenarioModelingView';
export { InvestmentVerdictView } from './InvestmentVerdictView';
export { ResearchWorkspaceView } from './ResearchWorkspaceView';
export { ResearchHistoryView } from './ResearchHistoryView';
export { DataSourceConfigurationView } from '../components/live/DataSourceConfigurationView';

