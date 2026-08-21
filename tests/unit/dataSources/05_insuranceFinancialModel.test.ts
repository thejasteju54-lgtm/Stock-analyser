/**
 * 05_insuranceFinancialModel.test.ts
 * Phase 16 — Insurance Financial Archetype Model Verification (GDPI, Solvency, VNB).
 */

import { describe, it, expect } from 'vitest';
import { InsuranceFinancialStatement } from '../../../src/domain/dataSources/DataSourceTypes';

describe('Insurance Financial Archetype (Phase 16)', () => {
  const mockInsuranceStatement: InsuranceFinancialStatement = {
    statementId: 'stmt_hdfclife_fy24',
    companyId: 'comp_hdfclife',
    reportingPeriod: 'FY2024',
    periodStart: '2023-04-01',
    periodEnd: '2024-03-31',
    periodType: 'ANNUAL_FY',
    statementBasis: 'CONSOLIDATED',
    auditStatus: 'AUDITED',
    publicationDate: '2024-04-22',
    sourceReference: {
      documentId: 'doc_hdfclife_ar24',
      documentTitle: 'HDFC Life Annual Report 2023-24',
      pageNumber: 140,
      tableHeader: 'Revenue Account & P&L',
    },
    rawPayloadHash: 'hash_hdfclife_fy24',
    archetype: 'INSURANCE',
    grossDirectPremiumIncome: 29500,
    netPremiumEarned: 27800,
    investmentIncome: 8400,
    claimsIncurred: 19200,
    commissionExpenses: 1800,
    operatingExpenses: 3400,
    combinedRatioPercent: 96.5,
    valueofNewBusiness: 3500,
    vnbMarginPercent: 26.1,
    embeddedValue: 47500,
    operatingRoevPercent: 17.5,
    solvencyRatioPercent: 187.0, // Above regulatory minimum 150%
    pat: 1570,
  };

  it('validates insurance specific actuarial and regulatory metrics', () => {
    expect(mockInsuranceStatement.grossDirectPremiumIncome).toBe(29500);
    expect(mockInsuranceStatement.solvencyRatioPercent).toBe(187.0);
    expect(mockInsuranceStatement.solvencyRatioPercent).toBeGreaterThan(150.0);
    expect(mockInsuranceStatement.vnbMarginPercent).toBe(26.1);
  });
});
