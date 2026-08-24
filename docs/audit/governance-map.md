# GOVERNANCE MAP & ENFORCEMENT AUDIT

**Project:** Indian Equity Research Intelligence Platform  
**Audit Type:** Forensic Governance & Enforcement Mapping  
**Date:** 2026-08-23  
**Status:** AUDITED — CRITICAL ENFORCEMENT BREACHES IDENTIFIED  

---

## 1. Executive Summary of Governance Status

The repository contains an extensive, sophisticated set of governance rules, workflows, and skills across `@AGENTS.md`, `@PRD.md`, `@Architecture.md`, `@Rules.md`, `@Phases.md`, `.agents/rules/`, `.agents/skills/`, and `.agents/workflows/`.

However, our forensic audit reveals a **catastrophic gap between the written governance specifications and the actual runtime implementation**:
1. **Rule 1 & Rule 12 Violation (Fabricated Data & Fake News):** `FinancialFactExtractor.ts`, `FinancialDataAdapter.ts`, `MarketDataAdapter.ts`, `ScreenerAdapter.ts`, `MoneycontrolAdapter.ts`, `NewsDiscoveryAdapter.ts`, and `SectorValuationView.tsx` inject hardcoded figures (Tata Motors financials, Indian Army radar contracts, static ₹980.5 prices, fixed auto peers) regardless of the target company.
2. **Rule 11 Violation (Fabricated Technicals):** `TechnicalAnalysisView.tsx` synthesizes OHLCV price candles using `Math.sin()`, `Math.cos()`, and `Math.random()`.
3. **Rule 19 & Rule 20 Violation (Fake Completeness & Self-Referential Testing):** 336 test files passed 100% because tests were written against deterministic mock contracts, creating an illusion of 100% test-verified production readiness while core pipelines (PDF parsing, OCR, live data, AI extraction) remain completely unbuilt or mocked.
4. **Skills Disconnect:** Specialist skills in `.agents/skills/` exist only as markdown documentation (and `document-ingestion/SKILL.md` is an empty 0-byte file). None of these skills are programmatically invoked by any LLM or backend orchestrator because **no LLM SDK, API key, or AI client is implemented in the codebase**.

---

## 2. Complete Governance Mapping Table

| Global Rule / Principle | Authoritative Rule File | Corresponding Skill | Associated Workflow | Phase | Implementation File(s) | Test File(s) | Actual Runtime Enforcement Status | Gap & Failure Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule 1: No Fabricated Data** | `Rules.md`<br>`anti-hallucination.md`<br>`financial-research.md` | `evidence-verification`<br>`financial-extraction` | `analyse-company.md`<br>`verify-research.md` | Phase 4, 16 | `FinancialFactExtractor.ts`<br>`FinancialDataAdapter.ts`<br>`MarketDataAdapter.ts` | `financialExtraction.test.ts`<br>`01_marketDataReplayAndFeeds.test.ts` | **CRITICAL BREACH** | Hardcodes Tata Motors P&L, ₹980.5 stock price, and archetype constants for all queried companies. |
| **Rule 2: Source Every Material Fact** | `Rules.md`<br>`financial-research.md` | `evidence-verification` | `analyse-company.md` | Phase 4, 15 | `FinancialFactExtractor.ts`<br>`InvestmentResearchReportEngine.ts` | `extractionUI.test.tsx` | **MOCKED ENFORCEMENT** | Attaches fake provenance strings (`page: 124, table: 'Statement of Profit and Loss'`) to hardcoded numbers. |
| **Rule 3: Never Hide Uncertainty** | `Rules.md`<br>`anti-hallucination.md` | `evidence-verification` | `analyse-company.md` | Phase 4, 6, 7 | `OcrProcessor.ts`<br>`FundamentalHealthEngine.ts` | `unit/ocrProcessor.test.ts` | **PARTIAL** | Flags simulated OCR errors in unit tests, but runtime PDF ingestion generates fake clean text bypassing OCR. |
| **Rule 4: LLMs Do Not Own Arithmetic** | `Rules.md`<br>`financial-research.md` | `financial-analysis` | `analyse-company.md` | Phase 5 | `FinancialCalculationEngine.ts`<br>`DuPontDecompositionEngine.ts` | `calculationUI.test.tsx`<br>`financialCalculation.test.ts` | **IMPLEMENTED (ISOLATED)** | Deterministic math is implemented in TypeScript, but it calculates ratios on top of hardcoded mock numbers. |
| **Rule 5: No False Precision** | `Rules.md`<br>`anti-hallucination.md` | `financial-extraction` | `verify-research.md` | Phase 4, 5 | `UnitNormalizer.ts` | `unit/unitNormalizer.test.ts` | **IMPLEMENTED** | Correctly rounds and converts units in memory. |
| **Rule 6: Two-Year Comparison** | `Rules.md`<br>`PRD.md` | `financial-extraction`<br>`financial-analysis` | `analyse-company.md` | Phase 4, 5, 6 | `TwoYearReconciliation.ts`<br>`FundamentalHealthEngine.ts` | `twoYearAuditCard.test.tsx` | **MOCKED ENFORCEMENT** | Compares FY23 vs FY24, but the numbers compared are hardcoded Tata Motors numbers (`₹3,45,967 Cr` vs `₹4,37,928 Cr`). |
| **Rule 7 & 8: Management Claims & Credibility** | `Rules.md`<br>`financial-research.md` | `management-dna` | `analyse-company.md` | Phase 8 | `ManagementDnaEngine.ts`<br>`PromiseOutcomeTracker.ts` | `managementDnaUI.test.tsx`<br>`managementDna.test.ts` | **MOCKED ENFORCEMENT** | Engine logic evaluates promise vs outcome, but inputs are hardcoded quotes by Girish Wagh and PB Balaji across all stocks. |
| **Rule 9: Promoter Red Flags** | `Rules.md`<br>`financial-research.md` | `forensic-analysis` | `analyse-company.md` | Phase 7 | `ForensicAccountingEngine.ts`<br>`ShareholdingDataAdapter.ts` | `forensicInvestigationUI.test.tsx` | **MOCKED ENFORCEMENT** | Evaluates pledge % and dilution, but `ShareholdingDataAdapter` hardcodes 46.36% promoter holding and 0.0% pledge for all companies. |
| **Rule 10: Valuation Sector-Aware** | `Rules.md`<br>`financial-research.md` | `valuation-analysis` | `analyse-company.md` | Phase 9 | `SectorValuationEngine.ts`<br>`SectorValuationView.tsx` | `sectorValuationUI.test.tsx` | **CRITICAL BREACH** | Sector models exist in domain, but UI (`SectorValuationView.tsx`) hardcodes auto peers (`M&M, MARUTI, ASHOKLEY`) and Tata Motors history for all stocks. |
| **Rule 11: Technicals Data-Based** | `Rules.md`<br>`financial-research.md` | `technical-analysis` | `analyse-company.md` | Phase 10 | `TechnicalAnalysisEngine.ts`<br>`TechnicalAnalysisView.tsx` | `technicalAnalysisUI.test.tsx` | **CRITICAL BREACH** | `TechnicalAnalysisView.tsx` generates candles using sinusoidal drift + `Math.random()` around base price `1000.0`. |
| **Rule 12: Current News Must Be Current** | `Rules.md`<br>`financial-research.md` | `news-intelligence` | `analyse-company.md` | Phase 11, 16 | `NewsDiscoveryAdapter.ts`<br>`MoneycontrolAdapter.ts`<br>`NewsIntelligenceView.tsx` | `newsAndIndustryUI.test.tsx` | **CRITICAL BREACH** | Injects fake 2024 Indian Army Radar Procurement wire copy and ₹800 Cr testing facility capex into all companies (e.g. TCS, Sun Pharma). |
| **Rule 13: Source Conflicts** | `Rules.md`<br>`financial-research.md` | `evidence-verification` | `verify-research.md` | Phase 4, 14, 16 | `ContradictionDetector.ts`<br>`DataConflictEngine.ts` | `hostile_audit/30_dataConflictAndDisagreement.test.ts` | **MOCKED ENFORCEMENT** | Detects synthetic contradictions between hardcoded annual report vs hardcoded Screener screenshot. |
| **Rule 14 & 15: Research Before Verdict & Traceable Verdict** | `Rules.md`<br>`financial-research.md` | `research-synthesis` | `analyse-company.md` | Phase 14 | `VerdictMasterEngine.ts`<br>`InvestmentVerdictView.tsx` | `verdictUI.test.tsx` | **MOCKED ENFORCEMENT** | Synthesis engine enforces gated decision tree, but synthesizes conclusions from mocked upstream layers. |
| **Rule 16 & 17: Bias Check & Negative Evidence** | `Rules.md`<br>`financial-research.md` | `research-synthesis` | `analyse-company.md` | Phase 14 | `VerdictMasterEngine.ts` | `hostile_audit/16_behavioralBiasCheck.test.ts` | **IMPLEMENTED (INTERNAL)** | Evaluates confirmation bias and anchoring flags in memory. |
| **Rule 18: No Diplomatic Filler** | `Rules.md` | `research-synthesis` | `analyse-company.md` | Phase 14, 15 | `VerdictMasterEngine.ts` | `tests/unit/verdict/*.test.ts` | **IMPLEMENTED** | Produces direct BUY/HOLD/AVOID verdicts with explicit thesis breakers. |
| **Rule 19 & 20: Test Before Completion & Fix Root Causes** | `Rules.md`<br>`testing.md`<br>`AGENTS.md` | `qa-verification` | `build-phase.md`<br>`ship.md` | Phase 19, 20 | `tests/hostile_audit/*` | `336 Vitest test suites` | **BROKEN / BYPASSED** | 336 test files test synthetic mock behavior; tests do not fail on hardcoded data because tests assert on hardcoded expected mock values. |
| **Rule 22: Update Memory** | `Rules.md`<br>`AGENTS.md` | N/A | `build-phase.md` | All Phases | `Memory.md` | N/A | **COMPROMISED** | `Memory.md` asserts Phase 20 complete and 0 defects when real data ingestion, PDF parsing, live price, and AI calls do not exist. |
| **Rule 23 & Security Rules** | `Rules.md`<br>`security.md` | N/A | `ship.md` | Phase 18 | `FileUploadSecurityGuard.ts`<br>`PromptInjectionFirewall.ts`<br>`SecretExposureScanner.ts` | `hostile_audit/08_promptInjectionDefense.test.ts` | **IMPLEMENTED (IN-MEMORY)** | In-memory regex filters and validation guards exist. |
| **Rule 25 & 26: Document Safety & Prompt Injection** | `Rules.md`<br>`security.md`<br>`anti-hallucination.md` | `document-ingestion` | `analyse-company.md` | Phase 3, 18 | `PromptInjectionFirewall.ts` | `hostile_audit/08_promptInjectionDefense.test.ts` | **IMPLEMENTED (IN-MEMORY)** | Regex filters detect prompt injection keywords in mock strings. |
| **Rule 28: Verify External Data** | `Rules.md`<br>`financial-research.md` | `evidence-verification` | `analyse-company.md` | Phase 16 | `DataSourceTypes.ts`<br>`FinancialDataAdapter.ts` | `hostile_audit/01_marketDataReplayAndFeeds.test.ts` | **MOCKED** | No actual external network APIs are connected; all external calls are simulated. |

---

## 3. Skill & Workflow Enforcement Gaps

### 3.1 Skills Directory Reality
- `.agents/skills/document-ingestion/SKILL.md` is **0 bytes** (empty file).
- `.agents/skills/financial-extraction/SKILL.md` describes a detailed human/agent extraction protocol, but `FinancialFactExtractor.ts` in the code does not invoke any LLM or OCR; it returns hardcoded JSON objects.
- `.agents/skills/technical-analysis/SKILL.md` explicitly mandates: *"Never invent price levels, indicators... If market data is unavailable, state: Technical analysis unavailable"*. In direct violation, `TechnicalAnalysisView.tsx` generates synthetic candles using `Math.sin() + Math.random()`.
- `.agents/skills/news-intelligence/SKILL.md` mandates: *"Never present rumors as facts. Always include date/source"*. In direct violation, `NewsDiscoveryAdapter.ts` manufactures fake Indian Army radar orders for all companies.

### 3.2 Workflow Reality
- `.agents/workflows/analyse-company.md` outlines a 20-step institutional research workflow.
- In the running application, the automated research flow (`AutomatedResearchOrchestrator.ts`) queries mock adapters that hardcode BEL and Tata Motors profiles, constructs an evidence graph of mock nodes, and runs deterministic scoring on fabricated inputs.

---

## 4. Summary of Root Governance Breakdown

The governance breakdown occurred because **the testing system was calibrated to verify code structure and internal arithmetic consistency rather than external reality and data integrity**.

1. **Mock Propagation:** Development introduced mock datasets during early phases to unblock UI development.
2. **Failure to Swap Mocks with Real Integrations:** As phases 1 to 20 progressed, these mock datasets were never replaced with live integrations (PDF parsing, OCR, NSE/BSE API, Google Gemini/LLM integration).
3. **Self-Fulfilling Tests:** Tests were written to assert that `FinancialFactExtractor` returns the hardcoded Tata Motors numbers and that `MarketDataAdapter` returns 980.5, allowing test suites to pass 100% while violating Rule 1, Rule 11, Rule 12, and Rule 19.
