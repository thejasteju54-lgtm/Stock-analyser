/**
 * debtCashCircularityAndStatementBridge.test.ts
 * Phase 13 — Debt/Cash Non-Circularity & Accounting Statement Bridge Tests.
 * Verifies that the sequence Opening Debt -> Interest -> PAT -> OCF -> Capex -> FCF -> Repayment -> Closing Debt -> Closing Cash
 * eliminates circular loops, and that ROE/ROCE guards handle negative net worth without crashing.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioCashFlowAndBalanceSheetEngine } from '../../src/domain/scenarios/ScenarioCashFlowAndBalanceSheetEngine';

describe('Phase 13 — Debt/Cash Non-Circularity & Statement Reconciliation', () => {
  it('executes non-circular debt/cash calculation and preserves FCF = OCF - Capex', () => {
    const res = ScenarioCashFlowAndBalanceSheetEngine.calculate({
      ebitda: 1500,
      ebit: 1100,
      pat: 750,
      taxExpense: 250,
      effectiveTaxRatePercent: 25.0,
      workingCapital: {
        receivableDays: 60,
        inventoryDays: 60,
        payableDays: 60,
        cashConversionCycleDays: 60,
        workingCapitalToRevenuePercent: 16.4,
        workingCapitalChange: 100, // INR 100 Cr WC increase
        historicalMedianDays: 60,
        normalizationRationale: 'Verified',
        status: 'VERIFIED',
      },
      capex: {
        classification: 'GROWTH_CAPEX',
        maintenanceCapex: 400,
        growthCapex: 300,
        totalCapex: 700,
        capexToRevenuePercent: 7.0,
        sourceReferences: [],
        confidence: 85,
      },
      openingDebt: 2000,
      openingCash: 500,
      historicalNetWorth: 4000,
      basicSharesCr: 10,
      dilutedSharesCr: 10.2,
      averageBorrowingCostPercent: 8.5,
    });

    // OCF = EBITDA (1500) - Tax (250) - WC Change (100) = 1150
    expect(res.cashFlow.operatingCashFlow).toBe(1150);
    // FCF = OCF (1150) - Capex (700) = 450
    expect(res.cashFlow.freeCashFlow).toBe(450);
    expect(res.cashFlow.cashConversionStatus).toBe('NORMAL');

    // Non-circular debt repayment: 60% of FCF (450 * 0.6 = 270)
    expect(res.debtSchedule.repayment).toBe(270);
    expect(res.debtSchedule.closingDebt).toBe(2000 - 270);
    expect(res.debtSchedule.closingCashBalance).toBe(500 + (450 - 270));
    expect(res.debtSchedule.sequencingMethod).toBe('NON_CIRCULAR_DETERMINISTIC');

    // EPS calculation
    expect(res.eps.basicEps).toBe(75); // 750 / 10
    expect(res.eps.dilutedEps).toBeCloseTo(73.53, 1); // 750 / 10.2
  });

  it('safely flags DISTORTED_NEGATIVE_EQUITY when net worth is negative (preventing inverted ROE)', () => {
    const res = ScenarioCashFlowAndBalanceSheetEngine.calculate({
      ebitda: 500,
      ebit: 200,
      pat: -300,
      taxExpense: 0,
      effectiveTaxRatePercent: 25.0,
      workingCapital: {
        receivableDays: 60,
        inventoryDays: 60,
        payableDays: 60,
        cashConversionCycleDays: 60,
        workingCapitalToRevenuePercent: 16.4,
        workingCapitalChange: 0,
        historicalMedianDays: 60,
        normalizationRationale: 'Verified',
        status: 'VERIFIED',
      },
      capex: {
        classification: 'MAINTENANCE_CAPEX',
        maintenanceCapex: 200,
        growthCapex: 0,
        totalCapex: 200,
        capexToRevenuePercent: 5.0,
        sourceReferences: [],
        confidence: 70,
      },
      openingDebt: 3000,
      openingCash: 100,
      historicalNetWorth: -500, // Negative equity!
      basicSharesCr: 10,
    });

    expect(res.returnMetrics.denominatorDistortionStatus).toBe('DISTORTED_NEGATIVE_EQUITY');
    expect(res.returnMetrics.roePercent).toBeNull();
  });
});
