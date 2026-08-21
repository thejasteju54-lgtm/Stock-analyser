/**
 * 12_totalReturnPriceCalculations.test.ts
 * Phase 16 — Total Return Price & Split Adjustment Formula Verification.
 */

import { describe, it, expect } from 'vitest';
import { CorporateActionEngine } from '../../../src/domain/dataSources/CorporateActionEngine';
import { CorporateActionRecord } from '../../../src/domain/dataSources/DataSourceTypes';

describe('Total Return Price & Corporate Actions (Phase 16)', () => {
  it('correctly calculates Split Adjusted Price for historical sessions before 10:1 stock split', () => {
    const actions: CorporateActionRecord[] = [
      {
        actionId: 'act_split_10_1',
        companyId: 'comp_tatasteel',
        symbol: 'TATASTEEL',
        actionType: 'STOCK_SPLIT',
        announcementDate: '2022-05-03',
        exDate: '2022-07-28',
        effectiveDate: '2022-07-28',
        ratio: '10:1',
        multiplier: 10,
        source: 'BSE Corporate Announcement',
        sourceTier: 'TIER_1_PRIMARY',
        verificationStatus: 'VERIFIED',
      },
    ];

    // Session BEFORE the 10:1 split (e.g. 2022-01-15 where raw price was ₹1200)
    const splitFactorPre = CorporateActionEngine.computeSplitAdjustmentFactor(actions, '2022-01-15');
    expect(splitFactorPre).toBe(0.1); // 1 / 10

    const recordPre = CorporateActionEngine.buildPriceRecord({
      symbol: 'TATASTEEL',
      exchange: 'NSE',
      sessionDate: '2022-01-15',
      tradeTimestamp: '2022-01-15T15:30:00Z',
      rawPrice: 1200.0,
      open: 1190.0,
      high: 1210.0,
      low: 1185.0,
      close: 1200.0,
      volume: 500000,
      actions,
      sourceId: 'NSE_OFFICIAL_FEED',
      captureId: 'cap_1',
    });

    expect(recordPre.rawPrice).toBe(1200.0);
    expect(recordPre.splitAdjustedPrice).toBe(120.0); // 1200 / 10

    // Session AFTER the split (e.g. 2023-01-15 where raw price is ₹125)
    const splitFactorPost = CorporateActionEngine.computeSplitAdjustmentFactor(actions, '2023-01-15');
    expect(splitFactorPost).toBe(1.0);

    const recordPost = CorporateActionEngine.buildPriceRecord({
      symbol: 'TATASTEEL',
      exchange: 'NSE',
      sessionDate: '2023-01-15',
      tradeTimestamp: '2023-01-15T15:30:00Z',
      rawPrice: 125.0,
      open: 124.0,
      high: 126.0,
      low: 123.5,
      close: 125.0,
      volume: 15000000,
      actions,
      sourceId: 'NSE_OFFICIAL_FEED',
      captureId: 'cap_2',
    });

    expect(recordPost.rawPrice).toBe(125.0);
    expect(recordPost.splitAdjustedPrice).toBe(125.0);
  });

  it('correctly calculates Total Return Price incorporating cash dividend reinvestment', () => {
    const actions: CorporateActionRecord[] = [
      {
        actionId: 'act_div_1',
        companyId: 'comp_infy',
        symbol: 'INFY',
        actionType: 'DIVIDEND',
        announcementDate: '2024-04-18',
        exDate: '2024-05-31',
        effectiveDate: '2024-05-31',
        dividendAmount: 28.0, // ₹28 dividend per share
        multiplier: 1.0,
        source: 'BSE Announcement',
        sourceTier: 'TIER_1_PRIMARY',
        verificationStatus: 'VERIFIED',
      },
    ];

    const priceMap = new Map<string, number>();
    priceMap.set('2024-05-31', 1400.0); // Prior close was ₹1400

    const trFactor = CorporateActionEngine.computeTotalReturnAdjustmentFactor(actions, '2024-01-15', priceMap);
    // (1400 - 28) / 1400 = 1372 / 1400 = 0.98
    expect(trFactor).toBeCloseTo(0.98, 4);

    const record = CorporateActionEngine.buildPriceRecord({
      symbol: 'INFY',
      exchange: 'NSE',
      sessionDate: '2024-01-15',
      tradeTimestamp: '2024-01-15T15:30:00Z',
      rawPrice: 1500.0,
      open: 1490.0,
      high: 1510.0,
      low: 1485.0,
      close: 1500.0,
      volume: 2500000,
      actions,
      historicalCloseMap: priceMap,
      sourceId: 'NSE_OFFICIAL_FEED',
      captureId: 'cap_tr_1',
    });

    expect(record.rawPrice).toBe(1500.0);
    expect(record.splitAdjustedPrice).toBe(1500.0);
    expect(record.totalReturnPrice).toBe(1470.0); // 1500 * 0.98
  });
});
