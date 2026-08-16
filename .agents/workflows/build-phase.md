---
description: Execute exactly one development phase from Phases.md using an inspect → plan → implement → test → debug → verify → document → commit workflow.
---

Read:

- @AGENTS.md
- @PRD.md
- @Architecture.md
- @Rules.md
- @Design.md
- @Phases.md
- @Memory.md

Determine the current phase.

## Critical Scope Rule

Implement ONLY the current phase.

Do not prematurely implement later phases unless a small dependency is absolutely required.

Do not build fake placeholder functionality that appears production-ready.

## Step 1 — Inspect

Inspect:

- relevant source files
- dependencies
- configuration
- database/schema
- APIs
- existing components
- tests
- related skills
- relevant rules

Do not modify files yet.

## Step 2 — Plan

Create a concise implementation plan containing:

- objective
- files likely to change
- dependencies
- implementation approach
- test strategy
- risks

## Step 3 — Implement

Implement the smallest complete version of the phase.

Follow:

- architecture
- coding standards
- security rules
- financial research rules
- anti-hallucination rules

## Step 4 — Test

Run appropriate:

- typecheck
- lint
- unit tests
- integration tests
- build

## Step 5 — Debug

If anything fails:

1. Read the actual error.
2. Identify root cause.
3. Fix the root cause.
4. Re-run the failing test.
5. Run regression tests.
6. Run the build again.

Never:

- disable tests
- weaken assertions
- suppress errors
- remove functionality to make tests pass
- use fake data to bypass failures

## Step 6 — Browser Verification

If the phase contains user-facing functionality:

- start the application
- open it in the browser
- execute the relevant workflow
- inspect UI
- inspect console errors
- inspect network errors
- test loading states
- test error states
- test responsive behaviour when relevant

## Step 7 — Security Check

Before completion verify:

- no secrets were added
- no credentials are committed
- no unsafe file access exists
- uploaded content is treated as untrusted
- no sensitive data is exposed

## Step 8 — Documentation

Update Memory.md with:

- completed work
- current phase
- files changed
- architecture decisions
- known issues
- test status
- next phase

## Step 9 — Git

Run:

git status

Inspect:

git diff

Then run the final relevant tests and build.

Commit the verified phase with a meaningful commit message.

## Completion Report

Return:

Phase:
Status:
Implemented:
Files changed:
Tests:
Build:
Browser verification:
Security check:
Known issues:
Git commit:
Next phase:

## Definition of Done

The phase is not complete until implementation, testing, build verification, runtime verification where relevant, documentation and Git checkpoint are complete.