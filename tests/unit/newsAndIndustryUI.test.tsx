import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsOverviewCard } from '../../src/components/news/NewsOverviewCard';
import { InteractiveNewsTimeline } from '../../src/components/news/InteractiveNewsTimeline';
import { CatalystsAndRisksCard } from '../../src/components/news/CatalystsAndRisksCard';
import { SourceVerificationModal } from '../../src/components/news/SourceVerificationModal';
import { CrossLayerSensitivityCard } from '../../src/components/news/CrossLayerSensitivityCard';
import { IndustryOverviewCard } from '../../src/components/industry/IndustryOverviewCard';
import { CompetitorLandscapeCard } from '../../src/components/industry/CompetitorLandscapeCard';
import { IndustryValueChainCard } from '../../src/components/industry/IndustryValueChainCard';
import { IndustryOutlookCard } from '../../src/components/industry/IndustryOutlookCard';
import { IndustryAnalysisEngine } from '../../src/domain/industry/IndustryAnalysisEngine';
import { NewsEvent } from '../../src/domain/news/NewsAndIndustryTypes';

describe('Phase 11 — UI Components Integration Tests', () => {
  const mockEvent: NewsEvent = {
    eventId: 'ev_001',
    headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
    summary: 'Order win for supplying 2,500 low-floor electric buses to Delhi Transport Corporation.',
    eventDate: '2024-04-12',
    eventDatePrecision: 'EXACT_DATE',
    publicationDate: '2024-04-12T10:30:00Z',
    retrievedAt: '2024-04-12T10:35:00Z',
    timezone: 'Asia/Kolkata',
    sourceReferences: [
      {
        sourceId: 'src_01',
        sourceName: 'NSE Disclosures',
        sourceType: 'EXCHANGE_FILING',
        sourceTier: 'TIER_1_PRIMARY',
        publisher: 'NSE India',
        publishedAt: '2024-04-12T10:30:00Z',
        retrievedAt: '2024-04-12T10:35:00Z',
        timezone: 'Asia/Kolkata',
        reliabilityScore: 99,
        primaryOrSecondary: 'PRIMARY_SOURCE',
        isSyndicated: false,
        isAccessible: true,
        status: 'ACCESSIBLE',
      },
    ],
    companyEntities: [],
    peopleEntities: [],
    industryEntities: [],
    eventCategory: 'ORDER_WIN',
    relevance: 'DIRECT_COMPANY',
    impactAssessment: {
      direction: 'POSITIVE',
      magnitude: 'MATERIAL',
      horizon: 'MEDIUM_TERM',
      rationale: 'Order win.',
      businessChannels: ['Order Inflow'],
      financialChannels: ['REVENUE', 'VOLUME'],
      potentialEffect: 'Positive revenue impact.',
      confidence: 90,
      evidenceReferences: [],
    },
    sourceLineageIds: [],
    corroborationStatus: 'PRIMARY_CONFIRMED',
    eventStatus: 'NEW',
    confidence: 88,
    evidenceReferences: [],
    createdAt: '2024-04-12T10:35:00Z',
    updatedAt: '2024-04-12T10:35:00Z',
  };

  const industryProfile = IndustryAnalysisEngine.generateIndustryProfile('Automobile', 'Automotive OEM', 'TATAMOTORS');
  const competitors = IndustryAnalysisEngine.getCompetitors('TATAMOTORS');
  const companyPosition = IndustryAnalysisEngine.evaluateCompanyPosition('TATAMOTORS', competitors);
  const industryOutlook = IndustryAnalysisEngine.generateIndustryOutlook('Automotive OEM');

  it('renders NewsOverviewCard with direct company metrics and freshness banner', () => {
    render(
      <NewsOverviewCard
        companySymbol="TATAMOTORS"
        materialAlerts={[
          {
            alertId: 'alt_1',
            headline: 'Tata Motors bags ₹3,500 Cr EV bus contract',
            eventDate: '2024-04-12',
            category: 'ORDER_WIN',
            magnitude: 'MATERIAL',
            relevance: 'DIRECT_COMPANY',
            sourceTier: 'TIER_1_PRIMARY',
            summary: 'Summary text',
          },
        ]}
        newsEvents={[mockEvent]}
        dataFreshness={{
          latestNewsRetrieved: '2024-04-12T10:35:00Z',
          industryDataUpdated: '2024-04-12T10:35:00Z',
          marketContextDate: '2024-04-12',
          isStale: false,
        }}
        confidenceScore={88}
      />
    );

    expect(screen.getByText(/News Intelligence & External Event Snapshot/i)).toBeDefined();
    expect(screen.getByText(/HIGH MATERIALITY NEWS ALERTS/i)).toBeDefined();
    expect(screen.getByText(/1 VERIFIED EVENTS/i)).toBeDefined();
  });

  it('renders InteractiveNewsTimeline and supports timeline button filtering', () => {
    const onSelectSpy = vi.fn();
    render(
      <InteractiveNewsTimeline
        events={[mockEvent]}
        onSelectEventSources={onSelectSpy}
      />
    );

    expect(screen.getByText(/Point-in-Time Event Timeline/i)).toBeDefined();
    expect(screen.getByText('Tata Motors bags ₹3,500 Cr EV bus contract from DTC')).toBeDefined();

    const inspectBtn = screen.getByRole('button', { name: /Inspect Sources/i });
    fireEvent.click(inspectBtn);
    expect(onSelectSpy).toHaveBeenCalledWith(mockEvent);
  });

  it('renders CatalystsAndRisksCard with tab switching', () => {
    render(
      <CatalystsAndRisksCard
        catalysts={[
          {
            catalystId: 'cat_1',
            event: 'Major EV Bus Contract Win',
            category: 'ORDER_WIN',
            expectedDate: '2024-04-12',
            datePrecision: 'EXACT_DATE',
            businessImpact: 'Revenue growth',
            financialChannel: 'REVENUE',
            status: 'COMPLETED',
            confidence: 90,
            sourceReferences: [],
          },
        ]}
        upcomingEvents={[]}
        newsRisks={[]}
      />
    );

    expect(screen.getByText(/External Catalysts, Upcoming Events & Risk Engine/i)).toBeDefined();
    expect(screen.getByText('Major EV Bus Contract Win')).toBeDefined();
  });

  it('renders SourceVerificationModal and closes on button click', () => {
    const onCloseSpy = vi.fn();
    render(
      <SourceVerificationModal
        event={mockEvent}
        conflicts={[]}
        onClose={onCloseSpy}
      />
    );

    expect(screen.getByText(/Source Provenance & Lineage Audit/i)).toBeDefined();
    expect(screen.getByText((_, el) => el?.textContent?.includes('NSE Disclosures') ?? false)).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /Close Inspector/i });
    fireEvent.click(closeBtn);
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('renders CrossLayerSensitivityCard with OBSERVATION ONLY status badge', () => {
    render(
      <CrossLayerSensitivityCard
        sensitivities={[
          {
            linkageId: 'l1',
            targetPhase: 'PHASE_5_FINANCIALS',
            shockEventHeadline: 'Input Steel Inflation',
            businessChannel: 'Procurement',
            financialChannel: 'MARGINS',
            observationNote: 'Gross margin sensitivity observation.',
            isCausalityProven: false,
            status: 'OBSERVATION_ONLY',
          },
        ]}
      />
    );

    expect(screen.getByText(/Decoupled Cross-Layer Sensitivity/i)).toBeDefined();
    expect(screen.getByText(/OBSERVATION ONLY/i)).toBeDefined();
  });

  it('renders IndustryOverviewCard, CompetitorLandscapeCard, and ValueChainCard', () => {
    render(
      <div>
        <IndustryOverviewCard industryProfile={industryProfile} />
        <CompetitorLandscapeCard
          companySymbol="TATAMOTORS"
          competitors={competitors}
          companyPosition={companyPosition}
        />
        <IndustryValueChainCard valueChain={industryProfile.valueChain} />
        <IndustryOutlookCard industryOutlook={industryOutlook} />
      </div>
    );

    expect(screen.getByText(/Industry Dynamics & Structural Drivers/i)).toBeDefined();
    expect(screen.getByText(/Peer Competitor Benchmarking/i)).toBeDefined();
    expect(screen.getByText(/Sector Value Chain Mapping/i)).toBeDefined();
    expect(screen.getByText(/3-Horizon Multi-Timeframe Industry Outlook/i)).toBeDefined();
  });
});
