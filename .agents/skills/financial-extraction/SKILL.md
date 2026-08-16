---
name: financial-extraction
description: Extract, normalize, validate, and preserve provenance for financial data from annual reports, financial statements, investor presentations, screenshots, and other company documents.
---

# Financial Extraction Skill

## Purpose

Extract reliable structured financial evidence from company documents.

This skill is responsible for EXTRACTION, not investment interpretation.

## Responsibilities

Extract where available:

- Revenue
- EBITDA
- EBIT
- PAT
- EPS
- CFO
- Capital expenditure
- FCF
- Cash
- Debt
- Net debt
- Interest expense
- Receivables
- Inventory
- Payables
- Working capital
- ROE
- ROCE
- Margins
- Shares outstanding
- Promoter holding
- Promoter pledge
- Segment information
- Operating metrics

## Document Verification

Before extracting values determine:

- Company
- Reporting period
- Financial year
- Quarter if applicable
- Consolidated or standalone
- Currency
- Unit
- Restated or original figures
- Continuing or discontinued operations

## Extraction Process

1. Identify relevant page/section.
2. Identify table heading.
3. Identify metric.
4. Identify period.
5. Identify unit.
6. Extract value.
7. Validate surrounding context.
8. Record provenance.
9. Assign confidence.
10. Detect contradictions.

## Provenance

Every extracted financial fact should retain:

- Metric
- Value
- Unit
- Period
- Company
- Document
- Page
- Section
- Table
- Extraction method
- Confidence
- Verification status

## OCR

OCR output must be treated as potentially unreliable.

For important values:

- inspect surrounding text
- verify units
- verify decimal placement
- verify period
- cross-check against another source where possible

Never silently correct OCR.

If a value is uncertain, mark it as uncertain.

## Screenshots

When extracting from screenshots:

- never invent unreadable digits
- never infer missing values
- preserve visible precision
- identify the source if visible
- identify the date if visible
- distinguish screenshot-derived data from primary-source data

## Unit Handling

Be extremely careful with:

- ₹
- ₹ lakh
- ₹ crore
- ₹ million
- ₹ billion
- %
- per-share values

Normalize internally only after recording the original unit.

## Consolidated vs Standalone

Never combine:

- standalone revenue with consolidated PAT
- standalone debt with consolidated cash
- different accounting bases

unless explicitly required and clearly labelled.

## Period Handling

Never compare incompatible periods.

Check:

- FY vs FY
- quarter vs quarter
- trailing twelve months
- calendar year vs financial year

## Calculated Values

If a value is mathematically derived from extracted data:

mark it as:

CALCULATED

and preserve the source values used.

Example:

Revenue Growth =
(Current Revenue - Previous Revenue) / Previous Revenue

Do not present calculated values as directly reported values.

## Missing Data

If a required value cannot be reliably extracted:

return:

DATA UNAVAILABLE

Do not estimate it.

## Contradictions

If two sources provide different values:

do not overwrite either value.

Record:

- Source A
- Value A
- Source B
- Value B
- Difference
- Possible explanation
- Resolution status

## Output

The extraction layer should produce structured evidence.

It should NOT produce:

- Buy/Hold/Avoid
- investment recommendations
- valuation opinions
- management opinions
- forecasts

Those belong to later analytical skills.

## Quality Standard

Extraction is complete only when:

- values are traceable
- units are correct
- periods are correct
- accounting basis is correct
- important values are validated
- uncertainty is explicitly represented
- contradictions are preserved

## Core Principle

Extract first.

Validate second.

Analyse later.

Never allow analytical assumptions to contaminate the underlying financial evidence.