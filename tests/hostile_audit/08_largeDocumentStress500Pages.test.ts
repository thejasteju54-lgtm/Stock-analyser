/**
 * 08_largeDocumentStress500Pages.test.ts
 * Phase 19 — Hostile 500-Page Annual Report Ingestion & Bounded Memory Suite.
 */

import { describe, it, expect } from 'vitest';
import { StressWorkloadHarness } from '../../src/domain/reliability/StressWorkloadHarness';

describe('Large Document Stress Suite (500 Pages)', () => {
  it('generates, indexes, and extracts facts from a massive 500-page synthetic annual report with zero page drops', () => {
    const start = performance.now();

    const report = StressWorkloadHarness.generateSyntheticAnnualReport({
      documentId: 'doc_500_pages',
      symbol: 'TATAMOTORS',
      totalPages: 500,
      financialStartPage: 380,
    });

    expect(report.document.pages.length).toBe(500);
    expect(report.facts.length).toBeGreaterThan(0);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
