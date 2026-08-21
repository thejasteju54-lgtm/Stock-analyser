/**
 * 31_infosysItServicesFixture.test.ts
 * Phase 16 — Infosys IT Services Real-Company Fixture Invariant Verification.
 */

import { describe, it, expect } from 'vitest';
import { INFOSYS_FIXTURE } from '../../../src/domain/fixtures/InfosysFixture';
import { RealCompanyValidationEngine } from '../../../src/domain/fixtures/RealCompanyValidationEngine';

describe('Infosys Real-Company Fixture (Phase 16)', () => {
  it('passes all IT services operating margins, cash and CFO invariants for Infosys FY24', () => {
    const report = RealCompanyValidationEngine.validateFixture(INFOSYS_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.failedInvariants).toBe(0);
  });
});
