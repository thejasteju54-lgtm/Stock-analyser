# PRD.md — Indian Equity Research Intelligence Platform

## Product Vision

Build an evidence-driven AI equity research platform for Indian listed companies.

The product transforms annual reports, financial statements, management commentary, concall transcripts, screenshots, technical charts, shareholding data and verified current information into a structured investment research report.

The product should feel closer to a professional equity-research terminal than a generic AI chat interface.

## Target User

Primary user:

An individual Indian equity investor who wants deep research before buying a stock.

The user wants:

- forensic analysis
- management analysis
- valuation analysis
- technical analysis
- current news
- future catalysts
- risk identification
- explicit investment verdict

## Core Workflow

### Step 1 — Company identification

User enters:

- company name
- stock symbol
- optional exchange

System identifies the company and confirms the entity before analysis.

### Step 2 — Document ingestion

User can upload:

- annual reports
- financial statements
- MDA
- concall transcripts
- investor presentations
- shareholding reports
- Screener screenshots
- technical charts
- other documents

### Step 3 — Document classification

Classify each upload into:

- annual report
- financial statement
- MDA
- concall
- investor presentation
- shareholding
- financial-data screenshot
- technical chart
- other

### Step 4 — Evidence extraction

Extract structured information with provenance.

### Step 5 — Financial reconstruction

Construct a two-year financial model from the provided evidence.

### Step 6 — Forensic analysis

Investigate:

- revenue quality
- profit quality
- cash conversion
- working capital
- receivables
- inventory
- debt
- interest burden
- capitalisation
- depreciation
- related parties
- contingent liabilities
- auditor observations
- exceptional items
- promoter transactions
- share dilution
- capital allocation

### Step 7 — Management analysis

Analyse:

- guidance
- execution
- consistency
- language
- confidence
- defensiveness
- excuses
- recurring promises
- delivery against previous promises
- capital allocation
- promoter behaviour

Compare current commentary with prior commentary whenever evidence exists.

### Step 8 — Industry analysis

Analyse:

- industry growth
- cyclicality
- competitive intensity
- regulation
- structural trends
- disruption
- pricing power
- market share
- industry-specific KPIs

### Step 9 — Valuation

Use appropriate metrics depending on the sector.

Potential metrics include:

- P/E
- EV/EBITDA
- EV/EBIT
- P/B
- FCF yield
- dividend yield
- PEG
- ROCE
- ROE

Do not blindly use P/E for every sector.

### Step 10 — Technical analysis

Analyse the supplied chart and/or verified market data.

Determine:

- trend
- market structure
- accumulation/distribution
- support
- resistance
- volume confirmation
- momentum
- moving averages when data exists
- breakout/breakdown
- divergence when demonstrable

Never invent technical levels.

### Step 11 — Current research

Research verified current:

- company announcements
- earnings
- management updates
- regulatory developments
- major contracts
- acquisitions
- capex plans
- order wins
- sector developments
- material news

Separate historical documents from current information.

### Step 12 — Scenario analysis

Create:

- bull case
- base case
- bear case

Each scenario must identify assumptions.

### Step 13 — Investment verdict

Return:

- Buy
- Hold
- Avoid

Also return:

- conviction score /10
- 1-year outlook
- 5+ year outlook
- key catalysts
- major risks
- price/valuation conditions that improve attractiveness
- one-line thesis

## Critical UX Principle

Every major conclusion should allow the user to inspect the evidence behind it.

Example:

"Cash conversion is deteriorating"

should expose the relevant:

- CFO
- PAT
- calculation
- period
- source

## Non-Goals

Do not initially build:

- social network
- trading execution
- brokerage integration
- automatic portfolio management
- personalised financial advice engine
- high-frequency trading
- unnecessary collaboration features

## Success Criteria

A user should be able to upload two years of company research material and receive a structured, explainable report without manually calculating the core financial metrics.

The system must prioritize correctness and evidence over impressive prose.