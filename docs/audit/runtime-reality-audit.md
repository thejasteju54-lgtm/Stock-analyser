# STOCK ANALYZER — FOUNDATION & RUNTIME REALITY AUDIT REPORT

**Project:** Indian Equity Research Intelligence Platform (`company-research-ai` / `Stock-analyser`)  
**Audit Type:** Complete Forensic System & Runtime Reality Audit  
**Authoritative Baselines:** `AGENTS.md`, `PRD.md`, `Architecture.md`, `Rules.md`, `Design.md`, `Phases.md`, `Memory.md`, `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`  
**Date:** 2026-08-23  
**Audit Classification:** **`D — Fundamental Rebuild Required`**

---

## 1. Executive Summary

A deep forensic inspection of the codebase and runtime execution was conducted to determine why the application produces fixed values, repeated numbers across different companies, random-looking technicals, fake news, and static rankings.

### Core Findings:
1. **Zero Real Network / External Data Connectivity:** There is **not a single HTTP `fetch()`, `axios`, or WebSocket network call** anywhere in the codebase to an external API. All data source adapters (`FinancialDataAdapter.ts`, `MarketDataAdapter.ts`, `NewsDataAdapter.ts`, `IndustryDataAdapter.ts`, `ShareholdingDataAdapter.ts`, `ExchangeFilingAdapter.ts`, `ScreenerAdapter.ts`, `MoneycontrolAdapter.ts`, `OfficialExchangeAdapter.ts`, `TickertapeAdapter.ts`) return hardcoded in-memory mock datasets wrapped in simulated latency timers.
2. **Hardcoded Financial Statements Injected Universally:** `FinancialFactExtractor.ts` (Phase 4) contains a hardcoded P&L, balance sheet, and cash flow statement belonging to **Tata Motors Limited** (`valFY23: 345967, valFY24: 437928, unit: 'INR_CRORE'`, Commercial Vehicles, Passenger Vehicles, and Jaguar Land Rover segments). When a user uploads ANY document for ANY company (e.g. BEL, TCS, Reliance, Sun Pharma, HDFC Bank), the extraction engine injects Tata Motors' financial figures.
3. **Manufactured Corporate News Wire:** `NewsDiscoveryAdapter.ts` and `MoneycontrolAdapter.ts` hardcode headlines about an *“Indian Army ₹1,150 Cr Radar Procurement Order”* and an *“₹800 Cr Next-Gen Defence Electronics Testing Facility”*. When searching or analyzing **TCS, Sun Pharma, Reliance, or HDFC Bank**, the news feed displays that these non-defence companies have won Indian Army defence radar contracts.
4. **Synthetic Mathematical Price Generation:** `TechnicalAnalysisView.tsx` creates OHLCV price history on-the-fly using `Math.sin() + Math.cos() + Math.random()` centered around a fixed `basePrice = 1000.0` or `980.5`, violating Rule 11 of `Rules.md`.
5. **Universal Automotive Peer & History Hardcoding:** `SectorValuationView.tsx` passes hardcoded auto peers (`M&M, MARUTI, ASHOKLEY`) and Tata Motors' historical price points (`₹70 in FY20, ₹300 in FY21, ₹430 in FY22, ₹420 in FY23, ₹630 in H1FY24, ₹980 in FY24`) into `SectorValuationEngine` regardless of the sector or company selected.
6. **Total Absence of AI / LLM Engine:** There is **no AI/LLM SDK** (`@google/genai`, `openai`, `anthropic`, `langchain`) installed in `package.json` or imported anywhere in `src/`. No prompt construction or LLM inference takes place; research claims and thesis points are synthesized via deterministic rule-based string templates.
7. **Phantom Document Processing:** No PDF parsing library (`pdfjs-dist`, `pdf-parse`) or OCR engine (`tesseract.js`) is installed. Ingested PDFs generate two fake dummy text pages: `[Machine Text Page 1] Audited Financial Statements for <filename>`.
8. **Compromised Testing & Governance Loop:** 336 test files (1,221 tests) pass 100% because test suites were written to assert against the deterministic mock data, creating an illusion of 100% verified production readiness (`Memory.md` claims Phase 20 SHIP complete) while the system has zero live functionality.

---

## 2. Governance Audit

| Governance Requirement | Authoritative Source | Target Standard | Actual Implementation Reality | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Rule 1: No Fabricated Data** | `Rules.md`, `anti-hallucination.md` | Never invent financial figures, stock prices, market cap, news, management claims. | `FinancialFactExtractor.ts` injects Tata Motors P&L into all uploads; `MarketDataAdapter.ts` injects ₹980.5 price; `NewsDiscoveryAdapter.ts` invents radar news. | **CRITICAL BREACH** |
| **Rule 4: LLMs Do Not Own Arithmetic** | `Rules.md`, `Architecture.md` | Deterministic code for financial calculations. | `FinancialCalculationEngine.ts` implements exact arithmetic formulas. | **IMPLEMENTED** (Fed mock inputs) |
| **Rule 10: Sector-Aware Valuation** | `Rules.md`, `PRD.md` | Tailored valuation models per sector without fake peers. | `SectorValuationView.tsx` passes hardcoded auto peers (`M&M`, `MARUTI`, `ASHOKLEY`) to all sectors (IT, Pharma, Banking). | **CRITICAL BREACH** |
| **Rule 11: Data-Based Technicals** | `Rules.md`, `Design.md` | Never invent price levels or indicators. | `TechnicalAnalysisView.tsx` calculates candles using `Math.sin()` and `Math.random()`. | **CRITICAL BREACH** |
| **Rule 12: Current News Must Be Current** | `Rules.md`, `PRD.md` | Sourced, dated, verified real-world events. | Adapters output static fake headlines with interpolated symbols. | **CRITICAL BREACH** |
| **Rule 19: Test Before Completion** | `Rules.md`, `testing.md` | No "done" without real verification. | 336 tests pass by asserting against mock constants. | **BYPASSED** |
| **Rule 22: Update Memory** | `Rules.md`, `AGENTS.md` | Truthful state tracking. | `Memory.md` falsely claims 0 defects, ESLint clean (ESLint not even installed), and Phase 20 SHIP. | **COMPROMISED** |
| **Operating Principle 12: No Fake Completeness** | `AGENTS.md` | Feature is incomplete if data is hardcoded or mocked in prod. | Entire ingestion, live data, news, and AI stack is mocked. | **CRITICAL BREACH** |

---

## 3. Architecture Audit

### 3.1 Logical Architecture vs Reality
- **Intended:** `User Upload -> PDF.js/OCR Ingestion -> LLM/Rule Extraction -> Normalization -> Deterministic Engines -> Explainable Report`.
- **Actual Runtime:**
  ```text
  User Input (e.g. TCS)
    ↓
  CompanyResolutionEngine (Fallback -> 'Capital Goods' / 'Heavy Electrical Equipment')
    ↓
  Document Ingestion (Creates dummy strings: "[Machine Text Page 1]")
    ↓
  FinancialFactExtractor (Hardcoded Tata Motors FY23/FY24 facts injected)
    ↓
  FinancialCalculationEngine (Calculates margins/ratios on Tata Motors numbers)
    ↓
  SectorValuationView (Injects M&M, Maruti, Ashok Leyland peers & Tata Motors prices)
    ↓
  NewsDiscoveryAdapter (Injects Indian Army Radar Contract wire news)
    ↓
  TechnicalAnalysisView (Generates Math.sin + Math.random candles around 1000.0)
    ↓
  VerdictMasterEngine (Deterministic decision tree evaluates mocked state)
    ↓
  Report & UI (Displays Tata Motors numbers with "TCS" header)
  ```

### 3.2 Frontend & Dependencies Audit (`package.json`)
- **Installed Dependencies:** `clsx`, `lucide-react`, `react@19`, `react-dom@19`.
- **Missing Core Dependencies:**
  - No PDF Parser (`pdfjs-dist` or `pdf-parse`)
  - No OCR Engine (`tesseract.js`)
  - No Charting Library (`lightweight-charts` / `recharts` / `chart.js`)
  - No HTTP Client (`axios` / modern fetch wrapper)
  - No AI/LLM SDK (`@google/genai`, `@anthropic-ai/sdk`, `openai`)
  - No Linter (`eslint` is missing; `npm run lint` is mapped to `tsc --noEmit`)

---

## 4. Phase 0–20 Detailed Audit

| Phase | Description & Requirement | Expected Implementation | Actual Implementation | Actual Runtime Behavior | Test Status | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | Repository Intelligence & Governance | Active rules, skills, workflows, MCP config. | Documentation exists; `document-ingestion/SKILL.md` is 0 bytes; `.agents/mcp_config.json` missing. | Governance rules are bypassed by production mock code. | N/A | **PARTIALLY_IMPLEMENTED** |
| **1** | Application Foundation & Shell | React terminal shell, dark theme, navigation, error boundary. | `App.tsx`, `SideNav.tsx`, `TopBar.tsx`, `index.css`. | Boots and renders high-density financial terminal layout. | 15+ tests pass | **IMPLEMENTED** |
| **2** | Research Project Creation | Company search, symbol resolution, duplicate prevention. | `NewProjectModal.tsx`, `CompanyResolutionEngine.ts`. | Resolves BEL/Tata Motors via hardcoded switch; all other companies fall back to 'Capital Goods' dummy entity. | 12 tests pass | **PARTIALLY_IMPLEMENTED** |
| **3** | Document Ingestion Pipeline | Multi-format PDF parsing, image ingestion, OCR. | `DocumentIngestionEngine.ts`, `OcrProcessor.ts`. | Does not parse binary PDF bytes or run OCR; creates 2 synthetic dummy pages. | 22 tests pass | **MOCKED** |
| **4** | Evidence Extraction Review | Fact extraction, 2-year model, unit normalization, provenance. | `FinancialFactExtractor.ts`, `UnitNormalizer.ts`. | Injects hardcoded Tata Motors P&L, balance sheet, and executive quotes into any document. | 18 tests pass | **MOCKED / BROKEN** |
| **5** | Financial Calculation Engine | Deterministic calculations (growth, margins, DuPont, FCF, ROCE). | `FinancialCalculationEngine.ts`, `DuPontDecompositionEngine.ts`. | Deterministic arithmetic functions execute perfectly on whatever input is provided. | 35 tests pass | **IMPLEMENTED** |
| **6** | Fundamental Health Engine | 7-category health scoring, sector-gated weights, red flags. | `FundamentalHealthEngine.ts`, `HealthScoringPolicyRegistry.ts`. | Gated multi-category scoring algorithm executes deterministically. | 28 tests pass | **IMPLEMENTED** |
| **7** | Forensic Accounting Engine | Beneish M-Score, Altman Z-Score, cash divergence, auditor checks. | `ForensicAccountingEngine.ts`, `BeneishMScoreEngine.ts`. | Forensic formulas execute deterministically on input facts. | 24 tests pass | **IMPLEMENTED** |
| **8** | Management DNA Engine | Promise vs outcome tracking, linguistic analysis, governance. | `ManagementDnaEngine.ts`, `PromiseOutcomeTracker.ts`. | Evaluates promises against outcomes; input statements are hardcoded Tata Motors quotes. | 20 tests pass | **MOCKED ENFORCEMENT** |
| **9** | Sector-Aware Valuation Models | Sector DCF, DDM, NAV, peer multiples, historical bands. | `SectorValuationEngine.ts`, `SectorValuationView.tsx`. | Domain engine is functional; UI passes hardcoded auto peers (`M&M, MARUTI, ASHOKLEY`) and Tata Motors prices to all stocks. | 26 tests pass | **MOCKED (UI LAYER)** |
| **10** | Technical Structure Engine | Chart patterns, support/resistance, momentum, moving averages. | `TechnicalAnalysisEngine.ts`, `TechnicalAnalysisView.tsx`. | `TechnicalAnalysisView.tsx` generates candles using `Math.sin() + Math.cos() + Math.random()`. | 18 tests pass | **MOCKED (RUNTIME)** |
| **11** | News Intelligence & Industry | Deduplication, corporate filings, macro overlay, Porter's 5 forces. | `NewsIntelligenceEngine.ts`, `NewsDiscoveryAdapter.ts`. | Displays fake Indian Army Radar order news and hardcoded automobile industry data across all stocks. | 22 tests pass | **MOCKED** |
| **12** | Catalysts & Multi-Dimensional Risks | 5x5 PxI risk matrix, operational catalysts, thesis breakers. | `CatalystRiskMasterEngine.ts`, `RiskScoringEngine.ts`. | Synthesizes risks/catalysts based on upstream phase outputs. | 16 tests pass | **IMPLEMENTED** |
| **13** | Scenario Modeling Engine | Bull/Base/Bear projections, probabilistic bridges, sensitivity. | `ScenarioMasterEngine.ts`, `ProbabilisticBridgeEngine.ts`. | Deterministic scenario math runs and projects 3 cases. | 18 tests pass | **IMPLEMENTED** |
| **14** | Investment Verdict Engine | BUY/HOLD/AVOID verdict, conviction /10, thesis breakers. | `VerdictMasterEngine.ts`, `InvestmentDecisionPolicyRegistry.ts`. | Gated synthesis tree generates explainable decision and audit trail. | 25 tests pass | **IMPLEMENTED** |
| **15** | Production Workspace & Delivery | 22-section institutional report, immutable snapshots, export. | `ResearchWorkspaceView.tsx`, `InvestmentResearchReportEngine.ts`. | Renders comprehensive institutional report and snapshot ledger. | 20 tests pass | **IMPLEMENTED** |
| **16** | Live & Replay Data Integration | Real-time and EOD data feeds (NSE, BSE, MCA, MOSPI). | `FinancialDataAdapter.ts`, `MarketDataAdapter.ts`, etc. | All 6 adapters are pure mocks returning static prices (980.5) and archetype constants. Zero HTTP calls. | 35 tests pass | **MOCKED** |
| **17** | Reliability Engineering | Bounded memory, backpressure queues, circuit breakers, retry. | `BackpressureQueueManager.ts`, `CircuitBreakerManager.ts`. | In-memory queues and circuit breaker state machines work. | 25 tests pass | **IMPLEMENTED** |
| **18** | Security Hardening & RBAC | RBAC authorization, security headers, secret scanner, firewall. | `RbacAuthorizationEngine.ts`, `PromptInjectionFirewall.ts`. | In-memory validators, regex firewalls, and header configs exist. | 20 tests pass | **IMPLEMENTED** |
| **19** | Hostile Audit & Verification | Hostile test suites testing edge cases, corruption, conflicts. | `tests/hostile_audit/*` (30 test suites). | Hostile tests test mock contract boundaries rather than real data integrity. | 30 tests pass | **PARTIALLY_IMPLEMENTED** |
| **20** | Production Ship & Release Certification | Release certification, clean build, clean git. | `Memory.md`, `package.json`, release smoke tests. | `Memory.md` certifies SHIP based on self-referential mock tests while platform lacks real data. | 6 tests pass | **BROKEN / FALSE COMPLETION** |

---

## 5. Data Source Audit

| Claimed Data Source | Claimed Adapter File | Authentication Mechanism | Retrieval Mechanism | Actual Response Origin | Persistence | Consumer | Reality Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NSE Official Market Feed** | `MarketDataAdapter.ts` | None | Hardcoded In-Memory Object | Static mock: `price: 980.5, volume: 4520000, vwap: 981.2` | `DataSourceCache` (In-Memory) | `VerdictMasterEngine`, `SectorValuationView` | **SIMULATED / FAKE** |
| **MCA XBRL Financials** | `FinancialDataAdapter.ts` | None | Hardcoded Sector Switch | Static mock: 3 archetypes (`BANKING`, `IT_SERVICES`, `INDUSTRIAL`) | `DataSourceCache` (In-Memory) | Research Pipeline | **SIMULATED / FAKE** |
| **BSE Shareholding Disclosures** | `ShareholdingDataAdapter.ts` | None | Hardcoded In-Memory Object | Static mock: `promoterHolding: 46.36%, pledge: 0.0%` | `DataSourceCache` (In-Memory) | `ForensicAccountingEngine` | **SIMULATED / FAKE** |
| **MOSPI Industry Statistics** | `IndustryDataAdapter.ts` | None | Hardcoded In-Memory Object | Static mock: `Automobile and Ancillaries / 8.4% CAGR` | `DataSourceCache` (In-Memory) | `IndustryAnalysisEngine` | **SIMULATED / FAKE** |
| **PTI News Wire Feed** | `NewsDataAdapter.ts` | None | Template String Interpolation | Static mock: `${query.symbol} reports robust quarterly volume expansion` | `DataSourceCache` (In-Memory) | `NewsIntelligenceEngine` | **SIMULATED / FAKE** |
| **BSE/NSE Regulatory Filings** | `ExchangeFilingAdapter.ts` | None | Hardcoded In-Memory Object | Static mock: `Audited Annual Report 2023-24` | `DataSourceCache` (In-Memory) | Ingestion Flow | **SIMULATED / FAKE** |
| **Screener.in Financial Discovery** | `ScreenerAdapter.ts` | None | Hardcoded Symbol Switch | Switch for BEL and TATAMOTORS; fallback returns ₹450 price, ₹68k rev | `localStorage` | `AutomatedResearchOrchestrator` | **SIMULATED / FAKE** |
| **Moneycontrol News & Concalls** | `MoneycontrolAdapter.ts` | None | Hardcoded Symbol Switch | Switch for BEL; returns fake Army radar orders and 23-25% margin guidance | `localStorage` | `AutomatedResearchOrchestrator` | **SIMULATED / FAKE** |

---

## 6. Live Data Audit

1. **Price Telemetry Inspection:**
   - Tracking the UI price display on the dashboard backward:
   - In `OverviewView` / `InvestmentVerdictView`: Calls `MarketPriceSourcePolicy.resolveMarketPrice()` -> Reads `marketSnapshot.currentPrice`.
   - `marketSnapshot.currentPrice` originates from either `MarketDataAdapter` (fixed ₹980.5) or `ScreenerAdapter` (₹312.5 for BEL, ₹985.4 for Tata Motors, ₹450.0 for all others).
   - In `TechnicalAnalysisView`: Renders price chart from `candles` generated by `Math.sin() + Math.random()` from `basePrice = 1000.0`.
2. **Timestamp Reality:**
   - Displayed timestamps are generated via `new Date().toISOString()` or hardcoded to `'2026-08-22'` / `'2024-03-31'`.
3. **Market Status Reality:**
   - The UI displays green `LIVE` badges and freshness counters, but these are calculated against browser local time, not any exchange feed.
4. **Verdict:** **CRITICAL FAILURE (Simulated Live Data).**

---

## 7. AI & LLM Audit

1. **LLM Invocation:** **No LLM is ever called.**
2. **AI Provider / SDK:** None installed (`@google/genai`, `openai`, `anthropic`, `langchain` are absent from `package.json`).
3. **Evidence Passing:** No evidence is ever serialized into prompt contexts for generative AI models.
4. **Current Information Retrieval:** No web search or search grounding tools exist in runtime code.
5. **Verdict:** **CRITICAL FAILURE (AI platform contains zero AI integrations).**

---

## 8. Research Skills Audit

| Skill Directory | Skill File | Defined | Implemented in Code | Invoked by Runtime | Tested in CI | Enforced in Production | Reality Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `document-ingestion` | `SKILL.md` | **0 Bytes (EMPTY)** | Simulated in `DocumentIngestionEngine.ts` | Mocked | Yes (Mock tests) | No | **EMPTY FILE / MOCKED CODE** |
| `financial-extraction` | `SKILL.md` | Yes (4,083 B) | Hardcoded in `FinancialFactExtractor.ts` | Hardcoded Tata Motors | Yes (Mock tests) | No | **NOT ENFORCED (HARDCODED)** |
| `forensic-analysis` | `skill.md` | Yes (1,380 B) | Implemented in `ForensicAccountingEngine.ts` | Yes (on mock facts) | Yes | Yes (Domain logic) | **IMPLEMENTED DOMAIN ENGINE** |
| `management-dna` | `skill.md` | Yes (1,188 B) | Implemented in `ManagementDnaEngine.ts` | Yes (on mock quotes) | Yes | Yes (Domain logic) | **IMPLEMENTED DOMAIN ENGINE** |
| `valuation-analysis` | `skill.md` | Yes (1,185 B) | Implemented in `SectorValuationEngine.ts` | Bypassed by UI mock peers | Yes | Partial | **ENGINE REAL, UI COMPROMISED** |
| `technical-analysis` | `SKILL.md` | Yes (1,087 B) | Implemented in `TechnicalAnalysisEngine.ts` | Bypassed by Math.random | Yes | No | **BYPASSED BY MATH.RANDOM** |
| `news-intelligence` | `SKILL.md` | Yes (992 B) | Implemented in `NewsIntelligenceEngine.ts` | Fed fake radar news | Yes | No | **FED FAKE NEWS WIRE** |
| `research-synthesis` | `skill.md` | Yes (1,497 B) | Implemented in `VerdictMasterEngine.ts` | Yes (on mock state) | Yes | Yes (Domain logic) | **IMPLEMENTED DOMAIN ENGINE** |
| `qa-verification` | `SKILL.md` | Yes (1,139 B) | Implemented in `DecisionReadinessGate.ts` | Yes | Yes | Yes | **IMPLEMENTED GATE** |

---

## 9. Workflow Audit (`analyse-company.md`)

- `analyse-company.md` defines a 20-step research workflow.
- **Trace from UI Entry:**
  1. User enters `TCS` in `AutomatedResearchModal` -> Triggers `AutomatedResearchOrchestrator.executeAutomatedResearch('TCS')`.
  2. Step 1 (Company Verification): `CompanyResolutionEngine` resolves `TCS` to fallback `Capital Goods` / `Heavy Electrical Equipment`.
  3. Step 2 (Evidence Discovery): Queries `ScreenerAdapter` (returns generic fallback numbers: Rev ₹68k Cr, PE 22) and `OfficialExchangeAdapter` (returns empty).
  4. Step 3 (News Discovery): `NewsDiscoveryAdapter` returns `TCS Bags ₹1,150 Cr Defence Contract from Indian Army for Advanced Radars`.
  5. Step 4 (Document Ingestion): `DocumentIngestionEngine` creates fake document records with 0 real text bytes.
  6. Step 5 (Pipeline Execution): `ResearchPipelineOrchestrator` executes Phase 5–14 deterministic engines.
  7. Step 6 (Verdict Synthesis): `VerdictMasterEngine` synthesizes a BUY/HOLD verdict based on the fake defence numbers and fallback multiples.
  8. Step 7 (UI Delivery): UI displays a complete 22-section institutional report for `TCS` containing defence radar contracts and industrial numbers.
- **Verdict:** **WORKFLOW BYPASSED BY MOCKS.**

---

## 10. Database & Storage Audit

1. **Storage Mechanism:** The entire application state is stored in browser `window.localStorage` under key `eq_terminal_research_projects_v1`.
2. **Server-Side Database:** None. (`ProductionConfig` mentions PostgreSQL, but no backend server or ORM exists).
3. **Company Isolation:** Projects are separated by `projectId` in `localStorage`. However, the **data generation layer shares universal static constants** across all projects (e.g. `FinancialFactExtractor` injects Tata Motors facts, `SectorValuationView` injects auto peers, `NewsDiscoveryAdapter` injects radar orders).

---

## 11. Source Provenance Audit

| UI Displayed Fact | Calculated Value | Stored Record | Claimed Source | Claimed Document | Claimed Page | Actual Origin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Revenue: ₹4,37,928 Cr** | Direct Fact | `fact_tcs_revenue_fy24_consolidated` | `Statement of Profit and Loss` | `TCS_Annual_Report_FY24.pdf` | Page 124 | Hardcoded in `FinancialFactExtractor.ts:106` |
| **PAT: ₹31,807 Cr** | Direct Fact | `fact_tcs_pat_fy24_consolidated` | `Statement of Profit and Loss` | `TCS_Annual_Report_FY24.pdf` | Page 124 | Hardcoded in `FinancialFactExtractor.ts:114` |
| **Operating EBITDA: ₹62,788 Cr** | Direct Fact | `fact_tcs_ebitda_fy24_consolidated` | `Financial Highlights` | `TCS_Annual_Report_FY24.pdf` | Page 124 | Hardcoded in `FinancialFactExtractor.ts:107` |
| **CFO: ₹67,120 Cr** | Direct Fact | `fact_tcs_cfo_fy24_consolidated` | `Statement of Cash Flows` | `TCS_Annual_Report_FY24.pdf` | Page 132 | Hardcoded in `FinancialFactExtractor.ts:128` |
| **Current Stock Price: ₹980.5** | Direct Price | `MarketPriceRecord` | `NSE Official Exchange Feed` | Electronic Feed | N/A | Hardcoded in `MarketDataAdapter.ts:77` |

---

## 12. Security Audit

1. **Secret Leakage:** Secret scanners in `src/domain/security/` and unit tests verify that no API keys or tokens are hardcoded. (Clean because no real API integrations exist).
2. **Untrusted Uploads:** File upload security guards validate extensions and MIME types. However, because PDF parsing is mocked, buffer overflow or PDF exploitation risks are unexercised.
3. **Prompt Injection:** `PromptInjectionFirewall.ts` contains regex filters for prompt injection keywords. (Clean, but no LLM is present to exploit).

---

## 13. Runtime Reality Matrix (5 Tested Companies)

| Company Tested | Resolved Sector | Market Price Shown | Revenue Shown | PAT Shown | Valuation Peers Shown | News Displayed in Terminal | Verdict Driver | Runtime Accuracy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BEL** | Defence / Capital Goods | ₹312.5 (or ₹1,000 synthetic) | ₹20,268 Cr (or ₹4,37,928 Cr) | ₹3,985 Cr (or ₹31,807 Cr) | `M&M, MARUTI, ASHOKLEY` | Army Radar ₹1,150 Cr Order Win | Mixed / Tata Motors | **COMPROMISED** |
| **TCS** | Capital Goods (Fallback) | ₹450.0 (or ₹1,000 synthetic) | ₹68,000 Cr (or ₹4,37,928 Cr) | ₹7,200 Cr (or ₹31,807 Cr) | `M&M, MARUTI, ASHOKLEY` | TCS wins Army Radar Order | Tata Motors P&L | **FABRICATED** |
| **Reliance** | Capital Goods (Fallback) | ₹450.0 (or ₹1,000 synthetic) | ₹68,000 Cr (or ₹4,37,928 Cr) | ₹7,200 Cr (or ₹31,807 Cr) | `M&M, MARUTI, ASHOKLEY` | Reliance wins Army Radar Order | Tata Motors P&L | **FABRICATED** |
| **HDFC Bank** | Capital Goods / Banking | ₹450.0 (or ₹1,000 synthetic) | ₹90,000 Cr NII (or ₹4,37,928 Cr) | ₹45,000 Cr (or ₹31,807 Cr) | `M&M, MARUTI, ASHOKLEY` | HDFC Bank wins Army Radar Order | Hardcoded Bank / Auto | **FABRICATED** |
| **Sun Pharma** | Capital Goods (Fallback) | ₹450.0 (or ₹1,000 synthetic) | ₹68,000 Cr (or ₹4,37,928 Cr) | ₹7,200 Cr (or ₹31,807 Cr) | `M&M, MARUTI, ASHOKLEY` | Sun Pharma wins Army Radar Order | Tata Motors P&L | **FABRICATED** |

---

## 14. Static Data & Mock Findings

1. **`src/domain/extraction/FinancialFactExtractor.ts`**: Hardcodes Tata Motors P&L (₹4,37,928 Cr), Balance Sheet, Cash Flow, JLR/CV/PV segment revenues, and Girish Wagh / PB Balaji quotes for all uploaded documents.
2. **`src/domain/dataSources/FinancialDataAdapter.ts`**: Hardcodes static numbers for 3 archetypes (Banking, IT, Industrial).
3. **`src/domain/dataSources/MarketDataAdapter.ts`**: Hardcodes price at ₹980.5.
4. **`src/domain/dataSources/ShareholdingDataAdapter.ts`**: Hardcodes 46.36% promoter holding, 0.0% pledge.
5. **`src/domain/dataSources/IndustryDataAdapter.ts`**: Hardcodes 'Automobile and Ancillaries' for all stocks.
6. **`src/infrastructure/researchSources/news/NewsDiscoveryAdapter.ts`**: Hardcodes Indian Army Radar Procurement order headlines.
7. **`src/infrastructure/researchSources/screener/ScreenerAdapter.ts`**: Hardcodes BEL and Tata Motors profiles; fallback returns ₹450 price and ₹68k rev.
8. **`src/routes/TechnicalAnalysisView.tsx`**: Generates synthetic OHLCV candles via `Math.sin() + Math.random()`.
9. **`src/routes/SectorValuationView.tsx`**: Hardcodes `M&M, MARUTI, ASHOKLEY` peers and historical Tata Motors price points.
10. **`src/domain/marketIntelligence/DailyMarketScanner.ts`**: 786-line file of 15 hardcoded stock records.

---

## 15. Company Isolation Findings

- **Project Isolation in Storage:** `ProjectStorage.ts` properly isolates project records by ID in `localStorage`.
- **Pipeline Data Leakage:** The analytical data pipeline is **not isolated by company**. It pulls from shared hardcoded mock generators. Thus, any newly created project inherits the exact same Tata Motors financials, auto peers, radar news, and synthetic technicals.

---

## 16. Critical Failures Summary

1. **Failure 1 (Data Fabrication):** Violates Rule 1 of `Rules.md` by generating fake financial statements, fake news, fake prices, and fake management quotes.
2. **Failure 2 (No Real Ingestion):** PDF parsing and OCR are completely simulated. Uploading a real 300-page annual report extracts nothing from the PDF bytes.
3. **Failure 3 (No Real External Data):** Zero HTTP network adapters exist. All financial, market, and corporate disclosure feeds are mocked.
4. **Failure 4 (No AI Model Integration):** The platform claims to be an "AI Equity Research Intelligence Platform" but has no LLM client or prompt orchestration.
5. **Failure 5 (Compromised QA Certification):** Memory.md declared Phase 20 SHIP complete based on tests written to validate mock constants.

---

## 17. Root Causes

1. **Mock-First Architecture Never Replaced:** Early prototype mocks in Phases 2, 3, 4, 10, 11, and 16 were treated as permanent implementations rather than being replaced with real services.
2. **Absence of Real API Integrations:** No backend proxy or client-side fetchers were built to connect with real Indian equity data sources (e.g. NSE/BSE public APIs, Yahoo Finance, Screener/Tickertape scraping proxies, MCA endpoints).
3. **Absence of PDF.js / OCR Pipeline:** The ingestion UI was wired to synthetic mock page generators instead of integrating `pdfjs-dist` and `tesseract.js`.
4. **Absence of Gemini / LLM SDK:** Research extraction and synthesis were built with deterministic TypeScript switch statements rather than connecting to Google Gemini or OpenAI APIs with structured tool-calling and schema validation.
5. **Circular Test Assertions:** Unit and integration tests were written to assert against the mock data values, allowing 1,221 tests to pass without ever validating against live or real-file data.

---

## 18. Recommended Rebuild Strategy

To transform the platform into a genuine, production-grade Indian Equity Research terminal:

### Step 1: Install Required Runtime Dependencies
- `pdfjs-dist` (for real client-side PDF rendering and text layer extraction)
- `tesseract.js` (for real client-side OCR on scanned pages & screenshots)
- `@google/genai` or `@anthropic-ai/sdk` (for real AI financial extraction, management DNA analysis, and research synthesis)
- `lightweight-charts` (TradingView's open-source library for real financial candlestick & volume charting)

### Step 2: Implement Real Document Ingestion Engine
- Replace `parseDocumentPages` in `DocumentIngestionEngine.ts` with real `PDF.js` page rendering and text extraction.
- Implement real canvas-based OCR on scanned pages using `Tesseract.js`.

### Step 3: Implement Real Data Acquisition Layer
- Build real network fetchers for live market quotes and historical daily OHLCV (via Yahoo Finance / NSE public endpoints / RapidAPI financial endpoints).
- Build real RSS/News fetchers for Google News / Moneycontrol / exchange regulatory announcements.
- Return explicit `DATA_UNAVAILABLE` when a stock is not found, rather than inventing fallback numbers (strictly enforcing Rule 1).

### Step 4: Implement Real AI Research & Extraction Service
- Create `AiResearchService.ts` using Google Gemini 2.5/Flash/Pro.
- Pass extracted PDF page text and screenshots into Gemini with structured schemas for P&L, balance sheet, cash flow, management guidance, and concall Q&A analysis.
- Preserve exact page numbers and snippet citations for genuine provenance.

### Step 5: Clean Domain Engines of Hardcoded Data
- Remove hardcoded Tata Motors numbers from `FinancialFactExtractor.ts`.
- Remove hardcoded peers and price history from `SectorValuationView.tsx`.
- Remove `Math.random` price generators from `TechnicalAnalysisView.tsx`.
- Remove fake radar news from `NewsDiscoveryAdapter.ts` and `MoneycontrolAdapter.ts`.
- Remove static stock arrays from `DailyMarketScanner.ts`.

### Step 6: Refactor Test Suites
- Update test fixtures to use explicit, isolated test datasets without allowing test constants to leak into production domain code.
- Add real integration tests with sample PDF files, real OCR image samples, and live API mock servers (MSW / Vitest fetch mocking).

---

## 19. Files Requiring Replacement or Major Overhaul

1. `src/domain/extraction/FinancialFactExtractor.ts` (Replace hardcoded Tata Motors numbers with real document parsing / LLM extraction).
2. `src/domain/ingestion/DocumentIngestionEngine.ts` (Integrate `pdfjs-dist` and `tesseract.js`).
3. `src/domain/dataAcquisition/CompanyResolutionEngine.ts` (Integrate real security master search / symbol lookup API).
4. `src/domain/dataAcquisition/AutomatedResearchOrchestrator.ts` (Connect to real data fetchers and LLM extraction).
5. `src/infrastructure/researchSources/screener/ScreenerAdapter.ts` (Replace hardcoded switch with real data scraper/API).
6. `src/infrastructure/researchSources/moneycontrol/MoneycontrolAdapter.ts` (Replace fake radar news with real feeds).
7. `src/infrastructure/researchSources/news/NewsDiscoveryAdapter.ts` (Replace fake radar news with real RSS/News API).
8. `src/infrastructure/researchSources/official/OfficialExchangeAdapter.ts` (Connect to real exchange disclosures API).
9. `src/infrastructure/researchSources/tickertape/TickertapeAdapter.ts` (Connect to real market data provider).
10. `src/domain/dataSources/FinancialDataAdapter.ts` (Remove static sector archetypes).
11. `src/domain/dataSources/MarketDataAdapter.ts` (Remove fixed 980.5 price; connect to real quote API).
12. `src/domain/dataSources/NewsDataAdapter.ts` (Remove fake PTI wire template).
13. `src/domain/dataSources/IndustryDataAdapter.ts` (Remove hardcoded automobile sector data).
14. `src/domain/dataSources/ShareholdingDataAdapter.ts` (Remove fixed 46.36% shareholding).
15. `src/routes/TechnicalAnalysisView.tsx` (Remove `Math.random` candle generator; integrate real OHLCV data).
16. `src/routes/SectorValuationView.tsx` (Remove hardcoded auto peers and Tata Motors history).
17. `src/domain/marketIntelligence/DailyMarketScanner.ts` (Replace 786-line static array with dynamic multi-factor scanner over fetched quotes).
18. `.agents/skills/document-ingestion/SKILL.md` (Populate empty 0-byte skill file).
19. `Memory.md` (Correct false status to reflect actual audit state).

---

## 20. Files That Can Be Preserved (Clean Architecture & Math)

The following domain engines contain excellent, robust, deterministic mathematical logic and can be 100% preserved once fed real data:

1. `src/domain/calculations/FinancialCalculationEngine.ts` (Deterministic margin, growth, FCF, working capital math).
2. `src/domain/calculations/DuPontDecompositionEngine.ts` (3-stage & 5-stage DuPont return decomposition).
3. `src/domain/calculations/IndicatorCalculations.ts` (RSI, MACD, SMA, EMA technical indicators).
4. `src/domain/analysis/FundamentalHealthEngine.ts` (Gated 7-category health scoring).
5. `src/domain/forensics/ForensicAccountingEngine.ts` (Beneish M-Score, Altman Z-Score, cash divergence logic).
6. `src/domain/forensics/BeneishMScoreEngine.ts` (Deterministic 8-variable Beneish equation).
7. `src/domain/forensics/AltmanZScoreEngine.ts` (Deterministic 5-variable Altman equation).
8. `src/domain/management/ManagementDnaEngine.ts` (Promise vs outcome tracking logic).
9. `src/domain/valuation/SectorValuationEngine.ts` (Sector-specific DCF, DDM, NAV, and multiples models).
10. `src/domain/valuation/DcfEngine.ts` & `DdmEngine.ts` & `NavEngine.ts` (Valuation calculation math).
11. `src/domain/risks/CatalystRiskMasterEngine.ts` (5x5 PxI risk scoring matrix).
12. `src/domain/scenarios/ScenarioMasterEngine.ts` (Bull/Base/Bear scenario simulator).
13. `src/domain/verdict/VerdictMasterEngine.ts` (Decision tree, margin of safety gate, thesis breakers).
14. `src/domain/reports/InvestmentResearchReportEngine.ts` (22-section report generation).
15. `src/domain/storage/ProjectStorage.ts` (Project CRUD and snapshot persistence in localStorage).
16. `src/domain/security/*` (`RbacAuthorizationEngine`, `PromptInjectionFirewall`, `SecretRedactionEngine`).
17. `src/components/*` (Terminal UI layout, TopBar, SideNav, StatusBar, report view components).
