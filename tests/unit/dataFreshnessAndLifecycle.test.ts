import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';

describe('Phase 12 — Data Freshness & Missing Data Gating Tests', () => {
  it('returns NOT_ASSESSABLE when metric value is null or undefined', () => {
    const status = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10.0,
      currentValue: null,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });

    expect(status).toBe('NOT_ASSESSABLE');
  });

  it('returns NOT_ASSESSABLE when data freshness is EXPIRED or UNKNOWN', () => {
    const statusExpired = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10.0,
      currentValue: 8.5,
      bufferMarginPercent: 10,
      freshnessStatus: 'EXPIRED',
    });

    expect(statusExpired).toBe('NOT_ASSESSABLE');

    const statusUnknown = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10.0,
      currentValue: 8.5,
      bufferMarginPercent: 10,
      freshnessStatus: 'UNKNOWN',
    });

    expect(statusUnknown).toBe('NOT_ASSESSABLE');
  });
});
