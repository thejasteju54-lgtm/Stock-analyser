/**
 * 02_sectorBankingQA.test.ts
 * QA Track: Sector Banking Model, Capital Adequacy & Non-Industrial Logic Guard.
 */

import { describe, it, expect } from 'vitest';
import { HDFC_BANK_FIXTURE } from '../../src/domain/fixtures/HdfcBankFixture';
import { RealCompanyValidationEngine } from '../../src/domain/fixtures/RealCompanyValidationEngine';
import { FinancialDataReconciliationEngine } from '../../src/domain/dataSources/FinancialDataReconciliationEngine';
import { BankingFinancialStatement } from '../../src/domain/dataSources/DataSourceTypes';

describe('Sector Banking QA (HDFC Bank Fixture & Model Specifics)', () => {
  it('validates all banking invariant assertions on HDFC Bank fixture with 100% pass', () => {
    const report = RealCompanyValidationEngine.validateFixture(HDFC_BANK_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.totalInvariants).toBe(5);
    expect(report.passedInvariants).toBe(5);
    expect(report.failedInvariants).toBe(0);
  });

  it('verifies banking arithmetic identities (NII, Total Net Income, PPOP, PBT, PAT)', () => {
    const stmt = HDFC_BANK_FIXTURE.canonicalStatement as BankingFinancialStatement;
    const report = FinancialDataReconciliationEngine.reconcileStatement(stmt);

    expect(report.overallStatus).toBe('RECONCILED');
    expect(report.isAssessable).toBe(true);

    // Verify NII = Interest Earned - Interest Expended
    expect(stmt.netInterestIncome).toBe(stmt.interestEarned - stmt.interestExpended);

    // Verify Total Net Income = NII + Non-Interest Income
    expect(stmt.totalNetIncome).toBe(stmt.netInterestIncome + stmt.nonInterestIncome);

    // Verify PPOP = Total Net Income - Operating Expenses
    expect(stmt.preProvisionOperatingProfit).toBe(stmt.totalNetIncome - stmt.operatingExpenses);

    // Verify PBT = PPOP - Provisions
    expect(stmt.pbt).toBe(stmt.preProvisionOperatingProfit - stmt.provisionsAndContingencies);

    // Verify PAT = PBT - Tax
    expect(stmt.pat).toBe(stmt.pbt - stmt.taxExpense);
  });

  it('strictly decomposes capital adequacy into CET1, AT1, Tier 1, and CRAR without blurring', () => {
    const stmt = HDFC_BANK_FIXTURE.canonicalStatement as BankingFinancialStatement;
    expect(stmt.cet1RatioPercent).toBe(16.3);
    expect(stmt.at1RatioPercent).toBe(0.8);
    expect(stmt.tier1CapitalRatioPercent).toBe(17.1);
    expect(stmt.tier2CapitalRatioPercent).toBe(1.7);
    expect(stmt.crarPercent).toBe(18.8);

    // Tier 1 = CET1 + AT1
    expect(Number((stmt.cet1RatioPercent + stmt.at1RatioPercent).toFixed(2))).toBe(stmt.tier1CapitalRatioPercent);

    // CRAR = Tier 1 + Tier 2
    expect(Number((stmt.tier1CapitalRatioPercent + stmt.tier2CapitalRatioPercent).toFixed(2))).toBe(stmt.crarPercent);
  });

  it('guarantees industrial EBITDA and Raw Material Cost are NOT enforced on banking statements', () => {
    const stmt = HDFC_BANK_FIXTURE.canonicalStatement as unknown as Record<string, unknown>;
    expect(stmt['ebitda']).toBeUndefined();
    expect(stmt['rawMaterialCost']).toBeUndefined();
    expect(stmt['inventory']).toBeUndefined();
  });
});
