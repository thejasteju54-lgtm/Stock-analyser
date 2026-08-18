import React from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { NewsAndIndustryMasterEngine } from '../domain/news/NewsAndIndustryMasterEngine';
import { IndustryOverviewCard } from '../components/industry/IndustryOverviewCard';
import { CompetitorLandscapeCard } from '../components/industry/CompetitorLandscapeCard';
import { IndustryValueChainCard } from '../components/industry/IndustryValueChainCard';
import { IndustryOutlookCard } from '../components/industry/IndustryOutlookCard';
import { Factory, Play } from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface IndustryAnalysisViewProps {
  project: ResearchProject;
  onProjectUpdate?: (project: ResearchProject) => void;
}

export const IndustryAnalysisView: React.FC<IndustryAnalysisViewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const existingReport = project.newsAndIndustryAnalysis;

  const handleRunAnalysis = () => {
    const rawArticles = [
      {
        articleId: 'art_1',
        headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
        body: 'Tata Motors Limited has emerged as the lowest bidder for supplying 2,500 low-floor electric buses to Delhi Transport Corporation.',
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
    ];

    const companyProfile = {
      symbol: project.company.symbol,
      legalName: project.company.legalName,
      displayName: project.company.displayName,
      aliases: ['Tata Motors Ltd', 'TAMO'],
      subsidiaries: ['Jaguar Land Rover', 'JLR'],
      brands: ['Nexon EV', 'Harrier'],
      promoters: ['Tata Sons'],
      management: ['PB Balaji'],
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={20} color="var(--color-primary)" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Industry Structure, Moat & Peer Benchmarking
            </h2>
            <Badge variant="cyan">PHASE 11</Badge>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Structural vs cyclical drivers, Porter 5-Forces, 5-stage value chain mapping, peer competitor benchmarking, and 3-horizon outlook.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          className="terminal-btn terminal-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Play size={14} />
          {report ? 'Re-Run Industry Analysis' : 'Run Industry Analysis'}
        </button>
      </div>

      {/* Main Content */}
      {!report ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-card)', border: '1px dashed var(--border-primary)', borderRadius: '8px' }}>
          <Factory size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--text-primary)' }}>
            Industry Analysis Engine Awaiting Execution
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
            Click &ldquo;Run Industry Analysis&rdquo; to evaluate sector size, historical vs forecast CAGR, 5-stage value chain, and peer competitor comparisons.
          </p>
          <button onClick={handleRunAnalysis} className="terminal-btn terminal-btn-primary">
            Execute Phase 11 Industry Engine
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Industry Overview & Structural Drivers */}
          <IndustryOverviewCard industryProfile={report.industryProfile} />

          {/* Competitor Benchmarking */}
          <CompetitorLandscapeCard
            companySymbol={project.company.symbol}
            competitors={report.competitors}
            companyPosition={report.companyIndustryPosition}
          />

          {/* Value Chain Mapping */}
          <IndustryValueChainCard valueChain={report.industryProfile.valueChain} />

          {/* 3-Horizon Industry Outlook */}
          <IndustryOutlookCard industryOutlook={report.industryOutlook} />
        </div>
      )}
    </div>
  );
};
