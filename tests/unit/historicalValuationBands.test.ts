import { describe, it, expect } from 'vitest';
import { HistoricalValuationDataService } from '../../src/domain/valuation/HistoricalValuationDataService';
import { PointInTimeHistoricalObservation } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Point-In-Time Historical Valuation Bands', () => {
  const sampleObservations: PointInTimeHistoricalObservation[] = [
    { valuationDate: '2020-03-31', marketPrice: 100, reportReleaseDate: '2020-05-15', financialPeriod: 'FY20', metricType: 'EPS', metricValue: 10, derivedMultiple: 10.0, source: 'BSE' },
    { valuationDate: '2020-09-30', marketPrice: 120, reportReleaseDate: '2020-11-15', financialPeriod: 'H1FY21', metricType: 'EPS', metricValue: 10, derivedMultiple: 12.0, source: 'BSE' },
    { valuationDate: '2021-03-31', marketPrice: 150, reportReleaseDate: '2021-05-15', financialPeriod: 'FY21', metricType: 'EPS', metricValue: 10, derivedMultiple: 15.0, source: 'BSE' },
    { valuationDate: '2021-09-30', marketPrice: 180, reportReleaseDate: '2021-11-15', financialPeriod: 'H1FY22', metricType: 'EPS', metricValue: 10, derivedMultiple: 18.0, source: 'BSE' },
    { valuationDate: '2022-03-31', marketPrice: 200, reportReleaseDate: '2022-05-15', financialPeriod: 'FY22', metricType: 'EPS', metricValue: 10, derivedMultiple: 20.0, source: 'BSE' },
    { valuationDate: '2022-09-30', marketPrice: 220, reportReleaseDate: '2022-11-15', financialPeriod: 'H1FY23', metricType: 'EPS', metricValue: 10, derivedMultiple: 22.0, source: 'BSE' },
    { valuationDate: '2023-03-31', marketPrice: 250, reportReleaseDate: '2023-05-15', financialPeriod: 'FY23', metricType: 'EPS', metricValue: 10, derivedMultiple: 25.0, source: 'BSE' },
  ];

  it('computes correct min, median, max, quartiles, and current percentile rank for sufficient historical data', () => {
    const range = HistoricalValuationDataService.calculateHistoricalRange('PE', 3, sampleObservations, 21.0);

    expect(range.status).toBe('HISTORICAL_DATA_SUFFICIENT');
    expect(range.pointInTimeObservationsCount).toBe(7);
    expect(range.min).toBe(10.0);
    expect(range.max).toBe(25.0);
    expect(range.median).toBe(18.0);
    expect(range.currentPercentile).toBe(71); // 5 of 7 observations (10, 12, 15, 18, 20) are below 21.0 -> ~71%
  });

  it('flags status as HISTORICAL_DATA_LIMITED when fewer than 6 observations exist', () => {
    const limitedObs = sampleObservations.slice(0, 3);
    const range = HistoricalValuationDataService.calculateHistoricalRange('PE', 3, limitedObs, 14.0);

    expect(range.status).toBe('HISTORICAL_DATA_LIMITED');
    expect(range.pointInTimeObservationsCount).toBe(3);
    expect(range.min).toBe(10.0);
    expect(range.max).toBe(15.0);
    expect(range.lowerQuartile).toBeNull();
  });

  it('flags status as HISTORICAL_DATA_UNAVAILABLE when observations are empty', () => {
    const range = HistoricalValuationDataService.calculateHistoricalRange('PE', 5, [], 20.0);
    expect(range.status).toBe('HISTORICAL_DATA_UNAVAILABLE');
    expect(range.median).toBeNull();
    expect(range.currentPercentile).toBeNull();
  });
});
