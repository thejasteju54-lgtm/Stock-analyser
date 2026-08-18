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

Phase 9 — Sector-Aware Valuation Engine (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with pure deterministic Sector-Aware Valuation Engine (`SectorValuationEngine.ts`) executing 10 valuation pipelines:
  1. Relative Multiples Pipeline (PE, PB, EV/EBITDA, EV/Sales, FCF Yield, Dividend Yield, PEG with negative EPS/EBITDA `NOT_MEANINGFUL` guardrails).
  2. Peer Selection & Outlier Filtering Engine (`PeerSelectionEngine.ts`) with relevance scoring (0-100), statistical IQR outlier filtering, and peer median calculation.
  3. Historical Valuation Bands Service (`HistoricalValuationDataService.ts`) computing 3Y and 5Y point-in-time trading ranges, quartiles, and current percentile rank.
  4. FCFF DCF Intrinsic Engine with 3 explicit scenarios (Bear, Base, Bull), CAPM WACC bridge (Risk-free rate + Beta * ERP), and Gordon Growth terminal bounds ($WACC > g$).
  5. 2D DCF Sensitivity Matrix evaluating value per share across WACC ($\pm 1\%$) and Terminal Growth Rate ($\pm 0.5\%$).
  6. Reverse DCF (Embedded Expectations Solver) using high-precision bisection solver ($< 0.001$ tolerance) to deduce market-implied revenue CAGR, margin, and ROCE, objectively classified against historical performance and management guidance.
  7. Sum-of-the-Parts (SOTP), Net Asset Value (NAV), and Dividend Discount Model (DDM) with holding company discount adjustments.
  8. Valuation Assumption Ledger (`ValuationAssumption`) preserving classification (`HISTORICAL_FACT`, `MANAGEMENT_GUIDANCE`, `EXTERNAL_ESTIMATE`, `ANALYST_ASSUMPTION`, `MODEL_DERIVED`), date, and confidence.
  9. Dynamic Valuation Triangulation (`ValuationWeightPolicyRegistry`) computing model-specific weighted intrinsic fair value and multi-scenario margin of safety (MoS vs Bear, Base, Bull).
  10. Deterministic Valuation Position Classifier (`ValuationPositionPolicy`) assigning `DEEP_DISCOUNT`, `DISCOUNT`, `AROUND_FAIR_RANGE`, `PREMIUM`, `EXTREME_PREMIUM`, or `NOT_ASSESSABLE` with zero BUY/HOLD/AVOID investment recommendations.
- Phase 9 UI components & route `/valuation` fully integrated: `SectorValuationView`, `ValuationOverviewCard`, `RelativeValuationCard`, `HistoricalValuationCard`, `PeerComparisonCard`, `DcfScenarioCard`, `DcfSensitivityCard`, `EmbeddedExpectationsCard`, `ValuationTriangulationCard`, and `SotpValuationModal`.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: 230/230 PASSED across 64 test files (9 dedicated Phase 9 suites + 55 previous suites).
- Build: PASSED (`npm.cmd run build` transformed 1889 modules into clean production bundle in 6.93s).
- Browser Runtime: Terminal active at `http://localhost:5173/`.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & subsector mappings (`SectorTaxonomyRegistry.ts`), extensible Business Model Taxonomy & Gated Model Registry (`BusinessModelRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.
- Phase 3: Document Ingestion Pipeline (`DocumentIngestionEngine.ts`), Document Classifier (`DocumentClassifier.ts`), SHA-256 Hasher & Duplicate Detector (`DocumentHasher.ts`), Reporting Period & Company Consistency Detector (`PeriodDetector.ts`), OCR Status & Confidence Processor with optional confidence (`OcrProcessor.ts`), Two-Year Annual Report Intake Audit (`TwoYearReportAudit.ts`), and Terminal Ingestion View (`IngestionView.tsx`).
- Phase 4: Financial Fact & Management Claim domain models (`FinancialFactTypes.ts`), Unit & Currency Normalizer (`UnitNormalizer.ts`), Deterministic Financial Fact Extractor (`FinancialFactExtractor.ts`), Contextual Discrepancy & Contradiction Sentinel (`ContradictionDetector.ts`), Two-Year Side-by-Side Model Alignment (`TwoYearReconciliation.ts`), Evidence Extraction Route (`EvidenceExtractionView.tsx`), Two-Year Reconciled Fact Table (`TwoYearFactTable.tsx`), Management Claims Ledger (`ManagementClaimsLedger.tsx`), Contradiction Alert Banner (`ContradictionAlertBanner.tsx`), and Provenance Audit Modal (`FactProvenanceDrawer.tsx`).
- Phase 5: Deterministic Financial Calculation Engine (`FinancialCalculationEngine.ts`), centralized Formula Registry with versioning (`FormulaRegistry.ts`), calculation domain types (`CalculationTypes.ts`), business model gating (`BusinessModelGatingBanner.tsx`), calculated metric card (`CalculatedMetricCard.tsx`), multi-hop fact-to-metric provenance modal (`MetricProvenanceModal.tsx`), calculation workspace route (`FinancialCalculationsView.tsx`), average-balance working capital days, CFO/PAT negative loss diagnostic statuses (`CASH_GENERATION_DURING_ACCOUNTING_LOSS`, `CASH_BURN_DURING_ACCOUNTING_LOSS`), and 9 dedicated unit test suites.
- Phase 6: Fundamental Health Analysis Engine (`FundamentalHealthEngine.ts`), 12 Business Model Scoring Policies (`HealthScoringPolicyRegistry.ts`), domain schemas (`FundamentalHealthTypes.ts`), category score cards (`FundamentalHealthCard.tsx`), red flag risk matrix (`RedFlagMatrixCard.tsx`), strengths and watch items (`StrengthsAndWatchItemsCard.tsx`), driver decomposition modal (`DriverDecompositionModal.tsx`), workspace dashboard (`FundamentalHealthView.tsx`), and 7 dedicated unit test suites (`fundamentalHealthScoring.test.ts`, `businessModelScoringPolicies.test.ts`, `signalSeverityContext.test.ts`, `driverDecomposition.test.ts`, `evidenceQualityAndConfidence.test.ts`, `verdictDecoupling.test.ts`, `fundamentalHealthUI.test.tsx`).
- Phase 7: Forensic Accounting & Red Flag Engine (`ForensicAccountingEngine.ts`), 14 Forensic Investigation categories, Forensic Policy Registry (`ForensicPolicyRegistry.ts`), domain schemas (`ForensicAnalysisTypes.ts`), specialized cards (`ForensicRiskOverviewCard.tsx`, `HighPriorityFindingsCard.tsx`, `InvestigationQueueCard.tsx`, `PromoterAndOwnershipCard.tsx`, `RelatedPartiesAndContingentCard.tsx`, `AuditorAndAccountingCard.tsx`), cross-statement reconciliation modal (`CrossStatementAuditModal.tsx`), route (`ForensicInvestigationView.tsx`), and 10 dedicated unit test suites.
- Phase 8: Management DNA, Concall & Execution Credibility Engine (`ManagementDnaEngine.ts`), 21 claim categories, 9 commitment statuses (`ABOVE_GUIDANCE`, `ACHIEVED`, `ON_TRACK`, `PARTIALLY_ACHIEVED`, `MISSED`, `REVISED`, `WITHDRAWN`, `UNVERIFIABLE`), outcome attribution (`MANAGEMENT_CONTROLLED`, `EXTERNAL_FACTOR`), separated management-stated vs verified reason models, CandidateManagementStatement validation, StatementCommitmentCertainty, language shift comparison, management-data tension cross-checks, minimum sample size gate (minimum 3 commitments or NOT_ASSESSABLE), multi-hop outcome provenance, stable pageId citations, 7-dimension behavioral discipline DNA profile, and 8 dedicated unit test suites (`managementGuidanceEvaluation.test.ts`, `promiseVsDeliveryScoring.test.ts`, `languageShiftAndCertainty.test.ts`, `managementDataTension.test.ts`, `managementReasonSeparation.test.ts`, `managementContradictionsAndRevisions.test.ts`, `managementAntiHallucination.test.ts`, `managementDnaUI.test.tsx`).
- Phase 9: Sector-Aware Valuation Engine (`SectorValuationEngine.ts`), 16 valuation method specifications (`ValuationMethodRegistry.ts`), business model valuation policies (`ValuationPolicyRegistry.ts`), peer selection with IQR outlier filtering (`PeerSelectionEngine.ts`), point-in-time historical ranges (`HistoricalValuationDataService.ts`), 3-scenario FCFF DCF, 2D sensitivity matrix, reverse DCF bisection solver, SOTP/NAV/DDM, dynamic triangulation weights, multi-scenario margin of safety, and 9 dedicated unit test suites (`relativeValuationMultiples.test.ts`, `historicalValuationBands.test.ts`, `peerSelectionAndOutliers.test.ts`, `dcfScenariosAndWacc.test.ts`, `dcfSensitivityMatrix.test.ts`, `embeddedExpectationsReverseDcf.test.ts`, `businessModelValuationPolicy.test.ts`, `valuationDecouplingAndAntiHallucination.test.ts`, `sectorValuationUI.test.tsx`).

## In Progress

- Ready for Phase 10: Technical Structure & Market Dynamics (Moving Averages, Support & Resistance, Volume Profile, RSI, Delivery %, Relative Strength).

## Next Action

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