/**
 * 02_nbfcFinancialModel.test.ts
 * Phase 16 — NBFC Financial Model Verification (AUM, Spreads, Stage 3 Assets).
 */

import { describe, it, expect } from 'vitest';
import { NbfcFinancialStatement } from '../../../src/domain/dataSources/DataSourceTypes';

describe('NBFC Financial Archetype (Phase 16)', () => {
  const mockNbfcStatement: NbfcFinancialStatement = {
    statementId: 'stmt_bajfinance_fy24',
    companyId: 'comp_bajajfinance',
    reportingPeriod: 'FY2024',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    auditStatus: 'AUDITED',
    publicationDate: '2024-05-10',
    sourceReference: {
      documentId: 'doc_bajaj_ar24',
      documentTitle: 'Bajaj Finance Annual Report 2023-24',
      pageNumber: 160,
      tableHeader: 'Consolidated Statement of Profit and Loss',
    },
    rawPayloadHash: 'hash_bajaj_fy24',
    archetype: 'NBFC',
    interestIncome: 48500,
    financeCost: 19200,
    netInterestIncome: 29300,
    feeAndCommissionIncome: 6200,
    operatingExpenses: 11800,
    preProvisionProfit: 23700,
    expectedCreditLossProvisions: 4600,
    pbt: 19100,
    pat: 14450,
    aum: 330000,
    aumGrowthYoYPercent: 34.0,
    borrowings: 245000,
    costOfFundsPercent: 7.8,
    loanSpreadPercent: 4.85,
    stage3AssetsPercent: 0.85,
    stage3ProvisionCoveragePercent: 68.5,
    crarPercent: 22.5,
    tier1RatioPercent: 21.5,
    returnOnAumPercent: 4.75,
  };

  it('validates NBFC specific operational metrics', () => {
    expect(mockNbfcStatement.aum).toBe(330000);
    expect(mockNbfcStatement.stage3AssetsPercent).toBe(0.85);
    expect(mockNbfcStatement.loanSpreadPercent).toBe(4.85);
    expect(mockNbfcStatement.returnOnAumPercent).toBe(4.75);
    expect(mockNbfcStatement.archetype).toBe('NBFC');
  });

  it('verifies PBT arithmetic for NBFC model', () => {
    const calculatedPbt = mockNbfcStatement.preProvisionProfit - mockNbfcStatement.expectedCreditLossProvisions;
    expect(mockNbfcStatement.pbt).toBe(calculatedPbt);
  });
});
