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

Phase 12 — Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix Engine (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with institutional-grade Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix Engine (`CatalystRiskMasterEngine.ts`):
  1. Pipeline A — Institutional Catalyst Extraction & Ranking (`CatalystExtractionEngine.ts`):
     - 12 discrete catalyst types (`EARNINGS_GROWTH`, `CAPACITY_EXPANSION`, `ORDER_BOOK_WIN`, `MARGIN_EXPANSION`, `DELEVERAGING`, `NEW_PRODUCT_LAUNCH`, etc.).
     - 5 forward time horizons (`IMMEDIATE_0_3M` to `STRUCTURAL`).
     - Exact 1–5 Catalyst Likelihood Scale (`evaluateCatalystLikelihood`): 5 (Confirmed milestone/contract/statutory approval), 4 (Guidance credibility >= 80%), 3 (Guidance credibility 60-79% / verified trend), 2 (Aspirational / low credibility < 60%), 1 (Conditional / missing data default).
     - Deterministic 1-10 impact scoring based on financial channels (`REVENUE`, `GROSS_MARGIN`, `EBITDA_MARGIN`, `WORKING_CAPITAL`, `CAPEX`, `CFO`, `DEBT`, etc.).
     - Verified evidence vs management claim status tracking with provenance back to source layers.
  2. Pipeline B — Multi-Dimensional Risk Synthesis & 5x5 Matrix Geometry (`RiskSynthesisEngine.ts`):
     - 9 discrete risk categories (`SECTOR_COMPETITIVE`, `COMPANY_EXECUTION`, `BALANCE_SHEET_LEVERAGE`, `EARNINGS_QUALITY_FORENSIC`, `MANAGEMENT_GOVERNANCE`, `VALUATION_MULTIPLE_COMPRESSION`, `REGULATORY_LEGAL`, `MACRO_COMMODITY_CURRENCY`, `TECHNICAL_PRICE_STRUCTURE`).
     - Exact 1–5 Risk Probability Scale (`evaluateRiskProbability`): 5 (Almost Certain / Active order / frequency >= 80%), 4 (High / frequency >= 50% / neg quarters >= 2), 3 (Moderate / frequency >= 25% / neg quarters = 1), 2 (Low / trigger proximity <= 30%), 1 (Remote default for missing/unverified data).
     - Exact 1–5 Risk Impact Scale (`evaluateRiskImpact`): 5 (Catastrophic: PAT impact >= 50% or >= 50% Net Worth), 4 (Severe: PAT impact >= 20% or >= 20% Net Worth / rating downgrade), 3 (Moderate: PAT >= 10% or >= 10% Net Worth), 2 (Minor: PAT >= 3% or >= 3% Net Worth), 1 (Negligible default for missing financial exposure).
     - Mitigation Stacking with Anti-Double-Counting (`evaluateStackedMitigations`): Deduplicates identical protections (taking max strength), compounds independent mitigations with multiplicative stacking, enforces strict 70% maximum reduction cap, and preserves full documentary lineage.
     - Multi-layer risk lineage tracking & deduplication (`SAME_UNDERLYING_RISK`, `RELATED_RISK`, `INDEPENDENT_RISK`) to prevent artificial risk inflation.
     - Decoupled cross-layer risk decomposition mapping across Fundamental, Forensic, Management, Valuation, Technical, and Industry sources.
  3. Pipeline C — Sector-Specific Falsifiable Thesis Breakers (`ThesisBreakerEngine.ts`):
     - Falsifiable invalidation conditions across exactly 7 verified mathematical operators (`GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`, `EQUALS`, `CHANGE_BY`, `PERCENT_CHANGE_BY`) and 6 threshold types.
     - Automated baseline vs current threshold monitoring with 10% buffer margin warning (`APPROACHING_TRIGGER`).
     - Point-in-time data freshness gating (`CURRENT`, `STALE`, `EXPIRED`) with strict missing data gating (`NOT_ASSESSABLE`).
     - Actionable institutional verdict recommendation signals (`REVIEW_FOR_DOWNGRADE`, `ELEVATE_RISK_CONVICTION`, `NEUTRAL_MONITORING`).
  4. Catalyst-Risk Asymmetry & Aggregate Risk Rating:
     - Deterministic Upside Potential (0-100) vs Downside Risk (0-100) scoring.
     - Net Asymmetry Ratio calculation (`HIGHLY_FAVORABLE` [>= 2.5x], `FAVORABLE` [1.5x-2.5x], `BALANCED`, `UNFAVORABLE`, `HIGHLY_ASYMMETRIC_DOWNSIDE`).
- UI Components & Routes:
  - `CatalystAndRiskView.tsx` (`/catalysts-risks`), `RiskOverviewCard.tsx`, `MultiDimensionalRiskMatrixCard.tsx` (interactive 5x5 heatmap with cell/row selection), `PrioritizedCatalystCard.tsx`, `ThesisBreakersCard.tsx`, `CrossLayerRiskBreakdownCard.tsx` (layer tab selector), and `RiskDetailModal.tsx` (provenance, mitigations, lineage, and triggers inspector).
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: **318/318 PASSED** across **93 test suites** (10 dedicated Phase 12 suites + 83 previous suites).
- Build: PASSED (`npm.cmd run build` transformed 1935 modules in 3.33s).
- Browser Runtime: Active and verified via browser subagent on `http://localhost:5173/`.

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

## In Progress

- Ready for Phase 13: Scenario Engine (Bull / Base / Bear Scenario Projections).

## Next Action

- Await user approval and prompt for Phase 13 execution. DO NOT start Phase 13 automatically.

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