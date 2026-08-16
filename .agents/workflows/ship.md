---
description: Perform the final production-readiness audit and prepare the verified application for deployment.
---

## Step 1 — Read Project State

Read:

- @AGENTS.md
- @PRD.md
- @Architecture.md
- @Rules.md
- @Design.md
- @Phases.md
- @Memory.md

## Step 2 — Git Audit

Run:

git status

Inspect:

git diff
git log

Check for:

- accidental files
- secrets
- credentials
- temporary files
- debug code
- private documents

## Step 3 — Quality Checks

Run:

- typecheck
- lint
- unit tests
- integration tests
- E2E tests
- production build

Fix failures.

Do not bypass them.

## Step 4 — Security Audit

Check:

- environment variables
- secrets
- API authentication
- authorization
- upload validation
- file access
- database security
- XSS
- injection
- prompt injection
- exposed errors

## Step 5 — Runtime Verification

Start the production-like application.

Verify:

- application starts
- routes work
- major workflows work
- API calls work
- error states work
- loading states work
- browser console is clean
- no critical network errors exist

## Step 6 — Research System Verification

Verify that the research engine:

- preserves provenance
- does not fabricate missing data
- handles conflicting sources
- performs deterministic calculations
- distinguishes facts from forecasts
- verifies material claims

## Step 7 — Performance

Check:

- large document handling
- long screenshots
- multiple uploads
- slow network behaviour
- failed API behaviour
- retry behaviour
- UI responsiveness

## Step 8 — Documentation

Update:

- README.md
- Memory.md
- architecture documentation if changed
- environment documentation

## Step 9 — Final Git Check

Run:

git status

Review:

git diff

Then run the final test/build sequence again.

## Step 10 — Commit

Create a meaningful production-readiness commit.

## Final Report

Return:

Production readiness:
Tests:
Build:
Security:
Browser:
Performance:
Known limitations:
Git commit:
Deployment status:

## Critical Rule

Never claim "Ship" if critical tests, build, security or runtime verification fails.