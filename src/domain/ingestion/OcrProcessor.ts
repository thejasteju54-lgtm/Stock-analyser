import {
  DocumentPage,
  PageOcrStatus,
  OcrConfidenceTier,
} from './DocumentTypes';

export interface OcrProcessingResult {
  ocrStatus: PageOcrStatus;
  ocrConfidence?: number;
  ocrConfidenceTier: OcrConfidenceTier;
  ocrText?: string;
  ocrApplied: boolean;
  errorMessage?: string;
}

export class OcrProcessor {
  /**
   * Evaluates and classifies the OCR requirements and confidence for a page.
   *
   * Thresholds:
   * - High: > 90% (ocrStatus = COMPLETE, tier = HIGH)
   * - Medium: 80% - 90% (ocrStatus = COMPLETE, tier = MEDIUM)
   * - Low: < 80% (ocrStatus = REQUIRES_REVIEW, tier = LOW)
   * - Machine readable / Text stream: (ocrStatus = NOT_REQUIRED, ocrConfidence = undefined, tier = NONE)
   * - Failed OCR: (ocrStatus = FAILED, ocrConfidence = undefined)
   */
  public static evaluateOcrForPage(params: {
    isScanned: boolean;
    hasMachineText: boolean;
    measuredConfidence?: number;
    extractedText?: string;
    simulateFailure?: boolean;
    failureReason?: string;
  }): OcrProcessingResult {
    const {
      isScanned,
      hasMachineText,
      measuredConfidence,
      extractedText,
      simulateFailure,
      failureReason,
    } = params;

    // Condition 1: Pure machine-readable page — No OCR required
    if (hasMachineText && !isScanned) {
      return {
        ocrStatus: 'NOT_REQUIRED',
        ocrConfidence: undefined, // Explicitly undefined, NOT 0%
        ocrConfidenceTier: 'NONE',
        ocrApplied: false,
        ocrText: undefined,
      };
    }

    // Condition 2: OCR Failed
    if (simulateFailure) {
      return {
        ocrStatus: 'FAILED',
        ocrConfidence: undefined,
        ocrConfidenceTier: 'NONE',
        ocrApplied: true,
        errorMessage: failureReason || 'OCR engine failed to recognize text glyphs.',
      };
    }

    // Condition 3: Scanned page requires OCR
    const confidence = measuredConfidence !== undefined ? measuredConfidence : 92.5;

    // High confidence (>90%)
    if (confidence > 90) {
      return {
        ocrStatus: 'COMPLETE',
        ocrConfidence: confidence,
        ocrConfidenceTier: 'HIGH',
        ocrApplied: true,
        ocrText: extractedText || 'Extracted high-fidelity OCR text layer.',
      };
    }

    // Medium confidence (80% - 90%)
    if (confidence >= 80 && confidence <= 90) {
      return {
        ocrStatus: 'COMPLETE',
        ocrConfidence: confidence,
        ocrConfidenceTier: 'MEDIUM',
        ocrApplied: true,
        ocrText: extractedText || 'Extracted medium-confidence OCR text layer.',
      };
    }

    // Low confidence (<80%) -> Flagged for review
    return {
      ocrStatus: 'REQUIRES_REVIEW',
      ocrConfidence: confidence,
      ocrConfidenceTier: 'LOW',
      ocrApplied: true,
      ocrText: extractedText || 'Extracted low-confidence OCR text layer.',
      errorMessage: `Low OCR extraction confidence (${confidence.toFixed(1)}% < 80%). Requires analyst manual verification.`,
    };
  }

  /**
   * Summarizes OCR metrics across a collection of document pages.
   */
  public static summarizeOcrAcrossPages(pages: DocumentPage[]): {
    required: boolean;
    pageCount: number;
    completedPages: number;
    scannedPageCount: number;
    machineReadablePageCount: number;
    averageConfidence?: number;
    overallTier: OcrConfidenceTier;
  } {
    const pageCount = pages.length;
    const scannedPages = pages.filter((p) => p.isScanned || p.ocrApplied);
    const machineReadablePages = pages.filter((p) => p.hasText && !p.isScanned);
    const ocrCompletedPages = pages.filter(
      (p) => (p.ocrStatus === 'COMPLETE' || p.ocrStatus === 'REQUIRES_REVIEW') && p.ocrConfidence !== undefined
    );

    const isRequired = scannedPages.length > 0;

    if (ocrCompletedPages.length === 0) {
      return {
        required: isRequired,
        pageCount,
        completedPages: 0,
        scannedPageCount: scannedPages.length,
        machineReadablePageCount: machineReadablePages.length,
        averageConfidence: undefined,
        overallTier: 'NONE',
      };
    }

    const totalConf = ocrCompletedPages.reduce((acc, p) => acc + (p.ocrConfidence || 0), 0);
    const avgConf = totalConf / ocrCompletedPages.length;

    let overallTier: OcrConfidenceTier = 'HIGH';
    if (pages.some((p) => p.ocrStatus === 'REQUIRES_REVIEW') || avgConf < 80) {
      overallTier = 'LOW';
    } else if (avgConf >= 80 && avgConf <= 90) {
      overallTier = 'MEDIUM';
    }

    return {
      required: isRequired,
      pageCount,
      completedPages: ocrCompletedPages.length,
      scannedPageCount: scannedPages.length,
      machineReadablePageCount: machineReadablePages.length,
      averageConfidence: Math.round(avgConf * 10) / 10,
      overallTier,
    };
  }
}
