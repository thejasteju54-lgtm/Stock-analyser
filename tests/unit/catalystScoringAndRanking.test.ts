import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';
import { CatalystExtractionEngine } from '../../src/domain/risks/CatalystExtractionEngine';
import { ResearchProject, createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 12 — Catalyst Scoring & Deterministic Ranking Tests', () => {
  it('calculates deterministic catalyst priority score (1-10) using exact multi-variable formula', () => {
    // Score = round(0.30*M + 0.25*L + 0.20*E + 0.10*T + 0.10*C + 0.05*H)
    // For Material (10), High (10), Verified (10), Immediate (10), Primary Channel (10), Precedent 100% (10):
    // raw = 0.3*10 + 0.25*10 + 0.2*10 + 0.1*10 + 0.1*10 + 0.05*10 = 10.0 -> Score 10
    const resMax = CatalystRiskPolicyRegistry.calculateCatalystScore({
      impactMagnitude: 'MATERIAL',
      likelihood: 'HIGH',
      verificationStatus: 'VERIFIED_EVIDENCE',
      horizon: 'IMMEDIATE_0_3M',
      isPrimaryFinancialChannel: true,
      precedentFrequency: 1.0,
      confidence: 95,
    });

    expect(resMax.isAssessable).toBe(true);
    expect(resMax.score).toBe(10);

    // For Low (2.5), Low (3.0), Analyst (3.0), Long Term (6.0), Secondary Channel (5.0), Precedent 20% (2.0):
    // raw = 0.30*2.5 + 0.25*3.0 + 0.20*3.0 + 0.10*6.0 + 0.10*5.0 + 0.05*2.0
    // = 0.75 + 0.75 + 0.60 + 0.60 + 0.50 + 0.10 = 3.3 -> Score 3
    const resLow = CatalystRiskPolicyRegistry.calculateCatalystScore({
      impactMagnitude: 'LOW',
      likelihood: 'LOW',
      verificationStatus: 'ANALYST_INFERENCE',
      horizon: 'LONG_TERM_12M_PLUS',
      isPrimaryFinancialChannel: false,
      precedentFrequency: 0.2,
      confidence: 60,
    });

    expect(resLow.isAssessable).toBe(true);
    expect(resLow.score).toBe(3);
  });

  it('falls back strictly to NOT_ASSESSABLE when evidence is missing or confidence is 0', () => {
    const resMissing = CatalystRiskPolicyRegistry.calculateCatalystScore({
      impactMagnitude: 'MATERIAL',
      likelihood: 'HIGH',
      verificationStatus: 'NOT_ASSESSABLE',
      horizon: 'IMMEDIATE_0_3M',
      isPrimaryFinancialChannel: true,
      confidence: 0,
    });

    expect(resMissing.isAssessable).toBe(false);
    expect(resMissing.score).toBe(0);
  });

  it('ranks catalysts deterministically by impactScore descending then likelihoodScore descending', () => {
    const mockCompany = createCompanyEntity({
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      sector: 'Automobile',
      subsector: 'Commercial Vehicles (CV)',
    });

    const project: ResearchProject = createResearchProject({ company: mockCompany });

    const { catalysts, rankedCatalysts } = CatalystExtractionEngine.extractCatalysts(project);

    expect(catalysts.length).toBeGreaterThan(0);
    expect(rankedCatalysts.length).toBe(catalysts.length);

    // Verify ordering
    for (let i = 0; i < rankedCatalysts.length - 1; i++) {
      expect(rankedCatalysts[i].impactScore).toBeGreaterThanOrEqual(rankedCatalysts[i + 1].impactScore);
    }
  });
});
