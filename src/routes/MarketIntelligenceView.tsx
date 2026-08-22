import React, { useState } from 'react';
import { DailyMarketScanner } from '../domain/marketIntelligence/DailyMarketScanner';
import { UniverseType, DailyOpportunityItem } from '../domain/marketIntelligence/MarketIntelligenceTypes';
import { MarketOverviewHeader } from '../components/marketIntelligence/MarketOverviewHeader';
import { DailyTop10Card } from '../components/marketIntelligence/DailyTop10Card';
import { OpportunityDetailDrawer } from '../components/marketIntelligence/OpportunityDetailDrawer';
import { TrendingNowCard } from '../components/marketIntelligence/TrendingNowCard';
import { SectorHeatmapCard } from '../components/marketIntelligence/SectorHeatmapCard';
import { EventsRadarCard } from '../components/marketIntelligence/EventsRadarCard';
import { RiskRadarCard } from '../components/marketIntelligence/RiskRadarCard';
import { MarketChangeDetectionCard } from '../components/marketIntelligence/MarketChangeDetectionCard';
import { DailyDataQualityPanel } from '../components/marketIntelligence/DailyDataQualityPanel';

export interface MarketIntelligenceViewProps {
  onAnalyzeStock: (symbol: string) => void;
}

export const MarketIntelligenceView: React.FC<MarketIntelligenceViewProps> = ({ onAnalyzeStock }) => {
  const [universe, setUniverse] = useState<UniverseType>('NSE_500');
  const [selectedOpportunity, setSelectedOpportunity] = useState<DailyOpportunityItem | null>(null);

  // Run or retrieve current market scan snapshot
  const snapshot = DailyMarketScanner.scanDailyMarket(universe);

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '16px 8px',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* 1. Market Overview & Index / Breadth Bar */}
      <MarketOverviewHeader
        date={snapshot.date}
        asOfTime={snapshot.asOfTime}
        universe={universe}
        onUniverseChange={(u) => setUniverse(u)}
        indices={snapshot.indices}
        breadth={snapshot.breadth}
      />

      {/* 2. Today's Top 10 Opportunities (Core Table) */}
      <DailyTop10Card
        opportunities={snapshot.top10Opportunities}
        onSelectOpportunity={(item) => setSelectedOpportunity(item)}
        onAnalyzeStock={onAnalyzeStock}
      />

      {/* 3. Trending Now & Volume Expansion Scanner */}
      <TrendingNowCard
        trendingStocks={snapshot.trendingStocks}
        onAnalyzeStock={onAnalyzeStock}
      />

      {/* 4. Sector Performance & News Heatmap */}
      <SectorHeatmapCard sectors={snapshot.sectorHeatmap} />

      {/* 5. Events & Order Radar */}
      <EventsRadarCard
        events={snapshot.eventsRadar}
        onAnalyzeStock={onAnalyzeStock}
      />

      {/* 6. Risk Radar & Governance Watchlist */}
      <RiskRadarCard
        risks={snapshot.riskRadar}
        onAnalyzeStock={onAnalyzeStock}
      />

      {/* 7. What Changed Since Yesterday? */}
      <MarketChangeDetectionCard opportunities={snapshot.top10Opportunities} />

      {/* 8. Daily Data Quality & Ingestion Telemetry */}
      <DailyDataQualityPanel
        scannedCount={snapshot.dataQuality.scannedCount}
        financialCoveragePercent={snapshot.dataQuality.financialCoveragePercent}
        newsCoveragePercent={snapshot.dataQuality.newsCoveragePercent}
        marketDataCoveragePercent={snapshot.dataQuality.marketDataCoveragePercent}
        sourceConflictsCount={snapshot.dataQuality.sourceConflictsCount}
        criticalMissingDataCount={snapshot.dataQuality.criticalMissingDataCount}
        calculationIntegrity={snapshot.dataQuality.calculationIntegrity}
      />

      {/* 9. Slide-Over Micro Research Drawer */}
      <OpportunityDetailDrawer
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onAnalyzeStock={onAnalyzeStock}
      />
    </div>
  );
};
