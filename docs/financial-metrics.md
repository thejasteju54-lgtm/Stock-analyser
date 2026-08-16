# Financial Metrics Reference

## Purpose

Define financial metrics used by the Stock Analyzer.

## Revenue Growth

Revenue Growth = (Current Revenue - Previous Revenue) / Previous Revenue × 100

Use comparable reporting periods.

## EBITDA Margin

EBITDA Margin = EBITDA / Revenue × 100

## EBIT Margin

EBIT Margin = EBIT / Revenue × 100

## PAT Margin

PAT Margin = PAT / Revenue × 100

## CFO/PAT

CFO/PAT = Cash Flow From Operations / PAT

Interpret carefully.

A low or declining ratio may indicate weak earnings-to-cash conversion, but context is required.

## Free Cash Flow

FCF should be defined consistently within the application.

A common framework:

FCF = CFO - Capital Expenditure

Clearly document the chosen definition.

## ROE

ROE = Profit After Tax / Average Shareholders' Equity

Use average equity where appropriate.

## ROCE

The application must define the exact ROCE methodology and use it consistently.

Do not mix formulas across periods without explanation.

## Debt-to-EBITDA

Debt / EBITDA

Interpret differently for cyclical businesses and financial institutions.

## Interest Coverage

Operating Profit or EBIT / Interest Expense

The exact formula used must be documented.

## Working Capital

Analyse:

- receivables
- inventory
- payables
- operating working capital
- working-capital days

## Financial Institutions

Do not blindly apply manufacturing metrics to banks/NBFCs/insurers.

Use sector-specific metrics.

Examples:

Banks:

- ROA
- ROE
- NIM
- GNPA
- NNPA
- credit cost
- CASA
- capital adequacy

NBFCs:

- AUM growth
- ROA
- ROE
- credit cost
- asset quality
- leverage

## Calculation Rules

All production calculations must be deterministic.

Never let an LLM perform critical arithmetic.

## Data Integrity

Every metric should retain:

- value
- unit
- period
- source
- calculation methodology
- confidence