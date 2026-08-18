/**
 * Phase 9 — Historical Valuation Data Service
 * Point-in-time historical multiple bands (3Y and 5Y), quartiles, and current percentile calculations.
 */

import {
  PointInTimeHistoricalObservation,
  HistoricalValuationRange,
  ValuationMethodId,
} from './ValuationTypes';

export class HistoricalValuationDataService {
  /**
   * Computes point-in-time 3Y and 5Y valuation bands for a given multiple.
   */
  public static calculateHistoricalRange(
    multipleCode: ValuationMethodId,
    periodYears: 3 | 5,
    observations: PointInTimeHistoricalObservation[],
    currentValue: number | null
  ): HistoricalValuationRange {
    if (!observations || observations.length === 0) {
      return {
        multipleCode,
        periodYears,
        current: currentValue,
        min: null,
        max: null,
        median: null,
        lowerQuartile: null,
        upperQuartile: null,
        currentPercentile: null,
        status: 'HISTORICAL_DATA_UNAVAILABLE',
        pointInTimeObservationsCount: 0,
      };
    }

    // Filter positive multiples
    const values = observations
      .map((o) => o.derivedMultiple)
      .filter((v) => v !== null && v !== undefined && !isNaN(v) && v > 0)
      .sort((a, b) => a - b);

    if (values.length < 6) {
      return {
        multipleCode,
        periodYears,
        current: currentValue,
        min: values.length > 0 ? values[0] : null,
        max: values.length > 0 ? values[values.length - 1] : null,
        median: values.length > 0 ? this.getPercentile(values, 50) : null,
        lowerQuartile: null,
        upperQuartile: null,
        currentPercentile: null,
        status: 'HISTORICAL_DATA_LIMITED',
        pointInTimeObservationsCount: values.length,
      };
    }

    const min = values[0];
    const max = values[values.length - 1];
    const q1 = this.getPercentile(values, 25);
    const median = this.getPercentile(values, 50);
    const q3 = this.getPercentile(values, 75);

    let currentPercentile: number | null = null;
    if (currentValue !== null && currentValue > 0) {
      const belowCount = values.filter((v) => v < currentValue).length;
      currentPercentile = Math.round((belowCount / values.length) * 100);
    }

    return {
      multipleCode,
      periodYears,
      current: currentValue,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      median: Math.round(median * 10) / 10,
      lowerQuartile: Math.round(q1 * 10) / 10,
      upperQuartile: Math.round(q3 * 10) / 10,
      currentPercentile,
      status: 'HISTORICAL_DATA_SUFFICIENT',
      pointInTimeObservationsCount: values.length,
    };
  }

  private static getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    if (sorted.length === 1) return sorted[0];
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
