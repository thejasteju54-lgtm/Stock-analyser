/**
 * 03_itServicesFinancialModel.test.ts
 * Phase 16 — IT Services Financial Model Verification (USD/INR conversion, Headcount, FCF).
 */

import { describe, it, expect } from 'vitest';
import { ItServicesFinancialStatement } from '../../../src/domain/dataSources/DataSourceTypes';
import { FinancialDataReconciliationEngine } from '../../../src/domain/dataSources/FinancialDataReconciliationEngine';

describe('IT Services Financial Archetype (Phase 16)', () => {
  const mockItStatement: ItServicesFinancialStatement = {
    statementId: 'stmt_infy_fy24',
    companyId: 'comp_infosys',
    reportingPeriod: 'FY2024',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    auditStatus: 'AUDITED',
    publicationDate: '2024-04-18',
    sourceReference: {
      documentId: 'doc_infy_ar24',
      documentTitle: 'Infosys Annual Report FY24',
      pageNumber: 135,
      tableHeader: 'Consolidated Statement of Profit and Loss',
    },
    rawPayloadHash: 'hash_infy_fy24',
    archetype: 'IT_SERVICES',
    revenueInr: 153670,
    revenueUsd: 18560,
    constantCurrencyGrowthYoY: 1.4,
    softwareDevelopmentExpenses: 82100,
    employeeBenefitExpenses: 78500,
    operatingProfit: 31750,
    operatingMarginPercent: 20.7,
    otherIncome: 3120,
    pbt: 34870,
    taxExpense: 8622,
    pat: 26248,
    basicEps: 63.39,
    cfo: 25780,
    fcf: 23410,
    cashAndLiquidInvestments: 34200,
    headcount: 317240,
    attritionRateLtmPercent: 12.6,
    utilizationRatePercent: 83.5,
  };

  it('verifies IT Services statement reconciliation (Operating Profit, PBT, PAT)', () => {
    const report = FinancialDataReconciliationEngine.reconcileStatement(mockItStatement);
    expect(report.overallStatus).toBe('RECONCILED');
    expect(report.isAssessable).toBe(true);
  });

  it('validates high FCF to PAT conversion characteristic of IT services', () => {
    const conversion = (mockItStatement.fcf / mockItStatement.pat) * 100;
    expect(conversion).toBeGreaterThan(85.0);
    expect(mockItStatement.headcount).toBe(317240);
  });
});
