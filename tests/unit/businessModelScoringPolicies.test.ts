import { describe, it, expect } from 'vitest';
import { HealthScoringPolicyRegistry } from '../../src/domain/analysis/HealthScoringPolicyRegistry';

describe('Phase 6 — HealthScoringPolicyRegistry & Business-Model-Specific Policies', () => {
  it('1. Banking Policy: excludes manufacturing working capital and debt/EBITDA', () => {
    const policy = HealthScoringPolicyRegistry.getPolicy('BANKING');
    expect(policy.businessModelCode).toBe('BANKING');
    expect(policy.excludedMetrics).toContain('INVENTORY_DAYS');
    expect(policy.excludedMetrics).toContain('CASH_CONVERSION_CYCLE');
    expect(policy.excludedMetrics).toContain('NET_DEBT_TO_EBITDA');
    expect(policy.categoryWeights.WORKING_CAPITAL).toBe(0);
    expect(policy.applicableCategories).not.toContain('WORKING_CAPITAL');
  });

  it('2. NBFC Policy: gates against non-financial operating debt metrics', () => {
    const policy = HealthScoringPolicyRegistry.getPolicy('NBFC');
    expect(policy.businessModelCode).toBe('NBFC');
    expect(policy.excludedMetrics).toContain('NET_DEBT_TO_EBITDA');
    expect(policy.excludedMetrics).toContain('RECEIVABLE_DAYS');
    expect(policy.categoryWeights.WORKING_CAPITAL).toBe(0);
  });

  it('3. Insurance Policy: focuses on top-line growth, net margins, and ROE', () => {
    const policy = HealthScoringPolicyRegistry.getPolicy('INSURANCE');
    expect(policy.businessModelCode).toBe('INSURANCE');
    expect(policy.applicableCategories).toContain('GROWTH');
    expect(policy.applicableCategories).toContain('MARGINS');
    expect(policy.applicableCategories).toContain('RETURNS');
    expect(policy.categoryWeights.LEVERAGE).toBe(0);
  });

  it('4. REIT & InvIT Policies: prioritize cash flow distribution and debt coverage', () => {
    const reitPolicy = HealthScoringPolicyRegistry.getPolicy('REIT');
    expect(reitPolicy.businessModelCode).toBe('REIT');
    expect(reitPolicy.categoryWeights.CASH_FLOW_QUALITY).toBe(30);
    expect(reitPolicy.categoryWeights.LEVERAGE).toBe(25);
    expect(reitPolicy.excludedMetrics).toContain('INVENTORY_DAYS');

    const invitPolicy = HealthScoringPolicyRegistry.getPolicy('INVIT');
    expect(invitPolicy.businessModelCode).toBe('INVIT');
    expect(invitPolicy.categoryWeights.CASH_FLOW_QUALITY).toBe(30);
  });

  it('5. Fallback Policy: unmapped business models default safely to OPERATING_INDUSTRIAL', () => {
    const customPolicy = HealthScoringPolicyRegistry.getPolicy('CUSTOM_UNKNOWN_MODEL');
    expect(customPolicy.businessModelCode).toBe('OPERATING_INDUSTRIAL');
    expect(customPolicy.applicableCategories).toContain('WORKING_CAPITAL');
    expect(customPolicy.applicableMetrics).toContain('CASH_CONVERSION_CYCLE');
  });
});
