import { describe, it, expect } from 'vitest';
import { OcrProcessor } from '../../src/domain/ingestion/OcrProcessor';
import { DocumentPage } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 3 — OCR Confidence & Status Architecture', () => {
  it('correctly classifies a machine-readable page (ocrStatus = NOT_REQUIRED, ocrConfidence = undefined)', () => {
    const result = OcrProcessor.evaluateOcrForPage({
      isScanned: false,
      hasMachineText: true,
      extractedText: 'Audited Financial Statement text stream',
    });

    expect(result.ocrStatus).toBe('NOT_REQUIRED');
    expect(result.ocrConfidence).toBeUndefined(); // Must NOT be 0 or a mandatory number
    expect(result.ocrConfidenceTier).toBe('NONE');
    expect(result.ocrApplied).toBe(false);
  });

  it('correctly handles successful high-confidence OCR (>90%)', () => {
    const result = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      measuredConfidence: 96.4,
      extractedText: 'Scanned Balance Sheet Table Row 1',
    });

    expect(result.ocrStatus).toBe('COMPLETE');
    expect(result.ocrConfidence).toBe(96.4);
    expect(result.ocrConfidenceTier).toBe('HIGH');
    expect(result.ocrApplied).toBe(true);
    expect(result.ocrText).toBe('Scanned Balance Sheet Table Row 1');
    expect(result.errorMessage).toBeUndefined();
  });

  it('correctly handles medium-confidence OCR (80% - 90%)', () => {
    const result = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      measuredConfidence: 84.8,
      extractedText: 'Scanned Concall Footnote',
    });

    expect(result.ocrStatus).toBe('COMPLETE');
    expect(result.ocrConfidence).toBe(84.8);
    expect(result.ocrConfidenceTier).toBe('MEDIUM');
    expect(result.ocrApplied).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('correctly handles low-confidence OCR (<80% -> REQUIRES_REVIEW)', () => {
    const result = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      measuredConfidence: 73.2,
      extractedText: 'Blurry screenshot OCR text',
    });

    expect(result.ocrStatus).toBe('REQUIRES_REVIEW');
    expect(result.ocrConfidence).toBe(73.2);
    expect(result.ocrConfidenceTier).toBe('LOW');
    expect(result.ocrApplied).toBe(true);
    expect(result.errorMessage).toContain('Low OCR extraction confidence');
  });

  it('correctly handles OCR failure (ocrStatus = FAILED, ocrConfidence = undefined)', () => {
    const result = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      simulateFailure: true,
      failureReason: 'Corrupted image glyph matrix',
    });

    expect(result.ocrStatus).toBe('FAILED');
    expect(result.ocrConfidence).toBeUndefined();
    expect(result.ocrConfidenceTier).toBe('NONE');
    expect(result.ocrApplied).toBe(true);
    expect(result.errorMessage).toBe('Corrupted image glyph matrix');
  });

  it('summarizes OCR statistics across a multi-page document accurately', () => {
    const pages: DocumentPage[] = [
      {
        pageNumber: 1,
        hasText: true,
        isScanned: false,
        textLength: 1500,
        textPreview: 'Machine page 1',
        ocrStatus: 'NOT_REQUIRED',
        ocrConfidence: undefined,
        ocrConfidenceTier: 'NONE',
        ocrApplied: false,
      },
      {
        pageNumber: 2,
        hasText: true,
        isScanned: true,
        textLength: 800,
        textPreview: 'Scanned page 2',
        ocrStatus: 'COMPLETE',
        ocrConfidence: 96.0,
        ocrConfidenceTier: 'HIGH',
        ocrApplied: true,
      },
      {
        pageNumber: 3,
        hasText: true,
        isScanned: true,
        textLength: 400,
        textPreview: 'Scanned page 3',
        ocrStatus: 'COMPLETE',
        ocrConfidence: 92.0,
        ocrConfidenceTier: 'HIGH',
        ocrApplied: true,
      },
    ];

    const summary = OcrProcessor.summarizeOcrAcrossPages(pages);
    expect(summary.required).toBe(true);
    expect(summary.pageCount).toBe(3);
    expect(summary.scannedPageCount).toBe(2);
    expect(summary.machineReadablePageCount).toBe(1);
    expect(summary.completedPages).toBe(2);
    expect(summary.averageConfidence).toBe(94.0);
    expect(summary.overallTier).toBe('HIGH');
  });
});
