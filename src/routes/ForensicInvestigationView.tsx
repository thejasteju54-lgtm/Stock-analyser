import React, { useState, useEffect } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { ForensicAccountingEngine } from '../domain/forensics/ForensicAccountingEngine';
import { ForensicAnalysisReport } from '../domain/forensics/ForensicAnalysisTypes';
import { ForensicPolicyRegistry } from '../domain/forensics/ForensicPolicyRegistry';
import { ForensicRiskOverviewCard } from '../components/forensics/ForensicRiskOverviewCard';
import { HighPriorityFindingsCard } from '../components/forensics/HighPriorityFindingsCard';
import { InvestigationQueueCard } from '../components/forensics/InvestigationQueueCard';
import { RelatedPartiesAndContingentCard } from '../components/forensics/RelatedPartiesAndContingentCard';
import { AuditorAndAccountingCard } from '../components/forensics/AuditorAndAccountingCard';
import { PromoterAndOwnershipCard } from '../components/forensics/PromoterAndOwnershipCard';
import { CrossStatementAuditModal } from '../components/forensics/CrossStatementAuditModal';
import { BusinessModelGatingBanner } from '../components/calculations/BusinessModelGatingBanner';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import {
  ShieldAlert,
  Play,
  Network,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ForensicInvestigationViewProps {
  currentProject: ResearchProject | null;
  onNavigateToCalculations?: () => void;
  onNavigateToFundamentals?: () => void;
}

export const ForensicInvestigationView: React.FC<ForensicInvestigationViewProps> = ({
  currentProject,
  onNavigateToCalculations,
  onNavigateToFundamentals,
}) => {
  const [report, setReport] = useState<ForensicAnalysisReport | null>(null);
  const [isCrossModalOpen, setIsCrossModalOpen] = useState<boolean>(false);
  const [selectedEvidenceList, setSelectedEvidenceList] = useState<string[] | null>(null);

  useEffect(() => {
    if (!currentProject) {
      setReport(null);
      return;
    }

    const savedReport = ProjectStorage.getForensicAnalysisForProject(currentProject.id);
    if (savedReport) {
      setReport(savedReport);
    } else {
      const facts = currentProject.facts || [];
      const metrics = currentProject.calculatedMetrics || [];
      if (facts.length > 0) {
        const result = ForensicAccountingEngine.analyze(
          currentProject.id,
          currentProject.company.symbol,
          currentProject.company.businessModel,
          facts,
          metrics,
          'FY24',
          'FY23'
        );
        setReport(result);
        ProjectStorage.saveForensicAnalysisForProject(currentProject.id, result);
      }
    }
  }, [currentProject?.id]);

  const handleRunAnalysis = () => {
    if (!currentProject) return;
    const facts = currentProject.facts || [];
    const metrics = currentProject.calculatedMetrics || [];
    const result = ForensicAccountingEngine.analyze(
      currentProject.id,
      currentProject.company.symbol,
      currentProject.company.businessModel,
      facts,
      metrics,
      'FY24',
      'FY23'
    );
    setReport(result);
    ProjectStorage.saveForensicAnalysisForProject(currentProject.id, result);
  };

  if (!currentProject) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card title="Forensic Accounting & Earnings-Quality Investigation">
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Please select or create an Indian equity research project to begin forensic analysis.
          </div>
        </Card>
      </div>
    );
  }

  const policy = ForensicPolicyRegistry.getPolicy(currentProject.company.businessModel);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header View */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} color="#f59e0b" />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Forensic Accounting & Earnings-Quality Investigation
            </h1>
            <Badge variant="cyan">PHASE 7</Badge>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-raised)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Policy: {policy.policyName}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Objective diagnostic sentinel identifying cash flow anomalies, earnings-quality divergences, disclosure risks, and ownership encumbrances.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onNavigateToFundamentals && (
            <button
              onClick={onNavigateToFundamentals}
              className="terminal-btn terminal-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Activity size={13} />
              Fundamental Health
            </button>
          )}

          {onNavigateToCalculations && (
            <button
              onClick={onNavigateToCalculations}
              className="terminal-btn terminal-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileSpreadsheet size={13} />
              Calculations View
            </button>
          )}

          <button
            onClick={() => setIsCrossModalOpen(true)}
            className="terminal-btn terminal-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Network size={13} />
            Cross-Statement Audit
          </button>

          <button
            onClick={handleRunAnalysis}
            className="terminal-btn terminal-btn-sm"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              borderColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={13} />
            Re-Run Forensic Scan
          </button>
        </div>
      </div>

      {/* Business Model Gating Notification */}
      <BusinessModelGatingBanner
        companySymbol={currentProject.company.symbol}
        businessModelCode={currentProject.company.businessModel}
        archetype={policy.archetype}
        totalMetricsCount={policy.applicableCategories.length}
        applicableMetricsCount={policy.applicableCategories.length}
      />

      {/* Forensic Risk Overview Card */}
      {report && <ForensicRiskOverviewCard report={report} />}

      {/* Positive Verification Signals Banner */}
      {report && report.positiveEvidence.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} /> Verified Forensic Strengths & Clean Disclosures:
          </span>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {report.positiveEvidence.map((ev, i) => (
              <li key={i}>{ev}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Forensic Grid */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {/* High-Priority Findings & Red Flags */}
          <HighPriorityFindingsCard
            findings={report.findings}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* Investigation Queue */}
          <InvestigationQueueCard
            priorities={report.investigationPriorities}
          />

          {/* Promoter Ownership & Pledge */}
          <PromoterAndOwnershipCard
            promoterSignals={report.promoterSignals}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* Related Parties & Contingent Liabilities */}
          <RelatedPartiesAndContingentCard
            relatedParties={report.relatedPartyTransactions}
            contingentLiabilities={report.contingentLiabilities}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* Auditor Disclosures & Accounting Changes */}
          <AuditorAndAccountingCard
            auditors={report.auditorDisclosures}
            policyChanges={report.accountingPolicyChanges}
            restatements={report.restatements}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />
        </div>
      )}

      {/* Cross-Statement Audit Modal */}
      {report && (
        <CrossStatementAuditModal
          isOpen={isCrossModalOpen}
          onClose={() => setIsCrossModalOpen(false)}
          checks={report.crossStatementChecks}
        />
      )}

      {/* Simple Evidence Citations Modal */}
      {selectedEvidenceList && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              width: '100%',
              maxWidth: '500px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                Source Evidence Provenance
              </span>
              <button
                onClick={() => setSelectedEvidenceList(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {selectedEvidenceList.map((cit, i) => (
                <li key={i}>{cit}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button onClick={() => setSelectedEvidenceList(null)} className="terminal-btn terminal-btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
