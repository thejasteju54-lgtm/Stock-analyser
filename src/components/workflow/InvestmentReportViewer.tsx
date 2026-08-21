/**
 * InvestmentReportViewer.tsx
 * Phase 15 — Canonical 22-Section Investment Research Report Viewer & Exporter Component.
 */

import React, { useState } from 'react';
import { InvestmentReportPayload, ReportClaimCitation } from '../../domain/reports/ReportTypes';
import { ReportExportService } from '../../domain/reports/ReportExportService';
import { ClaimProvenanceDrawer } from './ClaimProvenanceDrawer';
import { Printer, Download, FileCode, FileSpreadsheet, HelpCircle, ShieldCheck } from 'lucide-react';

interface InvestmentReportViewerProps {
  report: InvestmentReportPayload;
}

export const InvestmentReportViewer: React.FC<InvestmentReportViewerProps> = ({ report }) => {
  const [selectedCitation, setSelectedCitation] = useState<ReportClaimCitation | null>(null);

  const handleDownloadHtml = () => {
    const html = ReportExportService.generatePrintHtml(report);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.section1_CompanyOverview.symbol}_Investment_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const json = ReportExportService.generateJsonExport(report);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.section1_CompanyOverview.symbol}_Research_Payload.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = ReportExportService.generateCsvExport(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.section1_CompanyOverview.symbol}_Financial_Metrics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      {/* Header & Export Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Final Institutional Investment Research Report (22 Sections)
            </h2>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Report ID: <code>{report.reportId}</code> | Snapshot: <code>{report.snapshotId}</code> | Checksum: <code>{report.reproducibilityChecksum.substring(0, 12)}...</code>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => ReportExportService.triggerBrowserPrint(report)}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Printer size={12} />
            Print / Save as PDF
          </button>
          <button
            onClick={handleDownloadHtml}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Download size={12} /> HTML
          </button>
          <button
            onClick={handleDownloadJson}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FileCode size={12} /> JSON
          </button>
          <button
            onClick={handleDownloadCsv}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FileSpreadsheet size={12} /> CSV
          </button>
        </div>
      </div>

      {/* Section 1 & 2: Executive Verdict Banner */}
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            {report.section1_CompanyOverview.legalName} ({report.section1_CompanyOverview.symbol})
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
            {report.section4_OneLineThesis}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '4px',
              fontWeight: 800,
              fontSize: '14px',
              background:
                report.section2_ExecutiveVerdict.verdict === 'BUY'
                  ? '#059669'
                  : report.section2_ExecutiveVerdict.verdict === 'HOLD'
                  ? '#d97706'
                  : '#dc2626',
              color: '#fff',
            }}
          >
            {report.section2_ExecutiveVerdict.verdict}
          </span>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
            Conviction: {report.section3_Conviction.convictionScore.toFixed(1)}/10 ({report.section3_Conviction.convictionBand})
          </div>
        </div>
      </div>

      {/* Section 20: Evidence Citations Table */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
            Section 20: Evidence Citations & Provenance ({report.section20_EvidenceAndSources.length})
          </span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Click "Why?" to inspect source provenance</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {report.section20_EvidenceAndSources.slice(0, 8).map((cite) => (
            <div
              key={cite.claimId}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#f8fafc', fontWeight: 600 }}>{cite.claimText}</span>
                <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '8px' }}>
                  ({cite.sourceDocumentTitle || 'Annual Report'})
                </span>
              </div>
              <button
                onClick={() => setSelectedCitation(cite)}
                style={{
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  borderRadius: '3px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <HelpCircle size={10} /> Why?
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-in Claim Provenance Drawer */}
      <ClaimProvenanceDrawer
        citation={selectedCitation}
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
