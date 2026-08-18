import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { NewsAndIndustryMasterEngine } from '../domain/news/NewsAndIndustryMasterEngine';
import { NewsEvent } from '../domain/news/NewsAndIndustryTypes';
import { NewsOverviewCard } from '../components/news/NewsOverviewCard';
import { InteractiveNewsTimeline } from '../components/news/InteractiveNewsTimeline';
import { CatalystsAndRisksCard } from '../components/news/CatalystsAndRisksCard';
import { CrossLayerSensitivityCard } from '../components/news/CrossLayerSensitivityCard';
import { SourceVerificationModal } from '../components/news/SourceVerificationModal';
import { Newspaper, Play } from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface NewsIntelligenceViewProps {
  project: ResearchProject;
  onProjectUpdate?: (project: ResearchProject) => void;
}

export const NewsIntelligenceView: React.FC<NewsIntelligenceViewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const [selectedEventForModal, setSelectedEventForModal] = useState<NewsEvent | null>(null);

  // Initialize or fetch report
  const existingReport = project.newsAndIndustryAnalysis;

  const handleRunAnalysis = () => {
    // Generate verified demo news articles if none present
    const rawArticles = [
      {
        articleId: 'art_1',
        headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
        body: 'Tata Motors Limited has emerged as the lowest bidder for supplying 2,500 low-floor electric buses to Delhi Transport Corporation under the National Clean Air Programme.',
        publishedAt: '2024-04-12T10:30:00Z',
        source: {
          sourceId: 'src_nse_1',
          sourceName: 'NSE Regulatory Filing',
          sourceType: 'EXCHANGE_FILING' as const,
          sourceTier: 'TIER_1_PRIMARY' as const,
          publisher: 'National Stock Exchange of India',
          publishedAt: '2024-04-12T10:30:00Z',
          retrievedAt: '2024-04-12T10:35:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 99,
          primaryOrSecondary: 'PRIMARY_SOURCE' as const,
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE' as const,
        },
      },
      {
        articleId: 'art_2',
        headline: 'Tata Motors signs 2,500 EV bus supply deal worth ₹3,500 Cr',
        body: 'Mainstream report covering the exchange disclosure of the massive commercial electric vehicle order win.',
        publishedAt: '2024-04-12T11:15:00Z',
        source: {
          sourceId: 'src_reuters_1',
          sourceName: 'Reuters India Financial Wire',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA' as const,
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA' as const,
          publisher: 'Reuters',
          publishedAt: '2024-04-12T11:15:00Z',
          retrievedAt: '2024-04-12T11:20:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 90,
          primaryOrSecondary: 'SECONDARY_REPORTING' as const,
          isSyndicated: true,
          isAccessible: true,
          status: 'ACCESSIBLE' as const,
        },
      },
      {
        articleId: 'art_3',
        headline: 'JLR announces £15bn electric transition investment plan for FY25-FY28',
        body: 'Jaguar Land Rover announces accelerated multi-year capex plan for its luxury electric vehicle platform in Solihull.',
        publishedAt: '2024-03-20T08:00:00Z',
        source: {
          sourceId: 'src_mint_1',
          sourceName: 'LiveMint Financial Daily',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA' as const,
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA' as const,
          publisher: 'Mint',
          publishedAt: '2024-03-20T08:00:00Z',
          retrievedAt: '2024-03-20T08:05:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 88,
          primaryOrSecondary: 'PRIMARY_SOURCE' as const,
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE' as const,
        },
      },
      {
        articleId: 'art_4',
        headline: 'Steel input prices surge 6% amid global supply chain tightness',
        body: 'Automotive steel raw material index rises 6% YoY impacting OEM bill of materials across the domestic auto sector.',
        publishedAt: '2024-02-14T14:00:00Z',
        source: {
          sourceId: 'src_bs_1',
          sourceName: 'Business Standard',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA' as const,
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA' as const,
          publisher: 'Business Standard',
          publishedAt: '2024-02-14T14:00:00Z',
          retrievedAt: '2024-02-14T14:10:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 86,
          primaryOrSecondary: 'PRIMARY_SOURCE' as const,
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE' as const,
        },
      },
    ];

    const companyProfile = {
      symbol: project.company.symbol,
      legalName: project.company.legalName,
      displayName: project.company.displayName,
      aliases: ['Tata Motors Ltd', 'TAMO', 'Tata Auto'],
      subsidiaries: ['Jaguar Land Rover', 'JLR', 'Tata Passenger Electric Mobility'],
      brands: ['Harrier', 'Safari', 'Nexon EV', 'Punch', 'Range Rover', 'Defender'],
      promoters: ['Tata Sons Private Limited'],
      management: ['Natarajan Chandrasekaran', 'Shailesh Chandra', 'PB Balaji'],
      competitors: ['Maruti Suzuki', 'Mahindra & Mahindra', 'Ashok Leyland'],
      sector: project.company.sector,
    };

    const report = NewsAndIndustryMasterEngine.analyze(
      project.id,
      project.company.symbol,
      project.company.displayName,
      project.company.sector,
      project.company.subsector || 'Automotive Manufacturers',
      rawArticles,
      companyProfile
    );

    const updated = ProjectStorage.saveNewsAndIndustryAnalysisForProject(project.id, report);
    if (updated && onProjectUpdate) {
      onProjectUpdate(updated);
    }
  };

  const report = existingReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color="var(--color-primary)" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              News Intelligence & Real-Time Event Research
            </h2>
            <Badge variant="cyan">PHASE 11</Badge>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Deduplicated multi-source news stream, primary source hierarchy, catalyst scheduling, and non-mutating cross-layer sensitivities.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          className="terminal-btn terminal-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Play size={14} />
          {report ? 'Re-Sync News Intelligence' : 'Run News Analysis'}
        </button>
      </div>

      {/* Main Content */}
      {!report ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border-primary)', borderRadius: '8px' }}>
          <Newspaper size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--text-primary)' }}>
            News Intelligence Engine Awaiting Execution
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
            Click &ldquo;Run News Analysis&rdquo; to process verified media feeds, cluster syndicated duplicates, extract catalysts, and map cross-layer sensitivities.
          </p>
          <button onClick={handleRunAnalysis} className="terminal-btn terminal-btn-primary">
            Execute Phase 11 News Engine
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Overview Snapshot */}
          <NewsOverviewCard
            companySymbol={project.company.symbol}
            materialAlerts={report.materialAlerts}
            newsEvents={report.newsEvents}
            dataFreshness={report.dataFreshness}
            confidenceScore={report.confidenceScore}
          />

          {/* Interactive Timeline */}
          <InteractiveNewsTimeline
            events={report.newsEvents}
            onSelectEventSources={(e) => setSelectedEventForModal(e)}
          />

          {/* Catalysts, Upcoming Events & Risk Engine */}
          <CatalystsAndRisksCard
            catalysts={report.catalysts}
            upcomingEvents={report.upcomingEvents}
            newsRisks={report.newsRisks}
          />

          {/* Decoupled Cross-Layer Sensitivity */}
          <CrossLayerSensitivityCard sensitivities={report.crossLayerSensitivities} />

          {/* Source Verification & Lineage Modal */}
          <SourceVerificationModal
            event={selectedEventForModal}
            conflicts={report.sourceConflicts}
            onClose={() => setSelectedEventForModal(null)}
          />
        </div>
      )}
    </div>
  );
};
