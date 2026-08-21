/**
 * 29_hdfcBankFinancialFixture.test.ts
 * Phase 16 — HDFC Bank Universal Bank Fixture Invariant Verification.
 */

import { describe, it, expect } from 'vitest';
import { HDFC_BANK_FIXTURE } from '../../../src/domain/fixtures/HdfcBankFixture';
import { RealCompanyValidationEngine } from '../../../src/domain/fixtures/RealCompanyValidationEngine';

describe('HDFC Bank Real-Company Fixture (Phase 16)', () => {
  it('passes all banking asset quality, NII and capital adequacy invariants for HDFC Bank FY24', () => {
    const report = RealCompanyValidationEngine.validateFixture(HDFC_BANK_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.failedInvariants).toBe(0);
    expect(report.passedInvariants).toBe(HDFC_BANK_FIXTURE.invariants.length);
  });
});
