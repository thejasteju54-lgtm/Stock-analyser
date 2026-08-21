import { describe, it, expect } from 'vitest';
import { ResearchDocumentRegistry } from '../../../src/domain/documents/ResearchDocumentRegistry';
import { DocumentQualityEngine } from '../../../src/domain/documents/DocumentQualityEngine';
import { IngestedDocument } from '../../../src/domain/ingestion/DocumentTypes';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Document Registry & Quality Engine', () => {
  const company: CompanyIdentity = {
    id: 'comp_1',
    displayName: 'Tata Motors Ltd',
    legalName: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    sector: 'AUTOMOBILE',
    subsector: 'PASSENGER_CARS',
    marketCapCategory: 'LARGE_CAP',
    businessModel: 'NON_FINANCIAL_OPERATING',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('detects duplicate documents and validates company identity matching', () => {
    const doc1: IngestedDocument = {
      id: 'doc_1',
      filename: 'Tata Motors Annual Report 2024.pdf',
      documentType: 'ANNUAL_REPORT',
      fileHash: 'hash_abc123',
      reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      processingStatus: 'READY',
      uploadedAt: new Date().toISOString(),
    } as any;

    const docDuplicate: IngestedDocument = {
      ...doc1,
      id: 'doc_2',
    };

    const reportUnique = DocumentQualityEngine.evaluateDocument(doc1, company, []);
    expect(reportUnique.overallQuality).toBe('VALID');
    expect(reportUnique.duplicateStatus).toBe('UNIQUE');
    expect(reportUnique.companyIdentityMatch).toBe(true);

    const reportDup = DocumentQualityEngine.evaluateDocument(docDuplicate, company, [doc1]);
    expect(reportDup.duplicateStatus).toBe('EXACT_DUPLICATE');
    expect(reportDup.overallQuality).toBe('INVALID');
  });

  it('manages immutable document version history without mutating superseded versions', () => {
    const registry = new ResearchDocumentRegistry();

    const docV1: IngestedDocument = {
      id: 'doc_v1',
      filename: 'Tata Motors Annual Report FY24 (Draft).pdf',
      documentType: 'ANNUAL_REPORT',
      fileHash: 'hash_v1',
      reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      processingStatus: 'READY',
      uploadedAt: new Date().toISOString(),
    } as any;

    const docV2: IngestedDocument = {
      id: 'doc_v2',
      filename: 'Tata Motors Annual Report FY24 (Final Audited).pdf',
      documentType: 'ANNUAL_REPORT',
      fileHash: 'hash_v2',
      reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      processingStatus: 'READY',
      uploadedAt: new Date().toISOString(),
    } as any;

    const rec1 = registry.registerDocument('proj_1', 'comp_1', 'TATAMOTORS', docV1, 'TIER_1_PRIMARY', {
      overallQuality: 'VALID',
      readabilityScore: 85,
      extractionCompletenessScore: 80,
      companyIdentityMatch: true,
      reportingPeriodConsistent: true,
      duplicateStatus: 'UNIQUE',
      issues: [],
    });

    expect(rec1.version).toBe(1);
    expect(rec1.status).toBe('ACTIVE');

    const rec2 = registry.registerDocument('proj_1', 'comp_1', 'TATAMOTORS', docV2, 'TIER_1_PRIMARY', {
      overallQuality: 'VALID',
      readabilityScore: 95,
      extractionCompletenessScore: 90,
      companyIdentityMatch: true,
      reportingPeriodConsistent: true,
      duplicateStatus: 'UNIQUE',
      issues: [],
    });

    expect(rec2.version).toBe(2);
    expect(rec2.status).toBe('ACTIVE');
    expect(rec2.previousVersionId).toBe(rec1.documentId);

    const history = registry.getDocumentVersionHistory(rec2.documentId);
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe(1);
    expect(history[0].status).toBe('SUPERSEDED');
    expect(history[1].version).toBe(2);
  });
});
