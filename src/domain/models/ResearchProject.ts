import { CompanyIdentity } from './Company';
import { IngestedDocument } from '../ingestion/DocumentTypes';
import {
  FinancialFact,
  ManagementClaim,
  ContradictionRecord,
} from '../extraction/FinancialFactTypes';
import { CalculatedMetric } from '../calculations/CalculationTypes';
import { FundamentalHealthAnalysis } from '../analysis/FundamentalHealthTypes';
import { ForensicAnalysisReport } from '../forensics/ForensicAnalysisTypes';
import { ManagementAnalysisReport } from '../management/ManagementDnaTypes';
import { SectorValuationReport } from '../valuation/ValuationTypes';
import { TechnicalAnalysisReport } from '../technical/TechnicalTypes';
import { NewsAndIndustryReport } from '../news/NewsAndIndustryTypes';
import { CatalystAndRiskReport } from '../risks/CatalystRiskTypes';
import { ScenarioReport } from '../scenarios/ScenarioTypes';
import { InvestmentVerdictReport } from '../verdict/VerdictTypes';

export type ProjectLifecycleStatus =
  | 'DRAFT'
  | 'ONBOARDED'
  | 'INGESTING'
  | 'EXTRACTED'
  | 'ANALYZED'
  | 'VERIFIED';

export interface ResearchProjectMetadata {
  analystNotes?: string;
  targetInvestmentHorizon: '1_YEAR' | '3_YEARS' | '5_PLUS_YEARS';
  primaryResearchObjective?: string;
  sourceFilingYears: string[]; // e.g. ["FY24", "FY23"]
}

export interface ResearchProject {
  id: string; // e.g. "proj_tatamotors_fy24"
  name: string; // e.g. "Tata Motors - FY23/24 Deep Research"
  company: CompanyIdentity;
  status: ProjectLifecycleStatus;
  documents: IngestedDocument[];
  facts?: FinancialFact[];
  managementClaims?: ManagementClaim[];
  contradictions?: ContradictionRecord[];
  calculatedMetrics?: CalculatedMetric[];
  fundamentalAnalysis?: FundamentalHealthAnalysis;
  forensicAnalysis?: ForensicAnalysisReport;
  managementAnalysis?: ManagementAnalysisReport;
  valuationAnalysis?: SectorValuationReport;
  technicalAnalysis?: TechnicalAnalysisReport;
  newsAndIndustryAnalysis?: NewsAndIndustryReport;
  catalystAndRiskAnalysis?: CatalystAndRiskReport;
  scenarioAnalysis?: ScenarioReport;
  verdictAnalysis?: InvestmentVerdictReport;
  workflowState?: import('../workflow/WorkflowTypes').ResearchWorkflowState;
  snapshots?: import('../snapshots/SnapshotTypes').ResearchSnapshot[];
  documentRecords?: import('../documents/ResearchDocumentRegistry').ResearchDocumentRecord[];
  auditEvents?: import('../audit/ResearchAuditLog').AuditLogEvent[];
  overrides?: import('../audit/ResearchOverrideRecord').ResearchOverrideRecord[];
  reportPayload?: import('../reports/ReportTypes').InvestmentReportPayload;
  
  // Phase 16 Live Data Integration & Replay extensions
  isReplayMode?: boolean;
  replayCutoffDate?: string;
  liveDataChecksum?: string;
  liveDataStatus?: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE';
  
  metadata: ResearchProjectMetadata;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export function createResearchProject(params: {
  company: CompanyIdentity;
  name?: string;
  analystNotes?: string;
  targetInvestmentHorizon?: '1_YEAR' | '3_YEARS' | '5_PLUS_YEARS';
  primaryResearchObjective?: string;
  sourceFilingYears?: string[];
  documents?: IngestedDocument[];
}): ResearchProject {
  const now = new Date().toISOString();
  const projectName =
    params.name?.trim() || `${params.company.displayName} (${params.company.symbol}) Research`;

  const uniqueSuffix = Math.random().toString(36).substring(2, 9);
  return {
    id: `proj_${params.company.symbol.toLowerCase()}_${Date.now()}_${uniqueSuffix}`,
    name: projectName,
    company: params.company,
    status: 'ONBOARDED',
    documents: params.documents || [],
    isReplayMode: false,
    liveDataStatus: 'CONNECTED',
    metadata: {
      analystNotes: params.analystNotes?.trim() || '',
      targetInvestmentHorizon: params.targetInvestmentHorizon || '3_YEARS',
      primaryResearchObjective:
        params.primaryResearchObjective?.trim() ||
        'Comprehensive 2-Year Fundamental, Forensic & Valuation Analysis',
      sourceFilingYears: params.sourceFilingYears || ['FY24', 'FY23'],
    },
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
  };
}
