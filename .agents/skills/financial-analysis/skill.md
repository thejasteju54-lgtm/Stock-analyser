---
name: financial-extraction
description: Extract and normalize financial information from annual reports, financial statements, investor presentations, screenshots and other company documents while preserving provenance and uncertainty.
---

# Financial Extraction Skill

## Objective

Extract structured financial evidence without inventing information.

## Workflow

1. Identify document type.
2. Identify reporting period.
3. Identify consolidated vs standalone statements.
4. Identify units.
5. Extract relevant tables.
6. Normalize values.
7. Validate arithmetic where possible.
8. Attach provenance.
9. Assign confidence.
10. Detect contradictions.

## Mandatory Metrics

When available:

Revenue
EBITDA
EBIT
PAT
EPS
CFO
Capex
FCF
Cash
Debt
Net debt
Interest expense
Receivables
Inventory
Payables
ROE
ROCE
Working capital
Share capital
Diluted shares
Promoter holding
Promoter pledge

## Provenance

Every metric should retain:

document
page
section
table
period
unit
source text if useful
confidence

## Validation

Check:

- units
- decimal errors
- crore/lakh/million conversions
- consolidated/standalone mismatch
- annual/quarterly mismatch
- restated figures
- discontinued operations

## Missing Information

Never estimate a missing figure unless the calculation is mathematically justified and clearly labelled as calculated.

## OCR

OCR output is not automatically trusted.

Visually verify important financial values when possible.

## Final Rule

If uncertain, preserve uncertainty rather than invent precision.