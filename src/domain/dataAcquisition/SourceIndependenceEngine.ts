import { SourceTier } from '../../infrastructure/researchSources/SourceAdapterTypes';

export type SourceIndependenceType = 'INDEPENDENT' | 'SYNDICATED' | 'DERIVED' | 'UNKNOWN';

export interface SourceIndependenceAssessment {
  relationship: SourceIndependenceType;
  effectiveConfirmationCount: number;
  explanation: string;
}

export class SourceIndependenceEngine {
  /**
   * Assesses whether two sources provide independent validation
   */
  static assessIndependence(
    sourceA: { name: string; tier: SourceTier; isSyndicated?: boolean },
    sourceB: { name: string; tier: SourceTier; isSyndicated?: boolean }
  ): SourceIndependenceAssessment {
    // If one source is an exchange filing and the other is a news agency quoting it -> DERIVED
    if (sourceA.tier === 1 && sourceB.tier >= 3) {
      return {
        relationship: 'DERIVED',
        effectiveConfirmationCount: 1,
        explanation: `${sourceB.name} is reporting the primary statutory filing from ${sourceA.name}; not an independent confirmation.`,
      };
    }

    if (sourceB.tier === 1 && sourceA.tier >= 3) {
      return {
        relationship: 'DERIVED',
        effectiveConfirmationCount: 1,
        explanation: `${sourceA.name} is reporting the primary statutory filing from ${sourceB.name}; not an independent confirmation.`,
      };
    }

    // If both are wire copies
    if (sourceA.isSyndicated && sourceB.isSyndicated) {
      return {
        relationship: 'SYNDICATED',
        effectiveConfirmationCount: 1,
        explanation: 'Both sources represent syndicated press releases / wire distribution.',
      };
    }

    // If both are Tier 1 statutory filings from different regulators/exchanges
    if (sourceA.tier === 1 && sourceB.tier === 1) {
      return {
        relationship: 'INDEPENDENT',
        effectiveConfirmationCount: 2,
        explanation: 'Independent regulatory filings across distinct regulatory channels.',
      };
    }

    return {
      relationship: 'INDEPENDENT',
      effectiveConfirmationCount: 2,
      explanation: 'Independent reports from separate research entities.',
    };
  }
}
