import { describe, it, expect } from 'vitest';
import { TwoYearReportAudit } from '../../src/domain/ingestion/TwoYearReportAudit';
import { IngestedDocument } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 3 — Two-Year Annual Report Audit Engine', () => {
  const createMockAnnualReport = (id: string, filename: string, fy: string): IngestedDocument => ({
    id,
    projectId: 'proj_tatamotors',
    filename,
    originalFilename: filename,
    mimeType: 'application/pdf',
    sizeBytes: 15000000,
    fileHash: `hash_${id}`,
    documentType: 'ANNUAL_REPORT',
    classificationConfidence: 95,
    isClassificationManualOverride: false,
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    source: 'Official Filing',
    reportingPeriod: { fiscalYear: fy, periodType: 'ANNUAL', isIdentifiable: true },
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
    pages: [],
    validationErrors: [],
    uploadedAt: new Date().toISOString(),
  });

  it('validates a complete two-year baseline (FY23 & FY24)', () => {
    const docFY23 = createMockAnnualReport('doc_1', 'TataMotors_AR23.pdf', 'FY23');
    const docFY24 = createMockAnnualReport('doc_2', 'TataMotors_AR24.pdf', 'FY24');

    const audit = TwoYearReportAudit.audit({
      documents: [docFY23, docFY24],
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
    });

    expect(audit.isReadyForTwoYearModel).toBe(true);
    expect(audit.fy0Document?.id).toBe('doc_2'); // Current FY24
    expect(audit.fy1Document?.id).toBe('doc_1'); // Base FY23
    expect(audit.hasDuplicateYears).toBe(false);
    expect(audit.warnings).toHaveLength(0);
  });

  it('warns when both uploaded annual reports represent the identical fiscal year', () => {
    const doc1 = createMockAnnualReport('doc_1', 'TataMotors_AR24_copy1.pdf', 'FY24');
    const doc2 = createMockAnnualReport('doc_2', 'TataMotors_AR24_copy2.pdf', 'FY24');

    const audit = TwoYearReportAudit.audit({
      documents: [doc1, doc2],
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
    });

    expect(audit.isReadyForTwoYearModel).toBe(false);
    expect(audit.hasDuplicateYears).toBe(true);
    expect(audit.warnings.some((w) => w.includes('Multiple annual reports detected for identical period FY24'))).toBe(true);
  });

  it('reports incomplete baseline when only 1 annual report is uploaded', () => {
    const doc1 = createMockAnnualReport('doc_1', 'TataMotors_AR24.pdf', 'FY24');

    const audit = TwoYearReportAudit.audit({
      documents: [doc1],
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
    });

    expect(audit.isReadyForTwoYearModel).toBe(false);
    expect(audit.fy0Document?.id).toBe('doc_1');
    expect(audit.fy1Document).toBeUndefined();
    expect(audit.statusMessage).toContain('Upload a second consecutive Annual Report');
  });
});
