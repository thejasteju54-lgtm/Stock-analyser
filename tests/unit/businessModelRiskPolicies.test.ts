import { describe, it, expect } from 'vitest';
import { ThesisBreakerEngine } from '../../src/domain/risks/ThesisBreakerEngine';
import { ResearchProject, createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 12 — Business Model & Sector Specific Thesis Breakers Tests', () => {
  it('generates banking-specific thesis breakers (GNPA, NIM) for banking companies', () => {
    const bankCompany = createCompanyEntity({
      legalName: 'HDFC Bank Limited',
      displayName: 'HDFC Bank',
      symbol: 'HDFCBANK',
      exchange: 'NSE',
      sector: 'Banking',
      subsector: 'Private Sector Bank',
    });

    const project: ResearchProject = createResearchProject({ company: bankCompany });
    const breakers = ThesisBreakerEngine.generateThesisBreakers(project);

    const gnpaBreaker = breakers.find((b) => b.metric.includes('GNPA'));
    const nimBreaker = breakers.find((b) => b.metric.includes('NIM'));

    expect(gnpaBreaker).toBeDefined();
    expect(nimBreaker).toBeDefined();
    expect(gnpaBreaker?.operator).toBe('GREATER_THAN');
    expect(nimBreaker?.operator).toBe('LESS_THAN');
  });

  it('generates IT-specific thesis breakers (Attrition, EBIT Margin) for technology companies', () => {
    const itCompany = createCompanyEntity({
      legalName: 'Infosys Limited',
      displayName: 'Infosys',
      symbol: 'INFY',
      exchange: 'NSE',
      sector: 'IT Services',
      subsector: 'Tier 1 IT Exporters',
    });

    const project: ResearchProject = createResearchProject({ company: itCompany });
    const breakers = ThesisBreakerEngine.generateThesisBreakers(project);

    const attritionBreaker = breakers.find((b) => b.metric.includes('Attrition'));
    const marginBreaker = breakers.find((b) => b.metric.includes('EBIT Margin'));

    expect(attritionBreaker).toBeDefined();
    expect(marginBreaker).toBeDefined();
  });

  it('generates manufacturing-specific thesis breakers (EBITDA Margin, Leverage, ROCE) for auto companies', () => {
    const autoCompany = createCompanyEntity({
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      sector: 'Automobile',
      subsector: 'Commercial Vehicles (CV)',
    });

    const project: ResearchProject = createResearchProject({ company: autoCompany });
    const breakers = ThesisBreakerEngine.generateThesisBreakers(project);

    const marginBreaker = breakers.find((b) => b.metric.includes('EBITDA Margin'));
    const leverageBreaker = breakers.find((b) => b.metric.includes('Debt to Equity'));
    const roceBreaker = breakers.find((b) => b.metric.includes('ROCE'));

    expect(marginBreaker).toBeDefined();
    expect(leverageBreaker).toBeDefined();
    expect(roceBreaker).toBeDefined();
  });
});
