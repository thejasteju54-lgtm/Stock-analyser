/**
 * 14_shareholdingMultiTierReconciliation.test.ts
 * Phase 16 — Shareholding Multi-Tier Reconciliation Policy Verification.
 */

import { describe, it, expect } from 'vitest';
import { ShareholdingDataAdapter } from '../../../src/domain/dataSources/ShareholdingDataAdapter';

describe('Shareholding Multi-Tier Reconciliation (Phase 16)', () => {
  const adapter = new ShareholdingDataAdapter();

  it('classifies exact 100.0% sum as RECONCILED', () => {
    const raw = {
      recordId: 'sh_test_1',
      companyId: 'comp_tml',
      quarterEnd: '2024-03-31',
      filingDate: '2024-04-14',
      promoterHoldingPercent: 46.36,
      promoterPledgePercentOfPromoterHolding: 0.0,
      fiiHoldingPercent: 19.20,
      diiHoldingPercent: 15.42,
      publicRetailHoldingPercent: 18.52,
      otherHoldingPercent: 0.50,
    };

    const res = adapter.reconcileShareholding(raw, 'hash_1');
    expect(res.reconciliationStatus).toBe('RECONCILED');
    expect(res.totalOwnershipSumPercent).toBe(100.0);
    expect(res.reconciliationVariancePercent).toBe(0.0);
  });

  it('classifies small rounding discrepancy (99.8%) as MINOR_ROUNDING_VARIANCE', () => {
    const raw = {
      recordId: 'sh_test_2',
      companyId: 'comp_tml',
      quarterEnd: '2024-03-31',
      filingDate: '2024-04-14',
      promoterHoldingPercent: 46.36,
      promoterPledgePercentOfPromoterHolding: 0.0,
      fiiHoldingPercent: 19.10,
      diiHoldingPercent: 15.42,
      publicRetailHoldingPercent: 18.42,
      otherHoldingPercent: 0.50, // Sum = 99.80%
    };

    const res = adapter.reconcileShareholding(raw, 'hash_2');
    expect(res.reconciliationStatus).toBe('MINOR_ROUNDING_VARIANCE');
    expect(res.totalOwnershipSumPercent).toBe(99.8);
  });

  it('classifies large discrepancy (>1.0%) as MATERIAL_CONFLICT', () => {
    const raw = {
      recordId: 'sh_test_3',
      companyId: 'comp_tml',
      quarterEnd: '2024-03-31',
      filingDate: '2024-04-14',
      promoterHoldingPercent: 40.0,
      promoterPledgePercentOfPromoterHolding: 0.0,
      fiiHoldingPercent: 10.0,
      diiHoldingPercent: 10.0,
      publicRetailHoldingPercent: 10.0,
      otherHoldingPercent: 0.0, // Sum = 70%
    };

    const res = adapter.reconcileShareholding(raw, 'hash_3');
    expect(res.reconciliationStatus).toBe('MATERIAL_CONFLICT');
  });
});
