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

Phase 11 — News Intelligence & Industry Analysis Engine (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with institutional-grade News Intelligence & Industry Analysis Engine (`NewsAndIndustryMasterEngine.ts`) executing Pipelines A & B with non-mutating cross-layer sensitivities:
  1. Pipeline A — News Intelligence Engine (`NewsIntelligenceEngine.ts`):
     - Exact 16-field `NewsSource` and 20-field `NewsEvent` schemas with strict source hierarchy (Tier 1 Primary to Tier 4 Discovery Only).
     - Multi-outlet deduplication & clustering (`NewsDeduplicationEngine.ts`) building `SourceLineage` trees and calculating independent source counts.
     - Entity Resolution (`EntityResolutionEngine.ts`) disambiguating Primary/Secondary entities, subsidiaries, brands, competitors, and passing mentions (`MENTION_ONLY` / `ENTITY_UNCERTAIN`).
     - 33 discrete news categories, intermediate causal chain preservation (`EVENT → COMPANY EXPOSURE → BUSINESS CHANNEL → FINANCIAL CHANNEL → POTENTIAL EFFECT → TIME HORIZON → CONFIDENCE`).
     - Point-in-time date precision preservation (`EXACT_DATE`, `MONTH`, `QUARTER`, `YEAR`, `UNKNOWN`), status retention (`NEW`, `ONGOING`, `HISTORICAL`), and rumor penalty gating.
     - Deterministic News Materiality Scoring (relevance 30%, magnitude 25%, source tier 25%, duration 20% with conflict and rumor deductions).
     - Source conflict logging with resolution auditing and `CONFLICTING_INFORMATION` alerts.
     - Catalysts, upcoming milestones scheduling without manufactured dates, and prioritized external news risk matrices.
  2. Pipeline B — Industry Analysis & Peer Moat Engine (`IndustryAnalysisEngine.ts`):
     - Industry profile with explicit growth data segregation (`HISTORICAL`, `CURRENT`, `FORECAST`), forecast methodology preservation, and structural vs cyclical demand/supply driver classification.
     - Deterministic 8-stage industry cycle classifier (`NewsAndIndustryPolicyRegistry.ts`).
     - 5-stage interactive value chain mapping (`RAW_MATERIAL` → `PROCESSING` → `MANUFACTURING` → `DISTRIBUTION` → `CUSTOMER_END_MARKET`) with margin capture % and upstream/downstream risks.
     - Peer competitor benchmarking table with reporting period disclosure, period mismatch flags (`DATA_PERIOD_MISMATCH`), and verified market share tracking (`NOT_ASSESSABLE` fallback).
     - 3-horizon forward outlook (`SHORT_TERM`, `MEDIUM_TERM`, `LONG_TERM`) with drivers, risks, assumptions, and confidence ratings.
  3. Decoupled Cross-Layer Sensitivity Engine (`CrossLayerSensitivityEngine.ts`):
     - Read-only observation linkages to Phase 5 Financials, Phase 6 Health, Phase 7 Forensics, Phase 8 Management, Phase 9 Valuation, and Phase 10 Technical.
     - Strictly non-mutating (`status: 'OBSERVATION_ONLY'`) with price-event correlation guardrails (`isCausalityProven: false`).
- UI Components & Routes:
  - `NewsIntelligenceView.tsx` (`/news`), `IndustryAnalysisView.tsx` (`/industry`), `NewsOverviewCard.tsx`, `InteractiveNewsTimeline.tsx` (with `24H` to `1Y` window filters), `CatalystsAndRisksCard.tsx`, `SourceVerificationModal.tsx` (lineage & source inspector), `CrossLayerSensitivityCard.tsx`, `IndustryOverviewCard.tsx`, `CompetitorLandscapeCard.tsx`, `IndustryValueChainCard.tsx`, and `IndustryOutlookCard.tsx`.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: **287/287 PASSED** across **83 test suites** (10 dedicated Phase 11 suites + 73 previous suites).
- Build: PASSED (`npm.cmd run build` transformed 1923 modules in 7.41s).
- Browser Runtime: Terminal active at `http://localhost:5173/`.

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

## In Progress

- Ready for Phase 12: Catalysts, Thesis Breakers & Multi-Dimensional Risk Engine.

## Next Action

- Await user approval and prompt to initiate Phase 11.

- Await user approval and prompt for Phase 10 execution. DO NOT start Phase 10 automatically.

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