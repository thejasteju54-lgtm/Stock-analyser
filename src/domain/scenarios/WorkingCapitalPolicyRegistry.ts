/**
 * WorkingCapitalPolicyRegistry.ts
 * Phase 13 — Deterministic Working Capital Lookback, Median vs Mean,
 * IQR Outlier Filtering, and Structural Shift Detection.
 */

import { WorkingCapitalProjection } from './ScenarioTypes';

export interface HistoricalWorkingCapitalObservation {
  period: string; // e.g. "FY22", "FY23", "FY24"
  receivableDays: number;
  inventoryDays: number;
  payableDays: number;
  revenue: number;
}

export class WorkingCapitalPolicyRegistry {
  /**
   * Calculates median of an array of numbers.
   */
  public static calculateMedian(values: number[]): number {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Filters outliers using standard 1.5 * IQR bounds.
   */
  public static filterIqrOutliers(values: number[]): number[] {
    if (values.length < 4) return values;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor((sorted.length * 3) / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const filtered = sorted.filter((v) => v >= lowerBound && v <= upperBound);
    return filtered.length > 0 ? filtered : sorted;
  }

  /**
   * Evaluates deterministic working capital projection based on historical observations.
   * Prohibits arbitrary optimistic assumptions without evidence.
   */
  public static evaluateWorkingCapital(
    observations: HistoricalWorkingCapitalObservation[],
    projectedRevenue: number,
    scenarioType: 'BASE' | 'BULL' | 'BEAR'
  ): WorkingCapitalProjection {
    if (!observations || observations.length === 0) {
      return {
        receivableDays: 60,
        inventoryDays: 60,
        payableDays: 60,
        cashConversionCycleDays: 60,
        workingCapitalToRevenuePercent: 16.4,
        workingCapitalChange: 0,
        historicalMedianDays: 60,
        normalizationRationale: 'NOT_ASSESSABLE: No verified historical working capital observations available. Standard sector defaults applied with unquantified status.',
        status: 'NOT_ASSESSABLE',
      };
    }

    const recDaysList = this.filterIqrOutliers(observations.map((o) => o.receivableDays));
    const invDaysList = this.filterIqrOutliers(observations.map((o) => o.inventoryDays));
    const payDaysList = this.filterIqrOutliers(observations.map((o) => o.payableDays));

    const medRec = Math.round(this.calculateMedian(recDaysList));
    const medInv = Math.round(this.calculateMedian(invDaysList));
    const medPay = Math.round(this.calculateMedian(payDaysList));

    let recDays = medRec;
    let invDays = medInv;
    let payDays = medPay;

    // Detect structural shift in latest period (e.g. receivables lengthened by > 25%)
    const latest = observations[observations.length - 1];
    let structuralShiftWarning = '';
    if (latest.receivableDays > medRec * 1.25) {
      structuralShiftWarning = ` Structural lengthening detected in latest period (${latest.receivableDays}d vs ${medRec}d median).`;
      recDays = Math.round(medRec * 0.4 + latest.receivableDays * 0.6); // Weight recent deterioration
    }

    // Scenario differentiation
    if (scenarioType === 'BULL') {
      // Modest operational efficiency: 3-5% tightening max, never magical zeroing
      recDays = Math.max(15, Math.round(recDays * 0.96));
      invDays = Math.max(15, Math.round(invDays * 0.96));
      payDays = Math.round(payDays * 1.02);
    } else if (scenarioType === 'BEAR') {
      // Working capital friction: receivables and inventory extend by 8-12%
      recDays = Math.round(recDays * 1.1);
      invDays = Math.round(invDays * 1.1);
      payDays = Math.max(10, Math.round(payDays * 0.95));
    }

    const ccc = recDays + invDays - payDays;
    const wcToRevPct = Math.round((ccc / 365) * 1000) / 10;
    const projectedWc = Math.round(projectedRevenue * (wcToRevPct / 100) * 100) / 100;
    const latestRevenue = latest.revenue || projectedRevenue;
    const historicalWc = Math.round(latestRevenue * ((medRec + medInv - medPay) / 365) * 100) / 100;
    const wcChange = Math.round((projectedWc - historicalWc) * 100) / 100;

    return {
      receivableDays: recDays,
      inventoryDays: invDays,
      payableDays: payDays,
      cashConversionCycleDays: ccc,
      workingCapitalToRevenuePercent: wcToRevPct,
      workingCapitalChange: wcChange,
      historicalMedianDays: medRec + medInv - medPay,
      normalizationRationale: `Working capital derived from ${observations.length}-period historical median (DSO: ${medRec}d, DIO: ${medInv}d, DPO: ${medPay}d). CCC = ${ccc} days (${wcToRevPct}% of Revenue).${structuralShiftWarning}`,
      status: 'VERIFIED',
    };
  }
}
