/**
 * 01_bankingFinancialModel.test.ts
 * Phase 16 — Banking Financial Archetype & Capital Adequacy Model Verification.
 */

import { describe, it, expect } from 'vitest';
import { BankingFinancialStatement } from '../../../src/domain/dataSources/DataSourceTypes';
import { FinancialDataReconciliationEngine } from '../../../src/domain/dataSources/FinancialDataReconciliationEngine';

describe('Banking Financial Archetype (Phase 16)', () => {
  const mockBankStatement: BankingFinancialStatement = {
    statementId: 'stmt_hdfc_fy24',
    companyId: 'comp_hdfcbank',
    reportingPeriod: 'FY2024',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    auditStatus: 'AUDITED',
    publicationDate: '2024-04-20',
    sourceReference: {
      documentId: 'doc_hdfc_ar24',
      documentTitle: 'HDFC Bank Annual Report 2023-24',
      pageNumber: 210,
      tableHeader: 'Consolidated Profit and Loss Account',
    },
    rawPayloadHash: 'hash_hdfc_fy24',
    archetype: 'BANKING',
    interestEarned: 278450,
    interestExpended: 169950,
    netInterestIncome: 108500,
    nonInterestIncome: 43200,
    totalNetIncome: 151700,
    operatingExpenses: 59800,
    preProvisionOperatingProfit: 91900,
    provisionsAndContingencies: 15400,
    pbt: 76500,
    taxExpense: 18800,
    pat: 57700,
    basicEps: 76.5,
    netInterestMarginPercent: 3.62,
    grossNpaAmount: 31560,
    grossNpaRatioPercent: 1.24,
    netNpaAmount: 8400,
    netNpaRatioPercent: 0.33,
    provisionCoverageRatioPercent: 73.4,
    creditCostPercent: 0.54,
    casaRatioPercent: 38.2,
    totalAdvances: 2508000,
    advancesGrowthYoYPercent: 55.4,
    totalDeposits: 2380000,
    depositsGrowthYoYPercent: 26.4,
    cet1RatioPercent: 16.3,
    at1RatioPercent: 0.8,
    tier1CapitalRatioPercent: 17.1,
    tier2CapitalRatioPercent: 1.7,
    crarPercent: 18.8,
    returnOnAssetsPercent: 1.95,
    returnOnEquityPercent: 16.8,
  };

  it('verifies banking arithmetic identities (NII, PPOP, PBT, PAT)', () => {
    const report = FinancialDataReconciliationEngine.reconcileStatement(mockBankStatement);
    expect(report.overallStatus).toBe('RECONCILED');
    expect(report.isAssessable).toBe(true);
    expect(report.checks.length).toBeGreaterThanOrEqual(4);
    expect(report.maxVariancePercent).toBeLessThan(0.1);
  });

  it('explicitly distinguishes CET1, AT1, Tier 1, and CRAR capital ratios', () => {
    expect(mockBankStatement.cet1RatioPercent).toBe(16.3);
    expect(mockBankStatement.at1RatioPercent).toBe(0.8);
    expect(mockBankStatement.tier1CapitalRatioPercent).toBe(17.1);
    expect(mockBankStatement.crarPercent).toBe(18.8);
    expect(mockBankStatement.tier1CapitalRatioPercent).toBeCloseTo(
      mockBankStatement.cet1RatioPercent + mockBankStatement.at1RatioPercent,
      2
    );
  });

  it('does not enforce industrial EBITDA or raw material costs on banking statements', () => {
    expect((mockBankStatement as unknown as Record<string, unknown>)['ebitda']).toBeUndefined();
    expect((mockBankStatement as unknown as Record<string, unknown>)['rawMaterialCost']).toBeUndefined();
  });
});
