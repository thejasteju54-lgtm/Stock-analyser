/**
 * ScenarioCashFlowAndBalanceSheetEngine.ts
 * Phase 13 — Deterministic Cash Flow Modeling (OCF, FCF), Non-Circular Debt/Cash
 * Schedule, Balance Sheet Evolution, Return Ratios (ROE, ROCE), and EPS.
 */

import {
  CashFlowProjection,
  DebtScheduleProjection,
  BalanceSheetProjection,
  ReturnMetricsProjection,
  EPSProjection,
  WorkingCapitalProjection,
  CapexProjection,
} from './ScenarioTypes';

export interface CashFlowBalanceSheetInputs {
  ebitda: number; // in INR Cr
  ebit: number; // in INR Cr
  pat: number; // in INR Cr
  taxExpense: number; // in INR Cr
  effectiveTaxRatePercent: number;
  workingCapital: WorkingCapitalProjection;
  capex: CapexProjection;
  openingDebt: number; // in INR Cr
  openingCash: number; // in INR Cr
  historicalNetWorth: number; // in INR Cr
  basicSharesCr: number; // in Crores
  dilutedSharesCr?: number; // in Crores
  averageBorrowingCostPercent?: number; // e.g. 8.5%
}

export interface CashFlowBalanceSheetResult {
  cashFlow: CashFlowProjection;
  debtSchedule: DebtScheduleProjection;
  balanceSheet: BalanceSheetProjection;
  returnMetrics: ReturnMetricsProjection;
  eps: EPSProjection;
}

export class ScenarioCashFlowAndBalanceSheetEngine {
  /**
   * Deterministically calculates cash flows, debt schedule, balance sheet, and returns
   * using a strict non-circular calculation order:
   * Opening Debt -> Interest -> PAT -> OCF -> Capex -> FCF -> Debt Repayment/Borrowing -> Closing Debt -> Closing Cash.
   */
  public static calculate(inputs: CashFlowBalanceSheetInputs): CashFlowBalanceSheetResult {
    // 1. Operating Cash Flow (OCF)
    // OCF = EBITDA - Cash Taxes - Increase in Working Capital
    const wcChange = inputs.workingCapital.workingCapitalChange || 0;
    const ocf = Math.round((inputs.ebitda - inputs.taxExpense - wcChange) * 100) / 100;

    // 2. Free Cash Flow (FCF)
    // FCF = OCF - Total Capex
    const capexTotal = inputs.capex.totalCapex || 0;
    const fcf = Math.round((ocf - capexTotal) * 100) / 100;

    // Cash conversion diagnostics
    const ocfEbitda = inputs.ebitda > 0 ? Math.round((ocf / inputs.ebitda) * 100) / 100 : 0;
    const ocfPat = inputs.pat > 0 ? Math.round((ocf / inputs.pat) * 100) / 100 : 0;
    const fcfPat = inputs.pat > 0 ? Math.round((fcf / inputs.pat) * 100) / 100 : 0;

    const conversionStatus: 'STRONG' | 'NORMAL' | 'WEAK' =
      fcfPat >= 0.70 && ocfEbitda >= 0.65 ? 'STRONG' : fcfPat >= 0.35 ? 'NORMAL' : 'WEAK';

    const cashFlow: CashFlowProjection = {
      ebitda: inputs.ebitda,
      ebit: inputs.ebit,
      taxExpense: inputs.taxExpense,
      effectiveTaxRatePercent: inputs.effectiveTaxRatePercent,
      workingCapitalChange: wcChange,
      operatingCashFlow: ocf,
      capex: capexTotal,
      freeCashFlow: fcf,
      cashConversionStatus: conversionStatus,
      ocfToEbitdaRatio: ocfEbitda,
      ocfToPatRatio: ocfPat,
      fcfToPatRatio: fcfPat,
    };

    // 3. Non-Circular Debt Schedule Sequencing
    const borrowingCost = inputs.averageBorrowingCostPercent ?? 8.5;
    const interestExpense = Math.round(inputs.openingDebt * (borrowingCost / 100) * 100) / 100;

    let newBorrowing = 0;
    let repayment = 0;
    let closingCash = inputs.openingCash;

    if (fcf > 0) {
      // Allocate positive FCF: 60% to debt repayment, 40% to cash accumulation
      repayment = Math.min(inputs.openingDebt, Math.round(fcf * 0.6 * 100) / 100);
      closingCash = Math.round((inputs.openingCash + (fcf - repayment)) * 100) / 100;
    } else {
      // Negative FCF (cash burn): draw down cash first, borrow remainder
      const cashDeficit = Math.abs(fcf);
      const cashBuffer = Math.max(0, inputs.openingCash - 50); // Preserve 50 Cr operational cash buffer
      const cashDrawn = Math.min(cashBuffer, cashDeficit);
      closingCash = Math.round((inputs.openingCash - cashDrawn) * 100) / 100;
      newBorrowing = Math.round((cashDeficit - cashDrawn) * 100) / 100;
    }

    const closingDebt = Math.round((inputs.openingDebt + newBorrowing - repayment) * 100) / 100;
    const netDebt = Math.round((closingDebt - closingCash) * 100) / 100;
    const intCoverage = interestExpense > 0 ? Math.round((inputs.ebit / interestExpense) * 10) / 10 : 99.9;

    const debtSchedule: DebtScheduleProjection = {
      openingDebt: inputs.openingDebt,
      newBorrowing,
      repayment,
      closingDebt,
      interestExpense,
      averageBorrowingCostPercent: borrowingCost,
      closingCashBalance: closingCash,
      netDebt,
      interestCoverageRatio: intCoverage,
      sequencingMethod: 'NON_CIRCULAR_DETERMINISTIC',
    };

    // 4. Balance Sheet & Invested Capital
    // Closing Net Worth = Historical Net Worth + Retained Earnings (PAT * 0.85 assuming 15% dividend payout)
    const retainedEarnings = Math.round(inputs.pat * 0.85 * 100) / 100;
    const closingNetWorth = Math.round((inputs.historicalNetWorth + retainedEarnings) * 100) / 100;
    const netWorkingCapital = Math.round(inputs.workingCapital.workingCapitalChange + (inputs.historicalNetWorth * 0.2) * 100) / 100;
    const netFixedAssets = Math.round((inputs.historicalNetWorth * 0.8 + capexTotal) * 100) / 100;
    const investedCapital = Math.max(1, Math.round((closingNetWorth + netDebt) * 100) / 100);

    const basicShares = inputs.basicSharesCr || 1.0;
    const dilutedShares = inputs.dilutedSharesCr || basicShares * 1.02;

    const balanceSheet: BalanceSheetProjection = {
      investedCapital,
      netWorkingCapital,
      netFixedAssets,
      netDebt,
      netWorth: closingNetWorth,
      sharesOutstanding: basicShares,
      dilutedSharesOutstanding: dilutedShares,
    };

    // 5. Return Metrics (ROE, ROCE) with Denominator Distortion Guards
    let roe: number | null = null;
    let roce: number | null = null;
    let roic: number | null = null;
    let distortionStatus: 'NORMAL' | 'DISTORTED_NEGATIVE_EQUITY' | 'NOT_ASSESSABLE' = 'NORMAL';

    if (closingNetWorth <= 0) {
      distortionStatus = 'DISTORTED_NEGATIVE_EQUITY';
      roe = null; // Denominator distortion
    } else {
      roe = Math.round((inputs.pat / closingNetWorth) * 1000) / 10;
    }

    if (investedCapital <= 0) {
      roce = null;
      roic = null;
    } else {
      roce = Math.round((inputs.ebit / investedCapital) * 1000) / 10;
      const nopat = inputs.ebit * (1 - inputs.effectiveTaxRatePercent / 100);
      roic = Math.round((nopat / investedCapital) * 1000) / 10;
    }

    const returnMetrics: ReturnMetricsProjection = {
      roePercent: roe,
      rocePercent: roce,
      roicPercent: roic,
      denominatorDistortionStatus: distortionStatus,
    };

    // 6. EPS Projection
    const basicEps = basicShares > 0 ? Math.round((inputs.pat / basicShares) * 100) / 100 : 0;
    const dilutedEps = dilutedShares > 0 ? Math.round((inputs.pat / dilutedShares) * 100) / 100 : 0;
    const dilutionEffect = basicEps > 0 ? Math.round(((basicEps - dilutedEps) / basicEps) * 1000) / 10 : 0;

    const eps: EPSProjection = {
      pat: inputs.pat,
      basicShares,
      dilutedShares,
      dilutionEffectPercent: dilutionEffect,
      basicEps,
      dilutedEps,
    };

    return {
      cashFlow,
      debtSchedule,
      balanceSheet,
      returnMetrics,
      eps,
    };
  }
}
