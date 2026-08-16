# Walkthrough — Phase 2: Research Project Creation & Company Onboarding

## Overview

In **Phase 2**, we implemented the core company onboarding and research project creation layer for the **Indian Equity Research Intelligence Platform**. This ensures that every analysis session is anchored to an unambiguous Indian listed entity (NSE/BSE) with sector-specific taxonomy, business model categorization, and gated forensic/valuation models.

---

## 1. Architecture & Domain Models

### A. Company Identity & Validation
- **File**: [`Company.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/domain/models/Company.ts)
- **Purpose**: Strictly defines and validates Indian listed company entities.
- **Key Fields**:
  - `legalName`: Full registered corporate name (e.g. *"Tata Motors Limited"*).
  - `displayName`: Short trading name.
  - `symbol`: NSE/BSE ticker symbol (e.g. `TATAMOTORS`, `HDFCBANK`).
  - `exchange`: `NSE` | `BSE`.
  - `sector`: One of 30+ sectors from the taxonomy registry.
  - `subsector`: Specific industry vertical matching the sector.
  - `businessModel`: Derived canonical classification (`BANKING`, `NBFC`, `INSURANCE`, `NON_FINANCIAL_OPERATING`, `REAL_ESTATE_TRUST`, `PROJECT_INFRA`, `UTILITY`).
  - `marketCapCategory`: `LARGE_CAP` | `MID_CAP` | `SMALL_CAP` | `MICRO_CAP`.
  - `isin`: Optional standard 12-character ISIN code (e.g. `INE155A01022`).

### B. Sector Taxonomy & Gated Model Registry
- **File**: [`SectorTaxonomyRegistry.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/domain/taxonomy/SectorTaxonomyRegistry.ts)
- **Purpose**: Configurable engine mapping 30+ Indian sectors to their specific metrics, forensic checks, and valuation methods.
- **Model Gating Logic**:
  - **Banking & NBFC**:
    - *Forensic Models*: `NPA_PCR_QUALITY`, `REST_ASSET_MONITOR`, `RELATED_PARTY_LENDING`, `CAPITAL_DILUTION`. (Industrial checks like `BENEISH_M_SCORE` and `WORKING_CAPITAL_CYCLE` are gated off).
    - *Valuation Frameworks*: `PB_ABV`, `PE`, `DIVIDEND_DISCOUNT`. (`EV_EBITDA` is gated off).
  - **Non-Financial Operating (Auto, IT, FMCG, Pharma)**:
    - *Forensic Models*: `BENEISH_M_SCORE`, `ALTMAN_Z_SCORE`, `CFO_PAT_DIVERGENCE`, `WORKING_CAPITAL_CYCLE`.
    - *Valuation Frameworks*: `EV_EBITDA`, `PE`, `DCF`, `FCF_YIELD`.

### C. Research Project Lifecycle & Storage Engine
- **Files**: [`ResearchProject.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/domain/models/ResearchProject.ts), [`ProjectStorage.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/domain/storage/ProjectStorage.ts)
- **Purpose**: Container for research state and persistence.
- **Key Features**:
  - Status lifecycle: `DRAFT` → `ONBOARDED` → `INGESTING` → `EXTRACTED` → `ANALYZED` → `VERIFIED`.
  - Collision-resistant unique ID generation (`proj_<symbol>_<timestamp>_<random>`).
  - `localStorage` persistence with zero-data-loss restoration.
  - Strict duplicate detection across exchange + symbol combinations.

---

## 2. User Interface Components

### A. Company Onboarding Modal (`NewProjectModal.tsx`)
- **File**: [`NewProjectModal.tsx`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/components/project/NewProjectModal.tsx)
- Accessible form with `htmlFor` label binding and custom error banners.
- Live **Sector Taxonomy Preview** showing the active business model, applicable forensic checks, and valuation frameworks dynamically as the user selects a sector.

### B. Multi-Project Switcher (`ProjectSwitcher.tsx`)
- **File**: [`ProjectSwitcher.tsx`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/components/project/ProjectSwitcher.tsx)
- Integrated into the top navigation bar.
- Shows current active project with badge and dropdown listing all onboarded companies for quick switching.

### C. Active Target Profile Cards (`OverviewView`)
- **File**: [`index.tsx`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/src/routes/index.tsx)
- Terminal dashboard cards rendering active company taxonomy, market cap classification, applicable forensic model badges, and valuation framework tags.

---

## 3. Test Suite Verification

Vitest unit tests verify the integrity of Phase 2 across all layers:

| Test Suite | Tests | Result | Coverage |
| :--- | :--- | :--- | :--- |
| [`taxonomy.test.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/tests/unit/taxonomy.test.ts) | 4 | PASSED | 30+ verticals, model gating, subsector retrieval |
| [`company.test.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/tests/unit/company.test.ts) | 5 | PASSED | Entity validation, bad symbol rejection, sector mismatch checks |
| [`projectStorage.test.ts`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/tests/unit/projectStorage.test.ts) | 4 | PASSED | Seed initialization, project saving, duplicate prevention, switching |
| [`onboardingUI.test.tsx`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/tests/unit/onboardingUI.test.tsx) | 4 | PASSED | Dynamic modal behavior, error banner, submission, switcher dropdown |
| [`shell.test.tsx`](file:///c:/Users/Thejas/OneDrive/Desktop/stock%20analyser/tests/unit/shell.test.tsx) | 4 | PASSED | App shell, navigation, 15 route tabs, error boundary |
| **Total** | **21** | **PASSED (100%)** | |

---

## 4. Build & Typecheck Status

- **Typecheck**: `npm.cmd run typecheck` → **0 errors**.
- **Build**: `npm.cmd run build` → **2.35s build, 1821 modules compiled into production bundle in `dist/`**.
- **Runtime**: Active at `http://localhost:5173/` with **0 console errors**.
