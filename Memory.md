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

Phase 1 — Application Shell & Design System (Complete)

## Current Status

- React 19 + TypeScript + Vite project initialized with high-density Bloomberg/TradingView-grade dark terminal aesthetic.
- Full 15-module persistent navigation hierarchy, header with Indian enterprise context, telemetry status bar, error boundary, and responsive layouts implemented.
- Typecheck: PASSED (0 errors).
- Unit Tests: 4/4 PASSED (100%).
- Build: PASSED (`npm.cmd run build` complete in 2.89s).
- Browser Testing: Verified in browser with 0 console errors across all 15 navigation views.

## Completed

- Phase 0: Repository intelligence & architectural compliance review.
- Phase 1: Application shell, high-density terminal tokens, persistent SideNav, TopBar, StatusBar, ErrorBoundary, route placeholders, UI primitives (`Badge`, `Card`, `Button`), Vitest test suite, and browser verification.

## In Progress

- Ready for Phase 2: Research Project Creation & Company Onboarding.

## Next Action

- Execute Phase 2: Implement Indian company identification (NSE/BSE symbol input, company lookup, sector taxonomy selection) and research project state lifecycle store.

## Architecture Decisions

- **UI & Layout**: High-density 3-row, 2-column CSS Grid terminal layout with responsive collapse for mobile/tablet.
- **Design Tokens**: Deep dark terminal surfaces (`#07090e`, `#0c1017`, `#121824`), tabular numerals for financial data (`JetBrains Mono`), and semantic color tokens (`--color-bullish`, `--color-bearish`, `--color-warning`, `--color-cyan`).
- **Domain Decoupling**: View routes strictly demarcated by development phase with clear engine target declarations.

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

Unit: 4 passed / 4 total (100%)
Integration: Scoped to Phase 16
E2E: Scoped to Phase 16
Browser: Verified via Browser Subagent (14/14 routes + Overview validated)
Build: Passed (dist assets generated)

## Recent Git Commit

- Pending Phase 1 commit.

## Important Constraints

- Never fabricate financial data.
- Preserve provenance.
- Deterministic calculations.
- Test before completion.
- Do not bypass failures.