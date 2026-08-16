export type ForensicModelId =
  | 'BENEISH_M_SCORE'
  | 'ALTMAN_Z_SCORE'
  | 'WORKING_CAPITAL_CYCLE'
  | 'CFO_PAT_DIVERGENCE'
  | 'NPA_PCR_QUALITY'
  | 'REST_ASSET_MONITOR'
  | 'RELATED_PARTY_LENDING'
  | 'SOLVENCY_LEVERAGE'
  | 'CAPITAL_DILUTION'
  | 'REVENUE_RECOGNITION'
  | 'NAV_DISCOUNT_MONITOR'
  | 'PROJECT_EXECUTION_RISK'
  | 'UNDERWRITING_QUALITY';

export type ValuationModelId =
  | 'DCF'
  | 'EV_EBITDA'
  | 'PE'
  | 'PB_ABV'
  | 'FCF_YIELD'
  | 'NAV'
  | 'EMBEDDED_VALUE'
  | 'DIVIDEND_DISCOUNT'
  | 'SOTP'
  | 'REPLACEMENT_COST'
  | 'EV_CAPACITY'
  | 'ARPU_MULTIPLE';

export type EconomicArchetype =
  | 'LENDING_FINANCIAL'
  | 'NON_LENDING_FINANCIAL'
  | 'OPERATING_INDUSTRIAL'
  | 'INFRASTRUCTURE_TRUST'
  | 'UTILITY_REGULATED'
  | 'CONGLOMERATE';

export interface BusinessModelDefinition {
  code: string;
  displayName: string;
  description: string;
  economicArchetype: EconomicArchetype;
  applicableMetrics: string[];
  applicableForensicModels: ForensicModelId[];
  applicableValuationModels: ValuationModelId[];
  applicableTechnicalConsiderations?: string[];
  defaultPrimaryMetric?: string;
  isExtensibleCustom?: boolean;
}

// Built-in foundational registry covering mandatory Indian economic business models
const INITIAL_BUSINESS_MODELS: Record<string, BusinessModelDefinition> = {
  BANKING: {
    code: 'BANKING',
    displayName: 'Commercial & Retail Banking',
    description: 'Deposit-taking lending institution assessed on credit risk, net interest margin (NIM), CASA franchise, and asset quality.',
    economicArchetype: 'LENDING_FINANCIAL',
    applicableMetrics: ['NIM', 'GNPA', 'NNPA', 'PCR', 'CASA_RATIO', 'CRAR', 'COST_TO_INCOME', 'ROA', 'ROE'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'RELATED_PARTY_LENDING', 'CAPITAL_DILUTION'],
    applicableValuationModels: ['PB_ABV', 'PE', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Rate cycle sensitivity', 'Bank Nifty relative strength', 'Credit growth momentum'],
    defaultPrimaryMetric: 'P/ABV',
  },
  NBFC: {
    code: 'NBFC',
    displayName: 'Non-Banking Financial Company (NBFC)',
    description: 'Wholesale and retail non-banking credit institutions subject to asset-liability matching (ALM), borrowing costs, and collection efficiency.',
    economicArchetype: 'LENDING_FINANCIAL',
    applicableMetrics: ['AUM_GROWTH', 'NIM', 'STAGE_3_ASSETS', 'PCR', 'ALM_MISMATCH', 'SPREAD', 'ROA', 'ROE'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['PB_ABV', 'PE', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Cost of funds sensitivity', 'Liquidity spread impact'],
    defaultPrimaryMetric: 'P/ABV',
  },
  HFC: {
    code: 'HFC',
    displayName: 'Housing Finance Company (HFC)',
    description: 'Secured retail and developer housing mortgage lenders with long-duration asset portfolios and refinancing sensitivity.',
    economicArchetype: 'LENDING_FINANCIAL',
    applicableMetrics: ['LOAN_BOOK_GROWTH', 'NIM', 'COLLECTION_EFFICIENCY', 'LTV_RATIO', 'STAGE_3_ASSETS', 'SPREAD', 'ROA', 'ROE'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['PB_ABV', 'PE', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Real estate cycle alignment', '10Y G-Sec yield movement'],
    defaultPrimaryMetric: 'P/ABV',
  },
  MICROFINANCE: {
    code: 'MICROFINANCE',
    displayName: 'Microfinance Institution (MFI)',
    description: 'Unsecured joint-liability group (JLG) and individual micro-lending institutions subject to regional shocks and credit concentration cycles.',
    economicArchetype: 'LENDING_FINANCIAL',
    applicableMetrics: ['AUM_GROWTH', 'PAR_30', 'PAR_90', 'CREDIT_COST', 'NNPA', 'ROA', 'ROE', 'CUSTOMER_RETENTION'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'CAPITAL_DILUTION', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['PB_ABV', 'PE'],
    applicableTechnicalConsiderations: ['Rural economy indicators', 'Monsoon sentiment'],
    defaultPrimaryMetric: 'P/ABV',
  },
  INSURANCE: {
    code: 'INSURANCE',
    displayName: 'Life & General Insurance',
    description: 'Underwriting and risk protection business measured via Embedded Value, Value of New Business (VNB), combined ratio, and investment yield.',
    economicArchetype: 'NON_LENDING_FINANCIAL',
    applicableMetrics: ['VNB_MARGIN', 'EMBEDDED_VALUE', 'AUM', 'SOLVENCY_RATIO', 'COMBINED_RATIO', 'PERSISTENCY_13M', 'PERSISTENCY_61M'],
    applicableForensicModels: ['SOLVENCY_LEVERAGE', 'UNDERWRITING_QUALITY', 'RELATED_PARTY_LENDING', 'CAPITAL_DILUTION'],
    applicableValuationModels: ['EMBEDDED_VALUE', 'PB_ABV', 'PE'],
    applicableTechnicalConsiderations: ['Capital market equity flows', 'Bond yields'],
    defaultPrimaryMetric: 'P/EV',
  },
  ASSET_MANAGEMENT: {
    code: 'ASSET_MANAGEMENT',
    displayName: 'Asset Management Company (AMC)',
    description: 'Fee-based fund management and wealth advisory generating sticky revenue based on equity/debt AUM and market appreciation.',
    economicArchetype: 'NON_LENDING_FINANCIAL',
    applicableMetrics: ['EQUITY_AUM', 'TOTAL_AUM', 'SIP_INFLOWS', 'REVENUE_YIELD_BPS', 'EBITDA_MARGIN', 'PAT_MARGIN', 'ROCE'],
    applicableForensicModels: ['REVENUE_RECOGNITION', 'CFO_PAT_DIVERGENCE', 'CAPITAL_DILUTION'],
    applicableValuationModels: ['PE', 'DCF', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Domestic retail SIP trends', 'Equity market breadth'],
    defaultPrimaryMetric: 'P/E',
  },
  BROKERAGE: {
    code: 'BROKERAGE',
    displayName: 'Retail & Institutional Brokerage',
    description: 'Volume and transaction-driven equity/derivative execution, margin trading funding (MTF), and depository distribution.',
    economicArchetype: 'NON_LENDING_FINANCIAL',
    applicableMetrics: ['ADTO', 'ACTIVE_CLIENTS', 'MTF_BOOK', 'BROKING_REVENUE', 'INTEREST_INCOME', 'OPERATING_MARGIN', 'ROE'],
    applicableForensicModels: ['REVENUE_RECOGNITION', 'SOLVENCY_LEVERAGE', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['PE', 'PB_ABV', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Market turnover volumes', 'VIX volatility levels'],
    defaultPrimaryMetric: 'P/E',
  },
  STOCK_EXCHANGE: {
    code: 'STOCK_EXCHANGE',
    displayName: 'Market Infrastructure Institution (MII)',
    description: 'Natural exchange/depository monopolies profiting from listing fees, clearing charges, transaction volume, and market data.',
    economicArchetype: 'NON_LENDING_FINANCIAL',
    applicableMetrics: ['TRANSACTION_CHARGES', 'LISTING_FEES', 'EBITDA_MARGIN', 'CASH_CONVERSION_RATIO', 'ROCE', 'ROE'],
    applicableForensicModels: ['REVENUE_RECOGNITION', 'CFO_PAT_DIVERGENCE'],
    applicableValuationModels: ['PE', 'DCF', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Long-term structural compounder dynamics'],
    defaultPrimaryMetric: 'P/E',
  },
  REAL_ESTATE: {
    code: 'REAL_ESTATE',
    displayName: 'Real Estate Developer',
    description: 'Project development and pre-sales model sensitive to launch pipelines, land banking costs, cash collection cycles, and debt leverage.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['PRE_SALES', 'COLLECTIONS', 'NET_DEBT_EQUITY', 'EMBEDDED_LAND_BANK', 'AVERAGE_REALISATION', 'CASH_FLOW_FROM_OPERATIONS'],
    applicableForensicModels: ['WORKING_CAPITAL_CYCLE', 'CFO_PAT_DIVERGENCE', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['NAV', 'EV_EBITDA', 'PE'],
    applicableTechnicalConsiderations: ['Real estate index momentum', 'Property registrations data'],
    defaultPrimaryMetric: 'P/NAV',
  },
  REIT: {
    code: 'REIT',
    displayName: 'Real Estate Investment Trust (REIT)',
    description: 'Yield-focused commercial/retail real estate trust distributing mandatory ≥90% Net Distributable Cash Flows (NDCF).',
    economicArchetype: 'INFRASTRUCTURE_TRUST',
    applicableMetrics: ['NDCF_YIELD', 'COMMERCIAL_OCCUPANCY', 'WALE_YEARS', 'SAME_STORE_NOI_GROWTH', 'LOAN_TO_VALUE_LTV'],
    applicableForensicModels: ['NAV_DISCOUNT_MONITOR', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['NAV', 'DIVIDEND_DISCOUNT', 'SOTP'],
    applicableTechnicalConsiderations: ['10Y G-Sec spread', 'Interest rate trajectory'],
    defaultPrimaryMetric: 'NDCF Yield',
  },
  INVIT: {
    code: 'INVIT',
    displayName: 'Infrastructure Investment Trust (InvIT)',
    description: 'Operating infrastructure assets (highways, power transmission, telecom towers) providing long-term predictable cash distribution yields.',
    economicArchetype: 'INFRASTRUCTURE_TRUST',
    applicableMetrics: ['DISTRIBUTABLE_CASH_FLOW', 'ANNUITY_YIELD', 'TRAFFIC_GROWTH', 'TRANSMISSION_AVAILABILITY', 'LEVERAGE_LTV'],
    applicableForensicModels: ['NAV_DISCOUNT_MONITOR', 'SOLVENCY_LEVERAGE', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['NAV', 'DIVIDEND_DISCOUNT', 'DCF'],
    applicableTechnicalConsiderations: ['Bond yield differential', 'Inflation indexation'],
    defaultPrimaryMetric: 'Distribution Yield',
  },
  PROJECT_INFRA: {
    code: 'PROJECT_INFRA',
    displayName: 'EPC & Infrastructure Projects',
    description: 'Heavy construction, road concessions, and turnkey EPC projects driven by order book visibility, execution pace, and bank guarantees.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['ORDER_BOOK_TO_SALES', 'EXECUTION_CYCLE', 'EBITDA_MARGIN', 'WORKING_CAPITAL_DAYS', 'DEBT_TO_EQUITY', 'ROCE'],
    applicableForensicModels: ['WORKING_CAPITAL_CYCLE', 'CFO_PAT_DIVERGENCE', 'PROJECT_EXECUTION_RISK', 'ALTMAN_Z_SCORE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'SOTP', 'DCF'],
    applicableTechnicalConsiderations: ['Capex cycle tailwinds', 'Government budgetary allocations'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  UTILITY: {
    code: 'UTILITY',
    displayName: 'Regulated Utility & Power',
    description: 'Capital-intensive regulated return-on-equity (RoE) utilities (power generation, transmission, city gas distribution) with assured cash flows.',
    economicArchetype: 'UTILITY_REGULATED',
    applicableMetrics: ['REGULATED_EQUITY_BASE', 'PLATION_FACTOR', 'VOLUME_SALES', 'EBITDA_SPREAD', 'DEBT_SERVICE_COVERAGE', 'ROCE'],
    applicableForensicModels: ['SOLVENCY_LEVERAGE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF', 'DIVIDEND_DISCOUNT'],
    applicableTechnicalConsiderations: ['Power demand trends', 'Feedstock gas prices'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  NON_FINANCIAL_OPERATING: {
    code: 'NON_FINANCIAL_OPERATING',
    displayName: 'Standard Operating / Manufacturing / Consumer',
    description: 'Traditional commercial, industrial, or consumer enterprise analyzed via revenue growth, operating margins, working capital, and ROCE.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['REVENUE_GROWTH', 'EBITDA_MARGIN', 'PAT_MARGIN', 'ROCE', 'ROE', 'WORKING_CAPITAL_DAYS', 'FCF_CONVERSION', 'ASSET_TURNOVER'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF', 'FCF_YIELD'],
    applicableTechnicalConsiderations: ['Sector trend', '50/200 DMA support/resistance', 'Volume accumulation'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  COMMODITY: {
    code: 'COMMODITY',
    displayName: 'Cyclical Commodity & Materials',
    description: 'Price-taking cyclical businesses (Metals, Mining, Chemicals, Refining) with high earnings volatility tied to global benchmark prices.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['SPREAD_PER_TONNE', 'CAPACITY_UTILISATION', 'CASH_COST_PER_TONNE', 'EBITDA_PER_TONNE', 'NET_DEBT_EBITDA', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PB_ABV', 'REPLACEMENT_COST', 'EV_CAPACITY'],
    applicableTechnicalConsiderations: ['LME/Crude benchmark cycles', 'Global supply-demand balance'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  TELECOM: {
    code: 'TELECOM',
    displayName: 'Telecommunications & Digital Infrastructure',
    description: 'High-capex, spectrum-intensive network infrastructure analyzed via ARPU, subscriber base, spectrum debt, and operating leverage.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['ARPU', 'SUBSCRIBER_BASE', 'CHURN_RATE', 'DATA_USAGE_PER_SUB', 'EBITDA_MARGIN', 'NET_DEBT_EBITDA', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'SOLVENCY_LEVERAGE', 'CFO_PAT_DIVERGENCE'],
    applicableValuationModels: ['EV_EBITDA', 'ARPU_MULTIPLE', 'DCF'],
    applicableTechnicalConsiderations: ['Tariff hike expectations', 'Spectrum auction cycles'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  HEALTHCARE: {
    code: 'HEALTHCARE',
    displayName: 'Healthcare & Hospital Chains',
    description: 'Bed-capacity and diagnostic testing infrastructure evaluated on occupancy, average revenue per occupied bed (ARPOB), and ROCE.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['ARPOB', 'OCCUPANCY_RATE', 'OPERATING_BEDS', 'ALOS', 'EBITDA_PER_BED', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'EV_CAPACITY', 'PE', 'DCF'],
    applicableTechnicalConsiderations: ['Expansion capex progress', 'Bed addition timeline'],
    defaultPrimaryMetric: 'EV/EBITDA',
  },
  PHARMA: {
    code: 'PHARMA',
    displayName: 'Pharmaceuticals & Life Sciences',
    description: 'Regulated formulations, active ingredients (API), and CDMO services subject to USFDA compliance, R&D capitalisation, and patent pipelines.',
    economicArchetype: 'OPERATING_INDUSTRIAL',
    applicableMetrics: ['US_GENERIC_SALES', 'DOMESTIC_FORMULATION_GROWTH', 'EBITDA_MARGIN', 'RND_PCT_SALES', 'FDA_OBSERVATIONS', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    applicableTechnicalConsiderations: ['USFDA inspection clearance', 'ANDA approval momentum'],
    defaultPrimaryMetric: 'P/E',
  },
  DIVERSIFIED: {
    code: 'DIVERSIFIED',
    displayName: 'Conglomerate & Diversified Holding',
    description: 'Multi-business corporate groups evaluated through Sum-of-the-Parts (SOTP) and holdco discount adjustments across varied subsidiaries.',
    economicArchetype: 'CONGLOMERATE',
    applicableMetrics: ['SEGMENT_EBITDA_CONTRIBUTION', 'HOLDCO_DISCOUNT_PCT', 'SUBSIDIARY_DIVIDEND_INFLOWS', 'CONSOLIDATED_ROCE', 'NET_DEBT_EQUITY'],
    applicableForensicModels: ['RELATED_PARTY_LENDING', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['SOTP', 'NAV', 'PE', 'EV_EBITDA'],
    applicableTechnicalConsiderations: ['Subsidiary IPO or demerger catalysts'],
    defaultPrimaryMetric: 'SOTP NAV',
  },
  // Backward compatibility alias for legacy Phase 1/2 seed
  REAL_ESTATE_TRUST: {
    code: 'REAL_ESTATE_TRUST',
    displayName: 'Real Estate Investment Trust (Legacy)',
    description: 'Alias for yield-focused commercial/retail real estate trust (REIT).',
    economicArchetype: 'INFRASTRUCTURE_TRUST',
    applicableMetrics: ['NDCF_YIELD', 'COMMERCIAL_OCCUPANCY', 'WALE_YEARS', 'SAME_STORE_NOI_GROWTH', 'LOAN_TO_VALUE_LTV'],
    applicableForensicModels: ['NAV_DISCOUNT_MONITOR', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['NAV', 'DIVIDEND_DISCOUNT', 'SOTP'],
    defaultPrimaryMetric: 'NDCF Yield',
  },
};

// Dynamic Registry Store
class BusinessModelRegistryStore {
  private registry: Map<string, BusinessModelDefinition> = new Map();

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.registry.clear();
    Object.values(INITIAL_BUSINESS_MODELS).forEach((def) => {
      this.registry.set(def.code.toUpperCase(), def);
    });
  }

  public get(code: string): BusinessModelDefinition | undefined {
    if (!code) return undefined;
    return this.registry.get(code.trim().toUpperCase());
  }

  public getAll(): BusinessModelDefinition[] {
    return Array.from(this.registry.values());
  }

  public getAllCodes(): string[] {
    return Array.from(this.registry.keys());
  }

  public isRegistered(code: string): boolean {
    if (!code) return false;
    return this.registry.has(code.trim().toUpperCase());
  }

  public register(def: BusinessModelDefinition): void {
    if (!def || !def.code || def.code.trim().length === 0) {
      throw new Error('Business model definition must have a non-empty code.');
    }
    const cleanCode = def.code.trim().toUpperCase();
    this.registry.set(cleanCode, {
      ...def,
      code: cleanCode,
      isExtensibleCustom: true,
    });
  }

  public getApplicableForensicModels(code: string): ForensicModelId[] {
    const def = this.get(code);
    return def ? def.applicableForensicModels : [];
  }

  public getApplicableValuationModels(code: string): ValuationModelId[] {
    const def = this.get(code);
    return def ? def.applicableValuationModels : [];
  }

  public getApplicableMetrics(code: string): string[] {
    const def = this.get(code);
    return def ? def.applicableMetrics : [];
  }
}

export const BusinessModelRegistry = new BusinessModelRegistryStore();

export function getBusinessModelDefinition(code: string): BusinessModelDefinition | undefined {
  return BusinessModelRegistry.get(code);
}

export function getAllBusinessModels(): BusinessModelDefinition[] {
  return BusinessModelRegistry.getAll();
}

export function getAllBusinessModelCodes(): string[] {
  return BusinessModelRegistry.getAllCodes();
}

export function isBusinessModelRegistered(code: string): boolean {
  return BusinessModelRegistry.isRegistered(code);
}

export function registerBusinessModel(def: BusinessModelDefinition): void {
  BusinessModelRegistry.register(def);
}

export function isForensicModelApplicableToBusinessModel(
  businessModelCode: string,
  modelId: ForensicModelId
): boolean {
  const models = BusinessModelRegistry.getApplicableForensicModels(businessModelCode);
  return models.includes(modelId);
}

export function isValuationModelApplicableToBusinessModel(
  businessModelCode: string,
  modelId: ValuationModelId
): boolean {
  const models = BusinessModelRegistry.getApplicableValuationModels(businessModelCode);
  return models.includes(modelId);
}
