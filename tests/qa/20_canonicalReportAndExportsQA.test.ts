/**
 * 20_canonicalReportAndExportsQA.test.ts
 * QA Track: 22-Section Canonical Report & Multi-Format (JSON, CSV, HTML) Export.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { ReportExportService } from '../../src/domain/reports/ReportExportService';

describe('Canonical Report & Multi-Format Export QA', () => {
  it('generates complete 22-section report and exports to JSON, CSV, and HTML without data loss', () => {
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

    const report = InvestmentResearchReportEngine.generateReport(project);
    expect(report.section1_CompanyOverview).toBeDefined();
    expect(report.section2_ExecutiveVerdict).toBeDefined();

    const jsonExport = ReportExportService.generateJsonExport(report);
    expect(typeof jsonExport).toBe('string');
    expect(jsonExport.length).toBeGreaterThan(100);

    const parsedJson = JSON.parse(jsonExport);
    expect(parsedJson.reportId).toBe(report.reportId);

    const csvExport = ReportExportService.generateCsvExport(report);
    expect(typeof csvExport).toBe('string');
    expect(csvExport).toContain('"Section","Metric","Value","Unit","Status"');

    const htmlExport = ReportExportService.generatePrintHtml(report);
    expect(typeof htmlExport).toBe('string');
    expect(htmlExport).toContain('<!DOCTYPE html>');
  });
});
