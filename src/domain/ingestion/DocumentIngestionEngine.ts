import {
  IngestedDocument,
  DocumentType,
  DocumentPage,
  ImageDimensions,
} from './DocumentTypes';
import { DocumentClassifier } from './DocumentClassifier';
import { PeriodDetector } from './PeriodDetector';
import { DocumentHasher } from './DocumentHasher';
import { OcrProcessor } from './OcrProcessor';

export interface IngestionInput {
  file: File | { name: string; type: string; size: number; arrayBuffer?: () => Promise<ArrayBuffer> };
  projectId: string;
  targetSymbol: string;
  targetLegalName: string;
  existingDocuments?: IngestedDocument[];
  manualDocumentType?: DocumentType;
  customSourceLabel?: string;
  // Optional pre-extracted text / mock data for deterministic tests & fixtures
  mockTextPages?: Array<{ text: string; isScanned?: boolean; measuredOcrConfidence?: number }>;
  mockDimensions?: ImageDimensions;
  simulateOcrFailure?: boolean;
}

export interface IngestionValidationResult {
  isValid: boolean;
  errors: string[];
}

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'text/plain',
  'text/csv',
]);

const SUPPORTED_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'txt',
  'csv',
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export class DocumentIngestionEngine {
  /**
   * Validates file safety, extension, MIME type, and size.
   */
  public static validateFile(file: { name: string; type: string; size: number }): IngestionValidationResult {
    const errors: string[] = [];
    const filename = file.name || '';
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    // Check extension
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      errors.push(
        `Unsupported file extension ".${extension}". Supported formats: PDF, PNG, JPG, JPEG, WEBP, TXT, CSV.`
      );
    }

    // Check MIME type if provided
    if (file.type && !SUPPORTED_MIME_TYPES.has(file.type)) {
      // In case browser supplies generic binary type for a valid extension, warn or validate
      if (!SUPPORTED_EXTENSIONS.has(extension)) {
        errors.push(`Unsupported MIME type "${file.type}".`);
      }
    }

    // Check size limit
    if (file.size <= 0) {
      errors.push('File is empty (0 bytes). Upload a valid research document.');
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      errors.push(`File exceeds maximum permitted size of 50MB (detected ${sizeMB}MB).`);
    }

    // Check suspicious executable extensions
    const forbidden = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'ps1', 'zip', 'tar', 'gz', 'rar'];
    if (forbidden.includes(extension)) {
      errors.push(`Security violation: Executable or archive file type ".${extension}" is strictly rejected.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Processes and ingests a single research document into the project repository.
   */
  public static async ingestDocument(input: IngestionInput): Promise<{
    document: IngestedDocument;
    isDuplicate: boolean;
    duplicateReason?: string;
  }> {
    const {
      file,
      projectId,
      targetSymbol,
      targetLegalName,
      existingDocuments = [],
      manualDocumentType,
      customSourceLabel,
      mockTextPages,
      mockDimensions,
      simulateOcrFailure,
    } = input;

    // 1. File Validation
    const validation = this.validateFile(file);
    const filename = file.name;
    const mimeType = file.type || this.inferMimeType(filename);
    const sizeBytes = file.size;

    // 2. Compute SHA-256 Hash
    let fileHash = '';
    if (typeof file.arrayBuffer === 'function') {
      try {
        const buffer = await file.arrayBuffer();
        fileHash = await DocumentHasher.computeHash(buffer);
      } catch {
        fileHash = DocumentHasher.computeDeterministicFallbackHash(`${filename}_${sizeBytes}`);
      }
    } else {
      fileHash = DocumentHasher.computeDeterministicFallbackHash(`${filename}_${sizeBytes}`);
    }

    // 3. Duplicate Detection
    const duplicateCheck = DocumentHasher.detectDuplicate({
      newHash: fileHash,
      newFilename: filename,
      existingDocuments,
    });

    // 4. Extract or Mock Pages & Text Preview
    const { pages, textSample } = this.parseDocumentPages({
      filename,
      mimeType,
      mockTextPages,
      simulateOcrFailure,
    });

    // 5. Deterministic Document Classification
    const classification = DocumentClassifier.classify({
      filename,
      mimeType,
      textSample,
    });

    const finalDocType = manualDocumentType || classification.documentType;
    const isManualOverride = !!manualDocumentType && manualDocumentType !== classification.documentType;

    // 6. Period Detection & Company Verification
    const reportingPeriod = PeriodDetector.detectPeriod(filename, textSample);
    const companyVerification = PeriodDetector.verifyCompanyConsistency({
      filename,
      textSample,
      targetSymbol,
      targetLegalName,
    });

    // 7. Provenance & Screenshot Handling
    const isImageOrScreenshot =
      mimeType.startsWith('image/') ||
      finalDocType === 'SCREENER_SCREENSHOT' ||
      finalDocType === 'TECHNICAL_CHART';

    const provenanceSourceType = isImageOrScreenshot
      ? 'SCREENSHOT_DERIVED'
      : 'PRIMARY_SOURCE_DERIVED';

    const dimensions: ImageDimensions | undefined = isImageOrScreenshot
      ? mockDimensions || { width: 1920, height: 1080, aspectRatio: '16:9' }
      : undefined;

    // 8. OCR Summary
    const ocrSummary = OcrProcessor.summarizeOcrAcrossPages(pages);

    // 9. Processing Status Assignment
    let processingStatus = validation.isValid ? 'READY' : 'FAILED';
    if (validation.isValid) {
      if (duplicateCheck.isDuplicate) {
        processingStatus = 'REQUIRES_REVIEW';
      } else if (classification.requiresReview || reportingPeriod.periodType === 'OTHER') {
        processingStatus = 'REQUIRES_REVIEW';
      } else if (pages.some((p) => p.ocrStatus === 'REQUIRES_REVIEW')) {
        processingStatus = 'REQUIRES_REVIEW';
      } else if (pages.some((p) => p.ocrStatus === 'FAILED')) {
        processingStatus = 'FAILED';
      }
    }

    const docId = `doc_${targetSymbol.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const ingestedDoc: IngestedDocument = {
      id: docId,
      projectId,
      filename,
      originalFilename: filename,
      mimeType,
      sizeBytes,
      fileHash,
      documentType: finalDocType,
      classificationConfidence: isManualOverride ? 100 : classification.confidence,
      isClassificationManualOverride: isManualOverride,
      provenanceSourceType,
      source: customSourceLabel || (isImageOrScreenshot ? 'Screenshot Evidence' : 'Official Filing / PDF'),
      reportingPeriod,
      companyVerification,
      processingStatus: processingStatus as any,
      extractionStatus: 'PENDING',
      ocrStatusSummary: ocrSummary,
      pages,
      dimensions,
      validationErrors: validation.errors,
      uploadedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    return {
      document: ingestedDoc,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateReason: duplicateCheck.reason,
    };
  }

  /**
   * Helper to parse and structure document pages with machine-text vs OCR gating.
   */
  private static parseDocumentPages(params: {
    filename: string;
    mimeType: string;
    mockTextPages?: Array<{ text: string; isScanned?: boolean; measuredOcrConfidence?: number }>;
    simulateOcrFailure?: boolean;
  }): { pages: DocumentPage[]; textSample: string } {
    const { filename, mimeType, mockTextPages, simulateOcrFailure } = params;

    // If explicit mock pages are provided (e.g. from fixtures or PDF.js extraction)
    if (mockTextPages && mockTextPages.length > 0) {
      const pages: DocumentPage[] = mockTextPages.map((mp, index) => {
        const pageNumber = index + 1;
        const isScanned = mp.isScanned ?? false;
        const hasMachineText = !isScanned && mp.text.trim().length > 0;

        const ocrResult = OcrProcessor.evaluateOcrForPage({
          isScanned,
          hasMachineText,
          measuredConfidence: mp.measuredOcrConfidence,
          extractedText: isScanned ? mp.text : undefined,
          simulateFailure: simulateOcrFailure,
        });

        return {
          pageNumber,
          hasText: mp.text.length > 0 || !!ocrResult.ocrText,
          isScanned,
          textLength: mp.text.length,
          textPreview: mp.text.slice(0, 300),
          ocrStatus: ocrResult.ocrStatus,
          ocrConfidence: ocrResult.ocrConfidence,
          ocrConfidenceTier: ocrResult.ocrConfidenceTier,
          ocrApplied: ocrResult.ocrApplied,
          ocrText: ocrResult.ocrText,
          ocrErrorMessage: ocrResult.errorMessage,
        };
      });

      const textSample = pages.map((p) => p.textPreview).join(' ');
      return { pages, textSample };
    }

    // Default synthetic page parsing for PDFs vs Images
    if (mimeType === 'application/pdf') {
      const isScannedSample = filename.toLowerCase().includes('scanned');
      const pages: DocumentPage[] = [1, 2].map((pageNumber) => {
        const hasMachineText = !isScannedSample;
        const ocrResult = OcrProcessor.evaluateOcrForPage({
          isScanned: isScannedSample,
          hasMachineText,
          measuredConfidence: isScannedSample ? 94.2 : undefined,
          extractedText: isScannedSample ? `Scanned page ${pageNumber} OCR text layer` : undefined,
          simulateFailure: simulateOcrFailure,
        });

        const sampleText = isScannedSample
          ? `[OCR Layer Page ${pageNumber}] ${filename}`
          : `[Machine Text Page ${pageNumber}] Audited Financial Statements for ${filename}`;

        return {
          pageNumber,
          hasText: true,
          isScanned: isScannedSample,
          textLength: sampleText.length,
          textPreview: sampleText,
          ocrStatus: ocrResult.ocrStatus,
          ocrConfidence: ocrResult.ocrConfidence,
          ocrConfidenceTier: ocrResult.ocrConfidenceTier,
          ocrApplied: ocrResult.ocrApplied,
          ocrText: ocrResult.ocrText,
          ocrErrorMessage: ocrResult.errorMessage,
        };
      });

      const textSample = pages.map((p) => p.textPreview).join(' ');
      return { pages, textSample };
    }

    if (mimeType.startsWith('image/')) {
      // Screenshot single-page OCR evaluation
      const ocrResult = OcrProcessor.evaluateOcrForPage({
        isScanned: true,
        hasMachineText: false,
        measuredConfidence: 91.5,
        extractedText: `Image OCR text extraction for ${filename}`,
        simulateFailure: simulateOcrFailure,
      });

      const page: DocumentPage = {
        pageNumber: 1,
        hasText: true,
        isScanned: true,
        textLength: 120,
        textPreview: `Screenshot Evidence: ${filename}`,
        ocrStatus: ocrResult.ocrStatus,
        ocrConfidence: ocrResult.ocrConfidence,
        ocrConfidenceTier: ocrResult.ocrConfidenceTier,
        ocrApplied: ocrResult.ocrApplied,
        ocrText: ocrResult.ocrText,
        ocrErrorMessage: ocrResult.errorMessage,
      };

      return { pages: [page], textSample: page.textPreview };
    }

    // Default 1-page text
    const ocrResult = OcrProcessor.evaluateOcrForPage({
      isScanned: false,
      hasMachineText: true,
    });

    const page: DocumentPage = {
      pageNumber: 1,
      hasText: true,
      isScanned: false,
      textLength: 200,
      textPreview: `Text Stream for ${filename}`,
      ocrStatus: ocrResult.ocrStatus,
      ocrConfidence: undefined,
      ocrConfidenceTier: 'NONE',
      ocrApplied: false,
    };

    return { pages: [page], textSample: page.textPreview };
  }

  private static inferMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }
}
