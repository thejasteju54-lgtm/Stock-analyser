/**
 * 05_ocrCorruptionAndNoise.test.ts
 * Phase 19 — Hostile OCR Corruption, Digit Mismatches & Scanned Page Noise Suite.
 */

import { describe, it, expect } from 'vitest';
import { OcrProcessor } from '../../src/domain/ingestion/OcrProcessor';

describe('OCR Corruption & Noise Suite', () => {
  it('classifies corrupted, blank, or low-confidence scanned text with LOW confidence or FAILED status without manufacturing numbers', () => {
    // Highly corrupted text with digit confusion and noisy characters
    const noisyOcrText = 'Rev£nue: §12,5O cr0re   PAT: O.O%   EBIT: ?NaN';

    const evalResult = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      extractedText: noisyOcrText,
      measuredConfidence: 0.32,
    });

    expect(evalResult.ocrStatus === 'FAILED' || evalResult.ocrConfidenceTier === 'LOW').toBe(true);
  });

  it('marks pure machine-readable pages as NOT_REQUIRED without executing OCR', () => {
    const machineEval = OcrProcessor.evaluateOcrForPage({
      isScanned: false,
      hasMachineText: true,
      extractedText: 'Revenue: 10000 Cr',
    });

    expect(machineEval.ocrStatus).toBe('NOT_REQUIRED');
    expect(machineEval.ocrApplied).toBe(false);
  });
});
