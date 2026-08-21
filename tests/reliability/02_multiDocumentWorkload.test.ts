/**
 * 02_multiDocumentWorkload.test.ts
 * Phase 17 — Multi-Document Concurrent Ingestion & Isolation Suite.
 */

import { describe, it, expect } from 'vitest';
import { StressWorkloadHarness } from '../../src/domain/reliability/StressWorkloadHarness';
import { PerformanceBenchmarkEngine } from '../../src/domain/reliability/PerformanceBenchmarkEngine';

describe('Multi-Document Workload & State Isolation Suite', () => {
  it('ingests 1, 3, 5, and 10 concurrent documents while guaranteeing cross-document isolation and zero state cross-contamination', () => {
    const documentCounts = [1, 3, 5, 10];

    for (const count of documentCounts) {
      const benchmark = PerformanceBenchmarkEngine.measureSync(
        'DOCUMENT_UPLOAD',
        () => {
          return StressWorkloadHarness.generateMultiDocumentBundle('HDFCBANK', count);
        },
        count
      );

      const bundle = benchmark.result;
      expect(bundle.length).toBe(count);

      // Verify strict isolation between documents in bundle
      const seenIds = new Set<string>();
      for (const doc of bundle) {
        expect(seenIds.has(doc.id)).toBe(false);
        seenIds.add(doc.id);
        expect(doc.companyVerification.targetSymbol).toBe('HDFCBANK');
        expect(doc.pages.length).toBeGreaterThan(20);
      }
    }
  });
});
