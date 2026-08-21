/**
 * 28_dixonMidCapGrowthFixture.test.ts
 * Phase 16 — Dixon Technologies Mid-Cap Growth Fixture Invariant Verification.
 */

import { describe, it, expect } from 'vitest';
import { DIXON_TECHNOLOGIES_FIXTURE } from '../../../src/domain/fixtures/DixonTechnologiesFixture';
import { RealCompanyValidationEngine } from '../../../src/domain/fixtures/RealCompanyValidationEngine';

describe('Dixon Technologies Real-Company Fixture (Phase 16)', () => {
  it('passes all operating and financial invariants for Dixon FY24', () => {
    const report = RealCompanyValidationEngine.validateFixture(DIXON_TECHNOLOGIES_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.failedInvariants).toBe(0);
  });
});
