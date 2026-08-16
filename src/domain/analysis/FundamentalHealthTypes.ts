import { MetricCategory } from '../calculations/CalculationTypes';

export type SignalSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SignalStatus = 'OBSERVED' | 'REQUIRES_INVESTIGATION' | 'MATERIAL_CONCERN';

export type DriverDecompositionStatus = 'SUPPORTED_DRIVER' | 'DRIVER_NOT_DETERMINABLE';

export type AnalysisConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';

export interface HealthSignal {
  signalId: string;
  signalCode: string;
  category: MetricCategory;
  title: string;
  metricCode: string;
  currentValue?: number;
  thresholdValue?: number;
  signalDirection: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
  supportingMetricIds: string[];
  supportingFactIds: string[];
}

export interface FundamentalRedFlag {
  redFlagId: string;
  category: MetricCategory;
  signal: HealthSignal;
  title: string;
  description: string;
  severity: SignalSeverity;
  status: SignalStatus;
  triggerMetricIds: string[];
  supportingFactIds: string[];
  supportingMetricIds: string[];
  evidenceReferences: string[];
  confidence: number;
  requiresForensicReview: boolean; // Flagged for Phase 7 forensic investigation
}

export interface FundamentalStrength {
  strengthId: string;
  category: MetricCategory;
  title: string;
  description: string;
  supportingMetricIds: string[];
  supportingFactIds: string[];
  evidenceReferences: string[];
  confidence: number;
}

export interface WatchItem {
  watchItemId: string;
  category: MetricCategory;
  title: string;
  description: string;
  metricOrFact: string;
  currentValue: string | number;
  historicalComparison: string;
  reasonForMonitoring: string;
  evidenceReferences: string[];
  confidence: number;
}

export interface CategoryScore {
  category: MetricCategory;
  categoryName: string;
  rawScore?: number; // 0 - 10 scale (undefined if NOT_APPLICABLE or NOT_ASSESSABLE)
  originalWeight: number; // e.g. 15 (%)
  applicableWeight: number; // e.g. 15 (%) or 0 if NOT_APPLICABLE
  normalizedWeight: number; // re-normalized percentage across applicable categories (sum = 100%)
  isApplicable: boolean;
  status: 'ASSESSED' | 'MISSING_DATA' | 'NOT_APPLICABLE';
  supportingSignals: HealthSignal[];
  positiveFactors: string[];
  negativeFactors: string[];
  missingInputs: string[];
  confidence: AnalysisConfidence;
  evidenceReferences: string[];
}

export interface DriverDecomposition {
  returnMetric: 'ROE' | 'ROCE';
  currentReturn?: number;
  status: DriverDecompositionStatus;
  primaryDriver?: string;
  driverExplanation: string;
  supportingEvidence: Array<{
    component: string;
    value?: number;
    unit: string;
    period: string;
    factId?: string;
  }>;
}

export interface AnalysisSection {
  sectionId: string;
  title: string;
  category: MetricCategory;
  summary: string;
  score?: number;
  keyFindings: string[];
  concerns: string[];
  evidenceCitations: string[];
}

export interface FundamentalHealthAnalysis {
  analysisId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  businessModelCode: string;
  analysisVersion: string;
  methodologyVersion: string;
  generatedAt: string;
  overallHealthScore?: number; // 0 - 10 scale (undefined if NOT_ASSESSABLE)
  dataCompleteness: number; // 0 - 100 percentage
  evidenceQuality: number; // 0 - 100 percentage
  analysisConfidence: AnalysisConfidence;
  isAssessable: boolean;
  categoryScores: CategoryScore[];
  sections: AnalysisSection[];
  redFlags: FundamentalRedFlag[];
  strengths: FundamentalStrength[];
  watchItems: WatchItem[];
  driverDecompositions: DriverDecomposition[];
  evidenceReferences: string[];
  limitations: string[];
  notes?: string;
}

export interface BusinessModelScoringPolicy {
  businessModelCode: string;
  policyName: string;
  applicableCategories: MetricCategory[];
  categoryWeights: Record<MetricCategory, number>; // Must sum to 100 for default setup
  applicableMetrics: string[];
  excludedMetrics: string[];
  scoringRulesSummary: string;
  minimumCompletenessThreshold: number; // e.g. 40 (%)
}
