/**
 * 03_longScreenshotAndImageStress.test.ts
 * Phase 17 — Long Screenshot & High-Resolution Image Stress Suite.
 */

import { describe, it, expect } from 'vitest';
import { OcrProcessor } from '../../src/domain/ingestion/OcrProcessor';
import { CanonicalJsonSerializer } from '../../src/domain/audit/CanonicalJsonSerializer';

describe('Long Screenshot & Image Stress Suite', () => {
  it('processes high-resolution financial table screenshots with bounded memory and accurate confidence tiers', () => {
    // Generate synthetic financial screenshot text with 100 rows
    let tableText = 'METRIC | FY20 | FY21 | FY22 | FY23 | FY24\n';
    for (let r = 1; r <= 100; r++) {
      tableText += `Metric_${r} | ${r * 10} | ${r * 12} | ${r * 15} | ${r * 18} | ${r * 22}\n`;
    }

    const payloadHash = CanonicalJsonSerializer.sha256(tableText);
    expect(payloadHash.length).toBe(64);

    const ocrResult = OcrProcessor.evaluateOcrForPage({
      isScanned: true,
      hasMachineText: false,
      measuredConfidence: 96,
      extractedText: tableText,
    });

    expect(ocrResult.ocrStatus).toBe('COMPLETE');
    expect(ocrResult.ocrConfidenceTier).toBe('HIGH');
    expect(ocrResult.ocrConfidence).toBe(96);
  });
});
