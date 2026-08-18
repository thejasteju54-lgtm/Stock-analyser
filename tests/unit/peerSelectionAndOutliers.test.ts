import { describe, it, expect } from 'vitest';
import { PeerSelectionEngine } from '../../src/domain/valuation/PeerSelectionEngine';
import { PeerValuationRecord } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Peer Selection & Outlier Engine', () => {
  it('assigns high relevance score (>=85) for identical business model, sector, and comparable scale', () => {
    const target = {
      businessModel: 'OPERATING_INDUSTRIAL',
      sector: 'Automobile',
      marketCap: 300000.0,
      revenue: 100000.0,
      ebitdaMargin: 15.0,
    };

    const peer = {
      businessModel: 'OPERATING_INDUSTRIAL',
      sector: 'Automobile',
      marketCap: 250000.0,
      revenue: 90000.0,
      ebitdaMargin: 14.2,
    };

    const { score, rationale } = PeerSelectionEngine.calculateRelevanceScore(target, peer);
    expect(score).toBeGreaterThanOrEqual(85);
    expect(rationale).toContain('Identical business model');
    expect(rationale).toContain('Same primary industry sector');
  });

  it('filters extreme statistical outliers using IQR rule and excludes negative multiples', () => {
    const peers: PeerValuationRecord[] = [
      { peerId: 'p1', companyName: 'Peer 1', symbol: 'P1', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: 18.0, pb: 3.0, evEbitda: 10.0, fcfYield: 4.0, relevanceScore: 90, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' },
      { peerId: 'p2', companyName: 'Peer 2', symbol: 'P2', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: 20.0, pb: 3.2, evEbitda: 11.0, fcfYield: 3.5, relevanceScore: 90, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' },
      { peerId: 'p3', companyName: 'Peer 3', symbol: 'P3', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: 22.0, pb: 3.5, evEbitda: 12.0, fcfYield: 3.0, relevanceScore: 90, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' },
      { peerId: 'p4', companyName: 'Peer 4', symbol: 'P4', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: 24.0, pb: 3.8, evEbitda: 13.0, fcfYield: 2.8, relevanceScore: 90, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' },
      { peerId: 'p5', companyName: 'Peer Outlier', symbol: 'POUT', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: 150.0, pb: 20.0, evEbitda: 80.0, fcfYield: 0.1, relevanceScore: 80, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' }, // Extreme Outlier
      { peerId: 'p6', companyName: 'Peer Loss Maker', symbol: 'PLOSS', businessModel: 'OP', sector: 'Auto', marketCap: 1000, revenue: 1000, revenueGrowthYoY: 10, ebitdaMargin: 15, roe: 15, roce: 15, debtToEquity: 0.5, pe: -10.0, pb: 1.0, evEbitda: -5.0, fcfYield: -2.0, relevanceScore: 70, inclusionRationale: '', isOutlierExcluded: false, priceDate: '2024-03-31', financialPeriod: 'FY24', isStale: false, source: 'AR' }, // Loss Maker
    ];

    const { validPeers, summary } = PeerSelectionEngine.filterOutliers(peers, 'pe');
    expect(validPeers.length).toBe(4);
    expect(summary.excludedOutliersCount).toBe(2);
    expect(summary.median).toBe(21.0); // (20 + 22) / 2 = 21.0
  });
});
