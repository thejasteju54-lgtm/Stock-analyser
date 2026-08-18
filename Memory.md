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

Phase 7 — Forensic Accounting & Red Flag Engine (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with pure deterministic Forensic Accounting & Earnings-Quality Investigation Engine (`ForensicAccountingEngine.ts`) across 14 forensic categories (Revenue Quality, Profit vs Cash Flow Realization, Working Capital Forensics, Capitalization & Expense Quality, Exceptional Items, Related-Party Transactions, Contingent Liabilities, Auditor Disclosures, Accounting Policy Changes, Restatements, Debt & Financing, Promoter Ownership & Pledge, Cash & Balance-Sheet Quality, Cross-Statement Consistency).
- Objective Signal vs Accusatory Conclusion separation: every threshold divergence is classified into an objective deterministic signal code (e.g. `RECEIVABLES_VS_REVENUE_GROWTH_DIVERGENCE_SIGNAL`, `LOW_CFO_PAT_CONVERSION_SIGNAL`, `HIGH_PROMOTER_PLEDGE_SIGNAL`), with severity (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`) and status (`OBSERVED` | `POTENTIAL_CONCERN` | `REQUIRES_INVESTIGATION` | `MATERIAL_CONCERN`), explicitly providing plausible operational explanations alongside risk contexts without alleging fraud or manipulation.
- Dual-Denominator Promoter Pledge Analysis: explicitly calculates both primary denominator (`pledgeAsPctOfPromoterHolding` = Pledged / Promoter Shares) and secondary denominator (`pledgeAsPctOfTotalShareCapital` = Pledged / Total Shares) to prevent denominator confusion.
- Multi-Denominator Contingent Liability Materiality: evaluates disputed liabilities against Net Worth, Revenue, Cash & Equivalents, and Total Debt with outcome uncertainty status (`OUTCOME_UNCERTAIN`, `SUB_JUDICE_TAX_DISPUTE`).
- Cross-Statement Accounting Bridges: verifies numerical consistency across Income Statement, Balance Sheet, and Cash Flow Statement (e.g. Capex outflow vs Gross PPE additions reconciled via CWIP, FX, and capitalized interest).
- Auditor & Accounting Disclosures Sentinel: inspects audit opinion (`UNMODIFIED`, `QUALIFIED`, `ADVERSE`, `DISCLAIMER`), Key Audit Matters (KAM count and topics do NOT artificially inflate forensic risk score), going-concern modifications, and prior-period restatements (`RECLASSIFICATION` vs `ERROR_CORRECTION`).
- Phase 7 UI components & route `/forensic` fully integrated: `ForensicInvestigationView`, `ForensicRiskOverviewCard`, `HighPriorityFindingsCard`, `InvestigationQueueCard`, `PromoterAndOwnershipCard`, `RelatedPartiesAndContingentCard`, `AuditorAndAccountingCard`, `CrossStatementAuditModal`, and `BusinessModelGatingBanner`.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: 184/184 PASSED across 47 test files (10 dedicated Phase 7 suites + 37 previous suites).
- Build: PASSED (`npm.cmd run build` transformed 1865 modules into clean production bundle in 7.91s).
- Browser Runtime: Terminal active at `http://localhost:5173/`.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & subsector mappings (`SectorTaxonomyRegistry.ts`), extensible Business Model Taxonomy & Gated Model Registry (`BusinessModelRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.
- Phase 3: Document Ingestion Pipeline (`DocumentIngestionEngine.ts`), Document Classifier (`DocumentClassifier.ts`), SHA-256 Hasher & Duplicate Detector (`DocumentHasher.ts`), Reporting Period & Company Consistency Detector (`PeriodDetector.ts`), OCR Status & Confidence Processor with optional confidence (`OcrProcessor.ts`), Two-Year Annual Report Intake Audit (`TwoYearReportAudit.ts`), and Terminal Ingestion View (`IngestionView.tsx`).
- Phase 4: Financial Fact & Management Claim domain models (`FinancialFactTypes.ts`), Unit & Currency Normalizer (`UnitNormalizer.ts`), Deterministic Financial Fact Extractor (`FinancialFactExtractor.ts`), Contextual Discrepancy & Contradiction Sentinel (`ContradictionDetector.ts`), Two-Year Side-by-Side Model Alignment (`TwoYearReconciliation.ts`), Evidence Extraction Route (`EvidenceExtractionView.tsx`), Two-Year Reconciled Fact Table (`TwoYearFactTable.tsx`), Management Claims Ledger (`ManagementClaimsLedger.tsx`), Contradiction Alert Banner (`ContradictionAlertBanner.tsx`), and Provenance Audit Modal (`FactProvenanceDrawer.tsx`).
- Phase 5: Deterministic Financial Calculation Engine (`FinancialCalculationEngine.ts`), centralized Formula Registry with versioning (`FormulaRegistry.ts`), calculation domain types (`CalculationTypes.ts`), business model gating (`BusinessModelGatingBanner.tsx`), calculated metric card (`CalculatedMetricCard.tsx`), multi-hop fact-to-metric provenance modal (`MetricProvenanceModal.tsx`), calculation workspace route (`FinancialCalculationsView.tsx`), average-balance working capital days, CFO/PAT negative loss diagnostic statuses (`CASH_GENERATION_DURING_ACCOUNTING_LOSS`, `CASH_BURN_DURING_ACCOUNTING_LOSS`), and 9 dedicated unit test suites.
- Phase 6: Fundamental Health Analysis Engine (`FundamentalHealthEngine.ts`), 12 Business Model Scoring Policies (`HealthScoringPolicyRegistry.ts`), domain schemas (`FundamentalHealthTypes.ts`), category score cards (`FundamentalHealthCard.tsx`), red flag risk matrix (`RedFlagMatrixCard.tsx`), strengths and watch items (`StrengthsAndWatchItemsCard.tsx`), driver decomposition modal (`DriverDecompositionModal.tsx`), workspace dashboard (`FundamentalHealthView.tsx`), and 7 dedicated unit test suites (`fundamentalHealthScoring.test.ts`, `businessModelScoringPolicies.test.ts`, `signalSeverityContext.test.ts`, `driverDecomposition.test.ts`, `evidenceQualityAndConfidence.test.ts`, `verdictDecoupling.test.ts`, `fundamentalHealthUI.test.tsx`).
- Phase 7: Forensic Accounting & Red Flag Engine (`ForensicAccountingEngine.ts`), 14 Forensic Investigation categories, Forensic Policy Registry (`ForensicPolicyRegistry.ts`), domain schemas (`ForensicAnalysisTypes.ts`), specialized cards (`ForensicRiskOverviewCard.tsx`, `HighPriorityFindingsCard.tsx`, `InvestigationQueueCard.tsx`, `PromoterAndOwnershipCard.tsx`, `RelatedPartiesAndContingentCard.tsx`, `AuditorAndAccountingCard.tsx`), cross-statement reconciliation modal (`CrossStatementAuditModal.tsx`), route (`ForensicInvestigationView.tsx`), and 10 dedicated unit test suites (`forensicSignalVsConclusion.test.ts`, `revenueAndCashFlowForensics.test.ts`, `promoterPledgeDenominators.test.ts`, `contingentLiabilityMateriality.test.ts`, `auditorAndKamDisclosures.test.ts`, `relatedPartyAndRestatementForensics.test.ts`, `crossStatementReconciliation.test.ts`, `sourceIndependenceAndAntiHallucination.test.ts`, `forensicPolicyRegistry.test.ts`, `forensicInvestigationUI.test.tsx`).

## In Progress

- Ready for Phase 8: Management DNA & Credibility Engine (promise vs delivery tracking, guidance variance, concall tone & linguistic shifts, capital allocation execution).

## Next Action

- Await user approval and prompt for Phase 8 execution. DO NOT start Phase 8 automatically.

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