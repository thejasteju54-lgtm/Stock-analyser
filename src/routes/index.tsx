import React from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Code2,
  Building,
  Plus,
  Scale,
  Calculator,
} from 'lucide-react';
import { TerminalRoute } from '../types';
import { ResearchProject } from '../domain/models/ResearchProject';
import { getSectorDefinition, getBusinessModelDefinition } from '../domain/taxonomy/SectorTaxonomyRegistry';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="view-overview">
      {/* Welcome & Terminal Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c1524 0%, #070a12 100%)',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          padding: '18px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em', color: '#f8fafc' }}>
              Indian Equity Research Intelligence Terminal
            </h1>
            <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
              Phase 2 Active
            </Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '780px' }}>
            Institutional-grade fundamental analysis, forensic accounting, management DNA evaluation, sector-specific valuation, and technical analysis engine designed for Indian listed equities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="md"
            icon={<Plus size={13} />}
            onClick={onOpenNewProjectModal}
            id="overview-new-project-btn"
          >
            New Company (P2)
          </Button>
          <Button
            variant="primary"
            icon={<ArrowRight size={13} />}
            onClick={() => onNavigate('ingestion')}
          >
            Start Ingestion (P3)
          </Button>
        </div>
      </div>

      {/* Row 1: Active Target Taxonomic Profile & Gated Models */}
      {company && sectorDef && businessModelDef && (
        <Card
          title={`Active Target Profile: ${company.legalName}`}
          icon={<Building size={14} color="#38bdf8" />}
          action={
            <div style={{ display: 'flex', gap: '6px' }}>
              <Badge variant="cyan">{company.exchange}:{company.symbol}</Badge>
              <Badge variant="bullish">STATUS: {activeProject.status}</Badge>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* Identity & Structure */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                Corporate Taxonomy & Classification
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sector:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{company.sector}</strong>
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
                <span style={{ color: 'var(--color-brand)' }}>{company.marketCapCategory.replace('_', ' ')}</span>
              </div>
              {company.isin && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>ISIN:</span>
                  <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>{company.isin}</span>
                </div>
              )}
            </div>

            {/* Gated Forensic Frameworks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                <Scale size={13} color="#f59e0b" />
                <span>Applicable Forensic Engines ({businessModelDef.code})</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {businessModelDef.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {businessModelDef.applicableForensicModels.map((m) => (
                  <Badge key={m} variant="neutral">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gated Valuation Frameworks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                <Calculator size={13} color="#10b981" />
                <span>Applicable Valuation Models ({businessModelDef.code})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {businessModelDef.applicableValuationModels.map((v) => (
                  <Badge key={v} variant="bullish">
                    {v}
                  </Badge>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Horizon: <strong>{activeProject.metadata.targetInvestmentHorizon.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Row 2: Architecture Status & Project Library */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {/* Core Architecture Status */}
        <Card
          title="Terminal Architecture & Integrity"
          icon={<Server size={14} color="#38bdf8" />}
          action={<Badge variant="bullish">OPERATIONAL</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sector Registry:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>30+ Verticals (Extensible)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calculation Model:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>100% Deterministic (Pure TS)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Data Quality Gate:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>Mandatory Phase 13.5 Gating</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anti-Hallucination Policy:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>Zero Fabrication Enforced</span>
            </div>
          </div>
        </Card>

        {/* Research Project Library */}
        <Card
          title={`Research Project Library (${allProjects.length})`}
          icon={<Database size={14} color="#f59e0b" />}
          action={
            <Button size="sm" icon={<Plus size={11} />} onClick={onOpenNewProjectModal}>
              Onboard
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
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
                    padding: '6px 8px',
                    background: isCurrent ? 'var(--bg-surface-active)' : 'var(--bg-surface-raised)',
                    border: isCurrent ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: isCurrent ? 700 : 500, fontSize: '11px', color: 'var(--text-primary)' }}>
                      {p.company.displayName}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
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

        {/* 20-Phase Engine Roadmap Progress */}
        <Card
          title="Engine Pipeline Status"
          icon={<Activity size={14} color="#10b981" />}
          action={<Badge variant="neutral">PHASE 2 / 20</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>[✓] P00: REPOSITORY INTELLIGENCE</span>
              <span>COMPLETE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>[✓] P01: APPLICATION SHELL & TOKENS</span>
              <span>COMPLETE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 600 }}>
              <span>[●] P02: RESEARCH ONBOARDING & TAXONOMY</span>
              <span>ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>[ ] P03: MULTI-STAGE INGESTION & OCR</span>
              <span>NEXT</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modules Quick Navigation Matrix */}
      <Card
        title="Research Intelligence Modules (15 Engines)"
        icon={<Layers size={14} color="#6366f1" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { route: 'ingestion' as TerminalRoute, name: '1. Document Ingestion', phase: 'P3', status: 'Pending P3' },
            { route: 'extraction' as TerminalRoute, name: '2. Extraction Review', phase: 'P4', status: 'Pending P4' },
            { route: 'fundamentals' as TerminalRoute, name: '3. Fundamental Health', phase: 'P6', status: 'Pending P6' },
            { route: 'forensic' as TerminalRoute, name: '4. Forensic Accounting', phase: 'P7', status: 'Pending P7' },
            { route: 'management' as TerminalRoute, name: '5. Management DNA', phase: 'P8', status: 'Pending P8' },
            { route: 'valuation' as TerminalRoute, name: '6. Sector Valuation', phase: 'P9', status: 'Pending P9' },
            { route: 'technical' as TerminalRoute, name: '7. Technical Structure', phase: 'P10', status: 'Pending P10' },
            { route: 'industry' as TerminalRoute, name: '8. Industry Moat', phase: 'P8', status: 'Pending P8' },
            { route: 'news' as TerminalRoute, name: '9. News Intelligence', phase: 'P11', status: 'Pending P11' },
            { route: 'catalysts-risks' as TerminalRoute, name: '10. Catalysts & Risks', phase: 'P12', status: 'Pending P12' },
            { route: 'scenarios' as TerminalRoute, name: '11. Scenario Modeling', phase: 'P13', status: 'Pending P13' },
            { route: 'quality-gate' as TerminalRoute, name: '12. Data Quality Gate', phase: 'P13.5', status: 'Pending P13.5' },
            { route: 'verdict' as TerminalRoute, name: '13. Investment Verdict', phase: 'P14', status: 'Pending P14' },
            { route: 'evidence' as TerminalRoute, name: '14. Evidence Explorer', phase: 'P15', status: 'Pending P15' },
          ].map((mod) => (
            <div
              key={mod.route}
              onClick={() => onNavigate(mod.route)}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{mod.name}</span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{mod.phase}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{mod.status}</div>
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
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
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
        icon={<Code2 size={14} color="#38bdf8" />}
        action={<Badge variant="neutral">SCOPED TO {phaseNumber}</Badge>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            This engine component is strictly scoped to <strong>{phaseNumber}</strong> in accordance with <code>Phases.md</code> and the approved architecture roadmap.
          </div>

          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '3px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600 }}>
              <Lock size={12} /> Target Engine: {requiredEngine}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              To maintain financial data integrity and avoid premature/mock implementations, domain logic will be integrated during its scheduled phase.
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
