import { describe, it, expect } from 'vitest';
import { DocumentIngestionEngine } from '../../src/domain/ingestion/DocumentIngestionEngine';

describe('Phase 3 — Document Processing & Validation Engine', () => {
  it('accepts valid PDF, PNG, JPG, WebP, TXT, CSV files', () => {
    const validFiles = [
      { name: 'AnnualReport.pdf', type: 'application/pdf', size: 1024 * 1024 },
      { name: 'Screener.png', type: 'image/png', size: 500 * 1024 },
      { name: 'Chart.jpg', type: 'image/jpeg', size: 300 * 1024 },
      { name: 'Report.webp', type: 'image/webp', size: 250 * 1024 },
      { name: 'Notes.txt', type: 'text/plain', size: 5 * 1024 },
      { name: 'Financials.csv', type: 'text/csv', size: 10 * 1024 },
    ];

    validFiles.forEach((file) => {
      const validation = DocumentIngestionEngine.validateFile(file);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  it('rejects unsupported extensions and dangerous executable files', () => {
    const invalidFiles = [
      { name: 'malware.exe', type: 'application/x-msdownload', size: 1024 },
      { name: 'script.bat', type: 'application/octet-stream', size: 500 },
      { name: 'archive.zip', type: 'application/zip', size: 2048 },
      { name: 'doc.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 5000 },
    ];

    invalidFiles.forEach((file) => {
      const validation = DocumentIngestionEngine.validateFile(file);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  it('rejects empty files (0 bytes) and oversized files (>50MB)', () => {
    const emptyFile = { name: 'Empty.pdf', type: 'application/pdf', size: 0 };
    const oversizedFile = { name: 'Giant_AR.pdf', type: 'application/pdf', size: 55 * 1024 * 1024 };

    expect(DocumentIngestionEngine.validateFile(emptyFile).isValid).toBe(false);
    expect(DocumentIngestionEngine.validateFile(oversizedFile).isValid).toBe(false);
  });

  it('ingests a multi-page document while preserving page boundaries and text', async () => {
    const result = await DocumentIngestionEngine.ingestDocument({
      file: { name: 'Tata_Motors_AR24.pdf', type: 'application/pdf', size: 12000000 },
      projectId: 'proj_tatamotors_test',
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
      mockTextPages: [
        { text: 'Page 1: Overview and Board of Directors Report', isScanned: false },
        { text: 'Page 2: Consolidated Balance Sheet for FY24', isScanned: false },
        { text: 'Page 3: Scanned Notes on Contingent Liabilities', isScanned: true, measuredOcrConfidence: 94.5 },
      ],
    });

    const doc = result.document;
    expect(doc.documentType).toBe('ANNUAL_REPORT');
    expect(doc.pages).toHaveLength(3);
    expect(doc.pages[0].pageNumber).toBe(1);
    expect(doc.pages[0].ocrStatus).toBe('NOT_REQUIRED');
    expect(doc.pages[0].ocrConfidence).toBeUndefined();

    expect(doc.pages[2].pageNumber).toBe(3);
    expect(doc.pages[2].ocrStatus).toBe('COMPLETE');
    expect(doc.pages[2].ocrConfidence).toBe(94.5);
  });

  it('correctly handles screenshots and tags them with SCREENSHOT_DERIVED and dimensions', async () => {
    const result = await DocumentIngestionEngine.ingestDocument({
      file: { name: 'Screener_TATAMOTORS_Ratios.png', type: 'image/png', size: 1400000 },
      projectId: 'proj_tatamotors_test',
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
      mockDimensions: { width: 2560, height: 1440, aspectRatio: '16:9' },
    });

    const doc = result.document;
    expect(doc.documentType).toBe('SCREENER_SCREENSHOT');
    expect(doc.provenanceSourceType).toBe('SCREENSHOT_DERIVED');
    expect(doc.dimensions?.width).toBe(2560);
    expect(doc.dimensions?.height).toBe(1440);
  });
});
