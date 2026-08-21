/**
 * 04_ocrFailureResilience.test.ts
 * Phase 17 — OCR Failure, Corruption & Anti-Fabrication Resilience Suite.
 */

import { describe, it, expect } from 'vitest';
import { OcrProcessor } from '../../src/domain/ingestion/OcrProcessor';

describe('OCR Failure Resilience & Anti-Fabrication Suite', () => {
  it('strictly returns FAILED or NONE confidence without fabricating zero or default numerical values on corrupted input', () => {
    const corruptSimulations = [
      { simulateFailure: true, failureReason: 'Unreadable image noise' },
      { simulateFailure: true, failureReason: 'Corrupted image file buffer' },
      { simulateFailure: false, isScanned: false, hasMachineText: true },
    ];

    for (const sim of corruptSimulations) {
      const result = OcrProcessor.evaluateOcrForPage({
        isScanned: sim.simulateFailure,
        hasMachineText: sim.hasMachineText || false,
        simulateFailure: sim.simulateFailure,
        failureReason: sim.failureReason,
      });

      if (sim.simulateFailure) {
        expect(result.ocrStatus).toBe('FAILED');
        expect(result.ocrConfidence).toBeUndefined(); // Never 0% fabricated
        expect(result.ocrConfidenceTier).toBe('NONE');
      } else {
        expect(result.ocrStatus).toBe('NOT_REQUIRED');
        expect(result.ocrConfidence).toBeUndefined();
      }
    }
  });
});
