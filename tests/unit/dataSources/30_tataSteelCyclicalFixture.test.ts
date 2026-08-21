/**
 * 30_tataSteelCyclicalFixture.test.ts
 * Phase 16 — Tata Steel Cyclical Manufacturing Fixture Invariant Verification.
 */

import { describe, it, expect } from 'vitest';
import { TATA_STEEL_FIXTURE } from '../../../src/domain/fixtures/TataSteelFixture';
import { RealCompanyValidationEngine } from '../../../src/domain/fixtures/RealCompanyValidationEngine';

describe('Tata Steel Real-Company Fixture (Phase 16)', () => {
  it('passes all cyclical commodity manufacturing invariants for Tata Steel FY24', () => {
    const report = RealCompanyValidationEngine.validateFixture(TATA_STEEL_FIXTURE);
    expect(report.allPassed).toBe(true);
    expect(report.failedInvariants).toBe(0);
  });
});
