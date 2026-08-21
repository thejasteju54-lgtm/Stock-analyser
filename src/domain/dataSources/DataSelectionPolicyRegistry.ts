/**
 * DataSelectionPolicyRegistry.ts
 * Phase 16 — Deterministic Multi-Source Data Selection & Order-Independent Ranking Policy.
 * Evaluates candidates sharing the exact CanonicalDataPointKey across 5 decoupled dimensions.
 */

import { DataSourceTier, CanonicalDataPointKey, generateCanonicalDataPointKey } from './DataSourceTypes';

export interface DataPointCandidate<T = number | string> {
  key: CanonicalDataPointKey;
  value: T;
  sourceId: string;
  sourceTier: DataSourceTier;
  evidenceType: 'AUDITED_STATUTORY' | 'UNAUDITED_DISCLOSURE' | 'PRESS_RELEASE' | 'VERIFIED_DATABASE' | 'SECONDARY_MEDIA';
  publicationDate: string; // ISO String
  retrievedAt: string;     // ISO String
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'FLAGGED';
  reliabilityScore: number; // 0 to 100
  rawPayloadHash: string;
}

export interface CandidateSelectionResult<T> {
  selected: DataPointCandidate<T> | null;
  status: 'RESOLVED_AUTHORITATIVE' | 'RESOLVED_CONSENSUS' | 'MATERIAL_CONFLICT' | 'NOT_ASSESSABLE';
  explanation: string;
  evaluatedCandidatesCount: number;
}

export class DataSelectionPolicyRegistry {
  private static getTierWeight(tier: DataSourceTier): number {
    switch (tier) {
      case 'TIER_1_PRIMARY': return 4;
      case 'TIER_2_VERIFIED_SECONDARY': return 3;
      case 'TIER_3_CONTEXTUAL': return 2;
      case 'TIER_4_DISCOVERY': return 1;
      default: return 0;
    }
  }

  private static getVerificationWeight(status: string): number {
    switch (status) {
      case 'VERIFIED': return 3;
      case 'UNVERIFIED': return 2;
      case 'FLAGGED': return 1;
      default: return 0;
    }
  }

  /**
   * Deterministic comparator for candidate ranking.
   * Higher rank = higher priority.
   */
  public static compareCandidates<T>(a: DataPointCandidate<T>, b: DataPointCandidate<T>): number {
    // 1. Source Authority Tier
    const tierDiff = this.getTierWeight(b.sourceTier) - this.getTierWeight(a.sourceTier);
    if (tierDiff !== 0) return tierDiff;

    // 2. Verification Status
    const verDiff = this.getVerificationWeight(b.verificationStatus) - this.getVerificationWeight(a.verificationStatus);
    if (verDiff !== 0) return verDiff;

    // 3. Publication Date (newer official disclosure for the same period)
    const pubDiff = new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
    if (pubDiff !== 0) return pubDiff;

    // 4. Source Reliability Score
    const relDiff = (b.reliabilityScore || 0) - (a.reliabilityScore || 0);
    if (relDiff !== 0) return relDiff;

    // 5. Retrieval Date (fresher scrape)
    const retDiff = new Date(b.retrievedAt).getTime() - new Date(a.retrievedAt).getTime();
    if (retDiff !== 0) return retDiff;

    // 6. Stable lexicographical tie-breaker on sourceId to guarantee order independence
    return a.sourceId.localeCompare(b.sourceId);
  }

  /**
   * Complete multi-candidate evaluation (evaluates all N candidates for clusters/conflicts).
   */
  public static selectBestCandidate<T>(
    candidates: DataPointCandidate<T>[],
    tolerancePercent: number = 0.5
  ): CandidateSelectionResult<T> {
    if (!candidates || candidates.length === 0) {
      return {
        selected: null,
        status: 'NOT_ASSESSABLE',
        explanation: 'No candidates provided for evaluation.',
        evaluatedCandidatesCount: 0,
      };
    }

    // 1. Canonical Key Scope Validation
    const baseKey = generateCanonicalDataPointKey(candidates[0].key);
    for (let i = 1; i < candidates.length; i++) {
      const candidateKey = generateCanonicalDataPointKey(candidates[i].key);
      if (candidateKey !== baseKey) {
        throw new Error(
          `Incompatible CanonicalDataPointKey mismatch: '${candidateKey}' cannot compete with '${baseKey}'.`
        );
      }
    }

    // Filter out Tier 4 discovery-only data from authoritative selection
    const eligible = candidates.filter((c) => c.sourceTier !== 'TIER_4_DISCOVERY');
    if (eligible.length === 0) {
      return {
        selected: null,
        status: 'NOT_ASSESSABLE',
        explanation: 'Only Tier 4 discovery data present. Tier 4 data cannot establish canonical facts.',
        evaluatedCandidatesCount: candidates.length,
      };
    }

    // Sort deterministically (Guarantees order independence)
    const sorted = [...eligible].sort((a, b) => this.compareCandidates(a, b));
    const topTier = sorted[0].sourceTier;
    const topCandidates = sorted.filter((c) => c.sourceTier === topTier);

    // If top tier is Tier 1 Primary
    if (topTier === 'TIER_1_PRIMARY') {
      const sameDateTier1 = topCandidates.filter((c) => c.publicationDate === topCandidates[0].publicationDate);
      if (sameDateTier1.length > 1) {
        const v0 = Number(sameDateTier1[0].value);
        for (let i = 1; i < sameDateTier1.length; i++) {
          const vi = Number(sameDateTier1[i].value);
          const diff = Math.abs(v0 - vi);
          const maxVal = Math.max(Math.abs(v0), 1);
          if ((diff / maxVal) * 100 > tolerancePercent) {
            return {
              selected: null,
              status: 'MATERIAL_CONFLICT',
              explanation: `Material conflict between simultaneous Tier 1 primary sources: ${sameDateTier1[0].sourceId} (${v0}) vs ${sameDateTier1[i].sourceId} (${vi}).`,
              evaluatedCandidatesCount: candidates.length,
            };
          }
        }
      }
      return {
        selected: sorted[0],
        status: 'RESOLVED_AUTHORITATIVE',
        explanation: `Selected Tier 1 primary statutory disclosure (${sorted[0].sourceId}, published ${sorted[0].publicationDate}).`,
        evaluatedCandidatesCount: candidates.length,
      };
    }

    // Tier 2 multi-candidate cluster evaluation (e.g. A=100, B=100, C=130)
    if (topCandidates.length >= 2) {
      let clusterLeader = topCandidates[0];
      let hasConsensus = false;

      for (let i = 0; i < topCandidates.length; i++) {
        const matchCount = topCandidates.filter((c, j) => {
          if (i === j) return true;
          const diff = Math.abs(Number(topCandidates[i].value) - Number(c.value));
          const maxVal = Math.max(Math.abs(Number(topCandidates[i].value)), 1);
          return (diff / maxVal) * 100 <= tolerancePercent;
        }).length;

        if (matchCount >= 2) {
          clusterLeader = topCandidates[i];
          hasConsensus = true;
          break;
        }
      }

      if (hasConsensus) {
        return {
          selected: clusterLeader,
          status: 'RESOLVED_CONSENSUS',
          explanation: `Corroborated across Tier 2 consensus cluster (value: ${clusterLeader.value}).`,
          evaluatedCandidatesCount: candidates.length,
        };
      } else {
        return {
          selected: null,
          status: 'MATERIAL_CONFLICT',
          explanation: 'Disagreement among Tier 2 secondary sources without consensus cluster.',
          evaluatedCandidatesCount: candidates.length,
        };
      }
    }

    return {
      selected: sorted[0],
      status: 'RESOLVED_AUTHORITATIVE',
      explanation: `Single verified candidate accepted (${sorted[0].sourceId}).`,
      evaluatedCandidatesCount: candidates.length,
    };
  }
}
