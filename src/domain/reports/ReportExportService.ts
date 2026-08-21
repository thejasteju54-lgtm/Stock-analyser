/**
 * ReportExportService.ts
 * Phase 15 — Multi-Format Research Report Export Service.
 * Implements Print-to-PDF, Standalone HTML, JSON, and CSV export generators.
 */

import { InvestmentReportPayload } from './ReportTypes';

export class ReportExportService {
  /**
   * Generates a self-contained, printable HTML report string with embedded styling and print rules.
   */
  public static generatePrintHtml(report: InvestmentReportPayload): string {
    const { section1_CompanyOverview: comp, section2_ExecutiveVerdict: verd, section3_Conviction: conv, section10_Valuation: val } = report;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${comp.legalName} (${comp.symbol}) — Institutional Investment Research Report</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 10pt; color: #1e293b; line-height: 1.5; background: #fff; margin: 0; padding: 20px; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-title { font-size: 18pt; font-weight: 700; color: #0f172a; margin: 0; }
    .meta-subtitle { font-size: 9pt; color: #64748b; margin-top: 4px; }
    .verdict-badge { display: inline-block; padding: 6px 14px; border-radius: 4px; font-weight: 800; font-size: 12pt; text-transform: uppercase; background: #0f172a; color: #fff; }
    .verdict-BUY { background: #059669; color: #fff; }
    .verdict-HOLD { background: #d97706; color: #fff; }
    .verdict-AVOID { background: #dc2626; color: #fff; }
    .section-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 16px; background: #f8fafc; }
    .section-title { font-size: 11pt; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 0; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9pt; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; }
    .page-break { page-break-before: always; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      .section-card { break-inside: avoid; border-color: #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-title">${comp.legalName} (${comp.symbol})</h1>
      <div class="meta-subtitle">${comp.sector} | ${comp.subsector} | Archetype: ${comp.economicArchetype}</div>
      <div class="meta-subtitle">Report ID: ${report.reportId} | Snapshot: ${report.snapshotId} | Date: ${report.generatedAt.split('T')[0]}</div>
    </div>
    <div style="text-align: right;">
      <div class="verdict-badge verdict-${verd.verdict}">${verd.verdict}</div>
      <div style="font-size: 9pt; color: #475569; margin-top: 4px; font-weight: 600;">Conviction: ${conv.convictionScore.toFixed(1)}/10 (${conv.convictionBand})</div>
    </div>
  </div>

  <div class="section-card">
    <div class="section-title">1. Executive Investment Thesis</div>
    <p style="font-size: 11pt; font-weight: 600; color: #0f172a; margin: 0 0 8px 0;">${report.section4_OneLineThesis}</p>
    <div style="font-size: 9pt; color: #475569;">Applied Decision Rule: <code>${verd.appliedRuleId}</code></div>
  </div>

  <div class="section-card">
    <div class="section-title">2. Valuation & Margin of Safety Matrix</div>
    <table>
      <thead>
        <tr><th>Metric</th><th>Value</th><th>Status / Benchmark</th></tr>
      </thead>
      <tbody>
        <tr><td>Current Sourced Price</td><td>${report.section5_MarketPriceTelemetry.price ? '₹' + report.section5_MarketPriceTelemetry.price : 'N/A'}</td><td>${report.section5_MarketPriceTelemetry.freshness}</td></tr>
        <tr><td>Intrinsic Base Fair Value</td><td>${val.baseFairValue ? '₹' + val.baseFairValue : 'N/A'}</td><td>${val.primaryMethod}</td></tr>
        <tr><td>Actual Margin of Safety</td><td>${val.mosActualPercent !== null ? val.mosActualPercent.toFixed(1) + '%' : 'N/A'}</td><td>Required: ${val.mosRequiredPercent}% (${val.mosStatus})</td></tr>
        <tr><td>Interesting Accumulation Range</td><td>${report.section6_InterestingPriceRange.displayRange}</td><td>Implied MoS: ${report.section6_InterestingPriceRange.impliedMoSPercent}%</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section-card">
    <div class="section-title">3. Forward Scenario Spectrum</div>
    <table>
      <thead>
        <tr><th>Scenario</th><th>Implied Valuation</th><th>Probability Weight</th></tr>
      </thead>
      <tbody>
        <tr><td>Bear Case</td><td>${report.section16_ScenarioSpectrum.bear.valuation ? '₹' + report.section16_ScenarioSpectrum.bear.valuation : 'N/A'}</td><td>${report.section16_ScenarioSpectrum.bear.probability ? report.section16_ScenarioSpectrum.bear.probability + '%' : 'N/A'}</td></tr>
        <tr><td>Base Case</td><td>${report.section16_ScenarioSpectrum.base.valuation ? '₹' + report.section16_ScenarioSpectrum.base.valuation : 'N/A'}</td><td>${report.section16_ScenarioSpectrum.base.probability ? report.section16_ScenarioSpectrum.base.probability + '%' : 'N/A'}</td></tr>
        <tr><td>Bull Case</td><td>${report.section16_ScenarioSpectrum.bull.valuation ? '₹' + report.section16_ScenarioSpectrum.bull.valuation : 'N/A'}</td><td>${report.section16_ScenarioSpectrum.bull.probability ? report.section16_ScenarioSpectrum.bull.probability + '%' : 'N/A'}</td></tr>
        <tr><td>Expected Scenario Value</td><td>${report.section16_ScenarioSpectrum.expectedScenarioValue ? '₹' + report.section16_ScenarioSpectrum.expectedScenarioValue : 'Gated / Placeholders Active'}</td><td>${report.section16_ScenarioSpectrum.areProbabilitiesPlaceholders ? 'Display Placeholders Active' : 'Evidence-Weighted'}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section-card page-break">
    <div class="section-title">4. Evidence Citations & Source Provenance</div>
    <table>
      <thead>
        <tr><th>Claim / Fact</th><th>Source Document</th><th>Phase / Confidence</th><th>Assessability</th></tr>
      </thead>
      <tbody>
        ${report.section20_EvidenceAndSources.slice(0, 15).map(c => `
          <tr>
            <td>${c.claimText}</td>
            <td>${c.sourceDocumentTitle || 'Annual Report'} ${c.pageOrSection ? '(' + c.pageOrSection + ')' : ''}</td>
            <td>${c.sourcePhase} (${c.confidenceScore}%)</td>
            <td><strong>${c.assessabilityStatus}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #94a3b8; display: flex; justify-content: space-between;">
    <div>Indian Equity Research Terminal | Institutional Report Engine ${report.engineVersion}</div>
    <div>Reproducibility Checksum: <code>${report.reproducibilityChecksum.substring(0, 16)}...</code></div>
  </div>
</body>
</html>`;
  }

  /**
   * Generates a formatted JSON string export of the full report payload.
   */
  public static generateJsonExport(report: InvestmentReportPayload): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generates a normalized CSV string of key financial metrics and scenario projections.
   */
  public static generateCsvExport(report: InvestmentReportPayload): string {
    const rows: string[][] = [
      ['Section', 'Metric', 'Value', 'Unit', 'Status'],
      ['Company', 'Legal Name', report.section1_CompanyOverview.legalName, 'Text', 'VERIFIED'],
      ['Company', 'Symbol', report.section1_CompanyOverview.symbol, 'Ticker', 'VERIFIED'],
      ['Company', 'Sector', report.section1_CompanyOverview.sector, 'Text', 'VERIFIED'],
      ['Verdict', 'Recommendation', report.section2_ExecutiveVerdict.verdict, 'Signal', 'CANONICAL'],
      ['Verdict', 'Conviction Score', report.section3_Conviction.convictionScore.toString(), '0-10 Scale', report.section3_Conviction.convictionBand],
      ['Valuation', 'Current Market Price', report.section5_MarketPriceTelemetry.price?.toString() || 'N/A', 'INR', report.section5_MarketPriceTelemetry.freshness],
      ['Valuation', 'Base Fair Value', report.section10_Valuation.baseFairValue?.toString() || 'N/A', 'INR', 'DERIVED'],
      ['Valuation', 'Actual Margin of Safety', report.section10_Valuation.mosActualPercent?.toString() || 'N/A', '%', report.section10_Valuation.mosStatus],
      ['Scenarios', 'Bear Valuation', report.section16_ScenarioSpectrum.bear.valuation?.toString() || 'N/A', 'INR', 'ESTIMATED'],
      ['Scenarios', 'Base Valuation', report.section16_ScenarioSpectrum.base.valuation?.toString() || 'N/A', 'INR', 'ESTIMATED'],
      ['Scenarios', 'Bull Valuation', report.section16_ScenarioSpectrum.bull.valuation?.toString() || 'N/A', 'INR', 'ESTIMATED'],
      ['Scenarios', 'Expected Scenario Value', report.section16_ScenarioSpectrum.expectedScenarioValue?.toString() || 'N/A', 'INR', report.section16_ScenarioSpectrum.areProbabilitiesPlaceholders ? 'PLACEHOLDER' : 'WEIGHTED'],
    ];

    return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  /**
   * Helper to trigger the browser's native Print / Save as PDF modal with the report content.
   */
  public static triggerBrowserPrint(report: InvestmentReportPayload): void {
    const html = this.generatePrintHtml(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }
}
