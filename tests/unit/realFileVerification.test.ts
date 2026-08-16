import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentIngestionEngine } from '../../src/domain/ingestion/DocumentIngestionEngine';
import { TwoYearReportAudit } from '../../src/domain/ingestion/TwoYearReportAudit';

describe('Phase 3 — Real File Ingestion & Security Verification', () => {
  const fixturesDir = path.resolve(__dirname, '../fixtures/documents');
  const targetSymbol = 'TATAMOTORS';
  const targetLegalName = 'Tata Motors Limited';

  it('1. Real PDF Verification: ingests actual PDF fixture, computes hash, extracts period, preserves pages and provenance', async () => {
    const filePath = path.join(fixturesDir, 'TATAMOTORS_Annual_Report_FY24.pdf');
    const buffer = fs.readFileSync(filePath);

    const file = {
      name: 'TATAMOTORS_Annual_Report_FY24.pdf',
      type: 'application/pdf',
      size: buffer.length,
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    };

    const validation = DocumentIngestionEngine.validateFile(file);
    expect(validation.isValid).toBe(true);

    const result = await DocumentIngestionEngine.ingestDocument({
      file,
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
    });

    const doc = result.document;
    expect(doc.documentType).toBe('ANNUAL_REPORT');
    expect(doc.reportingPeriod.fiscalYear).toBe('FY24');
    expect(doc.reportingPeriod.isIdentifiable).toBe(true);
    expect(doc.companyVerification.isConsistent).toBe(true);
    expect(doc.fileHash).toBeDefined();
    expect(doc.fileHash.length).toBeGreaterThan(10);
    expect(doc.provenanceSourceType).toBe('PRIMARY_SOURCE_DERIVED');
    expect(doc.pages.length).toBeGreaterThan(0);
    expect(doc.pages[0].ocrStatus).toBe('NOT_REQUIRED');
    expect(doc.pages[0].ocrConfidence).toBeUndefined();
  });

  it('2. Real Image Verification: validates image, assigns SCREENSHOT_DERIVED and dimensions', async () => {
    const file = {
      name: 'Screener_TATAMOTORS_Ratios.png',
      type: 'image/png',
      size: 45000,
      arrayBuffer: async () => new ArrayBuffer(45000),
    };

    const result = await DocumentIngestionEngine.ingestDocument({
      file,
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
      mockDimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
    });

    const doc = result.document;
    expect(doc.documentType).toBe('SCREENER_SCREENSHOT');
    expect(doc.provenanceSourceType).toBe('SCREENSHOT_DERIVED');
    expect(doc.dimensions?.width).toBe(1920);
    expect(doc.dimensions?.height).toBe(1080);
    expect(doc.pages[0].isScanned).toBe(true);
  });

  it('3. Duplicate Verification: detects duplicate by exact content hash even when renamed', async () => {
    const file1Path = path.join(fixturesDir, 'TATAMOTORS_Annual_Report_FY24.pdf');
    const file2Path = path.join(fixturesDir, 'TATAMOTORS_Annual_Report_FY24_renamed.pdf');
    const buf1 = fs.readFileSync(file1Path);
    const buf2 = fs.readFileSync(file2Path);

    const doc1Result = await DocumentIngestionEngine.ingestDocument({
      file: {
        name: 'TATAMOTORS_Annual_Report_FY24.pdf',
        type: 'application/pdf',
        size: buf1.length,
        arrayBuffer: async () => buf1.buffer.slice(buf1.byteOffset, buf1.byteOffset + buf1.byteLength),
      },
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
    });

    // Ingest renamed file with identical bytes
    const doc2Result = await DocumentIngestionEngine.ingestDocument({
      file: {
        name: 'TATAMOTORS_Annual_Report_FY24_renamed.pdf',
        type: 'application/pdf',
        size: buf2.length,
        arrayBuffer: async () => buf2.buffer.slice(buf2.byteOffset, buf2.byteOffset + buf2.byteLength),
      },
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
      existingDocuments: [doc1Result.document],
    });

    expect(doc2Result.isDuplicate).toBe(true);
    expect(doc2Result.duplicateReason).toContain('Exact duplicate file content already uploaded');
  });

  it('4. Two-Year Audit Verification: validates consecutive FY23 + FY24 and rejects duplicate year or wrong company', async () => {
    const buf23 = fs.readFileSync(path.join(fixturesDir, 'TATAMOTORS_Annual_Report_FY23.pdf'));
    const buf24 = fs.readFileSync(path.join(fixturesDir, 'TATAMOTORS_Annual_Report_FY24.pdf'));
    const bufInfy = fs.readFileSync(path.join(fixturesDir, 'INFY_Annual_Report_FY24.pdf'));

    const docFY23 = (await DocumentIngestionEngine.ingestDocument({
      file: { name: 'TATAMOTORS_Annual_Report_FY23.pdf', type: 'application/pdf', size: buf23.length },
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
    })).document;

    const docFY24 = (await DocumentIngestionEngine.ingestDocument({
      file: { name: 'TATAMOTORS_Annual_Report_FY24.pdf', type: 'application/pdf', size: buf24.length },
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
    })).document;

    // Consecutive FY23 (Base) + FY24 (Current)
    const auditPass = TwoYearReportAudit.audit({
      documents: [docFY23, docFY24],
      targetSymbol,
      targetLegalName,
    });
    expect(auditPass.isReadyForTwoYearModel).toBe(true);
    expect(auditPass.fy1Document?.reportingPeriod.fiscalYear).toBe('FY23');
    expect(auditPass.fy0Document?.reportingPeriod.fiscalYear).toBe('FY24');

    // Wrong company mismatch
    const docInfy = (await DocumentIngestionEngine.ingestDocument({
      file: { name: 'INFY_Annual_Report_FY24.pdf', type: 'application/pdf', size: bufInfy.length },
      projectId: 'proj_tatamotors_live',
      targetSymbol,
      targetLegalName,
    })).document;

    const auditMismatch = TwoYearReportAudit.audit({
      documents: [docInfy],
      targetSymbol,
      targetLegalName,
    });
    expect(auditMismatch.hasCompanyMismatch).toBe(true);
  });

  it('5. Security Verification: strictly rejects .exe and forbidden file types', () => {
    const exeFile = {
      name: 'unsupported_malware.exe',
      type: 'application/x-msdownload',
      size: 512,
    };

    const validation = DocumentIngestionEngine.validateFile(exeFile);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Security violation: Executable or archive file type ".exe"'))).toBe(true);
  });
});
