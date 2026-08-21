/**
 * businessModelRevenueDrivers.test.ts
 * Phase 13 — Business-Model-Aware Revenue Driver Policies Tests.
 * Verifies driver formulations for Manufacturing, Banking, NBFC, IT, SaaS, Consumer, and Infrastructure.
 */

import { describe, it, expect } from 'vitest';
import { RevenueDriverPolicyRegistry } from '../../src/domain/scenarios/RevenueDriverPolicyRegistry';

describe('Phase 13 — Business-Model-Aware Revenue Driver Equations', () => {
  it('correctly calculates Manufacturing revenue (Volume x Price x Market Share)', () => {
    const res = RevenueDriverPolicyRegistry.calculateProjectedRevenue({
      modelType: 'MANUFACTURING_VOLUME_REALIZATION',
      baseRevenue: 10000, // INR Cr
      industryVolumeGrowthPercent: 8,
      realizationGrowthPercent: 4,
      marketSharePercent: 100, // Constant share
    });

    expect(res.isAssessable).toBe(true);
    expect(res.projectedRevenue).toBeCloseTo(10000 * 1.08 * 1.04, 0);
    expect(res.growthPercent).toBeGreaterThan(12);
    expect(res.driverContributions.length).toBe(2);
  });

  it('correctly calculates Banking revenue (Loan Book Growth + Fees)', () => {
    const res = RevenueDriverPolicyRegistry.calculateProjectedRevenue({
      modelType: 'BANK_LOANBOOK_SPREAD',
      baseRevenue: 20000,
      loanBookGrowthPercent: 15,
      feeIncomeGrowthPercent: 18,
    });

    expect(res.isAssessable).toBe(true);
    expect(res.projectedRevenue).toBeGreaterThan(20000);
    expect(res.formula).toContain('LoanGrowth');
  });

  it('correctly calculates IT Services revenue (Headcount x Utilization x Billing Rate)', () => {
    const res = RevenueDriverPolicyRegistry.calculateProjectedRevenue({
      modelType: 'IT_HEADCOUNT_UTILIZATION',
      baseRevenue: 5000,
      headcountGrowthPercent: 10,
      utilizationRatePercent: 84, // 84% vs 80% baseline
      billingRateGrowthPercent: 3,
    });

    expect(res.isAssessable).toBe(true);
    expect(res.projectedRevenue).toBeGreaterThan(5000 * 1.1);
  });

  it('correctly calculates SaaS revenue (Customers x ARPU - Churn)', () => {
    const res = RevenueDriverPolicyRegistry.calculateProjectedRevenue({
      modelType: 'SAAS_SUBSCRIBER_ARPU',
      baseRevenue: 1000,
      customerGrowthPercent: 25,
      churnRatePercent: 5,
      arpuGrowthPercent: 8,
    });

    expect(res.isAssessable).toBe(true);
    expect(res.projectedRevenue).toBeCloseTo(1000 * 1.20 * 1.08, 0);
  });

  it('returns isAssessable: false when base revenue is <= 0', () => {
    const res = RevenueDriverPolicyRegistry.calculateProjectedRevenue({
      modelType: 'MANUFACTURING_VOLUME_REALIZATION',
      baseRevenue: 0,
    });

    expect(res.isAssessable).toBe(false);
    expect(res.projectedRevenue).toBe(0);
  });
});
