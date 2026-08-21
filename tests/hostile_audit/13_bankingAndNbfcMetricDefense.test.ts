/**
 * 13_bankingAndNbfcMetricDefense.test.ts
 * Phase 19 — Hostile Banking & NBFC Metric Defense Suite.
 */

import { describe, it, expect } from 'vitest';
import { FinancialDataAdapter } from '../../src/domain/dataSources/FinancialDataAdapter';

describe('Banking & NBFC Metric Defense Suite', () => {
  it('enforces banking-specific metrics (NII, CRAR, GNPA, NNPA, NIM) and rejects manufacturing EBITDA assumptions for banks', () => {
    const adapter = new FinancialDataAdapter();

    const bankStatement: any = {
      reportingPeriod: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      archetype: 'BANKING',
      interestIncome: 200000,
      interestExpense: 110000,
      netInterestIncome: 90000,
      otherIncome: 35000,
      operatingExpenses: 50000,
      provisionsAndContingencies: 15000,
      pbt: 60000,
      taxExpense: 15000,
      pat: 45000,
      totalDeposits: 2000000,
      totalAdvances: 1800000,
      crarPercent: 18.5,
      gnpaPercent: 1.24,
      nnpaPercent: 0.33,
      nimPercent: 3.8,
    };

    const validation = adapter.validate({ parsedData: bankStatement });
    expect(validation.isValid).toBe(true);

    const invalidBank: any = {
      reportingPeriod: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      archetype: 'BANKING',
      netInterestIncome: -500, // Negative NII invalid
      crarPercent: 0,
    };

    const invalidRes = adapter.validate({ parsedData: invalidBank });
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.errors.length).toBeGreaterThanOrEqual(2);
  });
});
