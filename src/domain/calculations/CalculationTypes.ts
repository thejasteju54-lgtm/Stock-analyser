export type CalculationStatus =
  | 'CALCULATED'
  | 'NOT_CALCULABLE'
  | 'MISSING_INPUT'
  | 'INVALID_INPUT'
  | 'INCOMPATIBLE_INPUTS'
  | 'NOT_APPLICABLE';

export type GrowthStatus =
  | 'NORMAL_GROWTH'
  | 'NEGATIVE_BASE'
  | 'ZERO_BASE'
  | 'TURNAROUND'
  | 'DECLINE_FROM_LOSS'
  | 'NOT_MEANINGFUL';

export type MetricCategory =
  | 'GROWTH'
  | 'MARGINS'
  | 'CASH_FLOW_QUALITY'
  | 'RETURNS'
  | 'LEVERAGE'
  | 'WORKING_CAPITAL';

export type MetricUnit =
  | 'PERCENT'
  | 'INR_CRORE'
  | 'DAYS'
  | 'RATIO'
  | 'PER_SHARE';

export interface InputFactSummary {
  metric: string;
  metricLabel?: string;
  period: string;
  value?: number;
  unit: string;
  currency: string;
  accountingBasis: string;
  documentName: string;
  pageNumber?: number;
  factId: string;
}

export type CfoPatDiagnostic =
  | 'CASH_GENERATION_DURING_ACCOUNTING_LOSS'
  | 'CASH_BURN_DURING_ACCOUNTING_LOSS'
  | 'NORMAL_POSITIVE'
  | 'ZERO_PAT';

export interface CalculatedMetric {
  metricId: string;
  metricCode: string;
  metricName: string;
  category: MetricCategory;
  value?: number;
  unit: MetricUnit;
  period: string;
  formulaId: string;
  formulaName: string;
  formulaExpression: string;
  methodologyId: string;
  methodologyVersion: string;
  calculationVersion: string;
  growthStatus?: GrowthStatus;
  cfoPatDiagnostic?: CfoPatDiagnostic;
  inputFactIds: string[];
  inputFactsSummary: InputFactSummary[];
  calculationTimestamp: string;
  status: CalculationStatus;
  warnings: string[];
  isApplicableForBusinessModel: boolean;
  notes?: string;
}

export interface FormulaDefinition {
  formulaId: string;
  formulaName: string;
  category: MetricCategory;
  formulaExpression: string;
  unit: MetricUnit;
  requiredInputs: string[];
  applicableArchetypes: string[]; // e.g. ['OPERATING_INDUSTRIAL', 'LENDING_FINANCIAL', 'NON_LENDING_FINANCIAL', 'UTILITY_REGULATED', 'CONGLOMERATE', 'INFRASTRUCTURE_TRUST']
  applicabilityRules: string;
  denominatorRules: string;
  missingInputPolicy: string;
  negativeInputPolicy: string;
  methodologyVersion: string;
  calculationVersion: string;
}
