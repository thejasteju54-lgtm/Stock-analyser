/**
 * DocumentRequirementTypes.ts
 * Phase 15 — Document Requirement Schemas & Archetype Classification.
 */

import { DocumentType } from '../ingestion/DocumentTypes';
import { EconomicArchetype } from '../taxonomy/BusinessModelRegistry';

export type DocumentRequirementTier =
  | 'REQUIRED'
  | 'RECOMMENDED'
  | 'OPTIONAL'
  | 'NOT_APPLICABLE';

export interface DocumentRequirementRule {
  documentType: DocumentType;
  tier: DocumentRequirementTier;
  minimumCount: number;
  periodCoverageYears: number;
  description: string;
  applicableArchetypes: EconomicArchetype[];
}

export interface ProjectDocumentRequirementStatus {
  documentType: DocumentType;
  tier: DocumentRequirementTier;
  minimumCount: number;
  availableCount: number;
  isSatisfied: boolean;
  statusText: string;
}
