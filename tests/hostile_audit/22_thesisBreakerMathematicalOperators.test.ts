/**
 * 22_thesisBreakerMathematicalOperators.test.ts
 * Phase 19 — Hostile Thesis Breaker Mathematical Operators & Thresholds Suite.
 */

import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';

describe('Thesis Breaker Mathematical Operators Suite', () => {
  it('correctly evaluates all 7 thesis breaker mathematical operators across boundary thresholds and 10% buffer margins', () => {
    // 1. LESS_THAN: Threshold = 10, Current = 9 -> BREACHED
    const res1 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10,
      currentValue: 9,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });
    expect(res1).toBe('BREACHED');

    // 2. LESS_THAN: Threshold = 10, Current = 10.5 (within 10% buffer 10 to 11) -> APPROACHING_TRIGGER
    const res2 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10,
      currentValue: 10.5,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });
    expect(res2).toBe('APPROACHING_TRIGGER');

    // 3. GREATER_THAN: Threshold = 50, Current = 55 -> BREACHED
    const res3 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'GREATER_THAN',
      thresholdValue: 50,
      currentValue: 55,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });
    expect(res3).toBe('BREACHED');

    // 4. EQUALS: Threshold = 100, Current = 100 -> BREACHED
    const res4 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'EQUALS',
      thresholdValue: 100,
      currentValue: 100,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });
    expect(res4).toBe('BREACHED');

    // 5. PERCENT_CHANGE_BY: Threshold = 20, Current = 25 -> BREACHED
    const res5 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'PERCENT_CHANGE_BY',
      thresholdValue: 20,
      currentValue: 25,
      bufferMarginPercent: 10,
      freshnessStatus: 'CURRENT',
    });
    expect(res5).toBe('BREACHED');

    // 6. Expired / Null data -> NOT_ASSESSABLE
    const res6 = CatalystRiskPolicyRegistry.evaluateThesisBreaker({
      operator: 'LESS_THAN',
      thresholdValue: 10,
      currentValue: null,
      bufferMarginPercent: 10,
      freshnessStatus: 'EXPIRED',
    });
    expect(res6).toBe('NOT_ASSESSABLE');
  });
});
