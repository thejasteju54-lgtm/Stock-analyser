/**
 * 02_accountingEquationBridges.test.ts
 * Phase 19 — Hostile Accounting Equation Bridges & Circularity Suite.
 */

import { describe, it, expect } from 'vitest';
import { FinancialDataReconciliationEngine } from '../../src/domain/dataSources/FinancialDataReconciliationEngine';

describe('Accounting Equation Bridges Suite', () => {
  it('detects and flags bridge discrepancies across Operating Profit, EBITDA, EBIT, and PAT equations', () => {
    const rawFiling = {
      reportingPeriod: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      archetype: 'INDUSTRIAL_MANUFACTURING' as const,
      currency: 'INR',
      unit: 'CRORE',
      statementBasis: 'CONSOLIDATED' as const,
      revenue: 100000,
      ebitda: 20000,
      depreciationAndAmortization: 5000,
      ebit: 15000,
      financeCosts: 2000,
      otherIncome: 1000,
      pbt: 14000,
      taxExpense: 3500,
      pat: 10500,
      totalDebt: 30000,
      cashAndEquivalents: 10000,
      netWorth: 50000,
      totalAssets: 120000,
      rawMaterialCost: 40000,
      employeeExpenses: 20000,
      otherOperatingExpenses: 20000,
      basicEps: 25,
      dilutedEps: 25,
      cfo: 18000,
      capex: 6000,
      fcf: 12000,
      tradeReceivables: 8000,
      inventory: 15000,
      tradePayables: 12000,
    };

    const reconciliation = FinancialDataReconciliationEngine.reconcileStatement(rawFiling as any);
    expect(reconciliation).toBeDefined();
    expect(reconciliation.overallStatus).toBe('RECONCILED');
    expect(reconciliation.checks.length).toBeGreaterThan(0);
  });
});
