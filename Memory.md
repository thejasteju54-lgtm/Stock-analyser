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

Phase 2 — Research Project Creation & Company Onboarding (Complete)

## Current Status

- React 19 + TypeScript + Vite terminal with Indian Company Identity validation, Sector Taxonomy registry (30+ sectors, subsectors, gated forensic & valuation models), and Project Lifecycle persistence.
- Project creation modal (`NewProjectModal`), multi-project switcher (`ProjectSwitcher`), active profile cards, and storage engine (`ProjectStorage`) fully functional.
- Typecheck: PASSED (0 errors via `npm.cmd run typecheck`).
- Unit Tests: 21/21 PASSED across 5 test files (`taxonomy.test.ts`, `company.test.ts`, `projectStorage.test.ts`, `onboardingUI.test.tsx`, `shell.test.tsx`).
- Build: PASSED (`npm.cmd run build` transformed 1821 modules into clean production bundle in 2.35s).
- Browser Runtime: Terminal active and verified at `http://localhost:5173/`.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`).
- Phase 2: Company Identity validation (`Company.ts`), 30+ Sector Taxonomy definitions & gated model mappings (`SectorTaxonomyRegistry.ts`), Research Project state model (`ResearchProject.ts`), LocalStorage session persistence & duplicate protection (`ProjectStorage.ts`), Company Onboarding modal with dynamic model preview (`NewProjectModal.tsx`), multi-project switcher (`ProjectSwitcher.tsx`), and full unit test coverage.

## In Progress

- Ready for Phase 3: Document Ingestion Pipeline (PDF.js parsing, canvas OCR, classification, metadata extraction).

## Next Action

- Execute Phase 3 according to `Phases.md` when requested.

## Architecture Decisions

- **Sector Taxonomy Registry**: Extensible lookup mapping 30+ Indian sectors to canonical business models (`BANKING`, `NBFC`, `INSURANCE`, `NON_FINANCIAL_OPERATING`, `REAL_ESTATE_TRUST`, `PROJECT_INFRA`, `UTILITY`), applicable metrics, gated forensic checks (e.g. `NPA_PCR_QUALITY` vs `BENEISH_M_SCORE`), and valuation frameworks (`PB_ABV` vs `DCF`/`EV_EBITDA`).
- **Identity Disambiguation**: Company identity strictly requires Legal Name, Symbol (1-20 alphanumeric/&/-), Exchange (`NSE` | `BSE`), Sector, and Subsector before analysis can begin.
- **Persistence & Duplicate Control**: `ProjectStorage` preserves project history in `localStorage` with seed fallback and guards against duplicate exchange+symbol collisions.

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

Unit: 21 passed / 21 total (100%)
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