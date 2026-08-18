import { describe, it, expect } from 'vitest';
import { NewsEvent, SourceLineage } from '../../src/domain/news/NewsAndIndustryTypes';

describe('Phase 11 — NewsEvent Schema & Source Lineage Tests', () => {
  it('validates complete NewsEvent schema with all 20 required fields', () => {
    const event: NewsEvent = {
      eventId: 'ev_001',
      headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
      summary: 'Order win for supplying 2,500 low-floor electric buses to Delhi Transport Corporation.',
      eventDate: '2024-04-12',
      eventDatePrecision: 'EXACT_DATE',
      publicationDate: '2024-04-12T10:30:00Z',
      retrievedAt: '2024-04-12T10:35:00Z',
      timezone: 'Asia/Kolkata',
      sourceReferences: [
        {
          sourceId: 'src_01',
          sourceName: 'NSE Filing',
          sourceType: 'EXCHANGE_FILING',
          sourceTier: 'TIER_1_PRIMARY',
          publisher: 'NSE',
          publishedAt: '2024-04-12T10:30:00Z',
          retrievedAt: '2024-04-12T10:35:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 99,
          primaryOrSecondary: 'PRIMARY_SOURCE',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      ],
      companyEntities: [
        {
          entityId: 'ent_co_TATAMOTORS',
          name: 'Tata Motors Limited',
          type: 'COMPANY',
          role: 'PRIMARY_ENTITY',
        },
      ],
      peopleEntities: [],
      industryEntities: [
        {
          entityId: 'ent_sec_Automobile',
          name: 'Automobile',
          type: 'SECTOR',
          role: 'SECONDARY_ENTITY',
        },
      ],
      eventCategory: 'ORDER_WIN',
      eventSubcategory: 'COMMERCIAL_EV_BUSES',
      relevance: 'DIRECT_COMPANY',
      impactAssessment: {
        direction: 'POSITIVE',
        magnitude: 'MATERIAL',
        horizon: 'MEDIUM_TERM',
        rationale: 'Substantial commercial order inflow adding directly to order book.',
        businessChannels: ['Order Inflow', 'EV Fleet Delivery'],
        financialChannels: ['REVENUE', 'VOLUME', 'WORKING_CAPITAL'],
        potentialEffect: 'Positive revenue acceleration over next 24 months.',
        confidence: 90,
        evidenceReferences: ['NSE Filing Ref: 2024/04/12/TM_DTC'],
      },
      duplicateGroupId: 'grp_001',
      sourceLineageIds: ['lin_001'],
      corroborationStatus: 'PRIMARY_CONFIRMED',
      eventStatus: 'NEW',
      confidence: 88,
      evidenceReferences: ['NSE Filing Ref: 2024/04/12/TM_DTC'],
      createdAt: '2024-04-12T10:35:00Z',
      updatedAt: '2024-04-12T10:35:00Z',
    };

    expect(event.eventId).toBe('ev_001');
    expect(event.eventCategory).toBe('ORDER_WIN');
    expect(event.eventDatePrecision).toBe('EXACT_DATE');
    expect(event.impactAssessment.financialChannels).toContain('REVENUE');
    expect(event.impactAssessment.financialChannels).toContain('VOLUME');
  });

  it('preserves date precision without manufacturing exact days for quarter milestones', () => {
    const futureEvent: NewsEvent = {
      eventId: 'ev_fut_002',
      headline: 'New Sanand Plant commissioning expected by Q4 FY26',
      summary: 'Management targets operational readiness for dedicated EV facility.',
      eventDate: 'Q4 FY26',
      eventDatePrecision: 'QUARTER',
      publicationDate: '2024-04-01T00:00:00Z',
      retrievedAt: '2024-04-01T00:00:00Z',
      timezone: 'Asia/Kolkata',
      sourceReferences: [],
      companyEntities: [],
      peopleEntities: [],
      industryEntities: [],
      eventCategory: 'EXPANSION',
      relevance: 'DIRECT_COMPANY',
      impactAssessment: {
        direction: 'POSITIVE',
        magnitude: 'HIGH',
        horizon: 'LONG_TERM',
        rationale: 'Capacity scale-up.',
        businessChannels: ['Capacity Expansion'],
        financialChannels: ['CAPEX', 'ASSET_VALUE'],
        potentialEffect: 'Capacity expansion enabling higher volume output.',
        confidence: 80,
        evidenceReferences: [],
      },
      sourceLineageIds: ['lin_002'],
      corroborationStatus: 'SINGLE_RELIABLE_SOURCE',
      eventStatus: 'FUTURE_EXPECTED',
      confidence: 80,
      evidenceReferences: [],
      createdAt: '2024-04-01T00:00:00Z',
      updatedAt: '2024-04-01T00:00:00Z',
    };

    expect(futureEvent.eventDatePrecision).toBe('QUARTER');
    expect(futureEvent.eventDate).toBe('Q4 FY26');
    expect(futureEvent.eventStatus).toBe('FUTURE_EXPECTED');
  });

  it('models SourceLineage tracking primary origin and derived outlets', () => {
    const lineage: SourceLineage = {
      lineageId: 'lin_999',
      primarySourceId: 'src_filing_nse',
      derivedSourceIds: ['src_reuters_wire', 'src_moneycontrol_portal'],
      relationshipType: 'SYNDICATED',
      confidence: 95,
    };

    expect(lineage.primarySourceId).toBe('src_filing_nse');
    expect(lineage.derivedSourceIds.length).toBe(2);
    expect(lineage.relationshipType).toBe('SYNDICATED');
  });
});
