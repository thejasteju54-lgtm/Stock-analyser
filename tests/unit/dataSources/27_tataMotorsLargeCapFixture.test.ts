/**
 * 27_tataMotorsLargeCapFixture.test.ts
 * Phase 16 — Tata Motors Large-Cap Real-Company Fixture Invariant Verification.
 */

import { describe, it, expect } from 'vitest';
import { TATA_MOTORS_FIXTURE } from '../../../src/domain/fixtures/TataMotorsFixture';
import { RealCompanyValidationEngine } from '../../../src/domain/fixtures/RealCompanyValidationEngine';

describe('Tata Motors Real-Company Fixture (Phase 16)', () => {
  it('passes all mathematical and statutory invariants for Tata Motors FY24', () => {
    const report = RealCompanyValidationEngine.validateFixture(TATA_MOTORS_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.failedInvariants).toBe(0);
    expect(report.passedInvariants).toBe(TATA_MOTORS_FIXTURE.invariants.length);
  });
});
