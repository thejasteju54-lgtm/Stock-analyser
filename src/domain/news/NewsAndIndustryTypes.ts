/**
 * NewsAndIndustryTypes.ts
 * Phase 11 — News Intelligence & Industry Analysis Domain Models & Schemas.
 * Strictly decoupled from valuation and fundamental mutations.
 */

export type NewsSourceTier =
  | 'TIER_1_PRIMARY'
  | 'TIER_2_HIGH_QUALITY_MEDIA'
  | 'TIER_3_SECONDARY'
  | 'TIER_4_DISCOVERY_ONLY';

export interface NewsSource {
  sourceId: string;
  sourceName: string; // e.g. "NSE India Regulatory Filing", "Reuters", "Economic Times"
  sourceType: 'EXCHANGE_FILING' | 'REGULATORY_NOTIFICATION' | 'PRESS_RELEASE' | 'MAINSTREAM_FINANCIAL_MEDIA' | 'RESEARCH_PORTAL' | 'BLOG_OR_FORUM' | 'UNKNOWN';
  sourceTier: NewsSourceTier;
  sourceURL?: string;
  publisher: string;
  author?: string;
  publishedAt: string; // ISO DateTime
  retrievedAt: string; // ISO DateTime
  eventDate?: string; // Point-in-time occurrence date if known
  timezone: string; // e.g. "Asia/Kolkata"
  reliabilityScore: number; // 0 to 100
  primaryOrSecondary: 'PRIMARY_SOURCE' | 'SECONDARY_REPORTING';
  sourceLineageId?: string;
  isSyndicated: boolean;
  isAccessible: boolean;
  status: 'ACCESSIBLE' | 'PAYWALLED' | 'SOURCE_UNAVAILABLE' | 'ARCHIVED';
}

export type SourceRelationshipType =
  | 'DIRECT_PRIMARY'
  | 'SYNDICATED'
  | 'REWRITTEN'
  | 'QUOTED_FROM'
  | 'FOLLOW_UP'
  | 'INDEPENDENT_REPORT'
  | 'UNKNOWN';

export interface SourceLineage {
  lineageId: string;
  primarySourceId: string;
  derivedSourceIds: string[];
  relationshipType: SourceRelationshipType;
  confidence: number;
}

export type NewsCategory =
  | 'RESULTS'
  | 'EARNINGS'
  | 'GUIDANCE'
  | 'ORDER_WIN'
  | 'ORDER_LOSS'
  | 'CONTRACT'
  | 'CAPEX'
  | 'EXPANSION'
  | 'ACQUISITION'
  | 'DIVESTMENT'
  | 'FUNDRAISING'
  | 'DEBT'
  | 'CREDIT_RATING'
  | 'PROMOTER_ACTIVITY'
  | 'MANAGEMENT_CHANGE'
  | 'REGULATORY'
  | 'LEGAL'
  | 'LITIGATION'
  | 'GOVERNMENT_POLICY'
  | 'TAX'
  | 'COMPETITOR'
  | 'PRODUCT'
  | 'TECHNOLOGY'
  | 'PARTNERSHIP'
  | 'JOINT_VENTURE'
  | 'SUPPLY_CHAIN'
  | 'CUSTOMER'
  | 'COMMODITY'
  | 'MACROECONOMIC'
  | 'SECTOR'
  | 'ESG'
  | 'GOVERNANCE'
  | 'OTHER';

export type EventDatePrecision =
  | 'EXACT_DATE'
  | 'MONTH'
  | 'QUARTER'
  | 'YEAR'
  | 'UNKNOWN';

export type TemporalEventStatus =
  | 'NEW'
  | 'ONGOING'
  | 'RESOLVED'
  | 'RECURRING'
  | 'HISTORICAL'
  | 'FUTURE_EXPECTED';

export type CompanyRelevance =
  | 'DIRECT_COMPANY'
  | 'MATERIAL_COMPANY'
  | 'INDIRECT_COMPANY'
  | 'SECTOR_ONLY'
  | 'IRRELEVANT';

export type CorroborationStatus =
  | 'PRIMARY_CONFIRMED'
  | 'MULTI_SOURCE_CONFIRMED'
  | 'SINGLE_RELIABLE_SOURCE'
  | 'SECONDARY_ONLY'
  | 'UNVERIFIED'
  | 'CONFLICTING';

export type FactCertainty =
  | 'CONFIRMED'
  | 'REPORTED'
  | 'UNCONFIRMED'
  | 'RUMOR'
  | 'SPECULATION';

export type ImpactDirection =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'MIXED'
  | 'NEUTRAL'
  | 'UNKNOWN';

export type ImpactMagnitude =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'MATERIAL'
  | 'UNKNOWN';

export type ImpactHorizon =
  | 'IMMEDIATE'
  | 'SHORT_TERM'
  | 'MEDIUM_TERM'
  | 'LONG_TERM'
  | 'STRUCTURAL'
  | 'UNKNOWN';

export type FinancialChannel =
  | 'REVENUE'
  | 'VOLUME'
  | 'PRICING'
  | 'MARGINS'
  | 'CAPEX'
  | 'WORKING_CAPITAL'
  | 'DEBT'
  | 'CASH_FLOW'
  | 'TAX'
  | 'ASSET_VALUE'
  | 'MARKET_SHARE'
  | 'COMPETITIVE_POSITION'
  | 'COST_STRUCTURE'
  | 'VALUATION_MULTIPLE'
  | 'REGULATORY_COST'
  | 'OTHER';

export interface ImpactAssessment {
  direction: ImpactDirection;
  magnitude: ImpactMagnitude;
  horizon: ImpactHorizon;
  rationale: string;
  businessChannels: string[]; // e.g. ["Capacity expansion", "Client onboarding"]
  financialChannels: FinancialChannel[];
  potentialEffect: string; // Detailed causal explanation
  confidence: number; // 0 to 100
  evidenceReferences: string[];
}

export type EntityRole =
  | 'PRIMARY_ENTITY'
  | 'SECONDARY_ENTITY'
  | 'MENTION_ONLY'
  | 'ENTITY_UNCERTAIN';

export interface EntityMention {
  entityId: string;
  name: string;
  type: 'COMPANY' | 'TICKER' | 'LEGAL_NAME' | 'SUBSIDIARY' | 'BRAND' | 'PROMOTER' | 'MANAGEMENT' | 'PRODUCT' | 'COMPETITOR' | 'INDUSTRY' | 'SECTOR' | 'REGULATOR';
  role: EntityRole;
}

export interface NewsEvent {
  eventId: string;
  headline: string;
  summary: string;
  eventDate?: string;
  eventDatePrecision: EventDatePrecision;
  publicationDate: string;
  retrievedAt: string;
  timezone: string;
  sourceReferences: NewsSource[];
  companyEntities: EntityMention[];
  peopleEntities: EntityMention[];
  industryEntities: EntityMention[];
  eventCategory: NewsCategory;
  eventSubcategory?: string;
  relevance: CompanyRelevance;
  impactAssessment: ImpactAssessment;
  duplicateGroupId?: string;
  sourceLineageIds: string[];
  corroborationStatus: CorroborationStatus;
  eventStatus: TemporalEventStatus;
  confidence: number; // 0 to 100
  evidenceReferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SourceConflict {
  conflictId: string;
  eventId: string;
  claim: string;
  sourceA: NewsSource;
  sourceB: NewsSource;
  difference: string;
  sourceReliabilityA: number;
  sourceReliabilityB: number;
  resolution: 'RESOLVED_BY_PRIMARY_SOURCE' | 'RESOLVED_BY_LATER_DISCLOSURE' | 'UNRESOLVED' | 'NOT_MATERIAL';
  resolutionEvidence?: string;
  status: 'RESOLVED' | 'CONFLICTING_INFORMATION';
}

export type CatalystStatus =
  | 'ANNOUNCED'
  | 'EXPECTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED'
  | 'UNKNOWN';

export interface CatalystEvent {
  catalystId: string;
  event: string;
  category: NewsCategory;
  expectedDate?: string;
  datePrecision: EventDatePrecision;
  businessImpact: string;
  financialChannel: FinancialChannel;
  status: CatalystStatus;
  confidence: number;
  sourceReferences: NewsSource[];
}

export interface UpcomingEvent {
  eventId: string;
  eventType: 'EARNINGS' | 'AGM' | 'INVESTOR_DAY' | 'PROJECT_COMMISSIONING' | 'REGULATORY_DECISION' | 'CONTRACT_MILESTONE' | 'DEBT_MATURITY' | 'PRODUCT_LAUNCH' | 'COURT_HEARING' | 'OTHER';
  expectedDate: string;
  datePrecision: EventDatePrecision;
  status: CatalystStatus;
  description: string;
  sourceReferences: NewsSource[];
  confidence: number;
}

export interface NewsRisk {
  riskId: string;
  riskCategory: 'REGULATORY' | 'LITIGATION' | 'GOVERNANCE' | 'CUSTOMER_CONCENTRATION' | 'SUPPLY_CHAIN' | 'COMMODITY' | 'COMPETITIVE_PRESSURE' | 'TECHNOLOGICAL_DISRUPTION' | 'FINANCING' | 'MACROECONOMIC' | 'PROJECT_EXECUTION' | 'DEMAND_SLOWDOWN' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  businessChannel: string;
  financialChannel: FinancialChannel;
  horizon: ImpactHorizon;
  confidence: number;
  evidence: string;
  sources: NewsSource[];
}

export interface MaterialNewsAlert {
  alertId: string;
  headline: string;
  eventDate: string;
  category: NewsCategory;
  magnitude: ImpactMagnitude;
  relevance: CompanyRelevance;
  sourceTier: NewsSourceTier;
  summary: string;
}

export type IndustryCycleStage =
  | 'EARLY_EXPANSION'
  | 'EXPANSION'
  | 'PEAK'
  | 'SLOWDOWN'
  | 'CONTRACTION'
  | 'RECOVERY'
  | 'STRUCTURAL_GROWTH'
  | 'STRUCTURAL_DECLINE'
  | 'UNKNOWN';

export interface IndustryGrowthData {
  growthType: 'HISTORICAL' | 'CURRENT' | 'FORECAST';
  growthRatePercent: number | null;
  period: string; // e.g. "FY19-FY24 CAGR", "FY25E-FY28E"
  source: string;
  sourceDate: string;
  methodology?: string;
  confidence: number;
}

export interface PorterForcesAssessment {
  threatOfNewEntrants: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  supplierPower: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  buyerPower: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  threatOfSubstitutes: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  competitiveRivalry: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  evidenceSummary: string;
}

export interface ValueChainStage {
  stageId: string;
  stageName: 'RAW_MATERIAL' | 'PROCESSING' | 'MANUFACTURING' | 'DISTRIBUTION' | 'CUSTOMER_END_MARKET';
  description: string;
  isCompanyPresent: boolean;
  marginCaptureEstimatedPercent?: number;
  upstreamRisks: string[];
  downstreamRisks: string[];
}

export type RegulatoryStatus =
  | 'PROPOSED'
  | 'ANNOUNCED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'IMPLEMENTED'
  | 'REJECTED'
  | 'UNKNOWN';

export interface RegulatoryEvent {
  regulationId: string;
  title: string;
  authority: string; // e.g. "SEBI", "RBI", "MoRTH", "Govt of India"
  status: RegulatoryStatus;
  announcedDate: string;
  effectiveDate?: string;
  datePrecision: EventDatePrecision;
  impactOnIndustry: ImpactDirection;
  impactOnCompany: ImpactDirection;
  financialChannel: FinancialChannel;
  source: string;
  confidence: number;
}

export interface InputCostItem {
  commodityName: string; // e.g. "Steel", "Lithium", "Crude Oil", "Freight Rates"
  relevanceToCompany: 'DIRECT_RAW_MATERIAL' | 'INDIRECT_OVERHEAD' | 'ENERGY_INPUT' | 'LOGISTICS' | 'NOT_MATERIAL';
  costTrend: 'RISING' | 'STABLE' | 'FALLING' | 'VOLATILE' | 'UNKNOWN';
  marginSensitivityPercent: number | null; // e.g. 10% commodity spike -> -120 bps margin
  source: string;
  confidence: number;
}

export interface IndustryCompetitor {
  companyId: string;
  name: string;
  symbol?: string;
  businessModel: string;
  marketPosition: string;
  revenue: number | null; // in Cr
  revenuePeriod: string;
  growth: number | null; // YoY %
  growthPeriod: string;
  margin: number | null; // EBITDA %
  marginPeriod: string;
  ROE: number | null;
  ROEPeriod: string;
  ROCE: number | null;
  ROCEPeriod: string;
  marketShare: number | null; // % or null if not verified
  marketSharePeriod?: string;
  sources: string[];
  dataFreshness: string;
  periodMismatchFlag: boolean;
  confidence: number;
}

export interface CompanyIndustryPosition {
  marketPosition: 'STRONG' | 'ABOVE_AVERAGE' | 'IN_LINE' | 'BELOW_AVERAGE' | 'WEAK' | 'NOT_ASSESSABLE';
  growthRelativeToIndustry: 'STRONG' | 'ABOVE_AVERAGE' | 'IN_LINE' | 'BELOW_AVERAGE' | 'WEAK' | 'NOT_ASSESSABLE';
  marginRelativeToPeers: 'STRONG' | 'ABOVE_AVERAGE' | 'IN_LINE' | 'BELOW_AVERAGE' | 'WEAK' | 'NOT_ASSESSABLE';
  ROCERelativeToPeers: 'STRONG' | 'ABOVE_AVERAGE' | 'IN_LINE' | 'BELOW_AVERAGE' | 'WEAK' | 'NOT_ASSESSABLE';
  competitiveAdvantage: string;
  capacityExpansion: string;
  pricingPower: 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_ASSESSABLE';
  industryExposure: string;
  confidence: number;
  evidenceReferences: string[];
}

export interface HorizonOutlookItem {
  horizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  drivers: string[];
  risks: string[];
  assumptions: string[];
  evidence: string[];
  confidence: number;
}

export interface IndustryOutlook {
  shortTerm: HorizonOutlookItem;
  mediumTerm: HorizonOutlookItem;
  longTerm: HorizonOutlookItem;
  overallNarrative: string;
}

export interface IndustryProfile {
  industryId: string;
  industryName: string;
  sector: string;
  marketSize: number | null; // in Cr
  marketSizeDate: string;
  marketSizeUnit: string;
  growthHistory: IndustryGrowthData[];
  demandDrivers: { name: string; type: 'STRUCTURAL_DRIVER' | 'CYCLICAL_DRIVER' | 'TEMPORARY_DRIVER' | 'REGULATORY_DRIVER'; description: string }[];
  supplyDrivers: { name: string; type: 'STRUCTURAL_DRIVER' | 'CYCLICAL_DRIVER' | 'TEMPORARY_DRIVER'; description: string }[];
  regulatoryFactors: RegulatoryEvent[];
  technologyFactors: { technology: string; disruptionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'; description: string }[];
  competitiveFactors: PorterForcesAssessment;
  valueChain: ValueChainStage[];
  inputCosts: InputCostItem[];
  cyclicality: 'HIGH_CYCLICAL' | 'MODERATE_CYCLICAL' | 'NON_CYCLICAL_DEFENSIVE' | 'STRUCTURAL_COMPOUNDER' | 'UNKNOWN';
  capitalIntensity: 'HIGH' | 'MODERATE' | 'ASSET_LIGHT' | 'UNKNOWN';
  industryCycle: IndustryCycleStage;
  keyRisks: string[];
  keyCatalysts: string[];
  sources: string[];
  confidence: number;
  updatedAt: string;
}

export interface CrossLayerSensitivityItem {
  linkageId: string;
  targetPhase: 'PHASE_5_FINANCIALS' | 'PHASE_6_HEALTH' | 'PHASE_7_FORENSICS' | 'PHASE_8_MANAGEMENT' | 'PHASE_9_VALUATION' | 'PHASE_10_TECHNICAL';
  shockEventHeadline: string;
  businessChannel: string;
  financialChannel: FinancialChannel;
  observationNote: string;
  isCausalityProven: boolean;
  correlationContext?: string;
  status: 'OBSERVATION_ONLY'; // Guaranteed non-mutating
}

export interface NewsAndIndustryReport {
  reportId: string;
  projectId: string;
  companySymbol: string;
  companyName: string;
  sector: string;
  industry: string;
  newsEvents: NewsEvent[];
  materialAlerts: MaterialNewsAlert[];
  catalysts: CatalystEvent[];
  upcomingEvents: UpcomingEvent[];
  newsRisks: NewsRisk[];
  sourceConflicts: SourceConflict[];
  sourceLineages: SourceLineage[];
  industryProfile: IndustryProfile;
  competitors: IndustryCompetitor[];
  companyIndustryPosition: CompanyIndustryPosition;
  industryOutlook: IndustryOutlook;
  crossLayerSensitivities: CrossLayerSensitivityItem[];
  dataFreshness: {
    latestNewsRetrieved: string;
    industryDataUpdated: string;
    marketContextDate: string;
    isStale: boolean;
  };
  confidenceScore: number;
  disclaimers: string[];
  analysisTimestamp: string;
}
