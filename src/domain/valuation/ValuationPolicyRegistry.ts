/**
 * Phase 9 — Valuation Policy Registry & Enterprise Value Policy
 * Business model specific valuation policies, EV bridges, dynamic weighting, and position threshold evaluations.
 */

import { ValuationMethodId, ValuationPosition } from './ValuationTypes';

export interface ValuationPolicy {
  businessModel: string;
  preferredMethods: ValuationMethodId[];
  secondaryMethods: ValuationMethodId[];
  prohibitedMethods: ValuationMethodId[];
  relevantPeerMetrics: string[];
  requiredAdjustments: string[];
  minimumDataRequirements: string[];
  defaultWeights: Partial<Record<ValuationMethodId, number>>;
}

export interface EnterpriseValuePolicySpec {
  businessModel: string;
  isEvApplicable: boolean;
  evFormulaDescription: string;
  includesLiquidInvestmentsDeduction: boolean;
  includesMinorityInterestAddition: boolean;
  includesPreferredEquityAddition: boolean;
  prohibitionRationale?: string;
}

export const VALUATION_POLICY_REGISTRY: Record<string, ValuationPolicy> = {
  OPERATING_INDUSTRIAL: {
    businessModel: 'OPERATING_INDUSTRIAL',
    preferredMethods: ['PE', 'EV_EBITDA', 'FCFF_DCF', 'FCF_YIELD'],
    secondaryMethods: ['PB', 'EV_SALES', 'PEG'],
    prohibitedMethods: ['NAV'],
    relevantPeerMetrics: ['EV_EBITDA', 'PE', 'ROCE', 'EBITDA_MARGIN'],
    requiredAdjustments: ['Working capital cycle normalization', 'Capex maintenance vs growth split'],
    minimumDataRequirements: ['Audited 3Y Revenue', 'Operating EBITDA', 'Capex', 'Debt'],
    defaultWeights: { FCFF_DCF: 40, EV_EBITDA: 30, PE: 20, FCF_YIELD: 10 },
  },
  BANKING: {
    businessModel: 'BANKING',
    preferredMethods: ['PB', 'PE', 'DIVIDEND_DISCOUNT_MODEL'],
    secondaryMethods: ['DIVIDEND_YIELD'],
    prohibitedMethods: ['EV_EBITDA', 'EV_SALES', 'FCFF_DCF', 'FCF_YIELD'],
    relevantPeerMetrics: ['PB', 'PE', 'ROE', 'ROA', 'NIM', 'GNPA_PERCENT'],
    requiredAdjustments: ['Net NPA deduction from Book Value', 'Standard asset provisioning'],
    minimumDataRequirements: ['Net Worth', 'NIM', 'Gross & Net NPA', 'Capital Adequacy (CRAR)'],
    defaultWeights: { PB: 50, PE: 35, DIVIDEND_DISCOUNT_MODEL: 15 },
  },
  NBFC: {
    businessModel: 'NBFC',
    preferredMethods: ['PB', 'PE', 'DIVIDEND_DISCOUNT_MODEL'],
    secondaryMethods: ['DIVIDEND_YIELD'],
    prohibitedMethods: ['EV_EBITDA', 'EV_SALES', 'FCFF_DCF', 'FCF_YIELD'],
    relevantPeerMetrics: ['PB', 'PE', 'ROE', 'AUM_GROWTH', 'STAGE_3_ASSETS'],
    requiredAdjustments: ['Stage 3 expected credit loss provisioning'],
    minimumDataRequirements: ['AUM', 'Net Worth', 'Cost of Borrowing', 'Credit Cost'],
    defaultWeights: { PB: 45, PE: 40, DIVIDEND_DISCOUNT_MODEL: 15 },
  },
  HOUSING_FINANCE: {
    businessModel: 'HOUSING_FINANCE',
    preferredMethods: ['PB', 'PE'],
    secondaryMethods: ['DIVIDEND_DISCOUNT_MODEL', 'DIVIDEND_YIELD'],
    prohibitedMethods: ['EV_EBITDA', 'EV_SALES', 'FCFF_DCF'],
    relevantPeerMetrics: ['PB', 'PE', 'ROE', 'COLLECTION_EFFICIENCY'],
    requiredAdjustments: ['ECL Stage 3 asset quality adjustments'],
    minimumDataRequirements: ['Loan Book', 'Net Worth', 'Spreads'],
    defaultWeights: { PB: 50, PE: 50 },
  },
  INSURANCE: {
    businessModel: 'INSURANCE',
    preferredMethods: ['PB', 'PE'],
    secondaryMethods: ['DIVIDEND_DISCOUNT_MODEL'],
    prohibitedMethods: ['EV_EBITDA', 'FCFF_DCF', 'FCF_YIELD'],
    relevantPeerMetrics: ['PB', 'VNB_MARGIN', 'EMBEDDED_VALUE_MULTIPLE', 'ROE'],
    requiredAdjustments: ['Embedded Value adjustments', 'Persistency ratio considerations'],
    minimumDataRequirements: ['Net Worth', 'VNB Margin', 'Solvency Ratio'],
    defaultWeights: { PB: 50, PE: 50 },
  },
  REIT_REAL_ESTATE: {
    businessModel: 'REIT_REAL_ESTATE',
    preferredMethods: ['NAV', 'DIVIDEND_YIELD', 'GORDON_GROWTH'],
    secondaryMethods: ['PB', 'DIVIDEND_DISCOUNT_MODEL'],
    prohibitedMethods: ['EV_SALES', 'PE'],
    relevantPeerMetrics: ['NAV_PER_UNIT', 'DISTRIBUTION_YIELD', 'LOAN_TO_VALUE'],
    requiredAdjustments: ['Independent physical asset valuation appraisal', 'WALE lease expiry adjustments'],
    minimumDataRequirements: ['Audited NAV', 'Net Operating Income (NOI)', 'Loan-to-Value (LTV)'],
    defaultWeights: { NAV: 60, DIVIDEND_YIELD: 40 },
  },
  INFRASTRUCTURE_TRUST_INVIT: {
    businessModel: 'INFRASTRUCTURE_TRUST_INVIT',
    preferredMethods: ['NAV', 'DIVIDEND_YIELD', 'FCFF_DCF'],
    secondaryMethods: ['PB'],
    prohibitedMethods: ['PE', 'EV_SALES'],
    relevantPeerMetrics: ['DISTRIBUTION_YIELD', 'NAV', 'CONCESSION_PERIOD_YEARS'],
    requiredAdjustments: ['Concession life amortization', 'Major maintenance capex reserve'],
    minimumDataRequirements: ['Cash available for distribution (NDCF)', 'Concession timeline', 'Project Debt'],
    defaultWeights: { NAV: 50, DIVIDEND_YIELD: 30, FCFF_DCF: 20 },
  },
  UTILITIES: {
    businessModel: 'UTILITIES',
    preferredMethods: ['EV_EBITDA', 'PB', 'DIVIDEND_YIELD', 'FCFF_DCF'],
    secondaryMethods: ['PE'],
    prohibitedMethods: ['EV_SALES'],
    relevantPeerMetrics: ['EV_EBITDA', 'PB', 'REGULATED_EQUITY_ROE', 'DIVIDEND_YIELD'],
    requiredAdjustments: ['Regulated return on equity base verification', 'Tariff order regulatory assets'],
    minimumDataRequirements: ['Regulated Equity', 'Rate Base', 'EBITDA', 'Gross Debt'],
    defaultWeights: { EV_EBITDA: 35, FCFF_DCF: 35, PB: 20, DIVIDEND_YIELD: 10 },
  },
  IT_SERVICES: {
    businessModel: 'IT_SERVICES',
    preferredMethods: ['PE', 'FCFF_DCF', 'FCF_YIELD'],
    secondaryMethods: ['EV_EBITDA', 'PRICE_TO_SALES', 'PEG'],
    prohibitedMethods: ['NAV'],
    relevantPeerMetrics: ['PE', 'FCF_YIELD', 'EBIT_MARGIN', 'ATTRITION_RATE'],
    requiredAdjustments: ['Capitalized software development costs', 'FX volatility adjustments'],
    minimumDataRequirements: ['Revenues by vertical', 'EBIT', 'Free Cash Flow', 'Headcount'],
    defaultWeights: { PE: 40, FCFF_DCF: 35, FCF_YIELD: 25 },
  },
  PHARMACEUTICALS: {
    businessModel: 'PHARMACEUTICALS',
    preferredMethods: ['PE', 'EV_EBITDA', 'FCFF_DCF'],
    secondaryMethods: ['EV_SALES', 'PRICE_TO_SALES', 'FCF_YIELD'],
    prohibitedMethods: ['NAV'],
    relevantPeerMetrics: ['PE', 'EV_EBITDA', 'R_AND_D_TO_SALES', 'US_GENERIC_VS_DOMESTIC_SPLIT'],
    requiredAdjustments: ['R&D expense vs capitalization', 'USFDA compliance remediation provisions'],
    minimumDataRequirements: ['R&D spend', 'EBITDA', 'Net Debt', 'ANDAs/Filings pipeline'],
    defaultWeights: { PE: 40, EV_EBITDA: 30, FCFF_DCF: 30 },
  },
};

// =============================================================================
// ENTERPRISE VALUE POLICY REGISTRY
// =============================================================================

export const ENTERPRISE_VALUE_POLICY_REGISTRY: Record<string, EnterpriseValuePolicySpec> = {
  OPERATING_INDUSTRIAL: {
    businessModel: 'OPERATING_INDUSTRIAL',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + Total Debt + Preferred Equity + Minority Interest - Cash & Equivalents - Liquid Investments',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: true,
    includesPreferredEquityAddition: true,
  },
  BANKING: {
    businessModel: 'BANKING',
    isEvApplicable: false,
    evFormulaDescription: 'EV is prohibited for banks because deposits and borrowing are operational inventory, not debt financing.',
    includesLiquidInvestmentsDeduction: false,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
    prohibitionRationale: 'Operating borrowings cannot be separated from financing liabilities in deposit-taking institutions.',
  },
  NBFC: {
    businessModel: 'NBFC',
    isEvApplicable: false,
    evFormulaDescription: 'EV is prohibited for NBFCs where wholesale borrowings represent raw material for lending operations.',
    includesLiquidInvestmentsDeduction: false,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
    prohibitionRationale: 'Debt is an operational liability representing loan inventory.',
  },
  HOUSING_FINANCE: {
    businessModel: 'HOUSING_FINANCE',
    isEvApplicable: false,
    evFormulaDescription: 'EV is prohibited for HFCs.',
    includesLiquidInvestmentsDeduction: false,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
    prohibitionRationale: 'Lending business model makes debt an operating asset source.',
  },
  INSURANCE: {
    businessModel: 'INSURANCE',
    isEvApplicable: false,
    evFormulaDescription: 'EV is prohibited for Insurance companies.',
    includesLiquidInvestmentsDeduction: false,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
    prohibitionRationale: 'Policyholder float liabilities cannot be treated as standard debt.',
  },
  REIT_REAL_ESTATE: {
    businessModel: 'REIT_REAL_ESTATE',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + Project Level Debt - Cash & Equivalents',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: true,
    includesPreferredEquityAddition: false,
  },
  INFRASTRUCTURE_TRUST_INVIT: {
    businessModel: 'INFRASTRUCTURE_TRUST_INVIT',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + SPV Debt - Cash reserves',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
  },
  UTILITIES: {
    businessModel: 'UTILITIES',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + Long-term & Short-term Debt - Cash',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: true,
    includesPreferredEquityAddition: true,
  },
  IT_SERVICES: {
    businessModel: 'IT_SERVICES',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + Debt - Cash & Liquid Mutual Funds',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: false,
    includesPreferredEquityAddition: false,
  },
  PHARMACEUTICALS: {
    businessModel: 'PHARMACEUTICALS',
    isEvApplicable: true,
    evFormulaDescription: 'Market Cap + Debt - Cash & Bank Balances',
    includesLiquidInvestmentsDeduction: true,
    includesMinorityInterestAddition: true,
    includesPreferredEquityAddition: false,
  },
};

// =============================================================================
// VALUATION WEIGHT POLICY & DETERMINISTIC TRIANGULATION
// =============================================================================

export class ValuationWeightPolicyRegistry {
  /**
   * Deterministically calculates weights for applicable valuation methods
   * based on business model policy, data completeness, assumption intensity, and peer quality.
   */
  public static calculateDynamicWeights(
    businessModel: string,
    applicableMethods: ValuationMethodId[],
    methodDataQuality: Record<ValuationMethodId, 'HIGH' | 'MEDIUM' | 'LOW'>
  ): Record<ValuationMethodId, number> {
    const policy = VALUATION_POLICY_REGISTRY[businessModel] || VALUATION_POLICY_REGISTRY['OPERATING_INDUSTRIAL'];
    const result: Record<string, number> = {};

    let totalRawScore = 0;

    for (const method of applicableMethods) {
      // Prohibited methods receive 0 weight
      if (policy.prohibitedMethods.includes(method)) {
        result[method] = 0;
        continue;
      }

      let baseScore = 0;
      if (policy.preferredMethods.includes(method)) {
        baseScore = 50;
      } else if (policy.secondaryMethods.includes(method)) {
        baseScore = 25;
      } else {
        baseScore = 10;
      }

      // Quality modifier
      const quality = methodDataQuality[method] || 'MEDIUM';
      const qualityMultiplier = quality === 'HIGH' ? 1.2 : quality === 'MEDIUM' ? 1.0 : 0.6;

      const rawScore = baseScore * qualityMultiplier;
      result[method] = rawScore;
      totalRawScore += rawScore;
    }

    // Normalize to 100%
    const normalized: Record<string, number> = {};
    for (const method of applicableMethods) {
      if (totalRawScore > 0 && result[method] > 0) {
        normalized[method] = Math.round((result[method] / totalRawScore) * 100);
      } else {
        normalized[method] = 0;
      }
    }

    return normalized as Record<ValuationMethodId, number>;
  }
}

// =============================================================================
// VALUATION POSITION POLICY
// =============================================================================

export class ValuationPositionPolicy {
  /**
   * Deterministically assigns valuation position based on Current Price vs Intrinsic Base Value.
   * STRICT RULE: The LLM must NEVER assign this position label.
   */
  public static evaluatePosition(currentPrice: number, baseValuePerShare: number | null): ValuationPosition {
    if (baseValuePerShare === null || baseValuePerShare <= 0 || isNaN(baseValuePerShare)) {
      return 'NOT_ASSESSABLE';
    }

    const ratio = currentPrice / baseValuePerShare;
    // Price < 0.75x Base Value -> Deep Discount (MoS > +25%)
    if (ratio < 0.75) {
      return 'DEEP_DISCOUNT';
    }
    // 0.75 <= Price < 0.90x Base Value -> Discount (MoS +10% to +25%)
    if (ratio < 0.90) {
      return 'DISCOUNT';
    }
    // 0.90 <= Price <= 1.10x Base Value -> Around Fair Range (MoS -10% to +10%)
    if (ratio <= 1.10) {
      return 'AROUND_FAIR_RANGE';
    }
    // 1.10 < Price <= 1.30x Base Value -> Premium (MoS -10% to -30%)
    if (ratio <= 1.30) {
      return 'PREMIUM';
    }
    // Price > 1.30x Base Value -> Extreme Premium (MoS < -30%)
    return 'EXTREME_PREMIUM';
  }
}
