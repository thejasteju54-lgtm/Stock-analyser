/**
 * Phase 9 — Peer Selection Engine
 * Selects comparable peers, scores peer relevance (0-100), filters statistical outliers, and computes benchmarks.
 */

import { PeerValuationRecord, PeerBenchmarkSummary, ValuationMethodId } from './ValuationTypes';

export class PeerSelectionEngine {
  /**
   * Evaluates relevance score of a peer relative to the target company (0-100).
   */
  public static calculateRelevanceScore(
    targetCompany: {
      businessModel: string;
      sector: string;
      marketCap: number;
      revenue: number;
      ebitdaMargin: number;
    },
    peer: {
      businessModel: string;
      sector: string;
      marketCap: number;
      revenue: number;
      ebitdaMargin: number;
    }
  ): { score: number; rationale: string } {
    let score = 0;
    const reasons: string[] = [];

    // 1. Business Model match (40 pts)
    if (peer.businessModel === targetCompany.businessModel) {
      score += 40;
      reasons.push('Identical business model');
    } else {
      score += 10;
      reasons.push('Related operating structure');
    }

    // 2. Sector match (30 pts)
    if (peer.sector === targetCompany.sector) {
      score += 30;
      reasons.push('Same primary industry sector');
    } else {
      score += 5;
    }

    // 3. Revenue Scale proximity (15 pts)
    const revRatio = targetCompany.revenue > 0 ? peer.revenue / targetCompany.revenue : 1;
    if (revRatio >= 0.33 && revRatio <= 3.0) {
      score += 15;
      reasons.push('Comparable operational revenue scale');
    } else if (revRatio >= 0.1 && revRatio <= 10.0) {
      score += 8;
    }

    // 4. Margin profile similarity (15 pts)
    const marginDiff = Math.abs(peer.ebitdaMargin - targetCompany.ebitdaMargin);
    if (marginDiff <= 5.0) {
      score += 15;
      reasons.push('Similar EBITDA margin profile (within 500 bps)');
    } else if (marginDiff <= 12.0) {
      score += 8;
      reasons.push('Moderate margin alignment (within 1200 bps)');
    }

    const finalScore = Math.min(100, Math.max(0, score));
    return {
      score: finalScore,
      rationale: reasons.join('; '),
    };
  }

  /**
   * Filters extreme statistical outliers using Interquartile Range (IQR) rule and negative values.
   */
  public static filterOutliers(
    peers: PeerValuationRecord[],
    multipleCode: 'pe' | 'pb' | 'evEbitda' | 'fcfYield'
  ): { validPeers: PeerValuationRecord[]; summary: PeerBenchmarkSummary } {
    // Extract valid positive numbers (or valid numbers for fcfYield)
    const validEntries = peers.filter((p) => {
      const val = p[multipleCode];
      if (val === null || val === undefined || isNaN(val)) return false;
      if (multipleCode === 'pe' || multipleCode === 'pb' || multipleCode === 'evEbitda') {
        return val > 0; // Exclude non-positive multiples
      }
      return true;
    });

    if (validEntries.length === 0) {
      return {
        validPeers: [],
        summary: {
          multipleCode: multipleCode.toUpperCase() as ValuationMethodId,
          mean: null,
          median: null,
          min: null,
          max: null,
          lowerQuartile: null,
          upperQuartile: null,
          peerCount: 0,
          excludedOutliersCount: peers.length,
        },
      };
    }

    const values = validEntries.map((p) => p[multipleCode] as number).sort((a, b) => a - b);

    // Calculate quartiles
    const q1 = this.getPercentile(values, 25);
    const q3 = this.getPercentile(values, 75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const nonOutlierPeers: PeerValuationRecord[] = [];
    let excludedCount = 0;

    for (const peer of peers) {
      const val = peer[multipleCode];
      if (val === null || val === undefined || isNaN(val) || (multipleCode !== 'fcfYield' && val <= 0)) {
        peer.isOutlierExcluded = true;
        peer.exclusionReason = 'Non-meaningful or negative multiple value';
        excludedCount++;
      } else if (values.length >= 4 && (val < lowerBound || val > upperBound)) {
        peer.isOutlierExcluded = true;
        peer.exclusionReason = `Statistical IQR outlier (Value ${val.toFixed(1)} outside [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}])`;
        excludedCount++;
      } else {
        peer.isOutlierExcluded = false;
        nonOutlierPeers.push(peer);
      }
    }

    const cleanValues = nonOutlierPeers.map((p) => p[multipleCode] as number).sort((a, b) => a - b);
    const sum = cleanValues.reduce((acc, v) => acc + v, 0);
    const mean = cleanValues.length > 0 ? sum / cleanValues.length : null;

    return {
      validPeers: nonOutlierPeers,
      summary: {
        multipleCode: multipleCode.toUpperCase() as ValuationMethodId,
        mean: mean !== null ? Math.round(mean * 10) / 10 : null,
        median: cleanValues.length > 0 ? this.getPercentile(cleanValues, 50) : null,
        min: cleanValues.length > 0 ? cleanValues[0] : null,
        max: cleanValues.length > 0 ? cleanValues[cleanValues.length - 1] : null,
        lowerQuartile: cleanValues.length > 0 ? this.getPercentile(cleanValues, 25) : null,
        upperQuartile: cleanValues.length > 0 ? this.getPercentile(cleanValues, 75) : null,
        peerCount: cleanValues.length,
        excludedOutliersCount: excludedCount,
      },
    };
  }

  private static getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    const res = sorted[lower] * (1 - weight) + sorted[upper] * weight;
    return Math.round(res * 10) / 10;
  }
}
