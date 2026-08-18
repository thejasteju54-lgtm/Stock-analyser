import React, { useState, useEffect } from 'react';
import { TerminalRoute, SystemStatus } from './types';
import { ResearchProject } from './domain/models/ResearchProject';
import { ProjectStorage } from './domain/storage/ProjectStorage';
import { TopBar } from './components/layout/TopBar';
import { SideNav } from './components/layout/SideNav';
import { StatusBar } from './components/layout/StatusBar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { NewProjectModal } from './components/project/NewProjectModal';
import { OverviewView, PhasePlaceholderView, IngestionView, EvidenceExtractionView, FinancialCalculationsView, FundamentalHealthView, ForensicInvestigationView, ManagementDnaView } from './routes';

const ROUTE_DEFINITIONS: Record<
  Exclude<TerminalRoute, 'overview'>,
  { title: string; phaseNumber: string; description: string; requiredEngine: string }
> = {
  ingestion: {
    title: 'Document Ingestion Pipeline',
    phaseNumber: 'PHASE 3',
    description: 'Multi-format PDF, concall transcript, investor presentation, and canvas OCR parsing pipeline.',
    requiredEngine: 'DocumentIngestionEngine (PDF.js + Canvas Tesseract OCR)',
  },
  extraction: {
    title: 'Structured Evidence Extraction Review',
    phaseNumber: 'PHASE 4',
    description: 'Structured financial statement extraction, provenance preservation, and contradiction detection.',
    requiredEngine: 'EvidenceExtractionEngine (2-Year Model Normalizer)',
  },
  fundamentals: {
    title: 'Fundamental Health & Financial Engine',
    phaseNumber: 'PHASE 6',
    description: 'Evidence-driven, sector-aware fundamental health assessment, multi-category scoring, and deterministic financial calculations.',
    requiredEngine: 'FundamentalHealthEngine (Multi-Category Health Sentinel)',
  },
  forensic: {
    title: 'Forensic Accounting & Red-Flag Matrix',
    phaseNumber: 'PHASE 7',
    description: 'Sector-gated forensic checks (Beneish M-Score, Altman Z-Score, Cash Divergence, GNPA/NNPA).',
    requiredEngine: 'ForensicAccountingEngine (Severity Classifier)',
  },
  management: {
    title: 'Management DNA & Credibility Engine',
    phaseNumber: 'PHASE 8',
    description: 'Guidance vs delivery variance, promoter pledge tracking, and concall linguistic shift analysis.',
    requiredEngine: 'ManagementDNAEngine (Promise vs Execution Tracker)',
  },
  valuation: {
    title: 'Sector-Aware Valuation Models',
    phaseNumber: 'PHASE 9',
    description: 'Sector-specific multiples, DCF scenario grids, dated market inputs, and margin of safety.',
    requiredEngine: 'SectorValuationEngine (Dynamic Sensitivity Matrix)',
  },
  technical: {
    title: 'Technical Structure & Market Dynamics',
    phaseNumber: 'PHASE 10',
    description: 'Chart structure, support/resistance levels, moving averages, and volume profile.',
    requiredEngine: 'TechnicalStructureEngine (Chart Analyzer)',
  },
  industry: {
    title: 'Industry Structure & Peer Moat Analysis',
    phaseNumber: 'PHASE 8',
    description: 'Industry growth, cyclicality, competitive dynamics, and peer benchmarking.',
    requiredEngine: 'IndustryAnalysisEngine (Sector Frameworks)',
  },
  news: {
    title: 'Sourced & Dated News Intelligence',
    phaseNumber: 'PHASE 11',
    description: '27+ categorized corporate events, regulatory updates, capex plans, and rating actions.',
    requiredEngine: 'NewsIntelligenceEngine (Provenance Stamped Feed)',
  },
  'catalysts-risks': {
    title: 'Catalysts & Multi-Dimensional Risk Matrix',
    phaseNumber: 'PHASE 12',
    description: 'Impact-ranked operational triggers, deleveraging catalysts, and downside risk heatmaps.',
    requiredEngine: 'CatalystsRisksEngine (Impact Matrix)',
  },
  scenarios: {
    title: 'Scenario Projections (Bull / Base / Bear)',
    phaseNumber: 'PHASE 13',
    description: '3-tier scenario modeling with explicit drivers, operating assumptions, and price targets.',
    requiredEngine: 'ScenarioModelingEngine (Sensitivity Simulator)',
  },
  'quality-gate': {
    title: 'Mandatory Data Quality Gate',
    phaseNumber: 'PHASE 13.5',
    description: 'Pre-verdict completeness audit, contradiction count, and decoupled data confidence check.',
    requiredEngine: 'DataQualityAuditGate (Integrity Sentinel)',
  },
  verdict: {
    title: 'Institutional Investment Verdict & Thesis Breakers',
    phaseNumber: 'PHASE 14',
    description: 'BUY / HOLD / AVOID verdict, decoupled conviction score, 1Y/5Y+ outlook, and thesis breakers.',
    requiredEngine: 'InvestmentVerdictEngine (Explainable Synthesis)',
  },
  evidence: {
    title: 'Interactive Evidence Explorer',
    phaseNumber: 'PHASE 15',
    description: 'Auditability layer exposing fact provenance, page numbers, calculation traces, and formulas.',
    requiredEngine: 'EvidenceExplorerEngine (Audit Trail Inspector)',
  },
};

export const App: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<TerminalRoute>('overview');
  const [activeProject, setActiveProject] = useState<ResearchProject>(() => ProjectStorage.getActiveProject());
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [fundamentalsViewMode, setFundamentalsViewMode] = useState<'HEALTH' | 'CALCULATIONS'>('HEALTH');

  const [systemStatus] = useState<SystemStatus>({
    engineStatus: 'READY',
    activePhase: 8,
    dataQualityStatus: 'PASSED',
    memoryState: 'Phase 8: Management DNA, Concall & Execution Credibility Engine Active (Deterministic, Promise vs Delivery, 7 Disciplines)',
  });

  // Re-sync active project if needed
  useEffect(() => {
    const current = ProjectStorage.getActiveProject();
    if (current && current.id !== activeProject?.id) {
      setActiveProject(current);
    }
  }, [activeProject?.id]);

  const handleRouteChange = (route: TerminalRoute) => {
    setActiveRoute(route);
  };

  const handleProjectChange = (project: ResearchProject) => {
    setActiveProject(project);
  };

  const handleProjectCreated = (newProject: ResearchProject) => {
    setActiveProject(newProject);
  };

  return (
    <div className="terminal-layout" id="terminal-app-root">
      {/* Top Header */}
      <TopBar
        activeProject={activeProject}
        systemStatus={systemStatus}
        onProjectChange={handleProjectChange}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
      />

      {/* Persistent 15-Module Side Navigation */}
      <SideNav activeRoute={activeRoute} onRouteChange={handleRouteChange} />

      {/* Main Terminal Viewport with Error Boundary */}
      <main className="terminal-main" id="terminal-viewport">
        <ErrorBoundary key={activeRoute}>
          {activeRoute === 'overview' ? (
            <OverviewView
              activeProject={activeProject}
              onNavigate={handleRouteChange}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onProjectChange={handleProjectChange}
            />
          ) : activeRoute === 'ingestion' ? (
            <IngestionView
              activeProject={activeProject}
              onNavigate={handleRouteChange}
              onProjectChange={handleProjectChange}
            />
          ) : activeRoute === 'extraction' ? (
            <EvidenceExtractionView />
          ) : activeRoute === 'fundamentals' ? (
            fundamentalsViewMode === 'HEALTH' ? (
              <FundamentalHealthView
                currentProject={activeProject}
                onNavigateToCalculations={() => setFundamentalsViewMode('CALCULATIONS')}
                onNavigateToIngestion={() => handleRouteChange('ingestion')}
              />
            ) : (
              <div>
                <div style={{ padding: '16px 24px 0 24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setFundamentalsViewMode('HEALTH')}
                    className="terminal-btn terminal-btn-sm"
                    style={{ background: '#0284c7', color: '#fff' }}
                  >
                    ← Return to Fundamental Health Analysis
                  </button>
                </div>
                <FinancialCalculationsView />
              </div>
            )
          ) : activeRoute === 'forensic' ? (
            <ForensicInvestigationView
              currentProject={activeProject}
              onNavigateToCalculations={() => {
                handleRouteChange('fundamentals');
                setFundamentalsViewMode('CALCULATIONS');
              }}
              onNavigateToFundamentals={() => {
                handleRouteChange('fundamentals');
                setFundamentalsViewMode('HEALTH');
              }}
            />
          ) : activeRoute === 'management' ? (
            <ManagementDnaView
              currentProject={activeProject}
              onNavigateToFundamentals={() => {
                handleRouteChange('fundamentals');
                setFundamentalsViewMode('HEALTH');
              }}
              onNavigateToForensics={() => handleRouteChange('forensic')}
              onNavigateToCalculations={() => {
                handleRouteChange('fundamentals');
                setFundamentalsViewMode('CALCULATIONS');
              }}
            />
          ) : (
            <PhasePlaceholderView
              route={activeRoute}
              title={ROUTE_DEFINITIONS[activeRoute].title}
              phaseNumber={ROUTE_DEFINITIONS[activeRoute].phaseNumber}
              description={ROUTE_DEFINITIONS[activeRoute].description}
              requiredEngine={ROUTE_DEFINITIONS[activeRoute].requiredEngine}
              onBackToOverview={() => handleRouteChange('overview')}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Bottom Status Bar */}
      <StatusBar systemStatus={systemStatus} />

      {/* Phase 2 Company Onboarding Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};
