import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TourStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  category: string;
  targetSelector?: string;
  routePath?: string;
  explanation: string;
  whyThisExists: string;
  actionHint: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    stepNumber: 1,
    totalSteps: 21,
    title: 'Welcome to the Equity Research Terminal',
    category: 'GETTING STARTED',
    routePath: '/',
    targetSelector: '#overview-hero-card',
    explanation: 'This terminal is designed to take you from raw statutory filings to a fully auditable institutional equity research verdict.',
    whyThisExists: 'Institutional equity research requires rigorous separation of facts, calculations, and forecasts rather than ungrounded LLM guesses.',
    actionHint: 'Click "Next Step" to begin exploring how to research a company.',
  },
  {
    id: 'company_selection',
    stepNumber: 2,
    totalSteps: 21,
    title: 'Create or Select a Research Project',
    category: 'PROJECT SCOPE',
    routePath: '/',
    targetSelector: '#company-profile-card',
    explanation: 'Each research project isolates one listed company, maintaining an independent document archive, calculation DAG, and snapshot history.',
    whyThisExists: 'Isolating projects prevents cross-company data leakage and preserves complete regulatory provenance.',
    actionHint: 'Select or create a company to begin ingesting evidence.',
  },
  {
    id: 'workspace_navigation',
    stepNumber: 3,
    totalSteps: 21,
    title: 'Primary Research Workspace',
    category: 'WORKSPACE',
    routePath: '/workspace',
    targetSelector: '#what-matters-now-card',
    explanation: 'The workspace organizes the entire analytical case according to a strict 4-level information hierarchy.',
    whyThisExists: 'Analysts need to grasp the core thesis, valuation, and risks within 30 seconds above-the-fold without scrolling through endless clutter.',
    actionHint: 'Review the Level 1 Executive Summary and What Matters Now cards.',
  },
  {
    id: 'data_quality_center',
    stepNumber: 4,
    totalSteps: 21,
    title: 'Data Accuracy Center & Audit Vitals',
    category: 'ACCURACY',
    routePath: '/workspace',
    targetSelector: '#data-quality-center-card',
    explanation: 'Displays real-time audit vitals: Evidence Completeness (92%), Freshness (HIGH), Source Tier (Tier 1 Audited), and Calculation Integrity (PASS).',
    whyThisExists: 'You must always know the reliability of the underlying evidence before trusting any analytical conclusion.',
    actionHint: 'Check the 6 audit vitals in the Accuracy Center.',
  },
  {
    id: 'document_intake',
    stepNumber: 5,
    totalSteps: 21,
    title: 'Document Intake & Source Authority',
    category: 'EVIDENCE',
    routePath: '/workspace',
    targetSelector: '#document-registry-table',
    explanation: 'Ingests statutory filings: Audited Annual Reports, Quarterly Statements, Investor Presentations, and Concall Transcripts.',
    whyThisExists: 'Tier 1 statutory filings carry the highest legal authority and can never be silently overridden by web rumors.',
    actionHint: 'Inspect the document registry and version ledger below.',
  },
  {
    id: 'why_provenance_inspector',
    stepNumber: 6,
    totalSteps: 21,
    title: 'Universal "Why?" Evidence Inspector',
    category: 'PROVENANCE',
    routePath: '/workspace',
    targetSelector: '.why-trigger-btn',
    explanation: 'Clicking [Why?] on any metric opens its exact source document, page number, reporting period, formula, and verification confidence.',
    whyThisExists: 'Never blindly trust a dashboard number. Provenance makes every calculation reproducible and challengeable.',
    actionHint: 'Click any [Why?] button to open the slide-over inspector.',
  },
  {
    id: 'financial_trajectory',
    stepNumber: 7,
    totalSteps: 21,
    title: '5-Year Financial Statement Trajectory',
    category: 'FINANCIALS',
    routePath: '/workspace',
    targetSelector: '#financial-performance-card',
    explanation: 'Clean financial statement bridge with explicit [Consolidated] vs [Standalone] badges and clear historical actuals vs forward projections.',
    whyThisExists: 'Comparing mismatched accounting bases is a common trap. Explicit tagging guarantees period integrity.',
    actionHint: 'Toggle between Consolidated and Standalone views in the header.',
  },
  {
    id: 'fundamental_health',
    stepNumber: 8,
    totalSteps: 21,
    title: 'Fundamental Health & Return Ratios',
    category: 'FUNDAMENTALS',
    routePath: '/fundamentals',
    targetSelector: '.terminal-card',
    explanation: 'Evaluates revenue quality, operating leverage, balance sheet solvency, and return on capital employed (ROCE).',
    whyThisExists: 'Do not merely ask if a ratio is high; investigate whether returns are driven by pricing power or temporary cyclical tailwinds.',
    actionHint: 'Examine the fundamental health scores and strengths.',
  },
  {
    id: 'forensic_accounting',
    stepNumber: 9,
    totalSteps: 21,
    title: 'Forensic Accounting & Red Flag Sentinel',
    category: 'FORENSICS',
    routePath: '/forensics',
    targetSelector: '.terminal-card',
    explanation: 'Scans for cash flow divergence (CFO/PAT), inventory build-up, aggressive revenue recognition, related party transactions, and auditor remarks.',
    whyThisExists: 'Can you trust the reported profits? A forensic warning is not automatically fraud, but warrants deeper scrutiny.',
    actionHint: 'Review the forensic risk radar and severity levels.',
  },
  {
    id: 'management_dna',
    stepNumber: 10,
    totalSteps: 21,
    title: 'Management DNA & Guidance Delivery',
    category: 'MANAGEMENT',
    routePath: '/management',
    targetSelector: '.terminal-card',
    explanation: 'Tracks historical management guidance against actual reported outcomes to score credibility and capital allocation discipline.',
    whyThisExists: 'Management claims are claims, not facts. Repeated execution patterns reveal true managerial capability.',
    actionHint: 'Inspect the Promise vs Delivery scorecard.',
  },
  {
    id: 'valuation_spectrum',
    stepNumber: 11,
    totalSteps: 21,
    title: 'Sector-Aware Valuation Spectrum',
    category: 'VALUATION',
    routePath: '/workspace',
    targetSelector: '#valuation-spectrum-card',
    explanation: 'Triangulates intrinsic fair value using sector-appropriate DCF, target EV/EBITDA, and P/E multiples across Bear/Base/Bull ranges.',
    whyThisExists: 'Valuation asks what expectations are already embedded in the current market price, quantifying your Margin of Safety.',
    actionHint: 'View the visual valuation span comparing market price to base target.',
  },
  {
    id: 'technical_structure',
    stepNumber: 12,
    totalSteps: 21,
    title: 'Market Context & Technical Timing',
    category: 'MARKET CONTEXT',
    routePath: '/technicals',
    targetSelector: '.terminal-card',
    explanation: 'Evaluates trend regime, 200-DMA distance, support/resistance zones, and behavioral exuberance indicators.',
    whyThisExists: 'Technical analysis provides timing and liquidity context, ensuring you do not enter at overextended momentum peaks.',
    actionHint: 'Inspect the support and resistance execution directives.',
  },
  {
    id: 'news_and_industry',
    stepNumber: 13,
    totalSteps: 21,
    title: 'News Intelligence & Industry Structure',
    category: 'NEWS & INDUSTRY',
    routePath: '/news',
    targetSelector: '.terminal-card',
    explanation: 'Aggregates material corporate actions, regulatory orders, and industry competitive dynamics with publication vs event dates.',
    whyThisExists: 'News items are deduplicated and corroborated to separate genuine fundamental catalysts from short-term market noise.',
    actionHint: 'Review material events and industry cycle phases.',
  },
  {
    id: 'catalysts_and_risks',
    stepNumber: 14,
    totalSteps: 21,
    title: 'Asymmetric Catalysts & Downside Risks',
    category: 'RISK MANAGEMENT',
    routePath: '/workspace',
    targetSelector: '#what-matters-now-card',
    explanation: 'Ranks the top 3 value catalysts and top 3 downside risks by likelihood, impact, and expected horizon.',
    whyThisExists: 'Investing is probabilistic. Understanding asymmetric risk/reward drivers is central to conviction sizing.',
    actionHint: 'Compare the Top 3 Catalysts vs Top 3 Risks.',
  },
  {
    id: 'thesis_breakers',
    stepNumber: 15,
    totalSteps: 21,
    title: 'Mathematical Thesis Breakers',
    category: 'SENTINEL',
    routePath: '/workspace',
    targetSelector: '#what-matters-now-card',
    explanation: 'Explicit mathematical conditions that would falsify the investment thesis (e.g. EBITDA Margin < 11%, Distance: 3.2 pp).',
    whyThisExists: 'Converts vague opinions into clear falsification criteria. If a breaker triggers, the analyst must revisit the thesis immediately.',
    actionHint: 'Observe the distance-to-trigger metric and VALID status.',
  },
  {
    id: 'scenario_modeling',
    stepNumber: 16,
    totalSteps: 21,
    title: 'Quantitative Scenario Modeling (Bear/Base/Bull)',
    category: 'SCENARIOS',
    routePath: '/workspace',
    targetSelector: '#scenario-comparison-card',
    explanation: 'Compares operating variables across Bear (25%), Base (50%), and Bull (25%) scenarios with reconciling cash bridges.',
    whyThisExists: 'Base is not guaranteed; Bear is not a prediction. Structured scenarios bound the range of reasonable future outcomes.',
    actionHint: 'Compare the Revenue CAGR, Margin, and Target Values across columns.',
  },
  {
    id: 'investment_verdict',
    stepNumber: 17,
    totalSteps: 21,
    title: 'Final Institutional Investment Verdict',
    category: 'SYNTHESIS',
    routePath: '/verdict',
    targetSelector: '.terminal-card',
    explanation: 'Synthesizes all 15 analytical layers into a BUY, HOLD, or AVOID stance with a 0–10 conviction rating.',
    whyThisExists: 'The verdict is deterministic and challengeable, gated against missing data or severe forensic anomalies.',
    actionHint: 'Examine the verdict banner, conviction score, and one-line rationale.',
  },
  {
    id: 'decision_audit_trail',
    stepNumber: 18,
    totalSteps: 21,
    title: 'Decision Audit Trail & Gating Rules',
    category: 'AUDIT',
    routePath: '/verdict',
    targetSelector: '.terminal-card',
    explanation: 'Inspects active decision blockers, reproducibility checksums, and explicit rules evaluated by the decision engine.',
    whyThisExists: 'Zero black-box AI decisions. Every rating is traceable back to formal decision rules and statutory data.',
    actionHint: 'Click "Inspect Decision Audit Trail" to view the trace.',
  },
  {
    id: 'report_generation',
    stepNumber: 19,
    totalSteps: 21,
    title: 'Canonical 22-Section Research Report',
    category: 'REPORTING',
    routePath: '/workspace',
    targetSelector: '#report-viewer-card',
    explanation: 'Generates an institutional 22-section research report complete with executive summary, tables, citations, and export to PDF/JSON/CSV.',
    whyThisExists: 'Provides an audit-ready institutional deliverable for investment committees, clients, and compliance records.',
    actionHint: 'Scroll through the 22-section report or click "Print / Save as PDF".',
  },
  {
    id: 'snapshot_management',
    stepNumber: 20,
    totalSteps: 21,
    title: 'Immutable Research Snapshots',
    category: 'VERSIONING',
    routePath: '/history',
    targetSelector: '.terminal-card',
    explanation: 'Records point-in-time state with SHA-256 hashes, allowing visual delta comparisons as new quarterly filings arrive.',
    whyThisExists: 'Preserves historical research integrity so you can track how your thesis and valuations evolved over time.',
    actionHint: 'View the snapshot history timeline.',
  },
  {
    id: 'summary_rules',
    stepNumber: 21,
    totalSteps: 21,
    title: 'How to Get the Most From the Terminal',
    category: 'BEST PRACTICES',
    routePath: '/',
    targetSelector: '#overview-hero-card',
    explanation: 'You have completed the guided tour! Review the 10 Institutional Rules anytime from the top bar.',
    whyThisExists: 'Disciplined, evidence-grounded research produces consistent, superior long-term analytical outcomes.',
    actionHint: 'Click "Finish Tour" to return to full research control.',
  },
];

interface GuidedTourContextType {
  isTourActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  startTour: (stepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  exitTour: () => void;
  isRulesModalOpen: boolean;
  openRulesModal: () => void;
  closeRulesModal: () => void;
  isHelpModalOpen: boolean;
  helpTopic: string | null;
  openHelpModal: (topic: string) => void;
  closeHelpModal: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(undefined);

export const GuidedTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string | null>(null);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  const startTour = (stepIndex = 0) => {
    setCurrentStepIndex(stepIndex);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsTourActive(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const skipTour = () => {
    setIsTourActive(false);
  };

  const exitTour = () => {
    setIsTourActive(false);
  };

  const openRulesModal = () => setIsRulesModalOpen(true);
  const closeRulesModal = () => setIsRulesModalOpen(false);

  const openHelpModal = (topic: string) => {
    setHelpTopic(topic);
    setIsHelpModalOpen(true);
  };
  const closeHelpModal = () => {
    setIsHelpModalOpen(false);
    setHelpTopic(null);
  };

  // Keyboard accessibility: Escape exits tour, ArrowRight goes next, ArrowLeft goes back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isTourActive) return;
      if (e.key === 'Escape') {
        exitTour();
      } else if (e.key === 'ArrowRight') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, currentStepIndex]);

  return (
    <GuidedTourContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        exitTour,
        isRulesModalOpen,
        openRulesModal,
        closeRulesModal,
        isHelpModalOpen,
        helpTopic,
        openHelpModal,
        closeHelpModal,
      }}
    >
      {children}
    </GuidedTourContext.Provider>
  );
};

export const useGuidedTour = () => {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  }
  return context;
};
