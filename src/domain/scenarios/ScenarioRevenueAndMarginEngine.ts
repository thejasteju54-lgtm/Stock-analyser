/**
 * ScenarioRevenueAndMarginEngine.ts
 * Phase 13 — Deterministic Revenue Projections, Multi-Segment Modeling,
 * Cost Breakdown, and Margin Decompositions.
 */

import {
  ScenarioType,
  MarginProjection,
  SegmentProjection,
  RevenueBridgeItem,
} from './ScenarioTypes';
import { RevenueDriverPolicyRegistry, DriverParameters } from './RevenueDriverPolicyRegistry';
import { OperatingLeveragePolicyRegistry, HistoricalFinancialPeriod } from './OperatingLeveragePolicyRegistry';

export interface RevenueMarginInputs {
  scenarioType: ScenarioType;
  baseRevenue: number; // in INR Cr
  historicalEbitdaMargin: number; // in %
  historicalGrossMargin: number; // in %
  historicalPeriods: HistoricalFinancialPeriod[];
  driverParams: DriverParameters;
  segments?: SegmentProjection[];
  rawMaterialInflationPercent?: number;
  employeeCostInflationPercent?: number;
  taxRatePercent?: number;
}

export interface RevenueMarginResult {
  projectedRevenue: number;
  projectedGrossProfit: number;
  projectedEbitda: number;
  projectedEbit: number;
  projectedPbt: number;
  projectedPat: number;
  marginProjection: MarginProjection;
  revenueBridge: RevenueBridgeItem[];
  reconciledSegments: SegmentProjection[];
}

export class ScenarioRevenueAndMarginEngine {
  /**
   * Projects revenue, cost structure, EBITDA, EBIT, and PAT deterministically.
   */
  public static calculateProjections(inputs: RevenueMarginInputs): RevenueMarginResult {
    // 1. Calculate Driver-Derived Revenue
    const revResult = RevenueDriverPolicyRegistry.calculateProjectedRevenue(inputs.driverParams);
    const projectedRev = revResult.projectedRevenue;

    // 2. Build Revenue Bridge
    const revenueBridge: RevenueBridgeItem[] = revResult.driverContributions.map((c) => ({
      driverType: 'VOLUME',
      contributionPercent: c.contributionPercent,
      description: c.description,
      sourceReferences: ['RevenueDriverPolicyRegistry Model Execution'],
    }));

    // 3. Operating Leverage and Margin Evolution
    const leverageResult = OperatingLeveragePolicyRegistry.calculateOperatingLeverage(inputs.historicalPeriods);
    const histEbitdaMargin = inputs.historicalEbitdaMargin || 15.0;
    const histGrossMargin = inputs.historicalGrossMargin || 35.0;

    let ebitdaMargin = histEbitdaMargin;
    let grossMargin = histGrossMargin;

    const rmInf = inputs.rawMaterialInflationPercent ?? 0;
    const empInf = inputs.employeeCostInflationPercent ?? 0;

    if (inputs.scenarioType === 'BULL') {
      // Operating leverage expands margin moderately
      const leverageBonus = Math.min(2.5, (leverageResult.operatingLeverageFactor - 1.0) * 1.2);
      ebitdaMargin = Math.round((histEbitdaMargin + Math.max(0.5, leverageBonus)) * 10) / 10;
      grossMargin = Math.round((histGrossMargin + 0.8) * 10) / 10;
    } else if (inputs.scenarioType === 'BEAR') {
      // Input cost inflation and operating deleverage compress margin
      const compression = Math.max(1.2, (rmInf * 0.4 + empInf * 0.3));
      ebitdaMargin = Math.max(2.0, Math.round((histEbitdaMargin - compression) * 10) / 10);
      grossMargin = Math.max(10.0, Math.round((histGrossMargin - (rmInf * 0.6)) * 10) / 10);
    } else {
      // BASE: Historical baseline with minor operational pass-through
      ebitdaMargin = Math.round(histEbitdaMargin * 10) / 10;
      grossMargin = Math.round(histGrossMargin * 10) / 10;
    }

    const projectedGrossProfit = Math.round(projectedRev * (grossMargin / 100) * 100) / 100;
    const projectedEbitda = Math.round(projectedRev * (ebitdaMargin / 100) * 100) / 100;

    // Depreciation baseline: ~4% of Revenue or historical proportion
    const depRate = 0.04;
    const projectedDep = Math.round(projectedRev * depRate * 100) / 100;
    const projectedEbit = Math.round((projectedEbitda - projectedDep) * 100) / 100;
    const ebitMargin = projectedRev > 0 ? Math.round((projectedEbit / projectedRev) * 1000) / 10 : 0;

    // Interest baseline: estimated ~1.5% of Revenue for typical industrial
    const intRate = 0.015;
    const projectedInterest = Math.round(projectedRev * intRate * 100) / 100;
    const projectedPbt = Math.round((projectedEbit - projectedInterest) * 100) / 100;

    const taxRate = inputs.taxRatePercent ?? 25.0; // Standard 25.17% corporate tax rate in India
    const taxExpense = projectedPbt > 0 ? Math.round(projectedPbt * (taxRate / 100) * 100) / 100 : 0;
    const projectedPat = Math.round((projectedPbt - taxExpense) * 100) / 100;
    const patMargin = projectedRev > 0 ? Math.round((projectedPat / projectedRev) * 1000) / 10 : 0;

    // Cost decomposition
    const rawMatPct = Math.round((100 - grossMargin) * 10) / 10;
    const empPct = Math.round((grossMargin - ebitdaMargin) * 0.45 * 10) / 10;
    const freightEnergyPct = Math.round((grossMargin - ebitdaMargin) * 0.25 * 10) / 10;
    const otherFixedPct = Math.round((grossMargin - ebitdaMargin) * 0.20 * 10) / 10;
    const otherVarPct = Math.round((grossMargin - ebitdaMargin) * 0.10 * 10) / 10;

    const marginProjection: MarginProjection = {
      grossMarginPercent: grossMargin,
      ebitdaMarginPercent: ebitdaMargin,
      ebitMarginPercent: ebitMargin,
      patMarginPercent: patMargin,
      costBreakdown: {
        rawMaterialPercent: rawMatPct,
        employeeCostPercent: empPct,
        energyAndFreightPercent: freightEnergyPct,
        otherFixedCostPercent: otherFixedPct,
        otherVariableCostPercent: otherVarPct,
      },
      operatingLeverageFactor: leverageResult.operatingLeverageFactor,
      incrementalMarginPercent: leverageResult.incrementalMarginPercent,
      confidence: leverageResult.confidence,
    };

    // Reconcile Segments if provided
    let reconciledSegments: SegmentProjection[] = [];
    if (inputs.segments && inputs.segments.length > 0) {
      const totalSegHist = inputs.segments.reduce((sum, s) => sum + s.historicalRevenue, 0);
      reconciledSegments = inputs.segments.map((seg) => {
        const weight = totalSegHist > 0 ? seg.historicalRevenue / totalSegHist : 1 / inputs.segments!.length;
        const segRev = Math.round(projectedRev * weight * 100) / 100;
        const segGrowth = seg.historicalRevenue > 0 ? Math.round(((segRev - seg.historicalRevenue) / seg.historicalRevenue) * 1000) / 10 : 0;
        return {
          ...seg,
          projectedRevenue: segRev,
          projectedGrowthPercent: segGrowth,
          projectedMarginPercent: ebitdaMargin,
        };
      });
    }

    return {
      projectedRevenue: projectedRev,
      projectedGrossProfit,
      projectedEbitda,
      projectedEbit,
      projectedPbt,
      projectedPat,
      marginProjection,
      revenueBridge,
      reconciledSegments,
    };
  }
}
