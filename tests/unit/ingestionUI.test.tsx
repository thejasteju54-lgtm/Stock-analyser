import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IngestionView } from '../../src/routes/IngestionView';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';
import { IngestedDocument } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 3 — IngestionView & Evidence Intake UI Components', () => {
  const mockCompany = createCompanyEntity({
    legalName: 'Tata Motors Limited',
    displayName: 'Tata Motors',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    sector: 'Automobile',
    subsector: 'Passenger Vehicles (PV)',
    businessModel: 'NON_FINANCIAL_OPERATING',
  });

  const mockDocument: IngestedDocument = {
    id: 'doc_tatamotors_fy24_test',
    projectId: 'proj_test_123',
    filename: 'TATAMOTORS_Annual_Report_FY24.pdf',
    originalFilename: 'TATAMOTORS_Annual_Report_FY24.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 16500000,
    fileHash: 'sha256_abcdef1234567890',
    documentType: 'ANNUAL_REPORT',
    classificationConfidence: 95,
    isClassificationManualOverride: false,
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    source: 'Official Filing',
    reportingPeriod: { fiscalYear: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
    companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
    processingStatus: 'READY',
    extractionStatus: 'PENDING',
    ocrStatusSummary: {
      required: false,
      pageCount: 2,
      completedPages: 0,
      scannedPageCount: 0,
      machineReadablePageCount: 2,
      overallTier: 'NONE',
    },
    pages: [
      {
        pageNumber: 1,
        hasText: true,
        isScanned: false,
        textLength: 1200,
        textPreview: 'Audited Statement Page 1 Content',
        ocrStatus: 'NOT_REQUIRED',
        ocrConfidence: undefined,
        ocrConfidenceTier: 'NONE',
        ocrApplied: false,
      },
      {
        pageNumber: 2,
        hasText: true,
        isScanned: false,
        textLength: 1500,
        textPreview: 'Consolidated Balance Sheet FY24',
        ocrStatus: 'NOT_REQUIRED',
        ocrConfidence: undefined,
        ocrConfidenceTier: 'NONE',
        ocrApplied: false,
      },
    ],
    validationErrors: [],
    uploadedAt: new Date().toISOString(),
  };

  it('renders IngestionView with dropzone, audit card, and empty queue state when no docs exist', () => {
    const emptyProject = createResearchProject({ company: mockCompany, documents: [] });
    const onNavigate = vi.fn();
    const onProjectChange = vi.fn();

    render(
      <IngestionView
        activeProject={emptyProject}
        onNavigate={onNavigate}
        onProjectChange={onProjectChange}
      />
    );

    expect(screen.getByText(/Evidence Intake & Document Ingestion Pipeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Research Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Two-Year Annual Report Intake Baseline/i)).toBeInTheDocument();
    expect(screen.getByText(/No research documents ingested for this company yet/i)).toBeInTheDocument();
  });

  it('displays document details in table and allows opening the Page Inspector modal', () => {
    const projectWithDoc = createResearchProject({
      company: mockCompany,
      documents: [mockDocument],
    });
    const onNavigate = vi.fn();
    const onProjectChange = vi.fn();

    render(
      <IngestionView
        activeProject={projectWithDoc}
        onNavigate={onNavigate}
        onProjectChange={onProjectChange}
      />
    );

    // Verify document row renders (matches both table and audit card)
    const fileMatches = screen.getAllByText('TATAMOTORS_Annual_Report_FY24.pdf');
    expect(fileMatches.length).toBeGreaterThanOrEqual(1);

    const docTypeMatches = screen.getAllByText('ANNUAL_REPORT');
    expect(docTypeMatches.length).toBeGreaterThanOrEqual(1);

    const fyMatches = screen.getAllByText('FY24');
    expect(fyMatches.length).toBeGreaterThanOrEqual(1);

    // Click "Pages" inspector button
    const inspectBtn = screen.getByRole('button', { name: /Pages/i });
    fireEvent.click(inspectBtn);

    // Inspector modal should open
    expect(screen.getByText(/Evidence Page Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/Audited Statement Page 1 Content/i)).toBeInTheDocument();
    expect(screen.getByText(/NOT REQUIRED \(Machine Text\)/i)).toBeInTheDocument();

    // Close Inspector
    const closeBtn = screen.getByRole('button', { name: /Close Inspector/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Evidence Page Inspector/i)).not.toBeInTheDocument();
  });
});
