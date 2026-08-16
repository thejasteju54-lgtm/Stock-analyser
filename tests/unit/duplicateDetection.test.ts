import { describe, it, expect } from 'vitest';
import { DocumentHasher } from '../../src/domain/ingestion/DocumentHasher';
import { IngestedDocument } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 3 — Duplicate Detection Layer', () => {
  it('computes deterministic file hashes for byte streams', async () => {
    const data1 = 'Sample annual report text content for Tata Motors';
    const data2 = 'Sample annual report text content for Tata Motors';
    const data3 = 'Different annual report text content';

    const hash1 = await DocumentHasher.computeHash(data1);
    const hash2 = await DocumentHasher.computeHash(data2);
    const hash3 = await DocumentHasher.computeHash(data3);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('detects duplicate documents with identical hash in research project', async () => {
    const existingDoc: IngestedDocument = {
      id: 'doc_existing_123',
      projectId: 'proj_tatamotors',
      filename: 'TATAMOTORS_AR24.pdf',
      originalFilename: 'TATAMOTORS_AR24.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 12500000,
      fileHash: 'hash_abc123_deterministic',
      documentType: 'ANNUAL_REPORT',
      classificationConfidence: 90,
      isClassificationManualOverride: false,
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      source: 'Filing',
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
      pages: [],
      validationErrors: [],
      uploadedAt: new Date().toISOString(),
    };

    const duplicateCheck = DocumentHasher.detectDuplicate({
      newHash: 'hash_abc123_deterministic',
      newFilename: 'TATAMOTORS_AR24_copy.pdf',
      existingDocuments: [existingDoc],
    });

    expect(duplicateCheck.isDuplicate).toBe(true);
    expect(duplicateCheck.reason).toContain('Exact duplicate file content already uploaded');
  });

  it('detects identical filename duplicate upload', () => {
    const existingDoc: IngestedDocument = {
      id: 'doc_existing_456',
      projectId: 'proj_tatamotors',
      filename: 'TATAMOTORS_AR24.pdf',
      originalFilename: 'TATAMOTORS_AR24.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 12500000,
      fileHash: 'hash_different_1',
      documentType: 'ANNUAL_REPORT',
      classificationConfidence: 90,
      isClassificationManualOverride: false,
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      source: 'Filing',
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
      pages: [],
      validationErrors: [],
      uploadedAt: new Date().toISOString(),
    };

    const duplicateCheck = DocumentHasher.detectDuplicate({
      newHash: 'hash_different_2',
      newFilename: 'TATAMOTORS_AR24.pdf',
      existingDocuments: [existingDoc],
    });

    expect(duplicateCheck.isDuplicate).toBe(true);
    expect(duplicateCheck.reason).toContain('identical filename');
  });
});
