import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidenceExtractionView } from '../../src/routes/EvidenceExtractionView';
import { TwoYearFactTable } from '../../src/components/extraction/TwoYearFactTable';
import { FactProvenanceDrawer } from '../../src/components/extraction/FactProvenanceDrawer';
import { ProjectStorage } from '../../src/domain/storage/ProjectStorage';
import { FinancialFact, TwoYearReconciliationRecord } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 4 — Extraction UI & Provenance Modal Tests', () => {
  beforeEach(() => {
    ProjectStorage.clearAll();
  });

  const sampleFact: FinancialFact = {
    factId: 'fact_tatamotors_rev_fy24',
    projectId: 'proj_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: 'doc_ar_fy24',
    documentName: 'TATAMOTORS_Annual_Report_FY24.pdf',
    pageId: 'doc_ar_fy24_page_124',
    pageNumber: 124,
    category: 'INCOME_STATEMENT',
    metric: 'REVENUE',
    metricLabel: 'Revenue from Operations',
    availabilityStatus: 'AVAILABLE',
    value: 437928,
    originalValue: 437928,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
    accountingBasis: 'CONSOLIDATED',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: {
      documentId: 'doc_ar_fy24',
      documentTitle: 'TATAMOTORS_Annual_Report_FY24.pdf',
      pageId: 'doc_ar_fy24_page_124',
      pageNumber: 124,
      tableHeader: 'Statement of Profit and Loss',
      rawSnippet: 'Revenue from operations: ₹4,37,928 Cr',
    },
    confidence: 96,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  };

  const sampleRecord: TwoYearReconciliationRecord = {
    metric: 'REVENUE',
    metricLabel: 'Revenue from Operations',
    category: 'INCOME_STATEMENT',
    accountingBasis: 'CONSOLIDATED',
    fy1Fact: { ...sampleFact, factId: 'fact_rev_fy23', reportingPeriod: { fiscalYear: 'FY23', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY23' }, value: 345967 },
    fy0Fact: sampleFact,
    isComparable: true,
    comparabilityNotes: 'Comparable across both consecutive audited reports.',
  };

  it('1. Renders EvidenceExtractionView header and Run Extraction Pipeline action button', () => {
    render(<EvidenceExtractionView />);
    expect(screen.getByText(/Evidence Extraction & Financial Fact Reconstruction/i)).toBeInTheDocument();
    expect(screen.getByText(/Phase 4 Active/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Extraction Pipeline/i })).toBeInTheDocument();
  });

  it('2. Renders TwoYearFactTable and triggers inspect modal callback', () => {
    let inspected: FinancialFact | null = null;
    render(
      <TwoYearFactTable
        records={[sampleRecord]}
        fy1Label="FY23"
        fy0Label="FY24"
        onInspectFact={(fact: FinancialFact) => {
          inspected = fact;
        }}
      />
    );

    expect(screen.getByText(/Revenue from Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/345,967|3,45,967/i)).toBeInTheDocument();
    expect(screen.getByText(/437,928|4,37,928/i)).toBeInTheDocument();

    const inspectBtn = screen.getByRole('button', { name: /Inspect/i });
    fireEvent.click(inspectBtn);
    expect(inspected).not.toBeNull();
    expect((inspected as any)?.metric).toBe('REVENUE');
  });

  it('3. Renders FactProvenanceDrawer with citation and raw snippet', () => {
    render(<FactProvenanceDrawer fact={sampleFact} onClose={() => {}} />);
    expect(screen.getByText(/Evidence Provenance Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/TATAMOTORS_Annual_Report_FY24.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Statement of Profit and Loss/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue from operations: ₹4,37,928 Cr/i)).toBeInTheDocument();
  });
});
