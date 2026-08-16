# Indian Equity Research Intelligence Platform — Technical Architecture & Implementation Plan

## Executive Summary

We are building a production-grade Indian Equity Research Intelligence Platform designed for Indian equities. The platform enables institutional-grade equity research by ingesting annual reports, financial statements, MD&A, concall transcripts, investor presentations, Screener screenshots, and technical charts, normalizing financial data, executing deterministic financial & forensic calculations, evaluating management credibility, computing sector-specific valuations, evaluating technical market structure, and generating evidence-backed investment reports with full provenance.

---

## Architectural Review & Compliance Matrix

| # | Requirement | Architectural Specification & Standards |
|---|---|---|
| 1 | **Case-Study Provenance** | All preloaded case-study datasets (fixtures) must strictly map every single metric to official audited annual reports / filings with period, page number, table reference, and document hash. Zero AI-generated figures. |
| 2 | **OCR Confidence Thresholds & Fallback** | Consistent 3-tier threshold across Ingestion, Review, and Data Quality Gate:<br>• **High**: `>90%`<br>• **Medium**: `80% – 90%`<br>• **Low**: `<80%` (Mandatory human-in-the-loop verification trigger in Extraction Review). |
| 3 | **Sector Limitations for Forensic Models** | Configurable registry-driven constraints. Forensic checks (Beneish M-Score, Altman Z-Score, Working Capital Days, Cash Conversion Cycle) only run for applicable non-financial sectors. Banking, NBFC, Insurance, REITs/InvITs route to sector-specific models (GNPA/NNPA, PCR, NIM, CASA, CRAR, Cost-to-Income). |
| 4 | **Valuation Inputs & Assumption Exposure** | **Zero hardcoded market inputs**. All inputs (e.g. Risk-Free Rate, Equity Risk Premium, Beta) must store `value`, `date`, `source`, and `retrieval_timestamp`. Historical valuations use inputs appropriate to the valuation date. Full exposure of formulas, WACC, terminal growth, scenario multiples, sensitivity matrix, and margin of safety. |
| 5 | **Expanded News Intelligence Taxonomy** | Strict schema segregation from audited financials. Includes 27+ extensible event categories with `source_name`, `url_or_citation`, `published_at`, `materiality_score` (1–5), `sentiment`, and `verification_status`. |
| 6 | **Mandatory Data Quality Gate (Phase 13.5)** | Formal gate evaluating `ResearchCompleteness`, `UnresolvedContradictions`, and `DataConfidence`. If critical evidence is missing, report status is marked `"Preliminary / Data-Constrained"` and `InvestmentConviction` is left **Unavailable (null)** rather than manufactured. |
| 7 | **Decoupled Confidence & Conviction** | Strict separation of `ResearchCompleteness` (0–100%), `DataConfidence` (`HIGH` / `MEDIUM` / `LOW` / `DEGRADED`), and `InvestmentConviction` (1–10 or `null`). Conviction is never fabricated on incomplete data. |
| 8 | **Thesis Breakers Model** | Every investment verdict incorporates measurable conditions (`condition`, `metric`, `threshold`, `current_value`, `severity`, `monitoring_frequency`, `consequence`, `supporting_evidence`) that invalidate the thesis. |
| 9 | **Extensible SectorTaxonomy Abstraction** | Decoupled domain taxonomy engine specifying `sector`, `subsector`, `business_model`, `applicable_metrics`, `applicable_forensic_models`, and `applicable_valuation_models` across 30+ Indian industry verticals without UI hardcoding. |
| 10 | **20-Phase Roadmap Integrity** | The 20-phase structure in `Phases.md` remains strictly preserved with Phase 13.5 Data Quality Gate as a mandatory checkpoint. |

---

## Detailed Domain Models & Core Schemas

### 1. Document Ingestion & OCR Confidence Model
```typescript
export type OCRConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export function classifyOCRConfidence(score: number): OCRConfidenceLevel {
  if (score > 0.90) return 'HIGH';
  if (score >= 0.80) return 'MEDIUM';
  return 'LOW'; // < 0.80: Mandatory human-in-the-loop review trigger
}
```

### 2. Traceable Valuation Market Inputs Model
```typescript
export interface DatedMarketInput {
  metric_name: 'RISK_FREE_RATE' | 'EQUITY_RISK_PREMIUM' | 'SECTOR_BETA' | 'SOVEREIGN_10Y_YIELD' | 'INFLATION_EXPECTATION';
  value: number; // e.g., 0.0712
  unit: 'PERCENTAGE' | 'DECIMAL' | 'MULTIPLE';
  as_of_date: string; // YYYY-MM-DD
  source: string; // e.g. "RBI Sovereign Yield Curve", "CCIL", "NSE Indices"
  retrieval_timestamp: string; // ISO 8601
  notes?: string;
}

export interface ValuationModelAssumptions {
  valuation_method: 'DCF' | 'SOTP' | 'PE_RELATIVE' | 'EV_EBITDA_RELATIVE' | 'PB_ROE_REGRESSION' | 'NAV';
  risk_free_rate_input: DatedMarketInput;
  equity_risk_premium_input: DatedMarketInput;
  beta_input: DatedMarketInput;
  cost_of_equity: number;
  wacc?: number;
  terminal_growth_rate: number;
  explicit_forecast_years: number;
  target_multiple?: number;
  scenario: 'BULL' | 'BASE' | 'BEAR';
  probability_weight: number;
  fair_value: number;
  current_market_price: number;
  margin_of_safety_pct: number; // (fair_value - current_price) / fair_value * 100
  sensitivity_matrix: {
    discount_rates: number[];
    terminal_growth_rates: number[];
    fair_value_grid: number[][];
  };
}
```

### 3. Extensible News Intelligence Schema (27+ Categories)
```typescript
export type NewsEventCategory =
  | 'EARNINGS'
  | 'REGULATORY'
  | 'CAPEX'
  | 'CONTRACT_WIN'
  | 'ORDER_BOOK'
  | 'ORDER_CANCELLED'
  | 'MANAGEMENT_CHANGE'
  | 'ACQUISITION'
  | 'DIVESTMENT'
  | 'JOINT_VENTURE'
  | 'FUND_RAISE'
  | 'DEBT'
  | 'DELEVERAGING'
  | 'PROMOTER_ACTIVITY'
  | 'SHAREHOLDING'
  | 'PLEDGE'
  | 'BUYBACK'
  | 'DIVIDEND'
  | 'CAPACITY_EXPANSION'
  | 'PRODUCT_LAUNCH'
  | 'GUIDANCE'
  | 'LEGAL'
  | 'AUDITOR'
  | 'RATING_CHANGE'
  | 'GOVERNANCE'
  | 'INDUSTRY'
  | 'MACRO'
  | (string & {}); // Extensible union

export interface NewsIntelligenceItem {
  id: string;
  headline: string;
  source_name: string;
  url_or_citation: string;
  published_at: string; // ISO 8601
  event_category: NewsEventCategory;
  materiality_score: 1 | 2 | 3 | 4 | 5;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  verification_status: 'VERIFIED_OFFICIAL' | 'VERIFIED_REPUTABLE_MEDIA' | 'UNVERIFIED';
  impact_summary: string;
  affected_thesis_pillar: string;
}
```

### 4. Configurable Sector Taxonomy Abstraction
```typescript
export interface SectorTaxonomyDefinition {
  sector: string;
  subsector: string;
  business_model: 'NON_FINANCIAL_OPERATING' | 'BANKING' | 'NBFC' | 'INSURANCE' | 'REAL_ESTATE_TRUST' | 'PROJECT_INFRA' | 'UTILITY';
  applicable_metrics: string[];
  applicable_forensic_models: Array<'BENEISH_M_SCORE' | 'ALTMAN_Z_SCORE' | 'WORKING_CAPITAL_CYCLE' | 'CFO_PAT_DIVERGENCE' | 'NPA_PCR_QUALITY' | 'REST_ASSET_MONITOR' | 'RELATED_PARTY_LENDING'>;
  applicable_valuation_models: Array<'DCF' | 'EV_EBITDA' | 'PE' | 'PB_ABV' | 'FCF_YIELD' | 'NAV' | 'EMBEDDED_VALUE' | 'DIVIDEND_DISCOUNT'>;
}

// Registry supporting 30+ Indian sectors: Banking, NBFC, Insurance, IT Services, Pharma, Healthcare, FMCG,
// Consumer Durables, Automobile, Auto Ancillaries, Capital Goods, Infrastructure, Power, Renewables, Telecom,
// Chemicals, Metals, Mining, Oil & Gas, Real Estate, REIT, InvIT, Defence, Railways, Logistics, Aviation, Media,
// Specialty Manufacturing, Financial Services, Diversified.
```

### 5. Thesis Breaker Model
```typescript
export interface ThesisBreaker {
  id: string;
  condition: string; // e.g. "Operating EBITDA margin falls below 14.5% for 2 consecutive quarters"
  metric: string; // e.g. "EBITDA_MARGIN"
  threshold: string; // e.g. "< 14.50%"
  current_value: string; // e.g. "17.80%"
  severity: 'HIGH' | 'CRITICAL';
  monitoring_frequency: 'QUARTERLY' | 'MONTHLY' | 'ANNUAL' | 'EVENT_DRIVEN';
  consequence: string; // e.g. "Invalidates structural operating leverage thesis; triggers rating downgrade to AVOID."
  supporting_evidence: string[]; // references to source fact IDs or calculations
}
```

### 6. Decoupled Data Quality Gate & Verdict Status
```typescript
export interface ResearchDataQualityAudit {
  research_completeness_pct: number; // 0 to 100%
  data_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  unresolved_contradictions_count: number;
  low_confidence_facts_count: number;
  gate_status: 'PASSED' | 'DEGRADED' | 'BLOCKED';
  missing_mandatory_metrics: string[];
}

export interface InvestmentVerdictReport {
  verdict: 'BUY' | 'HOLD' | 'AVOID' | 'DATA_CONSTRAINED_NO_VERDICT';
  investment_conviction: number | null; // 1 to 10 score, or NULL if data-constrained
  research_completeness: number; // 0 to 100%
  data_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'DEGRADED';
  is_preliminary: boolean;
  one_line_thesis: string;
  outlook_1y: string;
  outlook_5y_plus: string;
  thesis_breakers: ThesisBreaker[];
  valuation_conditions_for_attractiveness: string;
  data_quality_report: ResearchDataQualityAudit;
}
```

---

## 20-Phase Implementation Roadmap

- **Phase 0**: Repository Intelligence & Architecture Baseline (Complete)
- **Phase 1**: Application Shell, Routing & High-Density Terminal Design System
- **Phase 2**: Research Project Creation, Company Entity & Sector Taxonomy Registry Setup
- **Phase 3**: Multi-Format Document Ingestion (PDF & Canvas OCR) with Consistent Confidence Thresholds (>90%, 80-90%, <80%)
- **Phase 4**: Evidence Extraction, Schema Normalization & Contradiction Engine
- **Phase 5**: Deterministic Financial Calculation Engine (YoY, Margins, Ratios, Cash Flow)
- **Phase 6**: Fundamental Quality & DuPont Decomposition Engine
- **Phase 7**: Sector-Gated Forensic Accounting & Red-Flag Engine (Beneish/Altman/NPA)
- **Phase 8**: Management DNA, Guidance vs Execution & Linguistic Shift Engine
- **Phase 9**: Sector-Aware Valuation Engine with Traceable Dated Market Inputs & Sensitivity Matrices
- **Phase 10**: Technical Structure, Trend & Support/Resistance Engine
- **Phase 11**: Sourced & Dated News Intelligence Engine (27+ Expanded Categories)
- **Phase 12**: Impact-Ranked Catalysts & Multi-Dimensional Risk Matrix
- **Phase 13**: Scenario Modeling Engine (Bull / Base / Bear with explicit drivers)
- **Phase 13.5**: Mandatory Data Quality Gate (Completeness & Decoupled Confidence Check)
- **Phase 14**: Institutional Investment Verdict Engine (BUY/HOLD/AVOID, Thesis Breakers, Decoupled Conviction)
- **Phase 15**: Interactive Evidence Explorer & Source Auditability Layer
- **Phase 16**: Full QA Test Suite (Unit, Integration, Component, Regression)
- **Phase 17**: Performance & Stress Testing (Large documents, low-confidence OCR)
- **Phase 18**: Production-Grade Reliability, Error Boundaries & Logging
- **Phase 19**: Hostile Audit (Anti-Hallucination, Sector Mismatch, Stress Verification)
- **Phase 20**: Final Verification, Deployment Build & Production Sign-off

---

## Verification Plan

### Automated Verification
1. `npm.cmd test` — 100% deterministic unit tests for financial math, DuPont calculations, forensic rules, sector gate validators, contradiction diffing, and thesis-breaker triggers.
2. `npm.cmd run typecheck` — TypeScript strict type checks.
3. `npm.cmd run lint` — ESLint verification.
4. `npm.cmd run build` — Production bundle build.

### Browser & Workflow Verification
- Automated Browser Subagent testing end-to-end user journeys:
  - Project creation with sector routing.
  - Multi-document upload & extraction review with OCR confidence warnings on <80% confidence.
  - Verification of Data Quality Gate decoupling data confidence from conviction score.
  - Thesis-breakers table inspection.
  - Complete 15-module research report drill-down into Evidence Explorer.
