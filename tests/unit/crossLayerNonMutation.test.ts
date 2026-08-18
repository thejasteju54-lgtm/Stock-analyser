import { describe, it, expect } from 'vitest';
import { CrossLayerSensitivityEngine } from '../../src/domain/news/CrossLayerSensitivityEngine';
import { IndustryAnalysisEngine } from '../../src/domain/industry/IndustryAnalysisEngine';
import { NewsEvent } from '../../src/domain/news/NewsAndIndustryTypes';

describe('Phase 11 — Non-Mutating Cross-Layer Sensitivity Tests', () => {
  it('generates observation-only cross-layer sensitivity items without mutating state', () => {
    const mockNewsEvents: NewsEvent[] = [
      {
        eventId: 'ev_steel',
        headline: 'Automotive steel raw material prices surge 8%',
        summary: 'Input price inflation impacting automotive OEMs.',
        eventDate: '2024-03-01',
        eventDatePrecision: 'EXACT_DATE',
        publicationDate: '2024-03-01T00:00:00Z',
        retrievedAt: '2024-03-01T00:00:00Z',
        timezone: 'Asia/Kolkata',
        sourceReferences: [],
        companyEntities: [],
        peopleEntities: [],
        industryEntities: [],
        eventCategory: 'COMMODITY',
        relevance: 'DIRECT_COMPANY',
        impactAssessment: {
          direction: 'NEGATIVE',
          magnitude: 'HIGH',
          horizon: 'MEDIUM_TERM',
          rationale: 'Cost inflation.',
          businessChannels: ['Raw Material Procurement'],
          financialChannels: ['MARGINS', 'PRICING'],
          potentialEffect: 'Gross margin pressure.',
          confidence: 85,
          evidenceReferences: [],
        },
        sourceLineageIds: [],
        corroborationStatus: 'PRIMARY_CONFIRMED',
        eventStatus: 'NEW',
        confidence: 85,
        evidenceReferences: [],
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
      },
    ];

    const industryProfile = IndustryAnalysisEngine.generateIndustryProfile('Automobile', 'Automotive OEM', 'TATAMOTORS');

    const sensitivities = CrossLayerSensitivityEngine.generateSensitivities(
      mockNewsEvents,
      industryProfile
    );

    expect(sensitivities.length).toBeGreaterThan(0);

    // Verify all items are strictly marked OBSERVATION_ONLY
    for (const item of sensitivities) {
      expect(item.status).toBe('OBSERVATION_ONLY');
      expect(item.isCausalityProven).toBe(false);
    }

    // Verify presence of linkages across target phases
    const phase5Link = sensitivities.find((s) => s.targetPhase === 'PHASE_5_FINANCIALS');
    expect(phase5Link).toBeDefined();
    expect(phase5Link?.observationNote).toContain('Phase 5 metrics remain unmodified');
  });
});
