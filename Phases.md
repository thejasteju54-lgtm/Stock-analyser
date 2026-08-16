# Phases.md — Execution Plan

## Phase 0 — Repository Intelligence

Tasks:

- inspect repository
- inspect dependencies
- inspect existing architecture
- inspect Git state
- inspect MCP
- inspect skills
- inspect rules
- identify existing tests
- identify deployment

Exit criteria:

- repository assessment complete
- PRD exists
- Architecture exists
- Rules exists
- Design exists
- phase plan exists

---

# Phase 1 — Application Foundation

Build:

- application shell
- routing
- design system
- theme
- navigation
- error boundary
- logging
- configuration
- environment validation

Tests:

- application boots
- routes load
- build passes

---

# Phase 2 — Research Project Creation

Build:

- company input
- research project creation
- project state
- project dashboard
- upload interface

Tests:

- create project
- validate company
- upload supported file
- reject unsupported file

---

# Phase 3 — Document Ingestion

Build:

- PDF ingestion
- image ingestion
- OCR where required
- document classification
- page extraction
- metadata
- document storage

Tests:

- valid PDF
- corrupted PDF
- image
- long screenshot
- duplicate document
- unsupported file

---

# Phase 4 — Evidence Extraction

Build structured extraction for:

- income statement
- balance sheet
- cash flow
- ratios
- shareholding
- management statements
- guidance
- business metrics

Implement provenance.

Tests:

- extraction schema validation
- numeric validation
- source mapping
- missing data
- contradictory data

---

# Phase 5 — Financial Calculation Engine

Implement deterministic calculations:

- revenue growth
- EBITDA margin
- EBIT margin
- PAT margin
- CFO/PAT
- FCF
- ROE
- ROCE
- debt ratios
- interest coverage
- working-capital metrics

Tests should use fixed known datasets.

---

# Phase 6 — Fundamental Engine

Analyse:

- revenue quality
- margin trajectory
- earnings quality
- cash conversion
- balance sheet
- capital allocation
- return ratios
- accounting red flags

Output structured findings.

---

# Phase 7 — Forensic Engine

Analyse:

- receivables
- inventory
- working capital
- related parties
- contingent liabilities
- auditor qualifications
- exceptional items
- cash flow anomalies
- dilution
- promoter activity

Implement severity levels:

Low
Medium
High
Critical

---

# Phase 8 — Management DNA Engine

Extract management statements.

Classify:

- guidance
- confidence
- uncertainty
- excuses
- promises
- strategic claims
- risks

Compare prior promises with actual outcomes.

Generate a management credibility assessment.

---

# Phase 9 — Valuation Engine

Implement sector-aware valuation frameworks.

Support appropriate metrics based on company type.

Compare:

- current valuation
- historical valuation when data exists
- peer valuation when verified data exists

Never invent peer values.

---

# Phase 10 — Technical Engine

Accept:

- chart image
- historical price data where available

Analyse:

- trend
- structure
- support
- resistance
- volume
- momentum
- accumulation/distribution

Use confidence labels for image-derived observations.

---

# Phase 11 — Current Research Engine

Research:

- latest company announcements
- earnings
- regulatory events
- capex
- contracts
- acquisitions
- management updates
- sector developments
- material news

Store source/date/relevance.

---

# Phase 12 — Catalyst & Risk Engine

Generate:

Catalysts:

- earnings
- capacity expansion
- order book
- margin improvement
- deleveraging
- new products
- market share
- industry tailwinds

Risks:

- sector
- company
- management
- balance sheet
- valuation
- regulatory
- macro

Rank by potential impact.

---

# Phase 13 — Scenario Engine

Build:

Bull
Base
Bear

Each scenario must specify:

assumptions
drivers
risks
valuation implications
expected outcome

No fake precision.

---

# Phase 14 — Investment Verdict

Generate:

BUY / HOLD / AVOID

Conviction /10

Include:

1-year outlook
5+ year outlook
catalysts
risks
valuation attractiveness
thesis breakers
interesting valuation condition

Verdict must reference evidence.

---

# Phase 15 — Evidence Explorer

Allow user to inspect:

claim
calculation
source
document
page
confidence

---

# Phase 16 — Full QA

Run:

- unit tests
- integration tests
- E2E tests
- browser tests
- accessibility tests
- security checks
- build
- production-like runtime

Fix all critical issues.

---

# Phase 17 — Performance & Reliability

Test:

- large PDFs
- multiple documents
- long screenshots
- slow network
- failed APIs
- partial extraction
- retry
- duplicate uploads

---

# Phase 18 — Production Readiness

Verify:

- environment configuration
- secrets
- logging
- error handling
- deployment
- database
- storage
- monitoring
- security

---

# Phase 19 — Final Audit

Perform a hostile review.

Ask:

What can still hallucinate?

What can produce wrong financial numbers?

What can break on a 300-page annual report?

What happens if OCR is wrong?

What happens if two sources disagree?

What happens if current data cannot be retrieved?

What happens if the company changes reporting structure?

What happens if the stock is a bank/REIT/InvIT?

Fix the highest-risk issues.

---

# Phase 20 — Ship

Final:

- tests
- build
- security review
- Git status
- documentation
- deployment

Only then declare:

Git.
Ship.
Done.