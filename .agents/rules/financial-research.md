---
trigger: always_on
---

# Financial Research Rules

## Purpose

These rules apply whenever the agent performs equity research, financial analysis, company analysis, valuation, management analysis, forensic analysis, technical analysis, or investment research.

## Evidence First

All material financial conclusions must be based on verified evidence.

Primary evidence sources include:

1. Audited annual reports
2. Audited financial statements
3. Official company filings
4. Official investor presentations
5. Official earnings/concall transcripts
6. Verified market data
7. Reputable financial databases
8. Reputable financial news sources
9. User-provided documents and screenshots

Do not treat an AI-generated statement as evidence.

## Financial Data Integrity

Never invent:

- Revenue
- EBITDA
- EBIT
- PAT
- EPS
- CFO
- FCF
- Debt
- Cash
- Net debt
- ROE
- ROCE
- Margins
- Shareholding
- Promoter pledge
- Market price
- Market capitalization
- P/E
- EV/EBITDA
- Peer multiples
- Order book
- Market share
- Guidance
- Technical levels

If reliable data is unavailable, explicitly state:

"Data unavailable from verified sources."

## Period Integrity

Always verify:

- Financial year
- Quarter
- Reporting date
- Consolidated vs standalone
- Continuing vs discontinued operations
- Restated vs originally reported numbers
- Currency
- Units

Never compare incompatible periods without explaining the limitation.

## Source Provenance

Material financial facts should preserve:

- Source document
- Page number
- Section
- Table
- Reporting period
- Value
- Unit
- Extraction method
- Confidence
- Verification status

## Fact vs Interpretation

Clearly distinguish:

FACT
CALCULATION
INTERPRETATION
ASSUMPTION
FORECAST
MANAGEMENT CLAIM
UNVERIFIED INFORMATION

Never present an interpretation as a factual statement.

## Financial Calculations

Use deterministic application code for:

- Revenue growth
- EBITDA margin
- EBIT margin
- PAT margin
- CFO/PAT
- FCF
- ROE
- ROCE
- Debt ratios
- Interest coverage
- Working-capital metrics
- Valuation ratios

The LLM may interpret calculations but must not replace deterministic arithmetic.

## Forensic Mindset

Actively investigate:

- Earnings quality
- Cash conversion
- Receivables
- Inventory
- Working capital
- Debt
- Related-party transactions
- Exceptional items
- Contingent liabilities
- Auditor qualifications
- Capitalisation of expenses
- Dilution
- Promoter activity

Do not assume that a red flag proves fraud.

## Management Claims

Management guidance is a management claim, not an established fact.

Track:

Promise → Expected outcome → Actual outcome → Variance → Explanation

Compare historical management statements with subsequent performance whenever evidence exists.

## Valuation

Valuation must be sector-aware.

Do not blindly use P/E for every company.

Select metrics appropriate to the business model and sector.

Never invent peer or historical valuation data.

## Technical Analysis

Technical levels must come from:

- verified market data
- or explicitly identified chart-derived observations

Never fabricate support, resistance, trend, volume, or momentum.

## Current Information

Clearly separate:

Historical company documents

from:

Current news and developments.

Current claims must have source and date.

## Contradictions

If reliable sources disagree:

1. Preserve both values.
2. Identify the disagreement.
3. Investigate the reason.
4. Prefer the higher-quality source where justified.
5. Document the resolution.

Never silently overwrite conflicting information.

## Investment Verdict

Do not generate BUY, HOLD, or AVOID until the relevant evidence has been analysed.

The final verdict must consider:

- Business quality
- Financial quality
- Cash generation
- Management
- Governance
- Industry
- Valuation
- Technical structure
- Catalysts
- Risks
- Scenario analysis

## Bias Control

Before the final verdict, actively search for evidence that could invalidate the investment thesis.

Avoid:

- Confirmation bias
- Narrative bias
- Recency bias
- Anchoring
- Survivorship bias
- Valuation optimism

## Core Principle

The objective is not to produce an impressive report.

The objective is to produce an accurate, evidence-backed, reproducible and challengeable investment analysis.