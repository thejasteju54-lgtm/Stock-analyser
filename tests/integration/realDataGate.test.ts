/**
 * realDataGate.test.ts
 * Rigorous RealDataGate & Integrity Verification Suite
 */

import { describe, it, expect } from 'vitest';
import { RealDataGate } from '../../src/domain/dataAcquisition/RealDataGate';

describe('RealDataGate 7-Point Integrity Verification Suite', () => {
  const targetCompany = 'comp_bel';

  it('strictly rejects data with mock / fake / placeholder source names', () => {
    const res = RealDataGate.validate(
      {
        metricId: 'm1',
        canonicalCompanyId: targetCompany,
        metricName: 'REVENUE',
        value: 20268,
        unit: 'INR_CRORE',
        period: 'FY24',
        source: 'mock_demo_source',
        sourceTier: 1,
        retrievedAt: new Date().toISOString(),
      },
      targetCompany
    );

    expect(res.isValid).toBe(false);
    expect(res.status).toBe('REJECTED');
    expect(res.rejectionReason).toContain('mock');
  });

  it('strictly rejects data with company identity mismatch', () => {
    const res = RealDataGate.validate(
      {
        metricId: 'm2',
        canonicalCompanyId: 'comp_tatamotors', // Different company
        metricName: 'REVENUE',
        value: 437928,
        unit: 'INR_CRORE',
        period: 'FY24',
        source: 'Audited Annual Report FY24',
        sourceTier: 1,
        retrievedAt: new Date().toISOString(),
      },
      targetCompany
    );

    expect(res.isValid).toBe(false);
    expect(res.status).toBe('REJECTED');
    expect(res.rejectionReason).toContain('Company identity mismatch');
  });

  it('strictly rejects invalid / NaN / Infinity values', () => {
    const res = RealDataGate.validate(
      {
        metricId: 'm3',
        canonicalCompanyId: targetCompany,
        metricName: 'ROCE',
        value: NaN,
        unit: 'PERCENTAGE',
        period: 'FY24',
        source: 'Audited Annual Report FY24',
        sourceTier: 1,
        retrievedAt: new Date().toISOString(),
      },
      targetCompany
    );

    expect(res.isValid).toBe(false);
    expect(res.status).toBe('REJECTED');
  });

  it('accepts fully verified and corroborated data candidate', () => {
    const res = RealDataGate.validate(
      {
        metricId: 'm4',
        canonicalCompanyId: targetCompany,
        metricName: 'REVENUE',
        value: 20268,
        unit: 'INR_CRORE',
        period: 'FY24',
        source: 'NSE Primary Filing Statement of P&L',
        sourceTier: 1,
        retrievedAt: new Date().toISOString(),
      },
      targetCompany
    );

    expect(res.isValid).toBe(true);
    expect(res.status).toBe('ACCEPTED');
    expect(res.sanitizedValue).toBe(20268);
  });
});
