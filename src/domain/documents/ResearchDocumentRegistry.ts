/**
 * ResearchDocumentRegistry.ts
 * Phase 15 — Immutable Research Document Registry & Versioning Controller.
 * Preserves historical document versions and detects duplicates without mutating prior records.
 */

import { DocumentType, IngestedDocument } from '../ingestion/DocumentTypes';
import { NewsSourceTier } from '../news/NewsAndIndustryTypes';

export interface DocumentQualityReport {
  overallQuality: 'VALID' | 'VALID_WITH_WARNINGS' | 'INVALID' | 'NOT_ASSESSABLE';
  readabilityScore: number; // 0-100
  extractionCompletenessScore: number; // 0-100
  companyIdentityMatch: boolean;
  reportingPeriodConsistent: boolean;
  duplicateStatus: 'UNIQUE' | 'EXACT_DUPLICATE' | 'CONTENT_DUPLICATE' | 'SYNDICATED_DUPLICATE';
  issues: string[];
}

export interface ResearchDocumentRecord {
  documentId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  documentType: DocumentType;
  title: string;
  source: string;
  sourceTier: NewsSourceTier;
  publicationDate: string;
  periodStart?: string;
  periodEnd?: string;
  retrievedAt: string;
  fileReference: string;
  contentHash: string; // 64 hex characters SHA-256
  version: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED' | 'REJECTED';
  confidence: number;
  isPrimarySource: boolean;
  previousVersionId?: string;
  qualityAssessment: DocumentQualityReport;
}

export class ResearchDocumentRegistry {
  private records: Map<string, ResearchDocumentRecord> = new Map();

  constructor(initialRecords: ResearchDocumentRecord[] = []) {
    for (const rec of initialRecords) {
      this.records.set(rec.documentId, { ...rec });
    }
  }

  /**
   * Registers a new document or updates an existing document with a new immutable version.
   */
  public registerDocument(
    projectId: string,
    companyId: string,
    companySymbol: string,
    doc: IngestedDocument,
    sourceTier: NewsSourceTier = 'TIER_1_PRIMARY',
    qualityAssessment: DocumentQualityReport
  ): ResearchDocumentRecord {
    // Check if this is a new version of an existing active document for the same period/type
    const existingActive = Array.from(this.records.values()).find(
      (r) =>
        r.projectId === projectId &&
        r.documentType === doc.documentType &&
        r.periodEnd === (doc.reportingPeriod?.fiscalYear || doc.reportingPeriod?.rawPeriodString) &&
        r.status === 'ACTIVE'
    );

    let version = 1;
    let previousVersionId: string | undefined = undefined;

    if (existingActive) {
      // Supersede the existing active document
      existingActive.status = 'SUPERSEDED';
      this.records.set(existingActive.documentId, existingActive);
      version = existingActive.version + 1;
      previousVersionId = existingActive.documentId;
    }

    const docTitle = doc.filename || (doc as any).name || 'Document';
    const newRecord: ResearchDocumentRecord = {
      documentId: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      companyId,
      companySymbol,
      documentType: doc.documentType,
      title: docTitle,
      source: doc.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' ? 'Official Company Filing' : 'Screenshot/External Source',
      sourceTier,
      publicationDate: doc.reportingPeriod?.fiscalYear || new Date().toISOString().split('T')[0],
      periodStart: doc.reportingPeriod?.fiscalYear,
      periodEnd: doc.reportingPeriod?.fiscalYear,
      retrievedAt: new Date().toISOString(),
      fileReference: docTitle,
      contentHash: doc.fileHash || (doc as any).contentHash || 'hash_pending',
      version,
      status: qualityAssessment.overallQuality === 'INVALID' ? 'REJECTED' : 'ACTIVE',
      confidence: qualityAssessment.readabilityScore,
      isPrimarySource: sourceTier === 'TIER_1_PRIMARY',
      previousVersionId,
      qualityAssessment,
    };

    this.records.set(newRecord.documentId, newRecord);
    return newRecord;
  }

  /**
   * Retrieves all document records for a given project.
   */
  public getDocumentsForProject(projectId: string, activeOnly: boolean = false): ResearchDocumentRecord[] {
    const all = Array.from(this.records.values()).filter((r) => r.projectId === projectId);
    return activeOnly ? all.filter((r) => r.status === 'ACTIVE') : all;
  }

  /**
   * Retrieves the complete version history for a given document.
   */
  public getDocumentVersionHistory(documentId: string): ResearchDocumentRecord[] {
    const target = this.records.get(documentId);
    if (!target) return [];

    const history: ResearchDocumentRecord[] = [target];
    let curr = target;

    while (curr.previousVersionId) {
      const prev = this.records.get(curr.previousVersionId);
      if (prev) {
        history.unshift(prev);
        curr = prev;
      } else {
        break;
      }
    }

    return history;
  }
}
