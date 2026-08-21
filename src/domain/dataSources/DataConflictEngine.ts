/**
 * DataConflictEngine.ts
 * Phase 16 — Conflict Detection & Strict Non-Fabrication Sentinel.
 * Unresolved material conflicts strictly propagate NOT_ASSESSABLE without conservative guessing.
 */

import { CanonicalDataPointKey } from './DataSourceTypes';
import { DataPointCandidate, DataSelectionPolicyRegistry } from './DataSelectionPolicyRegistry';

export interface DataConflictRecord {
  conflictId: string;
  canonicalKey: CanonicalDataPointKey;
  candidateA: DataPointCandidate<number | string>;
  candidateB: DataPointCandidate<number | string>;
  percentageDifference?: number;
  resolutionStatus: 'RESOLVED_PRIMARY' | 'RESOLVED_FRESHER_DISCLOSURE' | 'RESOLVED_CONSENSUS' | 'UNRESOLVED_MATERIAL_CONFLICT';
  selectedCandidate?: DataPointCandidate<number | string>;
  isAssessable: boolean;
  explanation: string;
}

export class DataConflictEngine {
  public static evaluateCandidates<T extends number | string>(
    candidates: DataPointCandidate<T>[],
    tolerancePercent: number = 0.5
  ): {
    selected: DataPointCandidate<T> | null;
    conflictRecord?: DataConflictRecord;
    isAssessable: boolean;
  } {
    if (!candidates || candidates.length <= 1) {
      return {
        selected: candidates?.[0] || null,
        isAssessable: !!candidates?.[0],
      };
    }

    const selection = DataSelectionPolicyRegistry.selectBestCandidate(candidates, tolerancePercent);

    if (selection.status === 'MATERIAL_CONFLICT' || !selection.selected) {
      const conflictRecord: DataConflictRecord = {
        conflictId: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        canonicalKey: candidates[0].key,
        candidateA: candidates[0],
        candidateB: candidates[1],
        resolutionStatus: 'UNRESOLVED_MATERIAL_CONFLICT',
        isAssessable: false,
        explanation: selection.explanation,
      };

      return {
        selected: null,
        conflictRecord,
        isAssessable: false,
      };
    }

    const conflictRecord: DataConflictRecord = {
      conflictId: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      canonicalKey: candidates[0].key,
      candidateA: candidates[0],
      candidateB: candidates[1],
      resolutionStatus:
        selection.status === 'RESOLVED_AUTHORITATIVE' ? 'RESOLVED_PRIMARY' : 'RESOLVED_CONSENSUS',
      selectedCandidate: selection.selected,
      isAssessable: true,
      explanation: selection.explanation,
    };

    return {
      selected: selection.selected,
      conflictRecord,
      isAssessable: true,
    };
  }
}
