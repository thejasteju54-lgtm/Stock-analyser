import { BusinessModelScoringPolicy } from './FundamentalHealthTypes';

export class HealthScoringPolicyRegistry {
  private static policies: Map<string, BusinessModelScoringPolicy> = new Map([
    // =========================================================================
    // 1. OPERATING INDUSTRIAL / MANUFACTURING
    // =========================================================================
    [
      'OPERATING_INDUSTRIAL',
      {
        businessModelCode: 'OPERATING_INDUSTRIAL',
        policyName: 'Operating Industrial / Manufacturing Health Policy',
        applicableCategories: [
          'GROWTH',
          'MARGINS',
          'CASH_FLOW_QUALITY',
          'LEVERAGE',
          'RETURNS',
          'WORKING_CAPITAL',
          'GROWTH', // duplicate check safe
        ],
        categoryWeights: {
          GROWTH: 15,
          MARGINS: 15,
          CASH_FLOW_QUALITY: 20,
          LEVERAGE: 15,
          RETURNS: 15,
          WORKING_CAPITAL: 10,
        },
        applicableMetrics: [
          'REVENUE_GROWTH',
          'EBITDA_GROWTH',
          'PAT_GROWTH',
          'EBITDA_MARGIN',
          'EBIT_MARGIN',
          'PAT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'NET_DEBT_TO_EBITDA',
          'INTEREST_COVERAGE',
          'ROE',
          'ROCE',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        excludedMetrics: [],
        scoringRulesSummary: 'Balanced evaluation across operating profitability, cash flow conversion, industrial solvency, and manufacturing working capital cycle.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 2. COMMERCIAL & RETAIL BANKING
    // =========================================================================
    [
      'BANKING',
      {
        businessModelCode: 'BANKING',
        policyName: 'Commercial & Retail Banking Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          GROWTH: 25,
          MARGINS: 25,
          LEVERAGE: 25,
          RETURNS: 25,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'EPS_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: [
          'EBITDA_GROWTH',
          'EBITDA_MARGIN',
          'EBIT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'NET_DEBT_TO_EBITDA',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        scoringRulesSummary: 'Lending institution health policy: Excludes non-financial working capital and operating cash flow metrics. Focuses on income growth, net margins, equity capital base, and ROE.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 3. NON-BANKING FINANCIAL COMPANY (NBFC)
    // =========================================================================
    [
      'NBFC',
      {
        businessModelCode: 'NBFC',
        policyName: 'Non-Banking Financial Company (NBFC) Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          GROWTH: 25,
          MARGINS: 25,
          LEVERAGE: 25,
          RETURNS: 25,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'EPS_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: [
          'EBITDA_GROWTH',
          'EBITDA_MARGIN',
          'EBIT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'NET_DEBT_TO_EBITDA',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        scoringRulesSummary: 'NBFC lending policy: Gated against manufacturing working capital and operating debt/EBITDA ratios.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 4. HOUSING FINANCE COMPANY (HFC)
    // =========================================================================
    [
      'HFC',
      {
        businessModelCode: 'HFC',
        policyName: 'Housing Finance Company Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          GROWTH: 25,
          MARGINS: 25,
          LEVERAGE: 25,
          RETURNS: 25,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: [
          'EBITDA_GROWTH',
          'EBITDA_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'NET_DEBT_TO_EBITDA',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        scoringRulesSummary: 'HFC mortgage lending policy.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 5. MICROFINANCE INSTITUTION (MFI)
    // =========================================================================
    [
      'MICROFINANCE',
      {
        businessModelCode: 'MICROFINANCE',
        policyName: 'Microfinance Institution Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          GROWTH: 25,
          MARGINS: 25,
          LEVERAGE: 25,
          RETURNS: 25,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: [
          'EBITDA_GROWTH',
          'EBITDA_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'NET_DEBT_TO_EBITDA',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        scoringRulesSummary: 'Microfinance unsecured lending health policy.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 6. LIFE & GENERAL INSURANCE
    // =========================================================================
    [
      'INSURANCE',
      {
        businessModelCode: 'INSURANCE',
        policyName: 'Insurance Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'RETURNS'],
        categoryWeights: {
          GROWTH: 35,
          MARGINS: 35,
          RETURNS: 30,
          LEVERAGE: 0,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: [
          'EBITDA_GROWTH',
          'EBITDA_MARGIN',
          'DEBT_TO_EQUITY',
          'NET_DEBT_TO_EBITDA',
          'RECEIVABLE_DAYS',
          'INVENTORY_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
        ],
        scoringRulesSummary: 'Insurance underwriting & investment return policy.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 7. REAL ESTATE INVESTMENT TRUST (REIT)
    // =========================================================================
    [
      'REIT',
      {
        businessModelCode: 'REIT',
        policyName: 'Real Estate Investment Trust (REIT) Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'CASH_FLOW_QUALITY', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          CASH_FLOW_QUALITY: 30,
          LEVERAGE: 25,
          GROWTH: 15,
          MARGINS: 15,
          RETURNS: 15,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: [
          'REVENUE_GROWTH',
          'PAT_GROWTH',
          'EBITDA_MARGIN',
          'PAT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'INTEREST_COVERAGE',
          'ROE',
          'ROCE',
        ],
        excludedMetrics: ['INVENTORY_DAYS', 'PAYABLE_DAYS', 'WORKING_CAPITAL_DAYS', 'CASH_CONVERSION_CYCLE'],
        scoringRulesSummary: 'REIT yield & distribution policy: Emphasizes cash flow generation, debt coverage, and rental yields.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 8. INFRASTRUCTURE INVESTMENT TRUST (INVIT)
    // =========================================================================
    [
      'INVIT',
      {
        businessModelCode: 'INVIT',
        policyName: 'Infrastructure Investment Trust (InvIT) Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'CASH_FLOW_QUALITY', 'LEVERAGE', 'RETURNS'],
        categoryWeights: {
          CASH_FLOW_QUALITY: 30,
          LEVERAGE: 25,
          GROWTH: 15,
          MARGINS: 15,
          RETURNS: 15,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: [
          'REVENUE_GROWTH',
          'PAT_GROWTH',
          'EBITDA_MARGIN',
          'PAT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'INTEREST_COVERAGE',
          'ROE',
          'ROCE',
        ],
        excludedMetrics: ['INVENTORY_DAYS', 'PAYABLE_DAYS', 'WORKING_CAPITAL_DAYS', 'CASH_CONVERSION_CYCLE'],
        scoringRulesSummary: 'InvIT distribution & concession asset debt servicing policy.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 9. REGULATED UTILITY
    // =========================================================================
    [
      'UTILITY',
      {
        businessModelCode: 'UTILITY',
        policyName: 'Regulated Utility Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'CASH_FLOW_QUALITY', 'LEVERAGE', 'RETURNS', 'WORKING_CAPITAL'],
        categoryWeights: {
          RETURNS: 25,
          CASH_FLOW_QUALITY: 25,
          LEVERAGE: 20,
          MARGINS: 15,
          GROWTH: 10,
          WORKING_CAPITAL: 5,
        },
        applicableMetrics: [
          'REVENUE_GROWTH',
          'EBITDA_GROWTH',
          'PAT_GROWTH',
          'EBITDA_MARGIN',
          'PAT_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'INTEREST_COVERAGE',
          'ROE',
          'ROCE',
          'RECEIVABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
        ],
        excludedMetrics: ['INVENTORY_DAYS'],
        scoringRulesSummary: 'Regulated utility policy prioritizing regulated ROCE, capex financing, and debt service over high top-line growth.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 10. PROJECT & INFRASTRUCTURE EPC
    // =========================================================================
    [
      'PROJECT_INFRA',
      {
        businessModelCode: 'PROJECT_INFRA',
        policyName: 'Project & Infrastructure EPC Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'CASH_FLOW_QUALITY', 'LEVERAGE', 'RETURNS', 'WORKING_CAPITAL'],
        categoryWeights: {
          WORKING_CAPITAL: 25,
          CASH_FLOW_QUALITY: 20,
          LEVERAGE: 20,
          MARGINS: 15,
          RETURNS: 10,
          GROWTH: 10,
        },
        applicableMetrics: [
          'REVENUE_GROWTH',
          'EBITDA_MARGIN',
          'CFO_TO_PAT_RATIO',
          'FREE_CASH_FLOW',
          'DEBT_TO_EQUITY',
          'INTEREST_COVERAGE',
          'RECEIVABLE_DAYS',
          'PAYABLE_DAYS',
          'WORKING_CAPITAL_DAYS',
          'CASH_CONVERSION_CYCLE',
          'ROCE',
          'ROE',
        ],
        excludedMetrics: [],
        scoringRulesSummary: 'EPC infrastructure policy heavily weighted toward working capital blockage and cash conversion.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 11. ASSET MANAGEMENT COMPANY (AMC)
    // =========================================================================
    [
      'ASSET_MANAGEMENT',
      {
        businessModelCode: 'ASSET_MANAGEMENT',
        policyName: 'Asset Management Company Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'CASH_FLOW_QUALITY', 'RETURNS'],
        categoryWeights: {
          MARGINS: 30,
          GROWTH: 30,
          RETURNS: 25,
          CASH_FLOW_QUALITY: 15,
          LEVERAGE: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'EBITDA_MARGIN', 'PAT_MARGIN', 'CFO_TO_PAT_RATIO', 'FREE_CASH_FLOW', 'ROE', 'ROCE'],
        excludedMetrics: ['DEBT_TO_EQUITY', 'NET_DEBT_TO_EBITDA', 'RECEIVABLE_DAYS', 'INVENTORY_DAYS', 'PAYABLE_DAYS', 'WORKING_CAPITAL_DAYS', 'CASH_CONVERSION_CYCLE'],
        scoringRulesSummary: 'Asset-light capital market policy: High operating margins and ROE focus, zero industrial working capital.',
        minimumCompletenessThreshold: 40,
      },
    ],

    // =========================================================================
    // 12. CAPITAL MARKETS BROKERAGE
    // =========================================================================
    [
      'BROKERAGE',
      {
        businessModelCode: 'BROKERAGE',
        policyName: 'Capital Markets Brokerage Health Policy',
        applicableCategories: ['GROWTH', 'MARGINS', 'RETURNS', 'LEVERAGE'],
        categoryWeights: {
          MARGINS: 30,
          GROWTH: 30,
          RETURNS: 25,
          LEVERAGE: 15,
          CASH_FLOW_QUALITY: 0,
          WORKING_CAPITAL: 0,
        },
        applicableMetrics: ['REVENUE_GROWTH', 'PAT_GROWTH', 'PAT_MARGIN', 'ROE'],
        excludedMetrics: ['RECEIVABLE_DAYS', 'INVENTORY_DAYS', 'PAYABLE_DAYS', 'WORKING_CAPITAL_DAYS', 'CASH_CONVERSION_CYCLE'],
        scoringRulesSummary: 'Brokerage franchise health policy.',
        minimumCompletenessThreshold: 40,
      },
    ],
  ]);

  public static getPolicy(businessModelCode: string): BusinessModelScoringPolicy {
    const cleanCode = businessModelCode ? businessModelCode.trim().toUpperCase() : 'OPERATING_INDUSTRIAL';
    if (this.policies.has(cleanCode)) {
      return this.policies.get(cleanCode)!;
    }

    // Check partial matches (e.g. AUTO_OEM -> OPERATING_INDUSTRIAL, BANK_COMMERCIAL -> BANKING)
    if (cleanCode.includes('BANK')) return this.policies.get('BANKING')!;
    if (cleanCode.includes('NBFC')) return this.policies.get('NBFC')!;
    if (cleanCode.includes('HFC') || cleanCode.includes('HOUSING')) return this.policies.get('HFC')!;
    if (cleanCode.includes('MFI') || cleanCode.includes('MICRO')) return this.policies.get('MICROFINANCE')!;
    if (cleanCode.includes('INSUR')) return this.policies.get('INSURANCE')!;
    if (cleanCode.includes('REIT')) return this.policies.get('REIT')!;
    if (cleanCode.includes('INVIT')) return this.policies.get('INVIT')!;
    if (cleanCode.includes('UTIL')) return this.policies.get('UTILITY')!;
    if (cleanCode.includes('INFRA') || cleanCode.includes('EPC')) return this.policies.get('PROJECT_INFRA')!;
    if (cleanCode.includes('AMC') || cleanCode.includes('ASSET')) return this.policies.get('ASSET_MANAGEMENT')!;
    if (cleanCode.includes('BROKER')) return this.policies.get('BROKERAGE')!;

    // Default to OPERATING_INDUSTRIAL policy
    return this.policies.get('OPERATING_INDUSTRIAL')!;
  }

  public static registerPolicy(policy: BusinessModelScoringPolicy): void {
    this.policies.set(policy.businessModelCode.trim().toUpperCase(), policy);
  }

  public static getAllPolicies(): BusinessModelScoringPolicy[] {
    return Array.from(this.policies.values());
  }
}
