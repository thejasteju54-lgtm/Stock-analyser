/**
 * ReportTypes.ts
 * Phase 15 — Canonical 22-Section Institutional Investment Report & Provenance Schemas.
 */

import { InvestmentVerdict } from '../verdict/VerdictTypes';
import { PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';
import { FreshnessItemAssessment } from '../freshness/ResearchFreshnessEngine';

export type ClaimAssessabilityStatus =
  | 'VERIFIED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'USER_DEFINED'
  | 'NOT_ASSESSABLE';

export interface ReportClaimCitation {
  claimId: string;
  claimText: string;
  assessabilityStatus: ClaimAssessabilityStatus;
  sourcePhase: PhaseNodeId;
  sourceMetricOrFactId?: string;
  sourceDocumentTitle?: string;
  pageOrSection?: string;
  dataDate: string;
  confidenceScore: number;
  calculationReference?: string;
}

export interface InvestmentReportPayload {
  reportId: string;
  projectId: string;
  snapshotId: string;
  generatedAt: string;
  dataCutoffDate: string;
  policyVersion: string;
  engineVersion: string;
  reproducibilityChecksum: string;

  // 22 Canonical Sections
  section1_CompanyOverview: {
    symbol: string;
    legalName: string;
    sector: string;
    subsector: string;
    marketCapCategory: string;
    businessModel: string;
    economicArchetype: string;
  };
  section2_ExecutiveVerdict: {
    verdict: InvestmentVerdict;
    verdictTag: string;
    oneLineThesis: string;
    appliedRuleId: string;
  };
  section3_Conviction: {
    convictionScore: number;
    convictionBand: string;
    scoreBreakdown: Record<string, number>;
  };
  section4_OneLineThesis: string;
  section5_MarketPriceTelemetry: {
    price: number | null;
    priceStatus: string;
    freshness: string;
    asOfDate: string;
    currency: string;
  };
  section6_InterestingPriceRange: {
    displayRange: string;
    lowPrice: number | null;
    highPrice: number | null;
    impliedMoSPercent: number;
  };
  section7_FundamentalHealth: {
    healthScore: number | null;
    revenueQuality: string;
    cashConversion: string;
    balanceSheet: string;
    strengths: string[];
    watchItems: string[];
  };
  section8_ForensicAccounting: {
    forensicState: string;
    riskScore: number | null;
    flagsCount: number;
    cashDivergenceStatus: string;
    adjustments: string[];
  };
  section9_ManagementDna: {
    credibilityScore: number | null;
    credibilityBand: string;
    promoterPledgePercent: number | null;
    guidanceTrackRecord: string;
  };
  section10_Valuation: {
    baseFairValue: number | null;
    mosActualPercent: number | null;
    mosRequiredPercent: number;
    mosStatus: string;
    primaryMethod: string;
  };
  section11_TechnicalStructure: {
    cyclePhase: string;
    timingDirective: string;
    supportZone: string;
    resistanceZone: string;
  };
  section12_NewsAndIndustry: {
    recentEventsCount: number;
    industryGrowthRate: number | null;
    porterMoatScore: number | null;
    valueChainPosition: string;
  };
  section13_TopCatalysts: Array<{
    rank: number;
    title: string;
    likelihood: string;
    impact: number;
    horizon: string;
    evidence: string;
  }>;
  section14_TopRisks: Array<{
    rank: number;
    title: string;
    severity: string;
    netRiskScore: number;
    mitigation: string;
  }>;
  section15_ThesisBreakers: Array<{
    premise: string;
    metric: string;
    operator: string;
    threshold: string | number;
    currentStatus: string;
  }>;
  section16_ScenarioSpectrum: {
    bear: { valuation: number | null; probability: number | null };
    base: { valuation: number | null; probability: number | null };
    bull: { valuation: number | null; probability: number | null };
    expectedScenarioValue: number | null;
    areProbabilitiesPlaceholders: boolean;
  };
  section17_ShortTermOutlook: {
    trajectory: string;
    earningsDirection: string;
    horizon: string;
  };
  section18_LongTermOutlook: {
    moatDurability: string;
    terminalGrowth: number | null;
    competitivePosition: string;
  };
  section19_DecisionChangeConditions: Array<{
    from: string;
    to: string;
    triggerCondition: string;
    threshold: string;
  }>;
  section20_EvidenceAndSources: ReportClaimCitation[];
  section21_DataFreshnessAudit: FreshnessItemAssessment[];
  section22_SnapshotAuditMetadata: {
    snapshotId: string;
    parentSnapshotId?: string;
    policyChecksum: string;
    inputDataHash: string;
    outputDataHash: string;
  };
}
