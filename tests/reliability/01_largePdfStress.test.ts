/**
 * 01_largePdfStress.test.ts
 * Phase 17 — Large PDF & 300+ Page Document Stress Test.
 */

import { describe, it, expect } from 'vitest';
import { StressWorkloadHarness } from '../../src/domain/reliability/StressWorkloadHarness';
import { PerformanceBenchmarkEngine } from '../../src/domain/reliability/PerformanceBenchmarkEngine';

describe('Large PDF Stress & Scalability Suite', () => {
  it('processes small (10 pages), medium (50 pages), large (100 pages), and massive (350 pages) annual reports with deterministic ordering and zero page loss', () => {
    const pageCounts = [10, 50, 100, 350];

    for (const pages of pageCounts) {
      const benchmark = PerformanceBenchmarkEngine.measureSync(
        'PDF_PARSING',
        () => {
          const doc = StressWorkloadHarness.generateSyntheticAnnualReport({
            documentId: `doc_stress_${pages}`,
            symbol: 'TATAMOTORS',
            totalPages: pages,
            financialStartPage: Math.floor(pages * 0.7),
          });
          return doc;
        },
        pages,
        { targetPages: pages }
      );

      const { document, facts } = benchmark.result;

      expect(document.pages.length).toBe(pages);
      expect(facts.length).toBeGreaterThan(0);

      // Verify strict sequential page numbering
      for (let i = 0; i < document.pages.length; i++) {
        expect(document.pages[i].pageNumber).toBe(i + 1);
      }

      expect(benchmark.record.durationMs).toBeLessThan(1000); // Sub-second in-memory parsing
    }
  });
});
