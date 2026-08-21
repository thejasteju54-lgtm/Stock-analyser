/**
 * 16_realCompanyArchetypesQA.test.ts
 * QA Track: 5 Real-Company Frozen Fixtures Invariant Hardening.
 */

import { describe, it, expect } from 'vitest';
import { RealCompanyValidationEngine } from '../../src/domain/fixtures/RealCompanyValidationEngine';
import { TATA_MOTORS_FIXTURE } from '../../src/domain/fixtures/TataMotorsFixture';
import { DIXON_TECHNOLOGIES_FIXTURE } from '../../src/domain/fixtures/DixonTechnologiesFixture';
import { HDFC_BANK_FIXTURE } from '../../src/domain/fixtures/HdfcBankFixture';
import { TATA_STEEL_FIXTURE } from '../../src/domain/fixtures/TataSteelFixture';
import { INFOSYS_FIXTURE } from '../../src/domain/fixtures/InfosysFixture';

describe('5 Real-Company Audited Archetypes QA', () => {
  it('validates 100% of invariants across all 5 real-company fixtures', () => {
    const allFixtures = [
      TATA_MOTORS_FIXTURE,
      DIXON_TECHNOLOGIES_FIXTURE,
      HDFC_BANK_FIXTURE,
      TATA_STEEL_FIXTURE,
      INFOSYS_FIXTURE,
    ];

    for (const fixture of allFixtures) {
      const report = RealCompanyValidationEngine.validateFixture(fixture);
      expect(report.allPassed).toBe(true);
      expect(report.failedInvariants).toBe(0);
      expect(report.passedInvariants).toBeGreaterThanOrEqual(3);
    }
  });
});
