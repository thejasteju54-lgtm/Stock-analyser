/**
 * DocumentQualityEngine.ts
 * Phase 15 — Document Quality & Company Identity Validation Engine.
 */

import { IngestedDocument } from '../ingestion/DocumentTypes';
import { CompanyIdentity } from '../models/Company';
import { DocumentQualityReport } from './ResearchDocumentRegistry';

export class DocumentQualityEngine {
  /**
   * Evaluates the quality, duplicate status, and company identity match of an ingested document.
   */
  public static evaluateDocument(
    doc: IngestedDocument,
    company: CompanyIdentity,
    existingDocs: IngestedDocument[] = []
  ): DocumentQualityReport {
    const issues: string[] = [];

    // 1. Company Identity Matching
    const docName = (doc as any).filename || (doc as any).name || '';
    const docText = `${docName} ${(doc as any).rawSnippet || ''}`.toLowerCase();
    const symbolMatch = docText.includes(company.symbol.toLowerCase());
    const nameWords = company.displayName.toLowerCase().split(' ');
    const nameMatch = nameWords.some((w) => w.length > 3 && docText.includes(w));
    const isCompanyMatch = symbolMatch || nameMatch || doc.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED';

    if (!isCompanyMatch) {
      issues.push(`Document text does not appear to match company symbol "${company.symbol}" or name "${company.displayName}".`);
    }

    // 2. Duplicate Detection
    let duplicateStatus: DocumentQualityReport['duplicateStatus'] = 'UNIQUE';
    const thisHash = doc.fileHash || (doc as any).contentHash;
    const sameHashDoc = existingDocs.find((d) => d.id !== doc.id && (d.fileHash || (d as any).contentHash) && (d.fileHash || (d as any).contentHash) === thisHash);
    const sameNamePeriodDoc = existingDocs.find(
      (d) =>
        d.id !== doc.id &&
        d.documentType === doc.documentType &&
        d.reportingPeriod?.fiscalYear &&
        d.reportingPeriod?.fiscalYear === doc.reportingPeriod?.fiscalYear
    );

    if (sameHashDoc) {
      duplicateStatus = 'EXACT_DUPLICATE';
      issues.push(`Exact content hash duplicate of document "${sameHashDoc.filename || (sameHashDoc as any).name}".`);
    } else if (sameNamePeriodDoc) {
      duplicateStatus = 'CONTENT_DUPLICATE';
      issues.push(`Duplicate document filing detected for ${doc.documentType} (${doc.reportingPeriod?.fiscalYear}).`);
    }

    // 3. Readability & Extraction Completeness
    let readabilityScore = 85;
    let extractionScore = 80;

    if (doc.processingStatus === 'FAILED') {
      readabilityScore = 0;
      extractionScore = 0;
      issues.push('Document processing failed.');
    } else if (doc.processingStatus === 'REQUIRES_REVIEW' || doc.ocrStatusSummary?.overallTier === 'LOW') {
      readabilityScore = 45;
      extractionScore = 40;
      issues.push('Extraction quality is degraded and requires analyst review.');
    }

    // 4. Reporting Period Consistency
    const hasPeriod = !!doc.reportingPeriod?.fiscalYear || !!doc.reportingPeriod?.rawPeriodString;
    if (!hasPeriod && doc.documentType === 'ANNUAL_REPORT') {
      issues.push('Missing explicit reporting fiscal year or period date.');
    }

    // 5. Overall Quality Synthesis
    let overallQuality: DocumentQualityReport['overallQuality'] = 'VALID';
    if (!isCompanyMatch || duplicateStatus === 'EXACT_DUPLICATE' || readabilityScore === 0) {
      overallQuality = 'INVALID';
    } else if (issues.length > 0) {
      overallQuality = 'VALID_WITH_WARNINGS';
    }

    return {
      overallQuality,
      readabilityScore,
      extractionCompletenessScore: extractionScore,
      companyIdentityMatch: isCompanyMatch,
      reportingPeriodConsistent: hasPeriod,
      duplicateStatus,
      issues,
    };
  }
}
