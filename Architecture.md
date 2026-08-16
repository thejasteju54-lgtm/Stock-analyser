# Architecture.md — System Architecture

## Architectural Principle

Build a modular monolith first.

Do not introduce microservices unless there is a demonstrated need.

The system should separate:

1. UI
2. ingestion
3. extraction
4. structured financial data
5. research
6. calculations
7. analysis
8. report generation
9. verification

## Logical Architecture

```text
User
  ↓
Web Application
  ↓
Upload / Company Input
  ↓
Document Ingestion Pipeline
  ↓
Document Classification
  ↓
OCR / PDF / Image Extraction
  ↓
Evidence Store
  ↓
Financial Data Normalization
  ↓
Research Engines
  ├── Fundamental Engine
  ├── Forensic Engine
  ├── Management Engine
  ├── Industry Engine
  ├── Valuation Engine
  ├── Technical Engine
  ├── News Engine
  └── Risk/Catalyst Engine
  ↓
Cross-Validation Layer
  ↓
Scenario Engine
  ↓
Investment Verdict Engine
  ↓
Explainable Research Report
```

## Data Model

At minimum define entities for:

- Company
- ResearchProject
- Document
- DocumentPage
- ExtractedFact
- FinancialMetric
- FinancialPeriod
- ManagementStatement
- ManagementPromise
- ManagementOutcome
- ShareholdingRecord
- ValuationMetric
- TechnicalObservation
- NewsItem
- Catalyst
- Risk
- Scenario
- AnalysisClaim
- SourceCitation
- ResearchReport

## Evidence Model

Every extracted fact should support:

```text
id
company_id
metric
value
unit
period
source_document_id
source_page
source_section
extraction_method
confidence
verification_status
created_at
```

## Claim Model

Analytical claims should support:

```text
claim
claim_type
supporting_fact_ids
calculation_ids
source_ids
confidence
analyst_interpretation
```

The system should never generate a material claim without evidence or an explicit assumption.

## Calculation Engine

Financial calculations must be deterministic.

LLMs should not perform critical arithmetic when deterministic code can do it.

Examples:

Revenue growth
EBITDA margin
PAT margin
CFO/PAT
FCF
ROCE
ROE
Debt/EBITDA
Interest coverage
Working-capital days
FCF yield
P/E
EV/EBITDA

The LLM can interpret calculations but should not replace the calculation engine.

## Research Engine

The research engine should combine:

- uploaded documents
- structured extracted facts
- verified external information
- deterministic calculations

Do not send the entire repository or entire documents into every model call.

Retrieve only relevant evidence.

## Retrieval

Use retrieval based on:

- company
- document
- period
- topic
- metric
- section
- page

Prioritize source-specific retrieval over generic semantic retrieval when exact financial facts are requested.

## Contradiction Detection

The system must detect conflicting values or statements.

Example:

Annual report revenue ≠ extracted screenshot revenue

Do not automatically choose one.

Display the conflict and identify likely source hierarchy.

## Source Hierarchy

When conflicting:

1. Audited financial statements
2. Annual report
3. Official investor presentation
4. Official company filing
5. Official earnings/concall transcript
6. Reputable financial data provider
7. Secondary media
8. User-provided unsourced information

The hierarchy may vary depending on the claim.

## External Research

Current information should be stored separately from historical document evidence.

Never silently mix current data into historical financial statements.

## UI Architecture

Primary screens:

1. Dashboard
2. New Research
3. Document Upload
4. Extraction Review
5. Financial Health
6. Forensic Analysis
7. Management DNA
8. Valuation
9. Technical Structure
10. Industry & Trends
11. News & Catalysts
12. Risks
13. Scenario Analysis
14. Final Verdict
15. Evidence Explorer

## Error Handling

Every external or AI-dependent operation must support:

- loading
- success
- partial success
- failure
- retry
- unavailable data

Never show fabricated fallback values.

## Testing Architecture

Unit tests:

- financial calculations
- parsers
- validation
- scoring

Integration tests:

- ingestion pipeline
- extraction pipeline
- database
- research pipeline

End-to-end tests:

- upload
- analysis
- report
- evidence inspection

Browser tests:

- navigation
- responsive layout
- upload workflow
- report interaction
- error states

## Performance

Do not process everything synchronously in a single request.

Long-running analysis should have a job/progress model when necessary.

UI should show meaningful progress stages rather than an indeterminate spinner.

## Security

Uploaded documents must be treated as untrusted input.

Never execute uploaded files.

Validate file types and sizes.

Protect secrets.

Do not expose private documents through public URLs.

## Maintainability

Business logic must not live inside UI components.

Use dedicated services/modules for:

- ingestion
- extraction
- financial calculations
- research
- scoring
- report generation