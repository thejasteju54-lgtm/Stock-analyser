import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechnicalOverviewCard } from '../../src/components/technical/TechnicalOverviewCard';
import { PriceChartCard } from '../../src/components/technical/PriceChartCard';
import { TrendStructureCard } from '../../src/components/technical/TrendStructureCard';
import { SupportResistanceCard } from '../../src/components/technical/SupportResistanceCard';
import { MomentumOscillatorsCard } from '../../src/components/technical/MomentumOscillatorsCard';
import { VolumeAnalysisCard } from '../../src/components/technical/VolumeAnalysisCard';
import { VolatilityDrawdownCard } from '../../src/components/technical/VolatilityDrawdownCard';
import { RelativeStrengthCard } from '../../src/components/technical/RelativeStrengthCard';
import { TechnicalRiskCard } from '../../src/components/technical/TechnicalRiskCard';
import { ScreenshotObservationModal } from '../../src/components/technical/ScreenshotObservationModal';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { TechnicalDataset, OHLCVCandle } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Technical Analysis UI Components', () => {
  const dataset: TechnicalDataset = {
    datasetId: 'ds_tata',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    timeframe: 'DAILY',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    candleCount: 100,
    adjusted: true,
    source: 'NSE Feed',
    sourceTimestamp: '2024-03-31T16:00:00Z',
    dataQuality: 'HIGH',
    isStale: false,
    freshnessThresholdHours: 24,
  };

  const candles: OHLCVCandle[] = [];
  for (let i = 0; i < 100; i++) {
    candles.push({
      timestamp: `2023-04-${(i % 28) + 1}`,
      open: 800 + i * 2,
      high: 805 + i * 2,
      low: 795 + i * 2,
      close: 802 + i * 2,
      volume: 1000000,
    });
  }

  const report = TechnicalAnalysisEngine.analyze(
    'proj_1',
    'TATAMOTORS',
    'NSE',
    dataset,
    candles
  );

  it('renders TechnicalOverviewCard with current price and trend badge', () => {
    render(
      <TechnicalOverviewCard
        currentPrice={report.currentPrice}
        priceDate={report.priceDate}
        dataset={report.dataset}
        trend={report.trend}
        marketStructure={report.marketStructure}
        technicalRisk={report.technicalRisk}
        confidenceScore={report.technicalConfidenceScore}
        technicalScore={report.technicalScore}
      />
    );
    expect(screen.getByText(/Technical Overview & Market Structure Snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/CURRENT PRICE/i)).toBeInTheDocument();
  });

  it('renders PriceChartCard with DMA buttons', () => {
    render(
      <PriceChartCard
        candles={candles}
        movingAverages={report.movingAverages}
        zones={report.supportResistance.zones}
        breakouts={report.supportResistance.breakouts}
        companySymbol="TATAMOTORS"
      />
    );
    expect(screen.getByText(/Interactive Price & Volume Chart/i)).toBeInTheDocument();
    expect(screen.getAllByText(/20 DMA/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders TrendStructureCard with HH/HL counts', () => {
    render(
      <TrendStructureCard
        trend={report.trend}
        structure={report.marketStructure}
      />
    );
    expect(screen.getByText(/Trend Hierarchy & Market Structure Progression/i)).toBeInTheDocument();
    expect(screen.getByText(/HIGHER HIGHS/i)).toBeInTheDocument();
  });

  it('renders SupportResistanceCard', () => {
    render(
      <SupportResistanceCard
        zones={report.supportResistance.zones}
        breakouts={report.supportResistance.breakouts}
      />
    );
    expect(screen.getByText(/Support & Resistance Zones & Breakout Tracker/i)).toBeInTheDocument();
  });

  it('renders MomentumOscillatorsCard', () => {
    render(<MomentumOscillatorsCard momentum={report.momentum} />);
    expect(screen.getByText(/Momentum Oscillators & Momentum Regime/i)).toBeInTheDocument();
    expect(screen.getByText(/RSI \(14-Period Wilder\)/i)).toBeInTheDocument();
  });

  it('renders VolumeAnalysisCard', () => {
    render(<VolumeAnalysisCard volume={report.volume} />);
    expect(screen.getByText(/Volume Dynamics & Accumulation \/ Distribution/i)).toBeInTheDocument();
    expect(screen.getAllByText(/RELATIVE VOLUME/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders VolatilityDrawdownCard', () => {
    render(<VolatilityDrawdownCard volatility={report.volatility} />);
    expect(screen.getByText(/Volatility Regime & Historical Drawdown Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/ATR \(14-PERIOD\)/i)).toBeInTheDocument();
  });

  it('renders RelativeStrengthCard', () => {
    render(<RelativeStrengthCard relativeStrength={report.relativeStrength} />);
    expect(screen.getByText(/Relative Strength Benchmarking/i)).toBeInTheDocument();
  });

  it('renders TechnicalRiskCard', () => {
    render(
      <TechnicalRiskCard
        technicalRisk={report.technicalRisk}
        marketCycle={report.marketCycle}
      />
    );
    expect(screen.getByText(/Technical Risk Matrix & Market Cycle Phase/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MARKET CYCLE PHASE/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders ScreenshotObservationModal when open', () => {
    render(
      <ScreenshotObservationModal
        isOpen={true}
        onClose={() => {}}
        observations={[]}
        companySymbol="TATAMOTORS"
      />
    );
    expect(screen.getByText(/Screenshot Visual Chart Observations/i)).toBeInTheDocument();
  });
});
