import { describe, it, expect } from 'vitest';
import { ForensicPolicyRegistry } from '../../src/domain/forensics/ForensicPolicyRegistry';

describe('Phase 7 — Forensic Policy Registry & Sector Gating', () => {
  it('1. Retrieves distinct forensic policies for Operating Industrial, Banking, NBFC, REIT, Utility', () => {
    const industrial = ForensicPolicyRegistry.getPolicy('OPERATING_INDUSTRIAL');
    const banking = ForensicPolicyRegistry.getPolicy('BANKING');
    const nbfc = ForensicPolicyRegistry.getPolicy('NBFC');
    const reit = ForensicPolicyRegistry.getPolicy('REIT');
    const utility = ForensicPolicyRegistry.getPolicy('UTILITY');

    expect(industrial.archetype).toBe('OPERATING_INDUSTRIAL');
    expect(industrial.isWorkingCapitalGated).toBe(false);

    expect(banking.archetype).toBe('LENDING_FINANCIAL');
    expect(banking.isWorkingCapitalGated).toBe(true);
    expect(banking.isCapexGrossBlockGated).toBe(true);

    expect(nbfc.archetype).toBe('LENDING_FINANCIAL');
    expect(reit.archetype).toBe('REAL_ESTATE');
    expect(utility.archetype).toBe('INFRA_UTILITY');
  });

  it('2. Fallback handling maps banking aliases to BANKING policy and unknown models to OPERATING_INDUSTRIAL', () => {
    const bankAlias = ForensicPolicyRegistry.getPolicy('RETAIL_BANKING_SECTOR');
    expect(bankAlias.businessModelCode).toBe('BANKING');

    const unknown = ForensicPolicyRegistry.getPolicy('CUSTOM_STARTUP_MODEL');
    expect(unknown.businessModelCode).toBe('OPERATING_INDUSTRIAL');
  });
});
