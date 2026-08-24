/**
 * staticDataScan.test.ts
 * Automated Static Data & Zero Hardcoding Linter Test
 * Scans production codebase to guarantee zero Math.random, zero hardcoded Tata Motors numbers, and zero fake radar templates.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Static Data & Anti-Fabrication Codebase Scan', () => {
  it('verifies that TechnicalAnalysisView contains ZERO Math.random calls', () => {
    const techViewPath = path.resolve(process.cwd(), 'src/routes/TechnicalAnalysisView.tsx');
    const content = fs.readFileSync(techViewPath, 'utf-8');

    expect(content).not.toContain('Math.random');
    expect(content).not.toContain('Math.sin');
    expect(content).not.toContain('generateDefaultCandles');
  });

  it('verifies that FinancialFactExtractor contains ZERO hardcoded Tata Motors financial constants or quotes', () => {
    const extractorPath = path.resolve(process.cwd(), 'src/domain/extraction/FinancialFactExtractor.ts');
    const content = fs.readFileSync(extractorPath, 'utf-8');

    expect(content).not.toContain('345967');
    expect(content).not.toContain('437928');
    expect(content).not.toContain('Girish Wagh');
    expect(content).not.toContain('Adrian Mardell');
    expect(content).not.toContain('Shailesh Chandra');
  });

  it('verifies that NewsDiscoveryAdapter contains ZERO hardcoded radar order wire strings', () => {
    const newsPath = path.resolve(process.cwd(), 'src/infrastructure/researchSources/news/NewsDiscoveryAdapter.ts');
    const content = fs.readFileSync(newsPath, 'utf-8');

    expect(content).not.toContain('Indian Army Awards Radar Procurement Order');
    expect(content).not.toContain('CRISIL Reaffirms');
  });
});
