/**
 * Phase 7 — Forensic Policy Registry
 * Configures sector-aware forensic rules, applicable categories, and heuristic signal thresholds.
 */

import { ForensicPolicyConfig } from './ForensicAnalysisTypes';

export class ForensicPolicyRegistry {
  private static policies: Map<string, ForensicPolicyConfig> = new Map([
    // =========================================================================
    // 1. OPERATING INDUSTRIAL / MANUFACTURING
    // =========================================================================
    [
      'OPERATING_INDUSTRIAL',
      {
        businessModelCode: 'OPERATING_INDUSTRIAL',
        policyName: 'Operating Industrial / Manufacturing Forensic Policy',
        archetype: 'OPERATING_INDUSTRIAL',
        applicableCategories: [
          'REVENUE_QUALITY',
          'PROFIT_VS_CASH_FLOW',
          'WORKING_CAPITAL_FORENSICS',
          'CAPITALIZATION_AND_EXPENSE_QUALITY',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CASH_AND_BALANCE_SHEET_QUALITY',
          'CROSS_STATEMENT_CONSISTENCY',
        ],
        categoryWeights: {
          REVENUE_QUALITY: 15,
          PROFIT_VS_CASH_FLOW: 15,
          WORKING_CAPITAL_FORENSICS: 10,
          CAPITALIZATION_AND_EXPENSE_QUALITY: 10,
          RELATED_PARTY_TRANSACTIONS: 10,
          CONTINGENT_LIABILITIES: 10,
          AUDITOR_DISCLOSURES: 10,
          PROMOTER_OWNERSHIP: 10,
          DEBT_AND_FINANCING: 5,
          EXCEPTIONAL_ITEMS: 5,
        },
        receivablesVsRevenueMultiplier: 1.5,
        cfoToPatConcernThreshold: 0.5,
        contingentLiabilityNetWorthThreshold: 20.0,
        promoterPledgeConcernThreshold: 10.0, // 10% of promoter holding
        promoterStakeReductionConcernThreshold: 2.0, // 200 bps YoY
        depreciationRateFloor: 3.0, // 3% on gross block
        isWorkingCapitalGated: false,
        isCapexGrossBlockGated: false,
        minimumCompletenessThreshold: 35,
      },
    ],

    // =========================================================================
    // 2. BANKING (COMMERCIAL & RETAIL)
    // =========================================================================
    [
      'BANKING',
      {
        businessModelCode: 'BANKING',
        policyName: 'Commercial Banking Forensic Policy',
        archetype: 'LENDING_FINANCIAL',
        applicableCategories: [
          'PROFIT_VS_CASH_FLOW',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'PROMOTER_OWNERSHIP',
          'CASH_AND_BALANCE_SHEET_QUALITY',
        ],
        categoryWeights: {
          PROFIT_VS_CASH_FLOW: 10,
          RELATED_PARTY_TRANSACTIONS: 20,
          CONTINGENT_LIABILITIES: 20,
          AUDITOR_DISCLOSURES: 20,
          PROMOTER_OWNERSHIP: 15,
          ACCOUNTING_POLICY_CHANGES: 10,
          EXCEPTIONAL_ITEMS: 5,
        },
        receivablesVsRevenueMultiplier: 2.0,
        cfoToPatConcernThreshold: 0.0, // Bank CFO is structurally volatile due to deposits
        contingentLiabilityNetWorthThreshold: 35.0, // Off-balance sheet bank guarantees/LCs
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 1.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: true,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 3. NBFC (NON-BANKING FINANCIAL COMPANY)
    // =========================================================================
    [
      'NBFC',
      {
        businessModelCode: 'NBFC',
        policyName: 'Non-Banking Financial Company Forensic Policy',
        archetype: 'LENDING_FINANCIAL',
        applicableCategories: [
          'PROFIT_VS_CASH_FLOW',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CASH_AND_BALANCE_SHEET_QUALITY',
        ],
        categoryWeights: {
          RELATED_PARTY_TRANSACTIONS: 20,
          CONTINGENT_LIABILITIES: 15,
          AUDITOR_DISCLOSURES: 20,
          PROMOTER_OWNERSHIP: 15,
          DEBT_AND_FINANCING: 15,
          ACCOUNTING_POLICY_CHANGES: 10,
          EXCEPTIONAL_ITEMS: 5,
        },
        receivablesVsRevenueMultiplier: 2.0,
        cfoToPatConcernThreshold: 0.0,
        contingentLiabilityNetWorthThreshold: 25.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 1.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: true,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 4. HFC (HOUSING FINANCE COMPANY)
    // =========================================================================
    [
      'HFC',
      {
        businessModelCode: 'HFC',
        policyName: 'Housing Finance Company Forensic Policy',
        archetype: 'LENDING_FINANCIAL',
        applicableCategories: [
          'PROFIT_VS_CASH_FLOW',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
        ],
        categoryWeights: {
          RELATED_PARTY_TRANSACTIONS: 20,
          CONTINGENT_LIABILITIES: 15,
          AUDITOR_DISCLOSURES: 20,
          PROMOTER_OWNERSHIP: 15,
          DEBT_AND_FINANCING: 15,
          ACCOUNTING_POLICY_CHANGES: 10,
          EXCEPTIONAL_ITEMS: 5,
        },
        receivablesVsRevenueMultiplier: 2.0,
        cfoToPatConcernThreshold: 0.0,
        contingentLiabilityNetWorthThreshold: 25.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 1.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: true,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 5. MICROFINANCE (MFI)
    // =========================================================================
    [
      'MICROFINANCE',
      {
        businessModelCode: 'MICROFINANCE',
        policyName: 'Microfinance Institution Forensic Policy',
        archetype: 'LENDING_FINANCIAL',
        applicableCategories: [
          'PROFIT_VS_CASH_FLOW',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'PROMOTER_OWNERSHIP',
        ],
        categoryWeights: {
          RELATED_PARTY_TRANSACTIONS: 20,
          AUDITOR_DISCLOSURES: 20,
          PROMOTER_OWNERSHIP: 20,
          CONTINGENT_LIABILITIES: 15,
          DEBT_AND_FINANCING: 15,
          EXCEPTIONAL_ITEMS: 10,
        },
        receivablesVsRevenueMultiplier: 2.0,
        cfoToPatConcernThreshold: 0.0,
        contingentLiabilityNetWorthThreshold: 20.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 1.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: true,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 6. INSURANCE (LIFE & GENERAL)
    // =========================================================================
    [
      'INSURANCE',
      {
        businessModelCode: 'INSURANCE',
        policyName: 'Insurance Carrier Forensic Policy',
        archetype: 'NON_LENDING_FINANCIAL',
        applicableCategories: [
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'PROMOTER_OWNERSHIP',
          'CASH_AND_BALANCE_SHEET_QUALITY',
        ],
        categoryWeights: {
          AUDITOR_DISCLOSURES: 25,
          ACCOUNTING_POLICY_CHANGES: 20,
          RELATED_PARTY_TRANSACTIONS: 20,
          CONTINGENT_LIABILITIES: 15,
          PROMOTER_OWNERSHIP: 15,
          EXCEPTIONAL_ITEMS: 5,
        },
        receivablesVsRevenueMultiplier: 2.0,
        cfoToPatConcernThreshold: 0.0,
        contingentLiabilityNetWorthThreshold: 30.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 1.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: true,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 7. REIT (REAL ESTATE INVESTMENT TRUST)
    // =========================================================================
    [
      'REIT',
      {
        businessModelCode: 'REIT',
        policyName: 'Real Estate Investment Trust Forensic Policy',
        archetype: 'REAL_ESTATE',
        applicableCategories: [
          'REVENUE_QUALITY',
          'PROFIT_VS_CASH_FLOW',
          'CAPITALIZATION_AND_EXPENSE_QUALITY',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CROSS_STATEMENT_CONSISTENCY',
        ],
        categoryWeights: {
          RELATED_PARTY_TRANSACTIONS: 20,
          PROFIT_VS_CASH_FLOW: 20,
          DEBT_AND_FINANCING: 15,
          CAPITALIZATION_AND_EXPENSE_QUALITY: 15,
          AUDITOR_DISCLOSURES: 15,
          CONTINGENT_LIABILITIES: 10,
          REVENUE_QUALITY: 5,
        },
        receivablesVsRevenueMultiplier: 1.5,
        cfoToPatConcernThreshold: 0.8,
        contingentLiabilityNetWorthThreshold: 20.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 2.0,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: false,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 8. INVIT (INFRASTRUCTURE INVESTMENT TRUST)
    // =========================================================================
    [
      'INVIT',
      {
        businessModelCode: 'INVIT',
        policyName: 'Infrastructure Investment Trust Forensic Policy',
        archetype: 'INFRA_UTILITY',
        applicableCategories: [
          'REVENUE_QUALITY',
          'PROFIT_VS_CASH_FLOW',
          'CAPITALIZATION_AND_EXPENSE_QUALITY',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CROSS_STATEMENT_CONSISTENCY',
        ],
        categoryWeights: {
          RELATED_PARTY_TRANSACTIONS: 20,
          PROFIT_VS_CASH_FLOW: 20,
          DEBT_AND_FINANCING: 15,
          CAPITALIZATION_AND_EXPENSE_QUALITY: 15,
          AUDITOR_DISCLOSURES: 15,
          CONTINGENT_LIABILITIES: 10,
          REVENUE_QUALITY: 5,
        },
        receivablesVsRevenueMultiplier: 1.5,
        cfoToPatConcernThreshold: 0.8,
        contingentLiabilityNetWorthThreshold: 25.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 2.5,
        isWorkingCapitalGated: true,
        isCapexGrossBlockGated: false,
        minimumCompletenessThreshold: 30,
      },
    ],

    // =========================================================================
    // 9. PROJECT INFRASTRUCTURE & EPC
    // =========================================================================
    [
      'PROJECT_INFRA',
      {
        businessModelCode: 'PROJECT_INFRA',
        policyName: 'Project Infrastructure & EPC Forensic Policy',
        archetype: 'INFRA_UTILITY',
        applicableCategories: [
          'REVENUE_QUALITY',
          'PROFIT_VS_CASH_FLOW',
          'WORKING_CAPITAL_FORENSICS',
          'CAPITALIZATION_AND_EXPENSE_QUALITY',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'RESTATEMENTS',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CROSS_STATEMENT_CONSISTENCY',
        ],
        categoryWeights: {
          REVENUE_QUALITY: 15,
          WORKING_CAPITAL_FORENSICS: 15,
          PROFIT_VS_CASH_FLOW: 15,
          CONTINGENT_LIABILITIES: 15,
          RELATED_PARTY_TRANSACTIONS: 10,
          AUDITOR_DISCLOSURES: 10,
          DEBT_AND_FINANCING: 10,
          PROMOTER_OWNERSHIP: 10,
        },
        receivablesVsRevenueMultiplier: 1.75,
        cfoToPatConcernThreshold: 0.5,
        contingentLiabilityNetWorthThreshold: 30.0, // Large performance guarantees
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 3.0,
        isWorkingCapitalGated: false,
        isCapexGrossBlockGated: false,
        minimumCompletenessThreshold: 35,
      },
    ],

    // =========================================================================
    // 10. UTILITY (POWER GENERATION & TRANSMISSION)
    // =========================================================================
    [
      'UTILITY',
      {
        businessModelCode: 'UTILITY',
        policyName: 'Regulated Utility Forensic Policy',
        archetype: 'INFRA_UTILITY',
        applicableCategories: [
          'REVENUE_QUALITY',
          'PROFIT_VS_CASH_FLOW',
          'WORKING_CAPITAL_FORENSICS',
          'CAPITALIZATION_AND_EXPENSE_QUALITY',
          'EXCEPTIONAL_ITEMS',
          'RELATED_PARTY_TRANSACTIONS',
          'CONTINGENT_LIABILITIES',
          'AUDITOR_DISCLOSURES',
          'ACCOUNTING_POLICY_CHANGES',
          'DEBT_AND_FINANCING',
          'PROMOTER_OWNERSHIP',
          'CROSS_STATEMENT_CONSISTENCY',
        ],
        categoryWeights: {
          CAPITALIZATION_AND_EXPENSE_QUALITY: 20,
          PROFIT_VS_CASH_FLOW: 15,
          DEBT_AND_FINANCING: 15,
          REVENUE_QUALITY: 10,
          WORKING_CAPITAL_FORENSICS: 10,
          CONTINGENT_LIABILITIES: 10,
          RELATED_PARTY_TRANSACTIONS: 10,
          AUDITOR_DISCLOSURES: 10,
        },
        receivablesVsRevenueMultiplier: 1.5,
        cfoToPatConcernThreshold: 0.7,
        contingentLiabilityNetWorthThreshold: 25.0,
        promoterPledgeConcernThreshold: 10.0,
        promoterStakeReductionConcernThreshold: 2.0,
        depreciationRateFloor: 3.0,
        isWorkingCapitalGated: false,
        isCapexGrossBlockGated: false,
        minimumCompletenessThreshold: 35,
      },
    ],
  ]);

  public static getPolicy(businessModelCode: string): ForensicPolicyConfig {
    const cleanCode = businessModelCode ? businessModelCode.toUpperCase().trim() : 'OPERATING_INDUSTRIAL';
    const policy = this.policies.get(cleanCode);
    if (policy) return policy;

    // Fallback: Map known aliases or return OPERATING_INDUSTRIAL
    if (cleanCode.includes('BANK')) return this.policies.get('BANKING')!;
    if (cleanCode.includes('FINANCE') || cleanCode.includes('NBFC')) return this.policies.get('NBFC')!;
    if (cleanCode.includes('INSUR')) return this.policies.get('INSURANCE')!;
    if (cleanCode.includes('REIT')) return this.policies.get('REIT')!;
    if (cleanCode.includes('INVIT')) return this.policies.get('INVIT')!;
    if (cleanCode.includes('INFRA') || cleanCode.includes('EPC')) return this.policies.get('PROJECT_INFRA')!;
    if (cleanCode.includes('UTIL') || cleanCode.includes('POWER')) return this.policies.get('UTILITY')!;

    return this.policies.get('OPERATING_INDUSTRIAL')!;
  }

  public static listPolicies(): ForensicPolicyConfig[] {
    return Array.from(this.policies.values());
  }
}
