import { describe, it, expect } from 'vitest';
import { EntityResolutionEngine, CompanyEntityProfile } from '../../src/domain/news/EntityResolutionEngine';

describe('Phase 11 — Entity Resolution & Contextual Relevance Tests', () => {
  const profile: CompanyEntityProfile = {
    symbol: 'TATAMOTORS',
    legalName: 'Tata Motors Limited',
    displayName: 'Tata Motors',
    aliases: ['Tata Motors Ltd', 'TAMO'],
    subsidiaries: ['Jaguar Land Rover', 'JLR', 'Tata Passenger Electric Mobility'],
    brands: ['Nexon EV', 'Harrier', 'Punch'],
    promoters: ['Tata Sons Private Limited'],
    management: ['Natarajan Chandrasekaran', 'PB Balaji'],
    competitors: ['Maruti Suzuki', 'Mahindra & Mahindra', 'Ashok Leyland'],
    sector: 'Automobile',
  };

  it('classifies direct headline mention as DIRECT_COMPANY and PRIMARY_ENTITY', () => {
    const res = EntityResolutionEngine.resolveEntities(
      'Tata Motors wins ₹3,500 Cr electric bus order from DTC',
      'The order covers 2,500 low floor electric buses.',
      profile
    );

    expect(res.relevance).toBe('DIRECT_COMPANY');
    expect(res.companyEntities.some((e) => e.name === 'Tata Motors' && e.role === 'PRIMARY_ENTITY')).toBe(true);
  });

  it('classifies subsidiary and brand mentions as MATERIAL_COMPANY', () => {
    const res = EntityResolutionEngine.resolveEntities(
      'JLR reports record quarterly operating cash flow of £890m',
      'Jaguar Land Rover announces strong order book for Range Rover models.',
      profile
    );

    expect(res.relevance).toBe('MATERIAL_COMPANY');
    expect(res.companyEntities.some((e) => e.type === 'SUBSIDIARY')).toBe(true);
  });

  it('classifies competitor headline with passing company mention as INDIRECT_COMPANY / MENTION_ONLY', () => {
    const res = EntityResolutionEngine.resolveEntities(
      'Maruti Suzuki launches new compact hybrid SUV targeting 50% market share',
      'Maruti Suzuki aims to compete directly against models from Tata Motors and Hyundai.',
      profile
    );

    expect(res.relevance).toBe('INDIRECT_COMPANY');
    const compEnt = res.companyEntities.find((e) => e.name === 'Maruti Suzuki');
    const targetEnt = res.companyEntities.find((e) => e.name === 'Tata Motors');

    expect(compEnt?.role).toBe('PRIMARY_ENTITY');
    expect(targetEnt?.role).toBe('MENTION_ONLY');
  });

  it('classifies general sector regulation article as SECTOR_ONLY', () => {
    const res = EntityResolutionEngine.resolveEntities(
      'MoRTH announces new BS-VI Phase 2 emission testing standards for Automobile sector',
      'The ministry mandated Real Driving Emissions (RDE) compliance starting April.',
      profile
    );

    expect(res.relevance).toBe('SECTOR_ONLY');
    expect(res.industryEntities.some((e) => e.type === 'SECTOR')).toBe(true);
  });
});
