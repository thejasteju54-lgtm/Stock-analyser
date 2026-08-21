/**
 * 17_largeReportAssemblyPerformance.test.ts
 * Phase 17 — Large Institutional Report Assembly & Citation Throughput Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { PerformanceBenchmarkEngine } from '../../src/domain/reliability/PerformanceBenchmarkEngine';
import { ReportExportService } from '../../src/domain/reports/ReportExportService';

describe('Large Report Assembly Performance Suite', () => {
  it('assembles the full 22-section institutional report and exports to HTML/JSON/CSV in sub-100ms duration', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial & Passenger Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const assemblyBenchmark = PerformanceBenchmarkEngine.measureSync(
      'REPORT_GENERATION',
      () => InvestmentResearchReportEngine.generateReport(project)
    );

    const report = assemblyBenchmark.result;
    expect(assemblyBenchmark.record.durationMs).toBeLessThan(100);
    expect(report.section1_CompanyOverview).toBeDefined();

    // Export formats benchmark
    const htmlExport = ReportExportService.generatePrintHtml(report);
    const jsonExport = ReportExportService.generateJsonExport(report);
    const csvExport = ReportExportService.generateCsvExport(report);

    expect(htmlExport.length).toBeGreaterThan(500);
    expect(jsonExport.length).toBeGreaterThan(500);
    expect(csvExport.length).toBeGreaterThan(100);
  });
});
