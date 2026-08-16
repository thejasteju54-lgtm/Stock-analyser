import { describe, it, expect } from 'vitest';
import { FinancialFactExtractor } from '../../src/domain/extraction/FinancialFactExtractor';
import { IngestedDocument } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 4 — Management Claims & Guidance Extraction', () => {
  const concallDoc: IngestedDocument = {
    id: 'doc_tatamotors_concall_q4fy24',
    projectId: 'proj_test',
    filename: 'TataMotors_Concall_Transcript_Q4FY24.pdf',
    originalFilename: 'TataMotors_Concall_Transcript_Q4FY24.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 850000,
    fileHash: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01',
    documentType: 'CONCALL_TRANSCRIPT',
    classificationConfidence: 98,
    isClassificationManualOverride: false,
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    source: 'Official Earnings Call Transcript',
    reportingPeriod: { fiscalYear: 'FY24', quarter: 'Q4', isIdentifiable: true, periodType: 'QUARTERLY', rawPeriodString: 'Q4FY24' },
    companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
    processingStatus: 'READY',
    extractionStatus: 'PENDING',
    ocrStatusSummary: { required: false, pageCount: 15, completedPages: 0, scannedPageCount: 0, machineReadablePageCount: 15, overallTier: 'NONE' },
    pages: [],
    validationErrors: [],
    uploadedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };

  it('1. Extracts management statements separately from financial facts with speaker attribution', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [concallDoc],
    });

    expect(result.managementClaims.length).toBeGreaterThanOrEqual(4);

    const guidanceClaim = result.managementClaims.find((c) => c.category === 'GUIDANCE');
    expect(guidanceClaim).toBeDefined();
    expect(guidanceClaim?.speaker).toBe('Girish Wagh');
    expect(guidanceClaim?.claimText).toContain('CV industry growth');

    const deleveragingClaim = result.managementClaims.find((c) => c.category === 'DELEVERAGING');
    expect(deleveragingClaim?.speaker).toBe('PB Balaji');
    expect(deleveragingClaim?.claimText).toContain('net debt zero');

    const capexClaim = result.managementClaims.find((c) => c.category === 'CAPEX_PLAN');
    expect(capexClaim?.speaker).toBe('Shailesh Chandra');
    expect(capexClaim?.claimText).toContain('₹16,000-18,000 crores');
  });

  it('2. Management claims preserve stable page citations and confidence', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [concallDoc],
    });

    for (const claim of result.managementClaims) {
      expect(claim.sourceReference.documentId).toBe(concallDoc.id);
      expect(claim.pageNumber).toBeDefined();
      expect(claim.sourceReference.pageId).toBeDefined();
      expect(claim.confidence).toBeGreaterThan(90);
      expect(claim.verificationStatus).toBe('RECORDED');
    }
  });
});
