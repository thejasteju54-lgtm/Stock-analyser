import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';
import { RiskItem } from '../../src/domain/risks/CatalystRiskTypes';

describe('Phase 12 — 5x5 Matrix Geometry & Risk Lineage Deduplication Tests', () => {
  it('correctly maps raw PxI scores (1-25) into Critical, High, Medium, and Low severity bins', () => {
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(25)).toBe('CRITICAL');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(20)).toBe('CRITICAL');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(16)).toBe('HIGH');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(12)).toBe('HIGH');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(9)).toBe('MEDIUM');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(6)).toBe('MEDIUM');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(4)).toBe('LOW');
    expect(CatalystRiskPolicyRegistry.getSeverityFromNetScore(1)).toBe('LOW');
  });

  it('deduplicates multiple related risks sharing the same underlying lineage ID to prevent score inflation', () => {
    const mockRisks: RiskItem[] = [
      {
        riskId: 'risk_forensic_debt',
        title: 'Forensic Debt Flag',
        category: 'BALANCE_SHEET_LEVERAGE',
        description: 'Debt increased by 40%',
        probability: 'HIGH',
        probabilityScore: 4,
        impact: 'SEVERE',
        impactScore: 4,
        rawRiskScore: 16,
        severity: 'HIGH',
        velocity: 'SLOW_EROSION',
        measurableExposure: '₹12,000 Cr Total Debt',
        mitigations: [],
        netExposure: 'UNMITIGATED',
        netRiskScore: 16,
        falsifiableTriggers: [],
        evidenceSourceIds: ['doc_1'],
        sourceLayer: 'FORENSIC',
        lineage: {
          underlyingRiskId: 'und_debt_leverage',
          sourceRiskIds: ['f1'],
          sourceLayers: ['FORENSIC'],
          relationshipType: 'SAME_UNDERLYING_RISK',
          confidence: 85,
        },
        confidence: 85,
      },
      {
        riskId: 'risk_health_debt',
        title: 'Fundamental Health Debt Flag',
        category: 'BALANCE_SHEET_LEVERAGE',
        description: 'D/E above 1.5x',
        probability: 'HIGH',
        probabilityScore: 4,
        impact: 'SEVERE',
        impactScore: 4,
        rawRiskScore: 16,
        severity: 'HIGH',
        velocity: 'SLOW_EROSION',
        measurableExposure: '₹12,000 Cr Total Debt',
        mitigations: [],
        netExposure: 'UNMITIGATED',
        netRiskScore: 16,
        falsifiableTriggers: [],
        evidenceSourceIds: ['doc_2'],
        sourceLayer: 'FUNDAMENTAL',
        lineage: {
          underlyingRiskId: 'und_debt_leverage',
          sourceRiskIds: ['h1'],
          sourceLayers: ['FUNDAMENTAL'],
          relationshipType: 'SAME_UNDERLYING_RISK',
          confidence: 85,
        },
        confidence: 85,
      },
    ];

    const agg = CatalystRiskPolicyRegistry.calculateAggregateRiskRating(mockRisks);

    // Should deduplicate 2 flags into 1 underlying risk
    expect(agg.deduplicatedRiskCount).toBe(1);
    expect(agg.highCount).toBe(1);
    expect(agg.rating).toBe('ELEVATED');
  });
});
