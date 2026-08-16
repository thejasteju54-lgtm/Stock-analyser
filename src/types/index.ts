export type TerminalRoute =
  | 'overview'
  | 'ingestion'
  | 'extraction'
  | 'fundamentals'
  | 'forensic'
  | 'management'
  | 'valuation'
  | 'technical'
  | 'industry'
  | 'news'
  | 'catalysts-risks'
  | 'scenarios'
  | 'quality-gate'
  | 'verdict'
  | 'evidence';

export interface CompanyEntitySummary {
  name: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  subsector: string;
  marketCapCategory: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';
  isLoaded: boolean;
}

export interface SystemStatus {
  engineStatus: 'READY' | 'PROCESSING' | 'IDLE';
  activePhase: number;
  dataQualityStatus: 'PASSED' | 'DEGRADED' | 'BLOCKED' | 'PENDING';
  memoryState: string;
}
