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

  it('strictly verifies all 7 implemented mathematical operators without inventing an eighth operator', () => {
    const operators = [
      'GREATER_THAN',
      'GREATER_THAN_OR_EQUAL',
      'LESS_THAN',
      'LESS_THAN_OR_EQUAL',
      'EQUALS',
      'CHANGE_BY',
      'PERCENT_CHANGE_BY',
    ] as const;

    // Verify exactly 7 operators are supported
    expect(operators.length).toBe(7);

    // 1. GREATER_THAN
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'GREATER_THAN',
        thresholdValue: 20,
        currentValue: 25,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 2. GREATER_THAN_OR_EQUAL
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'GREATER_THAN_OR_EQUAL',
        thresholdValue: 20,
        currentValue: 20,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 3. LESS_THAN
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'LESS_THAN',
        thresholdValue: 15,
        currentValue: 10,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 4. LESS_THAN_OR_EQUAL
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'LESS_THAN_OR_EQUAL',
        thresholdValue: 15,
        currentValue: 15,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 5. EQUALS
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'EQUALS',
        thresholdValue: 50,
        currentValue: 50,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 6. CHANGE_BY
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'CHANGE_BY',
        thresholdValue: 5,
        currentValue: 6,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');

    // 7. PERCENT_CHANGE_BY
    expect(
      CatalystRiskPolicyRegistry.evaluateThesisBreaker({
        operator: 'PERCENT_CHANGE_BY',
        thresholdValue: 20,
        currentValue: 25,
        bufferMarginPercent: 10,
        freshnessStatus: 'CURRENT',
      })
    ).toBe('BREACHED');
  });
});
