import {
  ForensicModelId,
  ValuationModelId,
  BusinessModelDefinition,
  EconomicArchetype,
  getBusinessModelDefinition,
  getAllBusinessModels,
  getAllBusinessModelCodes,
  isBusinessModelRegistered,
  registerBusinessModel,
  isForensicModelApplicableToBusinessModel,
  isValuationModelApplicableToBusinessModel,
} from './BusinessModelRegistry';

// Re-export business model taxonomy primitives for unified access
export {
  type ForensicModelId,
  type ValuationModelId,
  type BusinessModelDefinition,
  type EconomicArchetype,
  getBusinessModelDefinition,
  getAllBusinessModels,
  getAllBusinessModelCodes,
  isBusinessModelRegistered,
  registerBusinessModel,
  isForensicModelApplicableToBusinessModel,
  isValuationModelApplicableToBusinessModel,
};

// Extensible BusinessModelType (string-backed for dynamic registry models)
export type BusinessModelType = string;

export interface SectorTaxonomyDefinition {
  sector: string;
  subsectors: string[];
  businessModel: string; // Default business model code
  subsectorBusinessModelMap?: Record<string, string>; // Specialized subsector-to-business-model mappings
  applicableMetrics: string[];
  applicableForensicModels: ForensicModelId[];
  applicableValuationModels: ValuationModelId[];
  description: string;
}

export const SECTOR_TAXONOMY_REGISTRY: Record<string, SectorTaxonomyDefinition> = {
  Banking: {
    sector: 'Banking',
    subsectors: ['Public Sector Bank', 'Private Sector Bank', 'Small Finance Bank', 'Payment Bank'],
    businessModel: 'BANKING',
    applicableMetrics: ['NIM', 'GNPA', 'NNPA', 'PCR', 'CASA_RATIO', 'CRAR', 'COST_TO_INCOME', 'ROA', 'ROE'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'RELATED_PARTY_LENDING', 'CAPITAL_DILUTION'],
    applicableValuationModels: ['PB_ABV', 'PE', 'DIVIDEND_DISCOUNT'],
    description: 'Deposit-taking lending financial institutions evaluated on credit quality, NIM, and capital adequacy.',
  },
  NBFC: {
    sector: 'NBFC',
    subsectors: ['Housing Finance (HFC)', 'Vehicle Finance', 'Gold Loan NBFC', 'Microfinance (MFI)', 'Diversified NBFC'],
    businessModel: 'NBFC',
    subsectorBusinessModelMap: {
      'Housing Finance (HFC)': 'HFC',
      'Microfinance (MFI)': 'MICROFINANCE',
    },
    applicableMetrics: ['AUM_GROWTH', 'NIM', 'STAGE_3_ASSETS', 'PCR', 'ALM_MISMATCH', 'SPREAD', 'ROA', 'ROE'],
    applicableForensicModels: ['NPA_PCR_QUALITY', 'REST_ASSET_MONITOR', 'RELATED_PARTY_LENDING', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['PB_ABV', 'PE', 'DIVIDEND_DISCOUNT'],
    description: 'Non-banking credit institutions subject to asset-liability matching and credit cost cycles.',
  },
  Insurance: {
    sector: 'Insurance',
    subsectors: ['Life Insurance', 'General Insurance', 'Health Insurance', 'Reinsurance'],
    businessModel: 'INSURANCE',
    applicableMetrics: ['VNB_MARGIN', 'EMBEDDED_VALUE', 'AUM', 'SOLVENCY_RATIO', 'COMBINED_RATIO', 'PERSISTENCY_13M', 'PERSISTENCY_61M'],
    applicableForensicModels: ['SOLVENCY_LEVERAGE', 'UNDERWRITING_QUALITY', 'RELATED_PARTY_LENDING', 'CAPITAL_DILUTION'],
    applicableValuationModels: ['EMBEDDED_VALUE', 'PB_ABV', 'PE'],
    description: 'Underwriting and risk protection business measured via Embedded Value and Value of New Business.',
  },
  'Financial Services': {
    sector: 'Financial Services',
    subsectors: ['Asset Management (AMC)', 'Stock Exchanges & Depositories', 'Retail Wealth & Brokerages', 'Credit Rating Agencies'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    subsectorBusinessModelMap: {
      'Asset Management (AMC)': 'ASSET_MANAGEMENT',
      'Stock Exchanges & Depositories': 'STOCK_EXCHANGE',
      'Retail Wealth & Brokerages': 'BROKERAGE',
    },
    applicableMetrics: ['AAUM', 'EQUITY_AUM_MIX', 'MARKET_SHARE_TURNOVER', 'CORE_EBIT_MARGIN', 'ROCE', 'ROE', 'FCF_CONVERSION'],
    applicableForensicModels: ['REVENUE_RECOGNITION', 'BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE'],
    applicableValuationModels: ['PE', 'FCF_YIELD', 'DCF', 'DIVIDEND_DISCOUNT'],
    description: 'Capital market intermediaries with capital-light business models and high operating margins.',
  },
  'IT Services': {
    sector: 'IT Services',
    subsectors: ['Tier 1 IT Exporters', 'Mid-Cap Digital Services', 'BPO / BPM Services', 'ER&D Engineering'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['CC_REVENUE_GROWTH', 'EBIT_MARGIN', 'ATTRITION_RATE', 'UTILISATION', 'OFFSHORE_RATIO', 'FCF_PAT_RATIO', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['PE', 'FCF_YIELD', 'DCF', 'EV_EBITDA'],
    description: 'Export-oriented human capital & software services with high cash conversion and zero financial leverage.',
  },
  Pharma: {
    sector: 'Pharma',
    subsectors: ['Generic Formulations', 'Active Pharma Ingredients (API)', 'Contract Development & Mfg (CDMO)', 'Domestic Formulations'],
    businessModel: 'PHARMA',
    applicableMetrics: ['US_GENERIC_SALES', 'DOMESTIC_FORMULATION_GROWTH', 'EBITDA_MARGIN', 'RND_PCT_SALES', 'FDA_OBSERVATIONS', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Regulated healthcare formulations and manufacturing subject to USFDA audits and R&D capitalisation.',
  },
  Healthcare: {
    sector: 'Healthcare',
    subsectors: ['Hospitals & Chains', 'Diagnostic Laboratories', 'Medical Devices', 'Pharmacy Retail'],
    businessModel: 'HEALTHCARE',
    applicableMetrics: ['ARPOB', 'OCCUPANCY_RATE', 'OPERATING_BEDS', 'EBITDA_PER_BED', 'TESTS_PER_PATIENT', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Asset-heavy and service-driven healthcare delivery infrastructure.',
  },
  FMCG: {
    sector: 'FMCG',
    subsectors: ['Packaged Foods & Beverages', 'Personal Care', 'Home Care', 'Tobacco & Cigarettes'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['VOLUME_GROWTH', 'GROSS_MARGIN', 'AD_SPEND_PCT_SALES', 'WORKING_CAPITAL_DAYS', 'ROCE', 'ROE', 'FCF_CONVERSION'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['PE', 'FCF_YIELD', 'DCF', 'EV_EBITDA'],
    description: 'Fast moving consumer brands with negative working capital, strong pricing power, and high return ratios.',
  },
  'Consumer Durables': {
    sector: 'Consumer Durables',
    subsectors: ['White Goods / Appliances', 'Consumer Electricals (FMEG)', 'Electronic Manufacturing (EMS)', 'Home Furnishing'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['VOLUME_GROWTH', 'CHANNEL_INVENTORY', 'EBITDA_MARGIN', 'WARRANTY_COSTS', 'ROCE', 'CFO_PAT_RATIO'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['PE', 'EV_EBITDA', 'DCF'],
    description: 'Discretionary consumer appliances influenced by housing cycles, raw material pricing, and distribution reach.',
  },
  Automobile: {
    sector: 'Automobile',
    subsectors: ['Passenger Vehicles (PV)', 'Commercial Vehicles (CV)', 'Two-Wheelers (2W)', 'Electric Vehicles (EV)'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['MONTHLY_DISPATCH_VOLUME', 'AVG_SELLING_PRICE_ASP', 'EBITDA_MARGIN', 'CAPEX_INTENSITY', 'ROCE', 'FCF'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF', 'FCF_YIELD'],
    description: 'Cyclical OEM vehicle manufacturers evaluated on volume growth, operating leverage, and platform modularity.',
  },
  'Auto Ancillaries': {
    sector: 'Auto Ancillaries',
    subsectors: ['Engine & Transmission Components', 'Tyres & Rubber', 'Auto Electricals & Electronics', 'Forgings & Castings'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['CONTENT_PER_VEHICLE', 'OEM_VS_AFTERMARKET_MIX', 'EXPORT_SHARE', 'EBITDA_PER_TONNE', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Tier-1 and Tier-2 suppliers to global and domestic automotive OEMs.',
  },
  'Capital Goods': {
    sector: 'Capital Goods',
    subsectors: ['Heavy Electrical Equipment', 'Industrial Machinery', 'Process Automation', 'Pumps & Compressors'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['ORDER_INFLOW', 'ORDER_BACKLOG', 'BOOK_TO_BILL_RATIO', 'EBITDA_MARGIN', 'EXECUTION_CYCLE_MONTHS', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Private and public industrial capex equipment makers driven by multi-year order backlogs.',
  },
  Infrastructure: {
    sector: 'Infrastructure',
    subsectors: ['EPC Contractors', 'Highways & Roads (HAM/BOT)', 'Ports & Marine Infra', 'Water & Urban Infra'],
    businessModel: 'PROJECT_INFRA',
    applicableMetrics: ['ORDER_BOOK_TO_SALES', 'WORKING_CAPITAL_DAYS', 'DEBT_TO_EQUITY', 'INTEREST_COVERAGE', 'BID_WIN_RATIO', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE', 'SOLVENCY_LEVERAGE', 'PROJECT_EXECUTION_RISK'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'NAV', 'SOTP'],
    description: 'Contracting and asset developers with long working capital cycles and debt-funded concessions.',
  },
  Power: {
    sector: 'Power',
    subsectors: ['Thermal Generation', 'Hydro Generation', 'Transmission Utility', 'Distribution Utility'],
    businessModel: 'UTILITY',
    applicableMetrics: ['PLOF_PLF', 'REGULATED_EQUITY', 'ROE_REGULATED', 'T&D_LOSSES', 'TARIFF_PER_UNIT', 'DEBT_TO_EBITDA'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['PB_ABV', 'EV_EBITDA', 'DCF', 'DIVIDEND_DISCOUNT'],
    description: 'Regulated tariff-based power generation, transmission, and distribution assets.',
  },
  Renewables: {
    sector: 'Renewables',
    subsectors: ['Solar Independent Power Producer (IPP)', 'Wind IPP', 'Green Hydrogen', 'Renewable EPC & Modules'],
    businessModel: 'PROJECT_INFRA',
    applicableMetrics: ['CAPACITY_GW', 'PLF_CUF', 'PPA_TARIFF', 'RECEIVABLES_FROM_DISCOMS', 'DEBT_TO_EBITDA', 'IRR_PROJECT'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['EV_EBITDA', 'NAV', 'DCF'],
    description: 'Clean energy generation and technology developers driven by long-term Power Purchase Agreements (PPAs).',
  },
  Telecom: {
    sector: 'Telecom',
    subsectors: ['Telecom Service Providers (Telcos)', 'Telecom Towers', 'Optic Fibre & Optical Infra'],
    businessModel: 'TELECOM',
    applicableMetrics: ['ARPU', 'SUBSCRIBER_BASE', 'DATA_CONSUMPTION_PER_USER', 'CHURN_RATE', 'SPECTRUM_DEBT', 'EBITDA_MARGIN'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['EV_EBITDA', 'ARPU_MULTIPLE', 'DCF'],
    description: 'High-capex network operators dependent on ARPU expansion and spectrum asset management.',
  },
  Chemicals: {
    sector: 'Chemicals',
    subsectors: ['Specialty Chemicals', 'Agrochemicals & Fertilizers', 'Petrochemicals', 'Fluorochemicals'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['GROSS_MARGIN_SPREAD', 'CAPEX_COMMISSIONING', 'EXPORT_MIX', 'RAW_MATERIAL_BENCHMARK', 'ROCE', 'CFO_PAT_RATIO'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'High-value synthesis, agrochem, and performance chemicals linked to global chemistry chains.',
  },
  Metals: {
    sector: 'Metals',
    subsectors: ['Ferrous (Steel)', 'Non-Ferrous (Aluminium, Copper, Zinc)', 'Pipes & Tubes'],
    businessModel: 'COMMODITY',
    applicableMetrics: ['EBITDA_PER_TONNE', 'CAPACITY_UTILISATION', 'LME_PRICE_REALISATION', 'DEBT_TO_EBITDA', 'INTEGRATION_RATIO', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['EV_EBITDA', 'PB_ABV', 'PE', 'REPLACEMENT_COST'],
    description: 'Cyclical commodities with earnings dictated by global price benchmarks and operating spreads.',
  },
  Mining: {
    sector: 'Mining',
    subsectors: ['Coal Mining', 'Iron Ore Mining', 'Lignite & Rare Minerals'],
    businessModel: 'COMMODITY',
    applicableMetrics: ['PRODUCTION_VOLUME', 'OFFTAKE_VOLUME', 'REALISATION_PER_TONNE', 'STRIPPING_RATIO', 'DIVIDEND_YIELD', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'FCF_YIELD', 'PE'],
    description: 'Resource extraction concessions with regulated royalties and heavy operating cash flows.',
  },
  'Oil & Gas': {
    sector: 'Oil & Gas',
    subsectors: ['Upstream Exploration (E&P)', 'Refining & Marketing (R&M)', 'City Gas Distribution (CGD)', 'Gas Transmission'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['GRM_DOLLAR_PER_BBL', 'CRUDE_REALISATION', 'CGD_VOLUME_MMSCMD', 'EBITDA_PER_SCM', 'ROCE'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Hydrocarbon value chain from upstream exploration to downstream city gas distribution.',
  },
  'Real Estate': {
    sector: 'Real Estate',
    subsectors: ['Residential Developers', 'Commercial Office Developers', 'Retail Mall Operators', 'Plotted / Industrial Parks'],
    businessModel: 'REAL_ESTATE',
    applicableMetrics: ['PRE_SALES_BOOKINGS', 'COLLECTION_EFFICIENCY', 'NET_DEBT_TO_EQUITY', 'LAND_BANK_ACRES', 'LAUNCH_PIPELINE_MSF'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['NAV', 'EV_EBITDA', 'PE'],
    description: 'Project-based property development evaluated on pre-sales velocity, collections, and net asset value (NAV).',
  },
  REIT: {
    sector: 'REIT',
    subsectors: ['Commercial Office REIT', 'Retail Mall REIT', 'Industrial & Logistics REIT'],
    businessModel: 'REIT',
    applicableMetrics: ['NET_OPERATING_INCOME_NOI', 'DISTRIBUTION_YIELD', 'OCCUPANCY_RATE', 'WALE_YEARS', 'LOAN_TO_VALUE_LTV', 'NAV_PER_UNIT'],
    applicableForensicModels: ['NAV_DISCOUNT_MONITOR', 'SOLVENCY_LEVERAGE', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['NAV', 'DIVIDEND_DISCOUNT', 'SOTP'],
    description: 'Yield-generating real estate investment trusts with mandatory 90% NDCF distribution mandate.',
  },
  InvIT: {
    sector: 'InvIT',
    subsectors: ['Highways & Toll InvIT', 'Power Transmission InvIT', 'Gas Pipeline InvIT', 'Telecom Infra InvIT'],
    businessModel: 'INVIT',
    applicableMetrics: ['DISTRIBUTABLE_CASH_FLOW', 'DISTRIBUTION_YIELD', 'CONCESSION_PERIOD_REMAINING', 'LTV_RATIO', 'NAV_PER_UNIT'],
    applicableForensicModels: ['NAV_DISCOUNT_MONITOR', 'SOLVENCY_LEVERAGE', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['NAV', 'DIVIDEND_DISCOUNT', 'DCF'],
    description: 'Infrastructure investment trusts providing predictable yield from operational infrastructure assets.',
  },
  Defence: {
    sector: 'Defence',
    subsectors: ['Aerospace & Avionics', 'Naval & Shipbuilders', 'Land Systems & Artillery', 'Defence Electronics & Radar'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['ORDER_BOOK_TO_SALES', 'INDIGENISATION_LEVEL', 'EXPORT_ORDER_SHARE', 'EBITDA_MARGIN', 'WORKING_CAPITAL_DAYS', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['PE', 'EV_EBITDA', 'DCF'],
    description: 'Indigenous defence manufacturing backed by Ministry of Defence multi-year acquisition cycles.',
  },
  Railways: {
    sector: 'Railways',
    subsectors: ['Rolling Stock & Wagons', 'Railway Signalling & Electrification', 'Railway EPC', 'Railway Financing'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['ORDER_BOOK_TO_BILL', 'EXECUTION_PACE', 'WORKING_CAPITAL_DAYS', 'EBITDA_MARGIN', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['PE', 'EV_EBITDA'],
    description: 'Indian Railways modernization suppliers and rolling stock builders.',
  },
  Logistics: {
    sector: 'Logistics',
    subsectors: ['Express Parcel Delivery', '3PL Supply Chain', 'Container Freight & Rail', 'Warehousing'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['TONNAGE_VOLUME', 'YIELD_PER_KG', 'VEHICLE_UTILISATION', 'FLEET_OWNERSHIP_MIX', 'ROCE', 'CFO_PAT_RATIO'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Supply chain, freight, and warehousing operators supporting retail and manufacturing velocity.',
  },
  Aviation: {
    sector: 'Aviation',
    subsectors: ['Passenger Airlines', 'Airport Operators', 'Aviation MRO & Ground Handling'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['PASSENGER_LOAD_FACTOR_PLF', 'ASKM', 'RASK', 'CASK_EX_FUEL', 'FLEET_SIZE', 'EBITDAR_MARGIN'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE'],
    applicableValuationModels: ['EV_EBITDA', 'PE'],
    description: 'High operating-leverage transportation heavily impacted by aviation turbine fuel (ATF) and foreign exchange.',
  },
  Media: {
    sector: 'Media',
    subsectors: ['Broadcasting & Cable TV', 'Multiplex & Theatrical Exhibition', 'Digital Streaming & Publishing', 'Out of Home (OOH)'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['AD_REVENUE_GROWTH', 'SUBSCRIPTION_REVENUE', 'FOOTFALLS', 'SPEND_PER_HEAD_SPH', 'ROCE'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'Advertising and subscription-driven entertainment and exhibition businesses.',
  },
  'Specialty Manufacturing': {
    sector: 'Specialty Manufacturing',
    subsectors: ['Precision Engineering', 'Packaging & Polymers', 'Glass & Ceramics', 'Textiles & Technical Fabrics'],
    businessModel: 'NON_FINANCIAL_OPERATING',
    applicableMetrics: ['VALUE_ADD_MARGIN', 'EXPORT_CONTRIBUTION', 'ASSET_TURNOVER', 'ROCE', 'WORKING_CAPITAL_DAYS', 'CFO_PAT_RATIO'],
    applicableForensicModels: ['BENEISH_M_SCORE', 'ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'WORKING_CAPITAL_CYCLE'],
    applicableValuationModels: ['EV_EBITDA', 'PE', 'DCF'],
    description: 'High-precision engineering and custom industrial production with export exposure.',
  },
  Diversified: {
    sector: 'Diversified',
    subsectors: ['Multi-Industry Conglomerate', 'Holding Company', 'Diversified Industrial Group'],
    businessModel: 'DIVERSIFIED',
    applicableMetrics: ['CONSOLIDATED_EBITDA', 'SUBSIDIARY_DEBT', 'HOLDING_CO_DISCOUNT', 'ROCE_CONSOLIDATED'],
    applicableForensicModels: ['ALTMAN_Z_SCORE', 'CFO_PAT_DIVERGENCE', 'SOLVENCY_LEVERAGE', 'RELATED_PARTY_LENDING'],
    applicableValuationModels: ['SOTP', 'NAV', 'EV_EBITDA', 'PE'],
    description: 'Multi-business conglomerates requiring sum-of-the-parts (SOTP) evaluation and holding company discount.',
  },
};

export function getSectorDefinition(sectorName: string): SectorTaxonomyDefinition | undefined {
  return SECTOR_TAXONOMY_REGISTRY[sectorName];
}

export function getAllSectors(): string[] {
  return Object.keys(SECTOR_TAXONOMY_REGISTRY);
}

export function getSubsectorsForSector(sectorName: string): string[] {
  return SECTOR_TAXONOMY_REGISTRY[sectorName]?.subsectors || [];
}

export function resolveDefaultBusinessModelForSector(
  sectorName: string,
  subsectorName?: string
): string {
  const def = SECTOR_TAXONOMY_REGISTRY[sectorName];
  if (!def) return 'NON_FINANCIAL_OPERATING';
  if (subsectorName && def.subsectorBusinessModelMap?.[subsectorName]) {
    return def.subsectorBusinessModelMap[subsectorName];
  }
  return def.businessModel || 'NON_FINANCIAL_OPERATING';
}

export function isForensicModelApplicable(
  sectorName: string,
  modelId: ForensicModelId,
  businessModelOverride?: string
): boolean {
  if (businessModelOverride && isBusinessModelRegistered(businessModelOverride)) {
    return isForensicModelApplicableToBusinessModel(businessModelOverride, modelId);
  }
  const def = SECTOR_TAXONOMY_REGISTRY[sectorName];
  if (!def) return false;
  if (def.businessModel && isBusinessModelRegistered(def.businessModel)) {
    return isForensicModelApplicableToBusinessModel(def.businessModel, modelId);
  }
  return def.applicableForensicModels.includes(modelId);
}

export function isValuationModelApplicable(
  sectorName: string,
  modelId: ValuationModelId,
  businessModelOverride?: string
): boolean {
  if (businessModelOverride && isBusinessModelRegistered(businessModelOverride)) {
    return isValuationModelApplicableToBusinessModel(businessModelOverride, modelId);
  }
  const def = SECTOR_TAXONOMY_REGISTRY[sectorName];
  if (!def) return false;
  if (def.businessModel && isBusinessModelRegistered(def.businessModel)) {
    return isValuationModelApplicableToBusinessModel(def.businessModel, modelId);
  }
  return def.applicableValuationModels.includes(modelId);
}
