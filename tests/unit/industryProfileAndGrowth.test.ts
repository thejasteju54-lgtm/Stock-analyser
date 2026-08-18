import { describe, it, expect } from 'vitest';
import { IndustryAnalysisEngine } from '../../src/domain/industry/IndustryAnalysisEngine';
import { NewsAndIndustryPolicyRegistry } from '../../src/domain/news/NewsAndIndustryPolicyRegistry';

describe('Phase 11 — Industry Profile, Growth Segregation & Cyclicality Tests', () => {
  it('strictly segregates HISTORICAL, CURRENT, and FORECAST growth with full methodology provenance', () => {
    const profile = IndustryAnalysisEngine.generateIndustryProfile('Automobile', 'Automotive OEM', 'TATAMOTORS');

    expect(profile.growthHistory.length).toBe(3);

    const hist = profile.growthHistory.find((g) => g.growthType === 'HISTORICAL');
    const curr = profile.growthHistory.find((g) => g.growthType === 'CURRENT');
    const fcast = profile.growthHistory.find((g) => g.growthType === 'FORECAST');

    expect(hist).toBeDefined();
    expect(hist?.growthRatePercent).toBe(11.2);
    expect(hist?.period).toContain('5Y CAGR');

    expect(curr).toBeDefined();
    expect(curr?.growthRatePercent).toBe(13.8);

    expect(fcast).toBeDefined();
    expect(fcast?.growthRatePercent).toBe(10.5);
    expect(fcast?.methodology).toBeDefined();
  });

  it('classifies demand drivers into STRUCTURAL_DRIVER and CYCLICAL_DRIVER', () => {
    const profile = IndustryAnalysisEngine.generateIndustryProfile('Automobile', 'Automotive OEM', 'TATAMOTORS');

    const structural = profile.demandDrivers.filter((d) => d.type === 'STRUCTURAL_DRIVER');
    const cyclical = profile.demandDrivers.filter((d) => d.type === 'CYCLICAL_DRIVER');

    expect(structural.length).toBeGreaterThan(0);
    expect(cyclical.length).toBeGreaterThan(0);
  });

  it('evaluates industry cycle stage deterministically using growth and capacity metrics', () => {
    const cycle = NewsAndIndustryPolicyRegistry.evaluateIndustryCycle(14.5, 'EXPANDING', 82, 'STRONG');
    expect(cycle).toBe('EXPANSION');

    const peakCycle = NewsAndIndustryPolicyRegistry.evaluateIndustryCycle(6.0, 'STABLE', 90, 'MODERATE');
    expect(peakCycle).toBe('PEAK');

    const contractionCycle = NewsAndIndustryPolicyRegistry.evaluateIndustryCycle(-4.0, 'CONTRACTING', 60, 'WEAK');
    expect(contractionCycle).toBe('CONTRACTION');
  });
});
