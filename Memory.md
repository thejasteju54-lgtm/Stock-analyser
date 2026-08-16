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

Phase 4 — Evidence Extraction & Financial Fact Reconstruction (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with structured Financial Fact extraction across 5 statement categories (Income Statement, Balance Sheet, Cash Flow, Ownership, Segment Data), Management Claims ledger, Unit & Currency Normalizer (Lakh/Crore/Million/Foreign), Contextual Discrepancy & Contradiction Sentinel (`MATCH`, `ROUNDING_VARIANCE`, `UNIT_VARIANCE`, `PERIOD_VARIANCE`, `ACCOUNTING_BASIS_VARIANCE`, `RESTATEMENT`, `SOURCE_DEFINITION_VARIANCE`, `MATERIAL_CONFLICT`), 2-Year Reconciled Statements table, and Fact Provenance Audit drawer.
- Phase 4 route `/extraction` fully functional with `EvidenceExtractionView`, `TwoYearFactTable`, `ManagementClaimsLedger`, `ContradictionAlertBanner`, and `FactProvenanceDrawer`.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Lint: PASSED (0 errors via `npm.cmd run lint`).
- Unit Tests: 103/103 PASSED across 21 test files (`unitNormalizer.test.ts`, `financialExtraction.test.ts`, `contradictionDetector.test.ts`, `twoYearReconciliation.test.ts`, `managementClaims.test.ts`, `antiHallucinationGate.test.ts`, `extractionUI.test.tsx`, `realFileVerification.test.ts`, `ocrConfidence.test.ts`, `documentClassification.test.ts`, `documentProcessing.test.ts`, `duplicateDetection.test.ts`, `periodDetection.test.ts`, `twoYearAudit.test.ts`, `ingestionUI.test.tsx`, `businessModel.test.ts`, `taxonomy.test.ts`, `company.test.ts`, `projectStorage.test.ts`, `onboardingUI.test.tsx`, `shell.test.tsx`).
- Build: PASSED (`npm.cmd run build` transformed 1842 modules into clean production bundle in 3.11s).
- Browser Runtime: Terminal active at `http://localhost:5173/`.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & subsector mappings (`SectorTaxonomyRegistry.ts`), extensible Business Model Taxonomy & Gated Model Registry (`BusinessModelRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.
- Phase 3: Document Ingestion Pipeline (`DocumentIngestionEngine.ts`), Document Classifier (`DocumentClassifier.ts`), SHA-256 Hasher & Duplicate Detector (`DocumentHasher.ts`), Reporting Period & Company Consistency Detector (`PeriodDetector.ts`), OCR Status & Confidence Processor with optional confidence (`OcrProcessor.ts`), Two-Year Annual Report Intake Audit (`TwoYearReportAudit.ts`), and Terminal Ingestion View (`IngestionView.tsx`).
- Phase 4: Financial Fact & Management Claim domain models (`FinancialFactTypes.ts`), Unit & Currency Normalizer (`UnitNormalizer.ts`), Deterministic Financial Fact Extractor (`FinancialFactExtractor.ts`), Contextual Discrepancy & Contradiction Sentinel (`ContradictionDetector.ts`), Two-Year Side-by-Side Model Alignment (`TwoYearReconciliation.ts`), Evidence Extraction Route (`EvidenceExtractionView.tsx`), Two-Year Reconciled Fact Table (`TwoYearFactTable.tsx`), Management Claims Ledger (`ManagementClaimsLedger.tsx`), Contradiction Alert Banner (`ContradictionAlertBanner.tsx`), and Provenance Audit Modal (`FactProvenanceDrawer.tsx`).

## In Progress

- Ready for Phase 5: Financial Calculation Engine (Deterministic revenue growth, EBITDA/EBIT/PAT margins, CFO/PAT, FCF, ROE, ROCE, debt ratios, interest coverage, working-capital cycles).

## Next Action

- Execute Phase 5 according to `Phases.md` when requested.

## Architecture Decisions

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

Unit: 103 passed / 103 total (100%)
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