import React, { useState, useMemo } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { VerdictMasterEngine } from '../domain/verdict/VerdictMasterEngine';
import { FinalVerdictBannerCard } from '../components/verdict/FinalVerdictBannerCard';
import { PriceAndValuationMatrixCard } from '../components/verdict/PriceAndValuationMatrixCard';
import { CoreThesisCard } from '../components/verdict/CoreThesisCard';
import { QualityAndGovernanceCard } from '../components/verdict/QualityAndGovernanceCard';
import { ScenarioAndDownsideCard } from '../components/verdict/ScenarioAndDownsideCard';
import { CatalystsRisksBreakersCard } from '../components/verdict/CatalystsRisksBreakersCard';
import { OutlookAndTimingCard } from '../components/verdict/OutlookAndTimingCard';
import { DecisionAuditTrailDrawer } from '../components/verdict/DecisionAuditTrailDrawer';

interface InvestmentVerdictViewProps {
  project?: ResearchProject;
  onProjectUpdate?: (updated: ResearchProject) => void;
}

export const InvestmentVerdictView: React.FC<InvestmentVerdictViewProps> = ({
  project,
}) => {
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Generate deterministic verdict report
  const report = useMemo(() => {
    if (!project) return null;
    return VerdictMasterEngine.generateVerdictReport(project);
  }, [project]);

  if (!project || !report) {
    return (
      <div style={{ padding: '32px', color: '#94a3b8', textAlign: 'center' }}>
        <h2>No Active Research Project</h2>
        <p>Please select or create an active project to view the Institutional Investment Verdict.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Master Verdict Hero Banner */}
      <FinalVerdictBannerCard
        report={report}
        onOpenAuditDrawer={() => setIsAuditDrawerOpen(true)}
      />

      {/* 2. 2-Column High-Density Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PriceAndValuationMatrixCard report={report} />
          <QualityAndGovernanceCard report={report} />
          <CatalystsRisksBreakersCard report={report} />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CoreThesisCard report={report} />
          <ScenarioAndDownsideCard report={report} />
          <OutlookAndTimingCard report={report} />
        </div>
      </div>

      {/* 3. Interactive Decision Audit Drawer */}
      <DecisionAuditTrailDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        report={report}
      />
    </div>
  );
};
