import { CompanyIdentity } from './Company';
import { IngestedDocument } from '../ingestion/DocumentTypes';
import {
  FinancialFact,
  ManagementClaim,
  ContradictionRecord,
} from '../extraction/FinancialFactTypes';
import { CalculatedMetric } from '../calculations/CalculationTypes';

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
