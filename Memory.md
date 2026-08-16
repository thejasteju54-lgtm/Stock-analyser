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

Phase 3 — Document Ingestion & Evidence Intake (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with multi-format Document Ingestion pipeline, Deterministic Document Classifier, SHA-256 Duplicate Detection, Page-Preserving Extraction, OCR Confidence Gating (>90 High, 80-90 Medium, <80 Low -> REQUIRES_REVIEW), Screenshot Handling (`SCREENSHOT_DERIVED`), and Two-Year Annual Report Intake Audit.
- Phase 3 route `/ingestion` fully functional with terminal dropzone (`DocumentDropzone`), Two-Year Audit Card (`TwoYearAuditCard`), Ingested Evidence Queue Table (`DocumentQueueTable`), Page Inspector Modal (`DocumentPageInspectorModal`), and 2-Year Sample Research Kit loader.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Unit Tests: 66/66 PASSED across 13 test files (`ocrConfidence.test.ts`, `documentClassification.test.ts`, `documentProcessing.test.ts`, `duplicateDetection.test.ts`, `periodDetection.test.ts`, `twoYearAudit.test.ts`, `ingestionUI.test.tsx`, `businessModel.test.ts`, `taxonomy.test.ts`, `company.test.ts`, `projectStorage.test.ts`, `onboardingUI.test.tsx`, `shell.test.tsx`).
- Build: PASSED (`npm.cmd run build` transformed 1833 modules into clean production bundle in 2.88s).
- Browser Runtime: Terminal active and verified at `http://localhost:5173/` (sample kit loaded, two-year baseline ready, page inspector verified).

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & subsector mappings (`SectorTaxonomyRegistry.ts`), extensible Business Model Taxonomy & Gated Model Registry (`BusinessModelRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.
- Phase 3: Document Ingestion Pipeline (`DocumentIngestionEngine.ts`), Document Classifier (`DocumentClassifier.ts`), SHA-256 Hasher & Duplicate Detector (`DocumentHasher.ts`), Reporting Period & Company Consistency Detector (`PeriodDetector.ts`), OCR Status & Confidence Processor with optional confidence (`OcrProcessor.ts`), Two-Year Annual Report Intake Audit (`TwoYearReportAudit.ts`), and Terminal Ingestion View (`IngestionView.tsx`).

## In Progress

- Ready for Phase 4: Structured Evidence Extraction Review (2-Year Model Normalizer, financial statement table extraction, provenance tagging, contradiction detection).

## Next Action

- Execute Phase 4 according to `Phases.md` when requested.

## Architecture Decisions

- **Document Identity & Provenance**: Every document receives a deterministic ID (`doc_<symbol>_<timestamp>_<hash>`), SHA-256 content hash, explicit provenance source (`PRIMARY_SOURCE_DERIVED` vs `SCREENSHOT_DERIVED`), reporting period, and company verification status.
- **Page Boundary Preservation**: Ingestion pipeline never flattens multi-page PDFs into untraceable strings; each page is stored with page numbers, text layers, OCR flags, and confidence scores.
- **OCR Status & Confidence Architecture**: `ocrConfidence?: number` is undefined for machine-readable pages (never represented as 0%), and maps into `NOT_REQUIRED`, `COMPLETE`, `REQUIRES_REVIEW` (<80%), or `FAILED`.
- **Two-Year Annual Report Intake Gate**: Audits project documents for FY-1 (Base) and FY-0 (Current) annual reports, warning on duplicate years or missing periods before downstream extraction is unlocked.
- **Business Model Taxonomy Registry**: Decoupled from Sector taxonomy to represent *how* a company economically operates (19+ extensible archetypes).
- **Persistence & Duplicate Control**: `ProjectStorage` preserves project documents and prevents duplicate upload collisions.

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

Unit: 66 passed / 66 total (100%)
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