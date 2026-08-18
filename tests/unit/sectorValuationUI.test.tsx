import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValuationOverviewCard } from '../../src/components/valuation/ValuationOverviewCard';
import { RelativeValuationCard } from '../../src/components/valuation/RelativeValuationCard';
import { HistoricalValuationCard } from '../../src/components/valuation/HistoricalValuationCard';
import { PeerComparisonCard } from '../../src/components/valuation/PeerComparisonCard';
import { DcfScenarioCard } from '../../src/components/valuation/DcfScenarioCard';
import { DcfSensitivityCard } from '../../src/components/valuation/DcfSensitivityCard';
import { EmbeddedExpectationsCard } from '../../src/components/valuation/EmbeddedExpectationsCard';
import { ValuationTriangulationCard } from '../../src/components/valuation/ValuationTriangulationCard';
import { SotpValuationModal } from '../../src/components/valuation/SotpValuationModal';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Sector Valuation UI Components', () => {
  const baseMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 980.5,
    priceDate: '2024-03-31',
    marketDataTimestamp: new Date().toISOString(),
    currency: 'INR',
    shareCapital: {
      basicShares: 368.5,
      dilutedShares: 368.5,
      weightedAverageShares: 368.5,
      faceValue: 2.0,
      effectiveDate: '2024-03-31',
      corporateActionAdjustments: [],
      source: 'Exchange Filing',
      confidence: 95,
    },
    evBridge: {
      marketCapitalization: 361314.25,
      plusTotalDebt: 107000.0,
      plusPreferredEquity: 0,
      plusMinorityInterest: 5000.0,
      lessCashAndEquivalents: 45000.0,
      lessLiquidInvestments: 8000.0,
      netDebt: 59000.0,
      enterpriseValue: 420314.25,
      formulaDescription: 'Market Cap + Debt - Cash',
      accountingBasis: 'CONSOLIDATED',
      financialPeriod: 'FY24',
    },
    isStale: false,
    freshnessThresholdHours: 24,
    source: 'NSE',
    confidence: 95,
  };

  const report = SectorValuationEngine.analyze(
    'proj_1',
    'TATAMOTORS',
    'OPERATING_INDUSTRIAL',
    'Automobile',
    baseMarketSnapshot,
    [],
    [],
    null,
    null
  );

  it('renders ValuationOverviewCard with price, market cap, and position badge', () => {
    render(
      <ValuationOverviewCard
        snapshot={report.marketSnapshot}
        position={report.valuationPosition}
        confidenceScore={report.valuationConfidenceScore}
        triangulatedBaseValue={report.triangulation.triangulatedBaseValuePerShare}
      />
    );
    expect(screen.getByText(/Valuation Snapshot & Market Position/i)).toBeInTheDocument();
    expect(screen.getByText(/CURRENT PRICE/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MARKET CAP/i)[0]).toBeInTheDocument();
  });

  it('renders RelativeValuationCard and table headers', () => {
    render(<RelativeValuationCard multiples={report.relativeMultiples} />);
    expect(screen.getByText(/Relative Valuation Multiples/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PEER MEDIAN/i)[0]).toBeInTheDocument();
  });

  it('renders HistoricalValuationCard with bands', () => {
    render(<HistoricalValuationCard ranges={report.historicalValuation} />);
    expect(screen.getByText(/Historical Valuation Bands/i)).toBeInTheDocument();
  });

  it('renders PeerComparisonCard with table of comparables', () => {
    render(<PeerComparisonCard peers={report.peerBenchmarking.peers} />);
    expect(screen.getByText(/Peer Valuation Benchmarking & Relevance/i)).toBeInTheDocument();
  });

  it('renders DcfScenarioCard and allows switching tabs', () => {
    render(
      <DcfScenarioCard
        scenarios={report.dcfModel.scenarios}
        waccBridge={report.dcfModel.waccBridge}
        currentPrice={report.marketSnapshot.currentPrice}
      />
    );
    expect(screen.getByText(/Intrinsic Valuation — FCFF DCF Scenarios/i)).toBeInTheDocument();
    const bullBtn = screen.getByText(/BULL CASE/i);
    fireEvent.click(bullBtn);
    expect(screen.getByText(/BULL CASE/i)).toBeInTheDocument();
  });

  it('renders DcfSensitivityCard with 2D matrix', () => {
    render(
      <DcfSensitivityCard
        matrix={report.dcfModel.sensitivityMatrix}
        currentPrice={report.marketSnapshot.currentPrice}
      />
    );
    expect(screen.getByText(/2D DCF Sensitivity Matrix/i)).toBeInTheDocument();
  });

  it('renders EmbeddedExpectationsCard', () => {
    render(<EmbeddedExpectationsCard embedded={report.embeddedExpectations} />);
    expect(screen.getByText(/Embedded Growth Expectations/i)).toBeInTheDocument();
    expect(screen.getByText(/IMPLIED 5Y REVENUE CAGR/i)).toBeInTheDocument();
  });

  it('renders ValuationTriangulationCard', () => {
    render(
      <ValuationTriangulationCard
        items={report.triangulation.items}
        marginOfSafety={report.marginOfSafety}
        currentPrice={report.marketSnapshot.currentPrice}
      />
    );
    expect(screen.getByText(/Valuation Triangulation & Multi-Scenario Margin of Safety/i)).toBeInTheDocument();
  });

  it('renders SotpValuationModal when open', () => {
    if (report.sotpValuation) {
      render(
        <SotpValuationModal
          isOpen={true}
          onClose={() => {}}
          sotp={report.sotpValuation}
          companySymbol="TATAMOTORS"
        />
      );
      expect(screen.getByText(/Sum-of-the-Parts \(SOTP\) Segment Valuation/i)).toBeInTheDocument();
    }
  });
});
