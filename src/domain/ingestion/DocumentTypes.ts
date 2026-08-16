export type DocumentType =
  | 'ANNUAL_REPORT'
  | 'FINANCIAL_STATEMENTS'
  | 'MDA'
  | 'CONCALL_TRANSCRIPT'
  | 'INVESTOR_PRESENTATION'
  | 'SHAREHOLDING_PATTERN'
  | 'SCREENER_SCREENSHOT'
  | 'TECHNICAL_CHART'
  | 'OTHER'
  | 'UNKNOWN';

export type ProcessingStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'CLASSIFYING'
  | 'PAGE_EXTRACTING'
  | 'OCR_REQUIRED'
  | 'OCR_PROCESSING'
  | 'VERIFYING'
  | 'READY'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export type ExtractionStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'COMPLETE'
  | 'FAILED';

export type PageOcrStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'FAILED'
  | 'REQUIRES_REVIEW';

export type OcrConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type ProvenanceSourceType =
  | 'PRIMARY_SOURCE_DERIVED'
  | 'SCREENSHOT_DERIVED';

export interface ReportingPeriod {
  fiscalYear?: string; // e.g. "FY24", "FY23", "FY2024"
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  periodType: 'ANNUAL' | 'QUARTERLY' | 'TRAILING_12M' | 'OTHER';
  isIdentifiable: boolean;
  rawPeriodString?: string;
}

export interface CompanyVerificationResult {
  isConsistent: boolean;
  targetSymbol: string;
  detectedSymbol?: string;
  detectedName?: string;
  notes?: string;
}

export interface DocumentPage {
  pageNumber: number;
  hasText: boolean;
  isScanned: boolean;
  textLength: number;
  textPreview: string;
  ocrStatus: PageOcrStatus;
  ocrConfidence?: number; // Defined ONLY when OCR is measured, never 0% for unperformed OCR
  ocrConfidenceTier?: OcrConfidenceTier;
  ocrApplied: boolean;
  ocrText?: string;
  ocrErrorMessage?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface IngestedDocument {
  id: string; // e.g. "doc_tatamotors_fy24_ar_1723800"
  projectId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  fileHash: string; // SHA-256 hash for duplicate detection
  documentType: DocumentType;
  classificationConfidence: number; // 0-100
  isClassificationManualOverride: boolean;
  provenanceSourceType: ProvenanceSourceType;
  source: string; // e.g. "Company Filing", "BSE/NSE", "Screener.in", "TradingView"
  reportingPeriod: ReportingPeriod;
  companyVerification: CompanyVerificationResult;
  processingStatus: ProcessingStatus;
  extractionStatus: ExtractionStatus;
  ocrStatusSummary: {
    required: boolean;
    pageCount: number;
    completedPages: number;
    scannedPageCount: number;
    machineReadablePageCount: number;
    averageConfidence?: number;
    overallTier: OcrConfidenceTier;
  };
  pages: DocumentPage[];
  dimensions?: ImageDimensions; // For screenshots and charts
  validationErrors: string[];
  uploadedAt: string;
  processedAt?: string;
  rawContentDataUrl?: string; // For client-side preview in memory/storage
}
