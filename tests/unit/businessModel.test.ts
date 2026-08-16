import { describe, it, expect } from 'vitest';
import {
  getBusinessModelDefinition,
  getAllBusinessModelCodes,
  isBusinessModelRegistered,
  registerBusinessModel,
  isForensicModelApplicableToBusinessModel,
  isValuationModelApplicableToBusinessModel,
} from '../../src/domain/taxonomy/BusinessModelRegistry';
import { resolveDefaultBusinessModelForSector } from '../../src/domain/taxonomy/SectorTaxonomyRegistry';
import { createCompanyEntity, validateCompanyIdentity } from '../../src/domain/models/Company';

describe('Phase 2 Correction — Business Model Taxonomy & Extensible Registry', () => {
  it('contains all mandatory Indian business model archetypes', () => {
    const codes = getAllBusinessModelCodes();
    const mandatoryCodes = [
      'BANKING',
      'NBFC',
      'HFC',
      'MICROFINANCE',
      'INSURANCE',
      'ASSET_MANAGEMENT',
      'BROKERAGE',
      'STOCK_EXCHANGE',
      'REAL_ESTATE',
      'REIT',
      'INVIT',
      'PROJECT_INFRA',
      'UTILITY',
      'NON_FINANCIAL_OPERATING',
      'COMMODITY',
      'TELECOM',
      'HEALTHCARE',
      'PHARMA',
      'DIVERSIFIED',
    ];

    mandatoryCodes.forEach((code) => {
      expect(codes).toContain(code);
      expect(isBusinessModelRegistered(code)).toBe(true);
      const def = getBusinessModelDefinition(code);
      expect(def).toBeDefined();
      expect(def?.applicableMetrics.length).toBeGreaterThan(0);
      expect(def?.applicableForensicModels.length).toBeGreaterThan(0);
      expect(def?.applicableValuationModels.length).toBeGreaterThan(0);
    });
  });

  describe('Model Gating & Metric Resolution per Business Model', () => {
    it('resolves correct forensic and valuation models for HFC (Housing Finance)', () => {
      const hfc = getBusinessModelDefinition('HFC');
      expect(hfc?.economicArchetype).toBe('LENDING_FINANCIAL');
      expect(hfc?.applicableMetrics).toContain('LTV_RATIO');
      expect(hfc?.applicableMetrics).toContain('STAGE_3_ASSETS');

      // Gated models
      expect(isForensicModelApplicableToBusinessModel('HFC', 'NPA_PCR_QUALITY')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('HFC', 'SOLVENCY_LEVERAGE')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('HFC', 'BENEISH_M_SCORE')).toBe(false);
      expect(isForensicModelApplicableToBusinessModel('HFC', 'WORKING_CAPITAL_CYCLE')).toBe(false);

      expect(isValuationModelApplicableToBusinessModel('HFC', 'PB_ABV')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('HFC', 'EV_EBITDA')).toBe(false);
    });

    it('resolves correct forensic and valuation models for Microfinance (MFI)', () => {
      const mfi = getBusinessModelDefinition('MICROFINANCE');
      expect(mfi?.economicArchetype).toBe('LENDING_FINANCIAL');
      expect(mfi?.applicableMetrics).toContain('PAR_30');
      expect(mfi?.applicableMetrics).toContain('CREDIT_COST');

      expect(isForensicModelApplicableToBusinessModel('MICROFINANCE', 'NPA_PCR_QUALITY')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('MICROFINANCE', 'CAPITAL_DILUTION')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('MICROFINANCE', 'BENEISH_M_SCORE')).toBe(false);

      expect(isValuationModelApplicableToBusinessModel('MICROFINANCE', 'PB_ABV')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('MICROFINANCE', 'PE')).toBe(true);
    });

    it('resolves correct models for REIT (Real Estate Investment Trust)', () => {
      const reit = getBusinessModelDefinition('REIT');
      expect(reit?.economicArchetype).toBe('INFRASTRUCTURE_TRUST');
      expect(reit?.applicableMetrics).toContain('NDCF_YIELD');
      expect(reit?.applicableMetrics).toContain('WALE_YEARS');

      expect(isForensicModelApplicableToBusinessModel('REIT', 'NAV_DISCOUNT_MONITOR')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('REIT', 'BENEISH_M_SCORE')).toBe(false);

      expect(isValuationModelApplicableToBusinessModel('REIT', 'NAV')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('REIT', 'DIVIDEND_DISCOUNT')).toBe(true);
    });

    it('resolves correct models for InvIT (Infrastructure Investment Trust)', () => {
      const invit = getBusinessModelDefinition('INVIT');
      expect(invit?.economicArchetype).toBe('INFRASTRUCTURE_TRUST');
      expect(invit?.applicableMetrics).toContain('DISTRIBUTABLE_CASH_FLOW');

      expect(isForensicModelApplicableToBusinessModel('INVIT', 'NAV_DISCOUNT_MONITOR')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('INVIT', 'NAV')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('INVIT', 'DCF')).toBe(true);
    });

    it('resolves correct models for Banking', () => {
      const bank = getBusinessModelDefinition('BANKING');
      expect(bank?.economicArchetype).toBe('LENDING_FINANCIAL');
      expect(bank?.applicableMetrics).toContain('CASA_RATIO');
      expect(bank?.applicableMetrics).toContain('NIM');

      expect(isForensicModelApplicableToBusinessModel('BANKING', 'NPA_PCR_QUALITY')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('BANKING', 'BENEISH_M_SCORE')).toBe(false);
      expect(isValuationModelApplicableToBusinessModel('BANKING', 'PB_ABV')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('BANKING', 'EV_EBITDA')).toBe(false);
    });

    it('resolves correct models for NBFC', () => {
      const nbfc = getBusinessModelDefinition('NBFC');
      expect(nbfc?.economicArchetype).toBe('LENDING_FINANCIAL');
      expect(nbfc?.applicableMetrics).toContain('ALM_MISMATCH');
      expect(isForensicModelApplicableToBusinessModel('NBFC', 'SOLVENCY_LEVERAGE')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('NBFC', 'PB_ABV')).toBe(true);
    });

    it('resolves correct models for Insurance', () => {
      const ins = getBusinessModelDefinition('INSURANCE');
      expect(ins?.economicArchetype).toBe('NON_LENDING_FINANCIAL');
      expect(ins?.applicableMetrics).toContain('VNB_MARGIN');
      expect(ins?.applicableMetrics).toContain('EMBEDDED_VALUE');
      expect(isForensicModelApplicableToBusinessModel('INSURANCE', 'UNDERWRITING_QUALITY')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('INSURANCE', 'EMBEDDED_VALUE')).toBe(true);
    });

    it('resolves correct models for Non-Financial Operating (Manufacturing / IT / Consumer)', () => {
      const op = getBusinessModelDefinition('NON_FINANCIAL_OPERATING');
      expect(op?.economicArchetype).toBe('OPERATING_INDUSTRIAL');
      expect(op?.applicableMetrics).toContain('ROCE');
      expect(op?.applicableMetrics).toContain('WORKING_CAPITAL_DAYS');

      expect(isForensicModelApplicableToBusinessModel('NON_FINANCIAL_OPERATING', 'BENEISH_M_SCORE')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('NON_FINANCIAL_OPERATING', 'ALTMAN_Z_SCORE')).toBe(true);
      expect(isForensicModelApplicableToBusinessModel('NON_FINANCIAL_OPERATING', 'CFO_PAT_DIVERGENCE')).toBe(true);

      expect(isValuationModelApplicableToBusinessModel('NON_FINANCIAL_OPERATING', 'EV_EBITDA')).toBe(true);
      expect(isValuationModelApplicableToBusinessModel('NON_FINANCIAL_OPERATING', 'DCF')).toBe(true);
    });
  });

  describe('Sector to Business Model Resolution', () => {
    it('correctly maps specialized subsectors to distinct business models', () => {
      // Within NBFC sector, Housing Finance subsector resolves to HFC
      const hfcModel = resolveDefaultBusinessModelForSector('NBFC', 'Housing Finance (HFC)');
      expect(hfcModel).toBe('HFC');

      // Within NBFC sector, Microfinance subsector resolves to MICROFINANCE
      const mfiModel = resolveDefaultBusinessModelForSector('NBFC', 'Microfinance (MFI)');
      expect(mfiModel).toBe('MICROFINANCE');

      // Generic NBFC subsector defaults to NBFC
      const vehicleModel = resolveDefaultBusinessModelForSector('NBFC', 'Vehicle Finance');
      expect(vehicleModel).toBe('NBFC');

      // Financial Services subsectors
      expect(resolveDefaultBusinessModelForSector('Financial Services', 'Asset Management (AMC)')).toBe('ASSET_MANAGEMENT');
      expect(resolveDefaultBusinessModelForSector('Financial Services', 'Stock Exchanges & Depositories')).toBe('STOCK_EXCHANGE');
      expect(resolveDefaultBusinessModelForSector('Financial Services', 'Retail Wealth & Brokerages')).toBe('BROKERAGE');
    });
  });

  describe('Extensibility & Safety Verification', () => {
    it('fails safely when an unsupported/unregistered business model is requested', () => {
      expect(isBusinessModelRegistered('UNKNOWN_SYNTHETIC_MODEL')).toBe(false);
      expect(getBusinessModelDefinition('UNKNOWN_SYNTHETIC_MODEL')).toBeUndefined();
      expect(isForensicModelApplicableToBusinessModel('UNKNOWN_SYNTHETIC_MODEL', 'BENEISH_M_SCORE')).toBe(false);
      expect(isValuationModelApplicableToBusinessModel('UNKNOWN_SYNTHETIC_MODEL', 'DCF')).toBe(false);

      const validation = validateCompanyIdentity({
        legalName: 'Test Corporation',
        symbol: 'TEST',
        exchange: 'NSE',
        sector: 'IT Services',
        subsector: 'Tier 1 IT Exporters',
        businessModel: 'UNKNOWN_INVALID_MODEL',
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.includes('not recognized in the BusinessModel registry'))).toBe(true);
    });

    it('dynamically registers custom user/analyst-defined business models', () => {
      registerBusinessModel({
        code: 'PLATFORM_SAAS',
        displayName: 'Vertical SaaS & Cloud Marketplace',
        description: 'Subscription ARR software with negative churn and net dollar retention.',
        economicArchetype: 'OPERATING_INDUSTRIAL',
        applicableMetrics: ['ARR', 'NET_RETENTION_RATE', 'CAC_PAYBACK', 'RULE_OF_40', 'FCF_MARGIN'],
        applicableForensicModels: ['REVENUE_RECOGNITION', 'CFO_PAT_DIVERGENCE'],
        applicableValuationModels: ['EV_EBITDA', 'DCF', 'PE'],
      });

      expect(isBusinessModelRegistered('PLATFORM_SAAS')).toBe(true);
      const customDef = getBusinessModelDefinition('PLATFORM_SAAS');
      expect(customDef?.applicableMetrics).toContain('RULE_OF_40');
      expect(isForensicModelApplicableToBusinessModel('PLATFORM_SAAS', 'REVENUE_RECOGNITION')).toBe(true);

      // Successfully creates company entity using newly registered custom model
      const saasCo = createCompanyEntity({
        legalName: 'Cloud India Technologies Limited',
        symbol: 'CLOUDTECH',
        exchange: 'NSE',
        sector: 'IT Services',
        subsector: 'Tier 1 IT Exporters',
        businessModel: 'PLATFORM_SAAS',
      });
      expect(saasCo.businessModel).toBe('PLATFORM_SAAS');
    });

    it('preserves backward compatibility with existing legacy classifications', () => {
      const legacyReit = createCompanyEntity({
        legalName: 'Mindspace Business Parks REIT',
        symbol: 'MINDSPACE',
        exchange: 'NSE',
        sector: 'REIT',
        subsector: 'Commercial Office REIT',
        businessModel: 'REAL_ESTATE_TRUST',
      });
      expect(legacyReit.businessModel).toBe('REAL_ESTATE_TRUST');
    });
  });
});
