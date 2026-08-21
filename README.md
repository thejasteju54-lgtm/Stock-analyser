# Indian Equity Research Intelligence Terminal

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-1221%20Passed%20(100%25)-brightgreen)](https://vitest.dev/)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)]()

An institutional-grade, evidence-driven **Indian Equity Research Intelligence Terminal** built for comprehensive financial statement analysis, forensic accounting, sector-aware valuation, management credibility tracking, and audit-ready investment research.

---

## 🏛️ Core Architecture & Design Philosophy

The terminal is designed with strict **anti-fabrication, point-in-time temporal integrity, and deterministic mathematical principles**:

1. **Evidence-Driven Provenance**: Every financial number, management claim, and catalyst is linked to primary statutory disclosures (BSE/NSE XBRL, audited annual reports, quarterly filings) with explicit confidence scores and page citations.
2. **Sector-Aware Economic Archetypes**: Distinct financial models for **Commercial Banking**, **NBFCs**, **IT Services**, **Diversified Industrial**, and **Insurance**. Prevents invalid arithmetic such as EBITDA on banks or COGS on software firms.
3. **Temporal Leakage Prevention**: Strict point-in-time cutoff date filtering preventing future price or filing data from contaminating historical research analyses.
4. **Deterministic Arithmetic Engine**: All ratios (Margins, ROE, ROCE, CFO/PAT, CRAR, Net Debt) are calculated via deterministic TypeScript algorithms rather than approximate LLM estimations.
5. **Hostile Audit Certified**: Proven resilience across 43 adversarial vectors with 30 dedicated hostile audit suites and 336 unit/integration suites (1,221 tests, 100% pass rate).

---

## 📊 Analytical Pipeline (Phases 1–20)

```
[ Multi-Format Ingestion ] (PDFs, XBRL, Annual Reports, Scans)
           │
           ▼
[ Evidence Extraction & Unit Normalization ] (Cr / L / Mn / FX conversion)
           │
           ▼
[ Deterministic Arithmetic & Statement Bridges ] (EBITDA, CFO, Net Debt)
           │
           ▼
[ Sector Analysis & Forensic Quality ] (Beneish M-Score, Cash Divergence)
           │
           ▼
[ Management DNA & Execution Credibility ] (Promise vs Delivery Tracker)
           │
           ▼
[ Sector Valuation & Triangulation ] (DCF, DDM, NAV, EV/EBITDA, P/E Bands)
           │
           ▼
[ Technical Market Structure ] (Cyclical Stages, Support/Resistance Zones)
           │
           ▼
[ News Intelligence & Rumor Filtering ] (Deduplicated Wire Clusters, Porter's Moat)
           │
           ▼
[ Catalysts, Risks & Thesis Breakers ] (5x5 PxI Matrix, Falsifiable Triggers)
           │
           ▼
[ Quantitative Scenario Modeling ] (Base / Bull / Bear 100% Probability Sums)
           │
           ▼
[ Decision Readiness Gate & Verdict Master ] (Margin of Safety -> BUY / HOLD / AVOID)
           │
           ▼
[ 22-Section Institutional Report & Multi-Format Exports ] (HTML/PDF, JSON, CSV)
           │
           ▼
[ Immutable Snapshots & Change Detection ] (Parent-Linked SHA-256 Hash Chains)
```

---

## ⚡ Key Features

- **22-Section Institutional Report Engine**: Generates complete institutional reports with executive summaries, conviction scores, valuation sensitivity matrices, and compliance disclaimers.
- **Interactive Workspace UI**: Real-time research terminal with interactive valuation sandboxes, dynamic risk matrix heatmaps, technical cycle charts, and live/replay feed switches.
- **Live & Replay Feeds**: Seamlessly switch between live market streaming and historical replay modes with custom cutoff dates and token-bucket rate limiting.
- **Cryptographic Snapshots**: Version-controlled snapshots with parent-child SHA-256 hash chains and bit-level change detection.
- **Multi-Format Report Exports**: One-click exports to Print-to-PDF / standalone printable HTML, structured JSON payloads, and normalized tabular CSVs.
- **Zero Secret Exposure**: Built-in automated secret scanning, pattern-based redaction, and strict environment isolation.

---

## 🏢 Real-Company Audited Fixtures

The terminal includes frozen, audited FY2024 fixtures validating sector models:
1. **Tata Motors Limited** (`TATAMOTORS`) — *Diversified Large-Cap Industrial / Automotive*
2. **Dixon Technologies Limited** (`DIXON`) — *High-Growth Mid-Cap EMS / Manufacturing*
3. **HDFC Bank Limited** (`HDFCBANK`) — *Universal Commercial Banking (NII, NIM, CRAR, GNPA)*
4. **Tata Steel Limited** (`TATASTEEL`) — *Cyclical Commodity / Heavy Manufacturing*
5. **Infosys Limited** (`INFY`) — *IT Services Software Platform*

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0+ (v20+ recommended)
- **npm**: v9.0+

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/indian-equity-research-terminal.git
cd indian-equity-research-terminal

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Running Tests & Quality Gates

```bash
# Run full 336-suite test suite (1,221 tests)
npm test

# Run strict TypeScript typechecking (0 errors required)
npm run typecheck

# Run production linter
npm run lint

# Build production bundle
npm run build
```

---

## 📁 Repository Structure

```
stock analyser/
├── src/
│   ├── components/            # React UI components & terminal views
│   │   ├── live/              # Live data status, control panels & source configs
│   │   └── ...                # Charts, tables, modals, risk matrix, evidence explorer
│   ├── domain/                # Deterministic analytical business logic
│   │   ├── audit/             # SHA-256 canonical serializers & audit loggers
│   │   ├── config/            # Production configuration models & startup validators
│   │   ├── dataSources/       # Canonical datapoints, rate limiters & multi-source selection
│   │   ├── extraction/        # Financial fact extractors & unit normalizers
│   │   ├── fixtures/          # Real-company audited FY24 frozen datasets
│   │   ├── forensics/         # Forensic accounting, cash divergence & earnings quality
│   │   ├── management/        # Management DNA & promise-vs-delivery scoring
│   │   ├── models/            # Domain models (ResearchProject, Company, Documents)
│   │   ├── news/              # News clustering, deduplication & entity resolution
│   │   ├── observability/     # Health probes (/health/live, /health/ready) & logging
│   │   ├── operations/        # Zero-downtime deployment rollback engines
│   │   ├── readiness/         # Phase 14 decision readiness gatekeeper
│   │   ├── reliability/       # Backpressure queues & benchmark engines
│   │   ├── reports/           # 22-Section report engine & PDF/JSON/CSV exporters
│   │   ├── risks/             # Multi-dimensional risk matrix & thesis breakers
│   │   ├── scenarios/         # Quantitative Monte Carlo & return distributions
│   │   ├── security/          # RBAC, secret scanners, redaction & SSRF firewalls
│   │   ├── snapshots/         # Cryptographic snapshot engine & hash chains
│   │   ├── technical/         # Technical analysis & market cycle classifier
│   │   ├── valuation/         # Sector-aware valuation models (DCF, DDM, NAV)
│   │   └── verdict/           # Master investment verdict synthesis engine
│   └── routes/                # Application views (Dashboard, Workspace, Reports)
├── tests/
│   ├── hostile_audit/         # 30 dedicated adversarial hostile audit suites
│   ├── production/            # 25 production readiness & deployment hardening suites
│   ├── qa/                    # Institutional QA validation suites
│   ├── reliability/           # Stress, concurrency, latency, and memory suites
│   └── unit/                  # 200+ unit tests across all domain calculation engines
├── package.json
└── tsconfig.json
```

---

## ⚖️ Statutory Disclaimer

> **Statutory Disclaimer (SEBI Compliance Notice)**:  
> This platform and its analytical outputs are for institutional investment research, educational, and analytical evaluation purposes only. It does not constitute a guaranteed financial return, personal investment advice, or a solicitation to buy or sell securities. Past performance and scenario projections are not indicative of future market outcomes. Users must exercise independent professional judgement and verify primary statutory regulatory filings before making investment decisions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
