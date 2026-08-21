/**
 * 04_industrialFinancialModel.test.ts
 * Phase 16 — Industrial / Manufacturing Financial Model Verification.
 */

import { describe, it, expect } from 'vitest';
import { IndustrialFinancialStatement } from '../../../src/domain/dataSources/DataSourceTypes';
import { FinancialDataReconciliationEngine } from '../../../src/domain/dataSources/FinancialDataReconciliationEngine';

describe('Industrial / Manufacturing Financial Archetype (Phase 16)', () => {
  const mockIndustrialStatement: IndustrialFinancialStatement = {
    statementId: 'stmt_tml_fy24',
    companyId: 'comp_tatamotors',
    reportingPeriod: 'FY2024',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    auditStatus: 'AUDITED',
    publicationDate: '2024-05-10',
    sourceReference: {
      documentId: 'doc_tml_ar24',
      documentTitle: 'Tata Motors Integrated Annual Report 2023-24',
      pageNumber: 154,
      tableHeader: 'Consolidated Statement of Profit and Loss',
    },
    rawPayloadHash: 'hash_tml_fy24',
    archetype: 'INDUSTRIAL_MANUFACTURING',
    revenue: 437928,
    rawMaterialCost: 265430,
    employeeExpenses: 38712,
    otherOperatingExpenses: 64358,
    ebitda: 69428,
    depreciationAndAmortization: 27950,
    ebit: 41478,
    financeCosts: 9780,
    otherIncome: 4130,
    pbt: 35828,
    taxExpense: 8200,
    pat: 27628,
    basicEps: 72.1,
    dilutedEps: 72.0,
    cfo: 62500,
    capex: 35200,
    fcf: 27300,
    tradeReceivables: 18450,
    inventory: 48200,
    tradePayables: 65100,
    totalDebt: 82400,
    cashAndEquivalents: 45600,
    netWorth: 92800,
    totalAssets: 345000,
  };

  it('verifies industrial waterfall (Revenue -> EBITDA -> EBIT -> PBT -> PAT -> FCF)', () => {
    const report = FinancialDataReconciliationEngine.reconcileStatement(mockIndustrialStatement);
    expect(report.overallStatus).toBe('RECONCILED');
    expect(report.isAssessable).toBe(true);
    expect(report.checks.length).toBe(4);
  });

  it('detects material arithmetic variance when numbers are tampered', () => {
    const tampered = { ...mockIndustrialStatement, pat: 10000 }; // Incorrect PAT
    const report = FinancialDataReconciliationEngine.reconcileStatement(tampered);
    expect(report.overallStatus).toBe('MATERIAL_VARIANCE');
    expect(report.isAssessable).toBe(false);
  });
});
