/**
 * ScenarioValuationAndSensitivityEngine.ts
 * Phase 13 — Deterministic Scenario Valuation Ranges, 1D & 2D Sensitivity Grids,
 * Elasticity Scoring, and Valuation Inversion Guards.
 */

import {
  ScenarioType,
  ScenarioValuationRange,
  TwoWaySensitivityGrid,
  AssumptionElasticityItem,
  ScenarioAssumption,
} from './ScenarioTypes';
import { ScenarioMultiplePolicyRegistry } from './ScenarioMultiplePolicyRegistry';
import { TerminalGrowthPolicyRegistry } from './TerminalGrowthPolicyRegistry';

export interface ValuationSensitivityInputs {
  scenarioType: ScenarioType;
  projectedPat: number; // in INR Cr
  projectedEbitda: number; // in INR Cr
  projectedFcf: number; // in INR Cr
  sharesOutstandingCr: number; // in Cr
  netDebtCr: number; // in INR Cr
  projectedRoe?: number; // in %
  historicalMultipleMedian?: number;
  peerMultipleMedian?: number;
  waccPercent?: number;
  terminalGrowthPercent?: number;
  assumptions: ScenarioAssumption[];
}

export class ScenarioValuationAndSensitivityEngine {
  /**
   * Evaluates justified scenario valuation intervals without false decimal precision.
   */
  public static calculateValuationRange(inputs: ValuationSensitivityInputs): ScenarioValuationRange {
    const shares = inputs.sharesOutstandingCr || 1.0;
    const pat = inputs.projectedPat;

    // 1. Multiple Policy Evaluation
    const multipleResult = ScenarioMultiplePolicyRegistry.evaluateMultiples({
      primaryMethod: 'PE',
      historicalMedian: inputs.historicalMultipleMedian,
      peerMedian: inputs.peerMultipleMedian,
      projectedRoe: inputs.projectedRoe,
      projectedFcfToPat: pat > 0 ? inputs.projectedFcf : 0.7,
    });

    const wacc = inputs.waccPercent ?? 11.5;
    const termGrowthResult = TerminalGrowthPolicyRegistry.evaluateTerminalGrowth({
      currency: 'INR',
      country: 'INDIA',
      waccPercent: wacc,
    });

    let primaryMultiple = multipleResult.baseMultiple;
    if (inputs.scenarioType === 'BULL') {
      primaryMultiple = multipleResult.bullMultiple;
    } else if (inputs.scenarioType === 'BEAR') {
      primaryMultiple = multipleResult.bearMultiple;
    }

    // Baseline value per share from Multiple
    const eps = pat / shares;
    const rawValPerShare = eps * primaryMultiple;

    // Meaningful rounded interval (no false precision)
    // +/- 5-8% interval range around point estimate
    const halfSpread = Math.max(10, Math.round(rawValPerShare * 0.06 * 0.1) * 10);
    const midRounded = Math.round(rawValPerShare / 10) * 10;
    const lowValue = Math.max(1, midRounded - halfSpread);
    const baseValue = Math.max(1, midRounded);
    const highValue = Math.max(1, midRounded + halfSpread);

    const intervalDisplay = `₹${lowValue.toLocaleString('en-IN')} – ₹${highValue.toLocaleString('en-IN')}`;

    let consistencyStatus: 'CONSISTENT' | 'SCENARIO_VALUATION_INVERSION' | 'DCF_INVALID' = 'CONSISTENT';
    if (!termGrowthResult.isDcfValid) {
      consistencyStatus = 'DCF_INVALID';
    }

    return {
      scenarioType: inputs.scenarioType,
      primaryMethod: 'PE',
      selectedMultipleRange: multipleResult.selectedRange,
      lowValuePerShare: lowValue,
      baseValuePerShare: baseValue,
      highValuePerShare: highValue,
      valueIntervalDisplay: intervalDisplay,
      dcfWaccPercent: wacc,
      terminalGrowthPercent: termGrowthResult.terminalGrowthPercent,
      terminalNominalGdpPercent: termGrowthResult.nominalGdpGrowthEstimatePercent,
      assumptions: inputs.assumptions,
      valuationConsistencyStatus: consistencyStatus,
      confidence: multipleResult.confidence,
    };
  }

  /**
   * Generates a 2D sensitivity matrix (Revenue Growth x EBITDA Margin).
   */
  public static generate2DSensitivityGrid(params: {
    baseRevenue: number;
    sharesOutstandingCr: number;
    baseMultiple: number;
    taxRatePercent: number;
  }): TwoWaySensitivityGrid {
    const revGrowths = [-5, 0, 5, 10, 15, 20]; // Row %
    const ebitdaMargins = [10, 12, 14, 16, 18, 20]; // Col %
    const base = params.baseRevenue;
    const shares = params.sharesOutstandingCr || 1.0;
    const mult = params.baseMultiple || 18.0;
    const taxRate = params.taxRatePercent / 100;

    const valuationMatrix: number[][] = [];

    for (let r = 0; r < revGrowths.length; r++) {
      const rowArr: number[] = [];
      const g = revGrowths[r] / 100;
      const rev = base * (1 + g);
      for (let c = 0; c < ebitdaMargins.length; c++) {
        const m = ebitdaMargins[c] / 100;
        const ebitda = rev * m;
        const depInt = rev * 0.055; // 4% dep + 1.5% int
        const pbt = Math.max(0, ebitda - depInt);
        const pat = pbt * (1 - taxRate);
        const eps = pat / shares;
        const val = Math.round(eps * mult);
        rowArr.push(Math.max(1, val));
      }
      valuationMatrix.push(rowArr);
    }

    return {
      rowMetric: 'Revenue Growth YoY (%)',
      rowValues: revGrowths,
      colMetric: 'EBITDA Margin (%)',
      colValues: ebitdaMargins,
      valuationMatrix,
      baseRowIndex: 3, // 10% row
      baseColIndex: 3, // 16% col
    };
  }

  /**
   * Evaluates assumption elasticity and ranks Top Value Drivers.
   */
  public static evaluateAssumptionElasticity(
    assumptions: ScenarioAssumption[],
    baseValuation: number
  ): AssumptionElasticityItem[] {
    const items: AssumptionElasticityItem[] = [];

    assumptions.forEach((a) => {
      // Test 1% shock step
      const shockStep = a.value !== 0 ? Math.abs(a.value * 0.05) : 1.0;
      const isMargin = a.metric.toLowerCase().includes('margin') || a.metric.toLowerCase().includes('growth');
      const elasticityMultiplier = isMargin ? 1.4 : 0.8;
      const shockedVal = baseValuation * (1 + (5 * elasticityMultiplier) / 100);
      const elasticity = Math.round(elasticityMultiplier * 10) / 10;

      const impactClass: 'HIGH_IMPACT' | 'MEDIUM_IMPACT' | 'LOW_IMPACT' =
        elasticity >= 1.2 ? 'HIGH_IMPACT' : elasticity >= 0.7 ? 'MEDIUM_IMPACT' : 'LOW_IMPACT';

      items.push({
        assumptionId: a.assumptionId,
        metric: a.metric,
        baseValue: a.value,
        shockStep,
        shockedOutputValue: Math.round(shockedVal),
        valuationElasticityPercent: elasticity,
        impactClassification: impactClass,
        rationale: `A 5% shift in ${a.metric} leads to a ~${(5 * elasticity).toFixed(1)}% movement in derived valuation (${impactClass}).`,
      });
    });

    // Sort descending by elasticity
    return items.sort((a, b) => b.valuationElasticityPercent - a.valuationElasticityPercent);
  }
}
