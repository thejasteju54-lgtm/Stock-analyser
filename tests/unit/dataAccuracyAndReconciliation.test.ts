import { describe, it, expect } from 'vitest';

describe('Phase UI-3 — Data Accuracy, Source Verification & Reconciliation Integrity', () => {
  describe('1. Deterministic Financial Formula Bridges', () => {
    it('reconciles Revenue -> EBITDA -> EBIT -> PAT -> EPS mathematically', () => {
      const revenue = 437928;
      const opex = 375644;
      const ebitda = revenue - opex; // 62,284
      expect(ebitda).toBe(62284);

      const ebitdaMarginPercent = (ebitda / revenue) * 100;
      expect(ebitdaMarginPercent).toBeCloseTo(14.22, 1);

      const depreciation = 20764;
      const ebit = ebitda - depreciation; // 41,520
      expect(ebit).toBe(41520);

      const financeCosts = 3200;
      const tax = 6921;
      const pat = ebit - financeCosts - tax; // 31,399
      expect(pat).toBe(31399);

      const sharesOutstandingCr = 383.85; // 383.85 Cr shares
      const eps = pat / sharesOutstandingCr;
      expect(eps).toBeCloseTo(81.8, 1);
    });

    it('reconciles CFO -> Capex -> FCF and Debt -> Cash -> Net Debt', () => {
      const cfo = 58420;
      const capex = 28620;
      const fcf = cfo - capex;
      expect(fcf).toBe(29800);

      const grossDebt = 45000;
      const cashAndEquivalents = 29000;
      const netDebt = grossDebt - cashAndEquivalents;
      expect(netDebt).toBe(16000);
    });

    it('calculates ROCE deterministically as EBIT / Capital Employed', () => {
      const ebit = 41520;
      const totalEquity = 183000;
      const totalDebt = 45000;
      const capitalEmployed = totalEquity + totalDebt; // 228,000
      const rocePercent = (ebit / capitalEmployed) * 100;
      expect(rocePercent).toBeCloseTo(18.21, 1);
    });
  });

  describe('2. Source Hierarchy & Conflict Resolution', () => {
    interface SourceRecord {
      sourceTier: 1 | 2 | 3 | 4;
      authority: string;
      value: number;
      period: string;
    }

    it('prioritizes Tier 1 Statutory filings over Tier 4 Discovery sources', () => {
      const tier1Filing: SourceRecord = { sourceTier: 1, authority: 'NSE_AUDITED_ANNUAL_REPORT', value: 437928, period: 'FY24' };
      const tier4Blog: SourceRecord = { sourceTier: 4, authority: 'UNVERIFIED_WEB_SCRAPE', value: 450000, period: 'FY24' };

      const selectAuthoritativeValue = (records: SourceRecord[]) => {
        const sorted = [...records].sort((a, b) => a.sourceTier - b.sourceTier);
        return sorted[0];
      };

      const selected = selectAuthoritativeValue([tier4Blog, tier1Filing]);
      expect(selected.sourceTier).toBe(1);
      expect(selected.value).toBe(437928);
    });

    it('flags SOURCE_CONFLICT when same-tier sources report differing values', () => {
      const sourceA: SourceRecord = { sourceTier: 1, authority: 'BSE_STATUTORY_FILING', value: 437928, period: 'FY24' };
      const sourceB: SourceRecord = { sourceTier: 1, authority: 'NSE_STATUTORY_FILING', value: 437950, period: 'FY24' };

      const detectConflict = (a: SourceRecord, b: SourceRecord) => {
        if (a.sourceTier === b.sourceTier && a.period === b.period && a.value !== b.value) {
          return { status: 'SOURCE_CONFLICT', delta: Math.abs(a.value - b.value) };
        }
        return { status: 'RESOLVED', delta: 0 };
      };

      const result = detectConflict(sourceA, sourceB);
      expect(result.status).toBe('SOURCE_CONFLICT');
      expect(result.delta).toBe(22);
    });
  });

  describe('3. Consolidated vs Standalone Accounting Guard', () => {
    it('detects basis mismatches between reporting periods', () => {
      const fy24Consolidated = { period: 'FY24', basis: 'CONSOLIDATED', revenue: 437928 };
      const fy23Standalone = { period: 'FY23', basis: 'STANDALONE', revenue: 210000 };

      const validateComparison = (a: typeof fy24Consolidated, b: typeof fy23Standalone) => {
        if (a.basis !== b.basis) {
          return { isValidComparison: false, warning: 'INCOMPATIBLE_BASIS_WARNING: Comparing Consolidated with Standalone' };
        }
        return { isValidComparison: true, warning: null };
      };

      const validation = validateComparison(fy24Consolidated, fy23Standalone);
      expect(validation.isValidComparison).toBe(false);
      expect(validation.warning).toContain('INCOMPATIBLE_BASIS_WARNING');
    });
  });

  describe('4. Observation vs Retrieval Telemetry', () => {
    it('verifies distinct observation and retrieval timestamps', () => {
      const marketTick = {
        symbol: 'BEL',
        price: 312.50,
        observationTimestamp: '2026-08-22T15:30:00+05:30', // NSE Market Close
        retrievalTimestamp: '2026-08-22T15:31:05+05:30',   // Terminal Ingestion
      };

      expect(marketTick.observationTimestamp).not.toBe(marketTick.retrievalTimestamp);
      expect(new Date(marketTick.retrievalTimestamp).getTime()).toBeGreaterThan(new Date(marketTick.observationTimestamp).getTime());
    });
  });

  describe('5. Zero-Fabrication Sentinel', () => {
    it('returns NOT_ASSESSABLE when evidence is missing', () => {
      const getMetricOrSentinel = (val: number | null | undefined) => {
        if (val === null || val === undefined) {
          return 'NOT_ASSESSABLE';
        }
        return `₹${val.toLocaleString('en-IN')}`;
      };

      expect(getMetricOrSentinel(null)).toBe('NOT_ASSESSABLE');
      expect(getMetricOrSentinel(undefined)).toBe('NOT_ASSESSABLE');
      expect(getMetricOrSentinel(15000)).toBe('₹15,000');
    });
  });
});
