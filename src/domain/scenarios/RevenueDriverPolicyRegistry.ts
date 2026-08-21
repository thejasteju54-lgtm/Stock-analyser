/**
 * RevenueDriverPolicyRegistry.ts
 * Phase 13 — Deterministic Sector & Business-Model Specific Revenue Drivers,
 * Multi-Segment Bridges, and Sum Reconciliation.
 */

import { SegmentProjection } from './ScenarioTypes';

export type RevenueDriverModelType =
  | 'MANUFACTURING_VOLUME_REALIZATION'
  | 'BANK_LOANBOOK_SPREAD'
  | 'NBFC_AUM_SPREAD'
  | 'IT_HEADCOUNT_UTILIZATION'
  | 'SAAS_SUBSCRIBER_ARPU'
  | 'CONSUMER_VOLUME_DISTRIBUTION'
  | 'INFRASTRUCTURE_ORDERBOOK_BURNRATE'
  | 'GENERAL_GROWTH_MODEL';

export interface DriverParameters {
  modelType: RevenueDriverModelType;
  baseRevenue: number; // in INR Cr
  // Manufacturing
  industryVolumeGrowthPercent?: number;
  marketSharePercent?: number;
  realizationGrowthPercent?: number;
  // Banks
  loanBookGrowthPercent?: number;
  netInterestSpreadPercent?: number;
  feeIncomeGrowthPercent?: number;
  // NBFC
  aumGrowthPercent?: number;
  spreadPercent?: number;
  // IT
  headcountGrowthPercent?: number;
  utilizationRatePercent?: number;
  billingRateGrowthPercent?: number;
  // SaaS
  customerGrowthPercent?: number;
  churnRatePercent?: number;
  arpuGrowthPercent?: number;
  netExpansionPercent?: number;
  // Consumer
  volumeGrowthPercent?: number;
  priceGrowthPercent?: number;
  distributionExpansionPercent?: number;
  // Infra
  openingOrderBook?: number;
  executionBurnRatePercent?: number;
  orderInflows?: number;
  inYearExecutionPercent?: number;
  // Fallback
  generalGrowthRatePercent?: number;
}

export interface DriverDerivedRevenueResult {
  projectedRevenue: number; // in INR Cr
  growthPercent: number;
  modelType: RevenueDriverModelType;
  driverContributions: Array<{ driver: string; contributionPercent: number; description: string }>;
  formula: string;
  isAssessable: boolean;
}

export class RevenueDriverPolicyRegistry {
  /**
   * Selects the canonical revenue driver model for a business model archetype.
   */
  public static resolveDriverModel(archetype: string): RevenueDriverModelType {
    const arch = (archetype || '').toUpperCase();
    if (arch.includes('MANUFACTURING') || arch.includes('AUTO') || arch.includes('INDUSTRIAL') || arch.includes('CHEMICAL')) {
      return 'MANUFACTURING_VOLUME_REALIZATION';
    }
    if (arch.includes('BANK') || arch.includes('LENDING_FINANCIAL')) {
      return 'BANK_LOANBOOK_SPREAD';
    }
    if (arch.includes('NBFC') || arch.includes('FINANCIAL_SERVICE') || arch.includes('ASSET_MANAGEMENT')) {
      return 'NBFC_AUM_SPREAD';
    }
    if (arch.includes('IT') || arch.includes('TECH_SERVICES') || arch.includes('CONSULTING')) {
      return 'IT_HEADCOUNT_UTILIZATION';
    }
    if (arch.includes('SAAS') || arch.includes('PLATFORM') || arch.includes('SUBSCRIPTION')) {
      return 'SAAS_SUBSCRIBER_ARPU';
    }
    if (arch.includes('CONSUMER') || arch.includes('FMCG') || arch.includes('RETAIL')) {
      return 'CONSUMER_VOLUME_DISTRIBUTION';
    }
    if (arch.includes('INFRA') || arch.includes('CONSTRUCTION') || arch.includes('CAPITAL_GOODS')) {
      return 'INFRASTRUCTURE_ORDERBOOK_BURNRATE';
    }
    return 'GENERAL_GROWTH_MODEL';
  }

  /**
   * Evaluates projected revenue deterministically according to the driver model.
   */
  public static calculateProjectedRevenue(params: DriverParameters): DriverDerivedRevenueResult {
    const base = params.baseRevenue;
    if (base <= 0 || isNaN(base)) {
      return {
        projectedRevenue: 0,
        growthPercent: 0,
        modelType: params.modelType,
        driverContributions: [],
        formula: 'REVENUE_NOT_ASSESSABLE: Base revenue <= 0',
        isAssessable: false,
      };
    }

    switch (params.modelType) {
      case 'MANUFACTURING_VOLUME_REALIZATION': {
        const indVol = (params.industryVolumeGrowthPercent ?? 0) / 100;
        const real = (params.realizationGrowthPercent ?? 0) / 100;
        const shareFactor = params.marketSharePercent ? params.marketSharePercent / 100 : 1.0;
        // Rev(t+1) = Rev(t) * (1 + IndVol) * (1 + Realization) * (ShareFactor)
        const mult = (1 + indVol) * (1 + real) * (shareFactor !== 1.0 ? shareFactor : 1.0);
        const projected = Math.round(base * mult * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Industry Volume', contributionPercent: Math.round(indVol * 1000) / 10, description: 'Sector unit volume growth' },
            { driver: 'Realization / Price', contributionPercent: Math.round(real * 1000) / 10, description: 'Average selling price/mix adjustment' },
          ],
          formula: `Revenue = Base * (1 + ${indVol.toFixed(3)}) * (1 + ${real.toFixed(3)})`,
          isAssessable: true,
        };
      }

      case 'BANK_LOANBOOK_SPREAD': {
        const loanGrowth = (params.loanBookGrowthPercent ?? 0) / 100;
        const feeGrowth = (params.feeIncomeGrowthPercent ?? loanGrowth * 100) / 100;
        const projected = Math.round(base * (1 + loanGrowth * 0.8 + feeGrowth * 0.2) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Loan Book Growth', contributionPercent: Math.round(loanGrowth * 1000) / 10, description: 'Advances expansion' },
            { driver: 'Fee Income Growth', contributionPercent: Math.round(feeGrowth * 1000) / 10, description: 'Non-interest fee accretion' },
          ],
          formula: `Revenue = Base * (1 + 0.8*LoanGrowth + 0.2*FeeGrowth)`,
          isAssessable: true,
        };
      }

      case 'NBFC_AUM_SPREAD': {
        const aumGrowth = (params.aumGrowthPercent ?? 0) / 100;
        const projected = Math.round(base * (1 + aumGrowth) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'AUM Growth', contributionPercent: Math.round(aumGrowth * 1000) / 10, description: 'Assets under management expansion' },
          ],
          formula: `Revenue = Base * (1 + AumGrowth)`,
          isAssessable: true,
        };
      }

      case 'IT_HEADCOUNT_UTILIZATION': {
        const hcGrowth = (params.headcountGrowthPercent ?? 0) / 100;
        const utilFactor = params.utilizationRatePercent ? params.utilizationRatePercent / 80 : 1.0;
        const billRateGrowth = (params.billingRateGrowthPercent ?? 0) / 100;
        const projected = Math.round(base * (1 + hcGrowth) * utilFactor * (1 + billRateGrowth) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Billable Headcount', contributionPercent: Math.round(hcGrowth * 1000) / 10, description: 'Direct software engineer hiring' },
            { driver: 'Billing Rate / Pricing', contributionPercent: Math.round(billRateGrowth * 1000) / 10, description: 'Blended hourly rate shift' },
          ],
          formula: `Revenue = Base * (1 + HeadcountGrowth) * (Utilization / 80) * (1 + BillingRateGrowth)`,
          isAssessable: true,
        };
      }

      case 'SAAS_SUBSCRIBER_ARPU': {
        const custGrowth = (params.customerGrowthPercent ?? 0) / 100;
        const churn = (params.churnRatePercent ?? 0) / 100;
        const arpuGrowth = (params.arpuGrowthPercent ?? 0) / 100;
        const netCust = Math.max(0, 1 + custGrowth - churn);
        const projected = Math.round(base * netCust * (1 + arpuGrowth) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Net Customer Growth', contributionPercent: Math.round((custGrowth - churn) * 1000) / 10, description: 'Customer additions less churn' },
            { driver: 'ARPU Expansion', contributionPercent: Math.round(arpuGrowth * 1000) / 10, description: 'Average revenue per user uplift' },
          ],
          formula: `Revenue = Base * (1 + CustGrowth - Churn) * (1 + ArpuGrowth)`,
          isAssessable: true,
        };
      }

      case 'CONSUMER_VOLUME_DISTRIBUTION': {
        const volGrowth = (params.volumeGrowthPercent ?? 0) / 100;
        const priceGrowth = (params.priceGrowthPercent ?? 0) / 100;
        const distGrowth = (params.distributionExpansionPercent ?? 0) / 100;
        const projected = Math.round(base * (1 + volGrowth) * (1 + priceGrowth) * (1 + distGrowth * 0.5) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Volume Growth', contributionPercent: Math.round(volGrowth * 1000) / 10, description: 'Organic off-take unit growth' },
            { driver: 'Price / Mix Growth', contributionPercent: Math.round(priceGrowth * 1000) / 10, description: 'Realization & premiumization' },
          ],
          formula: `Revenue = Base * (1 + Vol) * (1 + Price) * (1 + 0.5*Dist)`,
          isAssessable: true,
        };
      }

      case 'INFRASTRUCTURE_ORDERBOOK_BURNRATE': {
        const ob = params.openingOrderBook ?? base * 2.5;
        const burn = (params.executionBurnRatePercent ?? 30) / 100;
        const inflows = params.orderInflows ?? base * 0.8;
        const inYearBurn = (params.inYearExecutionPercent ?? 15) / 100;
        const projected = Math.round((ob * burn + inflows * inYearBurn) * 100) / 100;
        const growth = Math.round(((projected - base) / base) * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: params.modelType,
          driverContributions: [
            { driver: 'Order Book Execution', contributionPercent: Math.round(((ob * burn) / projected) * 1000) / 10, description: 'Backlog conversion' },
            { driver: 'In-Year Inflow Execution', contributionPercent: Math.round(((inflows * inYearBurn) / projected) * 1000) / 10, description: 'New contract execution' },
          ],
          formula: `Revenue = (OrderBook * ${burn.toFixed(2)}) + (Inflows * ${inYearBurn.toFixed(2)})`,
          isAssessable: true,
        };
      }

      case 'GENERAL_GROWTH_MODEL':
      default: {
        const g = (params.generalGrowthRatePercent ?? 10) / 100;
        const projected = Math.round(base * (1 + g) * 100) / 100;
        const growth = Math.round(g * 1000) / 10;
        return {
          projectedRevenue: projected,
          growthPercent: growth,
          modelType: 'GENERAL_GROWTH_MODEL',
          driverContributions: [
            { driver: 'Baseline Revenue Growth', contributionPercent: growth, description: 'Model-derived revenue trajectory' },
          ],
          formula: `Revenue = Base * (1 + ${g.toFixed(3)})`,
          isAssessable: true,
        };
      }
    }
  }

  /**
   * Reconciles multiple segments against consolidated projected revenue.
   * If variance > 0.5%, triggers SCENARIO_INCONSISTENCY.
   */
  public static reconcileSegments(
    segments: SegmentProjection[],
    consolidatedRevenue: number
  ): { isReconciled: boolean; sumOfSegments: number; variancePercent: number; statusMessage: string } {
    if (!segments || segments.length === 0) {
      return {
        isReconciled: true,
        sumOfSegments: consolidatedRevenue,
        variancePercent: 0,
        statusMessage: 'SINGLE_SEGMENT: No separate segment breakdown required.',
      };
    }

    const sumOfSegments = segments.reduce((sum, s) => sum + s.projectedRevenue, 0);
    const diff = Math.abs(sumOfSegments - consolidatedRevenue);
    const variancePercent = consolidatedRevenue > 0 ? (diff / consolidatedRevenue) * 100 : 0;

    if (variancePercent <= 0.5) {
      return {
        isReconciled: true,
        sumOfSegments: Math.round(sumOfSegments * 100) / 100,
        variancePercent: Math.round(variancePercent * 100) / 100,
        statusMessage: 'RECONCILED: Segment sum matches consolidated revenue within 0.5% tolerance.',
      };
    }

    return {
      isReconciled: false,
      sumOfSegments: Math.round(sumOfSegments * 100) / 100,
      variancePercent: Math.round(variancePercent * 100) / 100,
      statusMessage: `SCENARIO_INCONSISTENCY: Segment sum (INR ${sumOfSegments.toFixed(2)} Cr) differs from Consolidated Revenue (INR ${consolidatedRevenue.toFixed(2)} Cr) by ${variancePercent.toFixed(2)}%.`,
    };
  }
}
