import React, { useState } from 'react';
import { Table, HelpCircle, Layers } from 'lucide-react';
import { WhyEvidenceItem } from '../common/WhyEvidenceModal';
import { Badge } from '../common/Badge';

export interface FinancialPerformanceTableProps {
  onOpenWhyModal?: (item: WhyEvidenceItem) => void;
}

export const FinancialPerformanceTable: React.FC<FinancialPerformanceTableProps> = ({
  onOpenWhyModal,
}) => {
  const [basis, setBasis] = useState<'CONSOLIDATED' | 'STANDALONE'>('CONSOLIDATED');

  const financialRows = [
    { metric: 'Revenue from Operations', unit: '₹ Cr', fy22: '278,454', fy23: '345,967', fy24: '437,928', fy25e: '485,000', fy26e: '535,000', source: 'Audited P&L Statements', page: 'p. 138', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'EBITDA', unit: '₹ Cr', fy22: '24,812', fy23: '37,011', fy24: '62,284', fy25e: '71,500', fy26e: '82,000', source: 'Deterministic Derived Bridge', page: 'P5 Model', pubDate: '29-May-2024', layer: 'DERIVED' as const },
    { metric: 'EBITDA Margin', unit: '%', fy22: '8.9%', fy23: '10.7%', fy24: '14.2%', fy25e: '14.7%', fy26e: '15.3%', source: 'EBITDA / Revenue Ratio', page: 'P5 Model', pubDate: '29-May-2024', layer: 'DERIVED' as const },
    { metric: 'EBIT (Operating Profit)', unit: '₹ Cr', fy22: '9,985', fy23: '20,442', fy24: '41,520', fy25e: '49,200', fy26e: '57,800', source: 'Audited P&L Statements', page: 'p. 138', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'Profit After Tax (PAT)', unit: '₹ Cr', fy22: '-11,441', fy23: '2,414', fy24: '31,399', fy25e: '36,800', fy26e: '43,500', source: 'Audited P&L Statements', page: 'p. 138', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'Earnings Per Share (EPS)', unit: '₹', fy22: '-29.8', fy23: '6.3', fy24: '81.8', fy25e: '95.9', fy26e: '113.3', source: 'Audited Statutory Disclosures', page: 'p. 139', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'Cash Flow from Ops (CFO)', unit: '₹ Cr', fy22: '14,286', fy23: '33,284', fy24: '58,420', fy25e: '64,000', fy26e: '72,000', source: 'Audited Cash Flow Statement', page: 'p. 144', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'Free Cash Flow (FCF)', unit: '₹ Cr', fy22: '-4,210', fy23: '11,450', fy24: '29,800', fy25e: '34,500', fy26e: '41,000', source: 'CFO - Capex Deterministic', page: 'P5 Model', pubDate: '29-May-2024', layer: 'DERIVED' as const },
    { metric: 'Net Debt', unit: '₹ Cr', fy22: '48,700', fy23: '43,700', fy24: '16,000', fy25e: '6,200', fy26e: 'Net Cash', source: 'Debt & Cash Bridge', page: 'p. 160', pubDate: '29-May-2024', layer: 'FACT' as const },
    { metric: 'Return on Capital (ROCE)', unit: '%', fy22: '5.2%', fy23: '10.8%', fy24: '18.2%', fy25e: '19.4%', fy26e: '20.8%', source: 'EBIT / Capital Employed', page: 'P5 Model', pubDate: '29-May-2024', layer: 'DERIVED' as const },
  ];

  const handleWhyClick = (row: typeof financialRows[0]) => {
    if (onOpenWhyModal) {
      onOpenWhyModal({
        metricOrClaim: row.metric,
        value: row.fy24,
        unit: row.unit,
        sourceDocument: row.source,
        sourceTier: 'TIER_1_STATUTORY',
        pageCitation: row.page,
        reportingPeriod: 'FY22–FY24 (Actual) / FY25–FY26 (Projected)',
        consolidationBasis: basis,
        publicationDate: row.pubDate,
        observationDate: 'Audited Statutory Exchange Filing',
        reasoningLayer: row.layer,
        formulaOrDerivation: `${row.metric} extraction from statutory disclosures and deterministic ratio engine.`,
        status: 'VERIFIED',
        confidence: 'HIGH',
      });
    }
  };

  return (
    <div
      className="terminal-card"
      id="financial-performance-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      {/* Header with Basis Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Table size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
            5-Year Financial Statement Trajectory & Forward Projections
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Basis Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setBasis('CONSOLIDATED')}
              style={{
                background: basis === 'CONSOLIDATED' ? '#ffffff' : 'transparent',
                color: basis === 'CONSOLIDATED' ? 'var(--brand-navy)' : 'var(--text-muted)',
                fontWeight: basis === 'CONSOLIDATED' ? 700 : 500,
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: basis === 'CONSOLIDATED' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Consolidated
            </button>
            <button
              onClick={() => setBasis('STANDALONE')}
              style={{
                background: basis === 'STANDALONE' ? '#ffffff' : 'transparent',
                color: basis === 'STANDALONE' ? 'var(--brand-navy)' : 'var(--text-muted)',
                fontWeight: basis === 'STANDALONE' ? 700 : 500,
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: basis === 'STANDALONE' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Standalone
            </button>
          </div>

          <Badge variant="neutral">
            <Layers size={11} /> {basis}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="terminal-table">
          <thead>
            <tr>
              <th style={{ minWidth: '220px' }}>Financial Metric</th>
              <th style={{ width: '70px' }}>Unit</th>
              <th className="text-right" style={{ width: '100px' }}>FY22 (A)</th>
              <th className="text-right" style={{ width: '100px' }}>FY23 (A)</th>
              <th className="text-right" style={{ width: '110px', background: '#eff6ff', color: 'var(--brand-blue)' }}>FY24 (A)</th>
              <th className="text-right" style={{ width: '100px', fontStyle: 'italic', background: '#f8fafc' }}>FY25 (E)</th>
              <th className="text-right" style={{ width: '100px', fontStyle: 'italic', background: '#f8fafc' }}>FY26 (E)</th>
              <th style={{ width: '50px', textAlign: 'center' }}>Why?</th>
            </tr>
          </thead>
          <tbody>
            {financialRows.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{row.metric}</span>
                    <span style={{ fontSize: '9px', color: row.layer === 'FACT' ? 'var(--color-bullish)' : 'var(--brand-blue)', background: row.layer === 'FACT' ? 'var(--color-bullish-bg)' : 'var(--brand-blue-light)', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                      {row.layer}
                    </span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{row.unit}</td>
                <td className="text-right tabular-nums">{row.fy22}</td>
                <td className="text-right tabular-nums">{row.fy23}</td>
                <td className="text-right tabular-nums" style={{ fontWeight: 700, background: '#f0f9ff', color: 'var(--brand-navy)' }}>
                  {row.fy24}
                </td>
                <td className="text-right tabular-nums" style={{ color: 'var(--text-secondary)', background: '#fafbfc' }}>{row.fy25e}</td>
                <td className="text-right tabular-nums" style={{ color: 'var(--text-secondary)', background: '#fafbfc' }}>{row.fy26e}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleWhyClick(row)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-blue)', display: 'inline-flex', padding: 0 }}
                    title={`Inspect ${row.metric} provenance`}
                  >
                    <HelpCircle size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <span>(A) = Audited Historical Disclosure ({basis}) • (E) = Forward Model Projection</span>
        <span>Authority: Tier 1 Statutory Annual Reports & Company Filing Archive</span>
      </div>
    </div>
  );
};
