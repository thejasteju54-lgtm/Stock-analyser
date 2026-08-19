import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';

describe('Phase 12 — Thesis Breakers Operators & Invalidation Gate Tests', () => {
  it('correctly evaluates LESS_THAN operator with 10% approach buffer', () => {
    // Threshold = 12.0 (e.g. EBITDA Margin < 12%)
    // Buffer = 10% of 12.0 = 1.2 -> Approach zone is (12.0, 13.2]
    // Value = 11.5 -> BREACHED (<= 12.0)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'LESS_THAN',
        thresholdValue: 12.0,
        currentValue: 11.5,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // Value = 12.8 -> APPROACHING_TRIGGER (12.0 < 12.8 <= 13.2)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'LESS_THAN',
        thresholdValue: 12.0,
        currentValue: 12.8,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('APPROACHING_TRIGGER');

    // Value = 15.0 -> SAFE (> 13.2)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'LESS_THAN',
        thresholdValue: 12.0,
        currentValue: 15.0,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('SAFE');
  });

  it('correctly evaluates GREATER_THAN operator with 10% approach buffer', () => {
    // Threshold = 2.0 (e.g. Debt/Equity > 2.0x)
    // Buffer = 10% of 2.0 = 0.2 -> Approach zone is [1.8, 2.0)
    // Value = 2.2 -> BREACHED (>= 2.0)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'GREATER_THAN',
        thresholdValue: 2.0,
        currentValue: 2.2,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // Value = 1.9 -> APPROACHING_TRIGGER (1.8 <= 1.9 < 2.0)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'GREATER_THAN',
        thresholdValue: 2.0,
        currentValue: 1.9,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('APPROACHING_TRIGGER');

    // Value = 1.2 -> SAFE (< 1.8)
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'GREATER_THAN',
        thresholdValue: 2.0,
        currentValue: 1.2,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('SAFE');
  });

  it('correctly evaluates BOOLEAN equality for governance qualifiers', () => {
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'EQUALS',
        thresholdValue: true,
        currentValue: true,
        bufferMarginPercent: 0,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'EQUALS',
        thresholdValue: true,
        currentValue: false,
        bufferMarginPercent: 0,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('SAFE');
  });
});
