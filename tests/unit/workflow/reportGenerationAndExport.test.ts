import { describe, it, expect } from 'vitest';
import { InvestmentResearchReportEngine } from '../../../src/domain/reports/InvestmentResearchReportEngine';
import { ReportExportService } from '../../../src/domain/reports/ReportExportService';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — 22-Section Report Engine & Multi-Format Exporter', () => {
  const company: CompanyIdentity = {
    id: 'comp_1',
    displayName: 'Tata Motors Ltd',
    legalName: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    sector: 'AUTOMOBILE',
    subsector: 'PASSENGER_CARS',
    marketCapCategory: 'LARGE_CAP',
    businessModel: 'NON_FINANCIAL_OPERATING',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('assembles all 22 canonical sections without performing independent arithmetic', () => {
    const project = createResearchProject({ company });
    project.facts = [{ id: 'f1', metric: 'REVENUE', value: 437928, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' } } as any];
    project.verdictAnalysis = {
      decision: 'BUY',
      convictionScore: 8.5,
      convictionBand: 'VERY_HIGH',
      thesis: { oneLineSummary: 'Leading CV and EV franchise with expanding margins and aggressive deleveraging.' },
      priceAndValuation: {
        currentPrice: 920,
        intrinsicFairValue: 1150,
        actualMarginOfSafetyPercent: 20.0,
        requiredMarginOfSafetyPercent: 15.0,
        marginOfSafetyStatus: 'ADEQUATE',
        interestingPriceRange: { displayRange: '₹800 - ₹950', lowPrice: 800, highPrice: 950, impliedMarginOfSafetyPercent: 15 },
      },
      auditTrail: { appliedRuleId: 'RULE_BUY_ELIGIBILITY_GATE', blockers: [] },
    } as any;

    const report = InvestmentResearchReportEngine.generateReport(project);

    expect(report.section1_CompanyOverview.symbol).toBe('TATAMOTORS');
    expect(report.section2_ExecutiveVerdict.verdict).toBe('BUY');
    expect(report.section3_Conviction.convictionScore).toBe(8.5);
    expect(report.section4_OneLineThesis).toContain('Leading CV and EV franchise');
    expect(report.section5_MarketPriceTelemetry.price).toBe(920);
    expect(report.section10_Valuation.baseFairValue).toBe(1150);
    expect(report.section20_EvidenceAndSources.length).toBeGreaterThan(0);
    expect(report.reproducibilityChecksum).toHaveLength(64);
  });

  it('generates valid printable HTML, JSON, and CSV exports', () => {
    const project = createResearchProject({ company });
    const report = InvestmentResearchReportEngine.generateReport(project);

    const html = ReportExportService.generatePrintHtml(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('TATAMOTORS');
    expect(html).toContain('@media print');

    const json = ReportExportService.generateJsonExport(report);
    expect(JSON.parse(json)).toBeDefined();

    const csv = ReportExportService.generateCsvExport(report);
    expect(csv).toContain('"Company","Legal Name"');
    expect(csv).toContain('TATAMOTORS');
  });
});
