# Memory.md — Project State & Memory

## Purpose

This file is a compact project-state memory tracking active execution and architectural baselines.

The authoritative sources of truth are:
- source code
- tests
- schemas
- configuration
- Git history
- PRD.md
- Architecture.md
- Rules.md
- Phases.md

## Current Phase

Phase 15 — Production Research Workflow, Evidence Explorer & Report Delivery (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with institutional-grade Production Research Workflow, Evidence Explorer & Report Delivery Engine:
  1. Single Canonical Analysis Dependency Graph & Invalidation Engine (`AnalysisDependencyGraph.ts`):
     - Directed Acyclic Graph (DAG) with 15 interconnected analytical phase nodes and 27 explicit dependency edges.
     - Topological sorting and downstream dependency traversal for surgical incremental recalculations.
     - Upstream dirty state propagation upon document upload, manual override, or market price update.
  2. Document Quality, Requirement Policies & Injection Isolation (`DocumentQualityEngine.ts`, `ResearchDocumentRequirementPolicy.ts`, `DocumentInstructionIsolationPolicy.ts`):
     - Sector- and archetype-aware document requirements across 6 business archetypes.
     - Fuzzy matching company identity verification (CIN, symbol, legal name) preventing document cross-contamination.
     - Strict prompt injection defenses stripping system override patterns, prompt leaking directives, and malicious payload instructions.
  3. Decoupled Two-Tier Readiness Gates (`PipelineReadinessGate.ts`, `DecisionReadinessGate.ts`):
     - Tier 1: Pre-flight Pipeline Execution Gate validating required filings (P0 documents, verified identity).
     - Tier 2: Pre-verdict Decision Readiness Gate enforcing mandatory evidence thresholds (audited financials, valuation, forensic review).
  4. Independent 11-Pillar Evidence Completeness Sentinel (`EvidenceCompletenessEngine.ts`, `CompletenessPolicyRegistry.ts`):
     - Evaluates 11 distinct analytical pillars (`STATUTORY_FILINGS`, `FINANCIAL_STATEMENTS`, `CALCULATIONS`, `FUNDAMENTAL_HEALTH`, `FORENSIC_INTEGRITY`, `MANAGEMENT_DNA`, `VALUATION_MODELS`, `TECHNICAL_STRUCTURE`, `NEWS_INTELLIGENCE`, `CATALYSTS_AND_RISKS`, `SCENARIOS_AND_PROJECTIONS`).
     - 4-tier criticality weighting (`CRITICAL`, `HIGH`, `MEDIUM`, `INFORMATIONAL`) producing a deterministic 0–100% project completeness score.
  5. Category-Specific Data Freshness Engine & Priority Refresh Queue (`ResearchFreshnessEngine.ts`, `ResearchRefreshQueue.ts`):
     - Freshness rules across 7 data categories with distinct TTL thresholds (Market Price: 48h, News: 7d, Technicals: 7d, Transcripts: 90d, Financials: 365d).
     - Priority-ranked refresh queue sorting stale and expired data categories by urgency.
  6. Cryptographic SHA-256 Snapshots & Change Detection Engine (`ResearchSnapshotEngine.ts`, `ResearchChangeDetectionEngine.ts`, `CanonicalJsonSerializer.ts`):
     - Deterministic recursive JSON canonicalizer and SHA-256 hashing for immutable research snapshots.
     - Audit hash chaining linking parent snapshot checksums with child snapshot records.
     - Automated verdict transition and thesis delta explainer computing driver attribution across snapshots.
  7. Canonical 22-Section Institutional Investment Research Report Engine (`InvestmentResearchReportEngine.ts`, `ReportExportService.ts`):
     - Assembles 22 standardized institutional sections with complete fact citations, calculation formulas, and source provenance.
     - Multi-format exporter supporting Browser Print / PDF layout, structured JSON payload, and financial metrics CSV.
  8. UI Routes & Interactive Production Dashboard:
     - `ResearchWorkspaceView.tsx` (`/evidence`): Workflow Status Stepper, Document Registry Table, 11-Pillar Evidence Completeness Grid, Pipeline Execution Panel, Freshness & Refresh Queue, 22-Section Report Viewer.
     - `ResearchHistoryView.tsx` (`/history`): Immutable snapshot ledger, snapshot comparator modal (`SnapshotComparisonModal.tsx`), and decision trajectory tracker.
     - `ClaimProvenanceDrawer.tsx`: Interactive slide-in drawer displaying deep source citation, location, confidence, and deterministic calculation formula.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: **418/418 PASSED** across **130 test suites** (14 dedicated Phase 15 suites + 116 previous suites).
- Build: PASSED (`npm.cmd run build` transformed 1995 modules in 4.74s).
- Dev Server: Running at `http://localhost:5173/`.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & subsector mappings (`SectorTaxonomyRegistry.ts`), extensible Business Model Taxonomy & Gated Model Registry (`BusinessModelRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.
- Phase 3: Document Ingestion Pipeline (`DocumentIngestionEngine.ts`), Document Classifier (`DocumentClassifier.ts`), SHA-256 Hasher & Duplicate Detector (`DocumentHasher.ts`), Reporting Period & Company Consistency Detector (`PeriodDetector.ts`), OCR Status & Confidence Processor with optional confidence (`OcrProcessor.ts`), Two-Year Annual Report Intake Audit (`TwoYearReportAudit.ts`), and Terminal Ingestion View (`IngestionView.tsx`).
- Phase 4: Financial Fact & Management Claim domain models (`FinancialFactTypes.ts`), Unit & Currency Normalizer (`UnitNormalizer.ts`), Deterministic Financial Fact Extractor (`FinancialFactExtractor.ts`), Contextual Discrepancy & Contradiction Sentinel (`ContradictionDetector.ts`), Two-Year Side-by-Side Model Alignment (`TwoYearReconciliation.ts`), Evidence Extraction Route (`EvidenceExtractionView.tsx`), Two-Year Reconciled Fact Table (`TwoYearFactTable.tsx`), Management Claims Ledger (`ManagementClaimsLedger.tsx`), Contradiction Alert Banner (`ContradictionAlertBanner.tsx`), and Provenance Audit Modal (`FactProvenanceDrawer.tsx`).
- Phase 5: Deterministic Financial Calculation Engine (`FinancialCalculationEngine.ts`), centralized Formula Registry with versioning (`FormulaRegistry.ts`), calculation domain types (`CalculationTypes.ts`), business model gating (`BusinessModelGatingBanner.tsx`), calculated metric card (`CalculatedMetricCard.tsx`), multi-hop fact-to-metric provenance modal (`MetricProvenanceModal.tsx`), calculation workspace route (`FinancialCalculationsView.tsx`), average-balance working capital days, CFO/PAT negative loss diagnostic statuses, and 9 dedicated unit test suites.
- Phase 6: Fundamental Health Analysis Engine (`FundamentalHealthEngine.ts`), 12 Business Model Scoring Policies (`HealthScoringPolicyRegistry.ts`), domain schemas (`FundamentalHealthTypes.ts`), category score cards (`FundamentalHealthCard.tsx`), red flag risk matrix (`RedFlagMatrixCard.tsx`), strengths and watch items (`StrengthsAndWatchItemsCard.tsx`), driver decomposition modal (`DriverDecompositionModal.tsx`), workspace dashboard (`FundamentalHealthView.tsx`), and 7 dedicated unit test suites.
- Phase 7: Forensic Accounting & Red Flag Engine (`ForensicAccountingEngine.ts`), 14 Forensic Investigation categories, Forensic Policy Registry (`ForensicPolicyRegistry.ts`), domain schemas (`ForensicAnalysisTypes.ts`), specialized cards, cross-statement reconciliation modal (`CrossStatementAuditModal.tsx`), route (`ForensicInvestigationView.tsx`), and 10 dedicated unit test suites.
- Phase 8: Management DNA, Concall & Execution Credibility Engine (`ManagementDnaEngine.ts`), 21 claim categories, 9 commitment statuses, outcome attribution, separated management-stated vs verified reason models, language shift comparison, management-data tension cross-checks, and 8 dedicated unit test suites.
- Phase 9: Sector-Aware Valuation Engine (`SectorValuationEngine.ts`), 16 valuation method specifications (`ValuationMethodRegistry.ts`), business model valuation policies (`ValuationPolicyRegistry.ts`), peer selection with IQR outlier filtering (`PeerSelectionEngine.ts`), 3-scenario FCFF DCF, 2D sensitivity matrix, reverse DCF bisection solver, SOTP/NAV/DDM, dynamic triangulation weights, and 9 dedicated unit test suites.
- Phase 10: Technical Analysis & Price-Action Intelligence Engine (`TechnicalAnalysisEngine.ts`), 8 primary analytical pipelines, 2 synthesis layers (Market Cycle Phase, Technical Risk Fragility), interactive SVG Price Chart with DMA overlays, screenshot visual observation mode, and 9 dedicated unit test suites.
- Phase 11: News Intelligence & Industry Analysis Engine (`NewsAndIndustryMasterEngine.ts`), Pipelines A & B, source hierarchy (Tier 1–4), deduplication & lineage, entity resolution, 33 event categories, deterministic materiality scoring, source conflict logging, catalyst/risk schedules, industry growth segregation (Historical vs Forecast), Porter 5-Forces, 5-stage value chains, peer comparison with period mismatch protection, 3-horizon outlook, non-mutating cross-layer sensitivity mapping, and 10 dedicated unit test suites.
- Phase 12: Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix Engine (`CatalystRiskMasterEngine.ts`), 12 catalyst categories, exact 1-5 likelihood scale, 9 risk categories, exact 1-5 probability & impact scales, net worth percentage exposure, verified mitigation stacking with anti-double-counting (70% cap), 7 mathematical thesis breaker operators, catalyst-risk asymmetry scoring, cross-layer risk decomposition, and 10 dedicated unit test suites.
- Phase 13: Scenario Modeling & Forward Financial Projection Engine (`ScenarioMasterEngine.ts`), 3-state differentiated scenario generation (Base, Bull, Bear), 4-component probability weighting, operating leverage & incremental margin policy, maintenance vs growth capex classification, working capital lookback with IQR outlier filtering, non-circular debt/cash scheduling, 4-horizon complete statement bridge, 2D valuation sensitivity heatmap, 8-tier assumption provenance with analyst override drawer, falsifiable scenario invalidation gates, and 12 dedicated unit test suites.
- Phase 14: Final Investment Synthesis & Decision Engine (`VerdictMasterEngine.ts`), archetype-aware margin of safety policy (`MarginOfSafetyPolicyRegistry.ts`), forensic severity mapping & decision blocker model (`ForensicDecisionPolicyRegistry.ts`), single vs structural thesis breaker decision policy (`ThesisBreakerDecisionPolicy.ts`), cross-layer contradiction resolution (`DecisionConflictPolicyRegistry.ts`), 0.0–1.0 normalized conviction calculation (`ConvictionPolicyRegistry.ts`), 3-tier price freshness validation (`MarketPriceSourcePolicy.ts`), accumulation entry bracket policy (`InterestingPricePolicyRegistry.ts`), 8-tier precedence override hierarchy & decision matrix (`InvestmentDecisionPolicyRegistry.ts`), high-density institutional UI (`InvestmentVerdictView.tsx`), Decision Audit Trail Drawer (`DecisionAuditTrailDrawer.tsx`), and 11 dedicated unit test suites.
- Phase 15: Production Research Workflow, Evidence Explorer & Report Delivery (`ResearchWorkflowEngine.ts`), Canonical 22-Section Investment Research Report Assembler (`InvestmentResearchReportEngine.ts`), Multi-Format Exporter (`ReportExportService.ts`), Immutable Snapshot & Cryptographic Checksum Engine (`ResearchSnapshotEngine.ts`), Research Snapshot Change Detection & Delta Explainer (`ResearchChangeDetectionEngine.ts`), Independent 11-Pillar Evidence Completeness Sentinel (`EvidenceCompletenessEngine.ts`), Category-Specific Data Freshness Engine (`ResearchFreshnessEngine.ts`), Single Canonical Analysis Dependency Graph & Invalidation Engine (`AnalysisDependencyGraph.ts`), Document Quality & Requirement Policies (`DocumentQualityEngine.ts`, `ResearchDocumentRequirementPolicy.ts`), Security & Prompt Injection Defense Policy (`DocumentInstructionIsolationPolicy.ts`), Research Workspace UI View (`ResearchWorkspaceView.tsx`), Research Snapshot History UI View (`ResearchHistoryView.tsx`), Interactive Claim Provenance Drawer (`ClaimProvenanceDrawer.tsx`), and 14 dedicated unit test suites.

## Next Action

- All analytical and delivery phases (Phases 1–15) are complete with 100% test pass rate across 130 test suites (418 unit tests).
- Ready for Phase 16 (Full QA & Verification Audit) or subsequent production ship readiness phases.

## Architecture Decisions

- **Average Balance Alignment for Activity Cycles & WC Days**: Working Capital Days uses Average Operating Working Capital (`Average Receivables + Average Inventory - Average Payables`) divided by Revenue * 365, aligning with Receivable, Inventory, and Payable days.
- **CFO/PAT Diagnostic Policy on Negative PAT**: When PAT <= 0, conventional ratio is `NOT_CALCULABLE` and explicit diagnostic statuses (`CASH_GENERATION_DURING_ACCOUNTING_LOSS`, `CASH_BURN_DURING_ACCOUNTING_LOSS`, `ZERO_PAT`) are attached while retaining complete fact provenance without subjective commentary.

- **Optional Financial Values & Explicit Availability**: `value?: number` and `originalValue?: number` are strictly optional with explicit `availabilityStatus` (`AVAILABLE`, `NOT_DISCLOSED`, `NOT_FOUND`, `UNREADABLE`, `REQUIRES_REVIEW`). Missing numbers are never represented as zero.
- **Foreign Currency Protection**: `UnitNormalizer` preserves original foreign currencies (`USD`, `EUR`, `GBP`) without silent conversion unless explicit rate, date, and source metadata are supplied.
- **Contextual Discrepancy Classification**: Contradictions are categorized into 8 distinct contextual tiers (`MATCH`, `ROUNDING_VARIANCE`, `UNIT_VARIANCE`, `PERIOD_VARIANCE`, `ACCOUNTING_BASIS_VARIANCE`, `RESTATEMENT`, `SOURCE_DEFINITION_VARIANCE`, `MATERIAL_CONFLICT`) and both conflicting facts are preserved for auditability.
- **Stable Evidence Identity**: Every fact and claim retains stable `documentId`, `pageId`, `pageNumber`, `tableHeader`, and `rawSnippet` citations.
- **Strict Separation of Extraction vs Calculation**: Phase 4 extracts inputs; derived financial ratios (growth, margins, DuPont, ROCE) are strictly deferred to Phase 5.

## Important Dependencies Added

- `react` (^19.0.0), `react-dom` (^19.0.0)
- `lucide-react` (^1.16.0)
- `clsx` (^2.1.1)
- `vite` (^6.1.1), `typescript` (^5.7.3), `vitest` (^3.0.6)
- `@testing-library/react` (^16.2.0), `@testing-library/jest-dom` (^6.6.3), `jsdom` (^26.0.0)

## MCP Used

- Lazy: `data-agent-kit`, `notebooks`, `visualization`

## Skills Configured

- 12 active workspace skills in `.agents/skills`

## Known Issues

- None.

## Technical Debt

- None.

## Tests

Unit: 106 passed / 106 total (100%)
Integration: Scoped to Phase 16
E2E: Scoped to Phase 16
Typecheck: Passed (0 errors)
Build: Passed (`dist/` generated)

## Important Constraints

- Never fabricate financial data.
- Preserve provenance.
- Deterministic calculations.
- Test before completion.
- Do not bypass failures.