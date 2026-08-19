import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';
import { CatalystItem, RiskItem } from '../../src/domain/risks/CatalystRiskTypes';

describe('Phase 12 — Catalyst vs Risk Asymmetry Evaluation Tests', () => {
  it('evaluates HIGHLY_FAVORABLE asymmetry when upside potential significantly outweighs downside exposure and critical risks are 0', () => {
    const mockCatalysts: CatalystItem[] = [
      {
        catalystId: 'c1',
        title: 'Major Capacity Expansion',
        description: 'New plant starts production',
        type: 'CAPACITY_EXPANSION',
        expectedHorizon: 'SHORT_TERM_3_6M',
        likelihood: 'HIGH',
        likelihoodScore: 4,
        impactMagnitude: 'MATERIAL',
        impactScore: 9,
        financialChannels: ['REVENUE'],
        businessDrivers: ['Volume'],
        evidenceReferences: ['Annual Report'],
        supportingFactIds: [],
        sourceLayer: 'MANAGEMENT',
        verificationStatus: 'VERIFIED_EVIDENCE',
        confidence: 90,
      },
    ];

    const mockRisks: RiskItem[] = [
      {
        riskId: 'r1',
        title: 'Minor Raw Material Fluctuations',
        category: 'MACRO_COMMODITY_CURRENCY',
        description: 'Transient raw material price rise',
        probability: 'LOW',
        probabilityScore: 2,
        impact: 'MINOR',
        impactScore: 2,
        rawRiskScore: 4,
        severity: 'LOW',
        velocity: 'SLOW_EROSION',
        measurableExposure: '₹20 Cr cost variance',
        mitigations: [],
        netExposure: 'UNMITIGATED',
        netRiskScore: 4,
        falsifiableTriggers: [],
        evidenceSourceIds: [],
        sourceLayer: 'INDUSTRY',
        lineage: {
          underlyingRiskId: 'und_r1',
          sourceRiskIds: [],
          sourceLayers: [],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 80,
        },
        confidence: 80,
      },
    ];

    const res = CatalystRiskPolicyRegistry.calculateCatalystRiskAsymmetry(mockCatalysts, mockRisks);

    expect(res.asymmetry).toBe('HIGHLY_FAVORABLE');
    expect(res.ratio).toBeGreaterThanOrEqual(2.0);
  });

  it('evaluates HIGHLY_ASYMMETRIC_DOWNSIDE when critical risks >= 2', () => {
    const mockCatalysts: CatalystItem[] = [];
    const mockRisks: RiskItem[] = [
      {
        riskId: 'r_crit_1',
        title: 'Imminent Solvency Threat',
        category: 'BALANCE_SHEET_LEVERAGE',
        description: 'Default on external debt covenants',
        probability: 'HIGH',
        probabilityScore: 5,
        impact: 'CATASTROPHIC',
        impactScore: 5,
        rawRiskScore: 25,
        severity: 'CRITICAL',
        velocity: 'IMMEDIATE_SHOCK',
        measurableExposure: '₹10,000 Cr debt default',
        mitigations: [],
        netExposure: 'UNMITIGATED',
        netRiskScore: 25,
        falsifiableTriggers: [],
        evidenceSourceIds: [],
        sourceLayer: 'FORENSIC',
        lineage: {
          underlyingRiskId: 'und_crit1',
          sourceRiskIds: [],
          sourceLayers: [],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 90,
        },
        confidence: 90,
      },
      {
        riskId: 'r_crit_2',
        title: 'Statutory License Revocation',
        category: 'REGULATORY_LEGAL',
        description: 'Key operating license suspended',
        probability: 'HIGH',
        probabilityScore: 5,
        impact: 'CATASTROPHIC',
        impactScore: 5,
        rawRiskScore: 25,
        severity: 'CRITICAL',
        velocity: 'IMMEDIATE_SHOCK',
        measurableExposure: '100% production stoppage',
        mitigations: [],
        netExposure: 'UNMITIGATED',
        netRiskScore: 25,
        falsifiableTriggers: [],
        evidenceSourceIds: [],
        sourceLayer: 'NEWS_INDUSTRY',
        lineage: {
          underlyingRiskId: 'und_crit2',
          sourceRiskIds: [],
          sourceLayers: [],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 90,
        },
        confidence: 90,
      },
    ];

    const res = CatalystRiskPolicyRegistry.calculateCatalystRiskAsymmetry(mockCatalysts, mockRisks);

    expect(res.asymmetry).toBe('HIGHLY_ASYMMETRIC_DOWNSIDE');
  });
});
