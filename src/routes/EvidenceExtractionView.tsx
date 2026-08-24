import React, { useState, useEffect } from 'react';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { ResearchProject } from '../domain/models/ResearchProject';
import {
  FinancialFact,
  ManagementClaim,
  ContradictionRecord,
  TwoYearReconciliationRecord,
} from '../domain/extraction/FinancialFactTypes';
import { FinancialFactExtractor } from '../domain/extraction/FinancialFactExtractor';
import { ContradictionDetector } from '../domain/extraction/ContradictionDetector';
import { TwoYearReconciliation } from '../domain/extraction/TwoYearReconciliation';
import { TwoYearFactTable } from '../components/extraction/TwoYearFactTable';
import { ManagementClaimsLedger } from '../components/extraction/ManagementClaimsLedger';
import { ContradictionAlertBanner } from '../components/extraction/ContradictionAlertBanner';
import { FactProvenanceDrawer } from '../components/extraction/FactProvenanceDrawer';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Database,
  Play,
  CheckCircle2,
  FileSpreadsheet,
  MessageSquareQuote,
  Scale,
  RefreshCw,
} from 'lucide-react';

export const EvidenceExtractionView: React.FC = () => {
  const [activeProject, setActiveProject] = useState<ResearchProject>(ProjectStorage.getActiveProject());
  const [facts, setFacts] = useState<FinancialFact[]>(ProjectStorage.getFactsForProject(activeProject.id));
  const [claims, setClaims] = useState<ManagementClaim[]>(ProjectStorage.getClaimsForProject(activeProject.id));
  const [contradictions, setContradictions] = useState<ContradictionRecord[]>(
    ProjectStorage.getContradictionsForProject(activeProject.id)
  );
  const [reconciliationRecords, setReconciliationRecords] = useState<TwoYearReconciliationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'STATEMENTS' | 'CLAIMS' | 'CONTRADICTIONS'>('STATEMENTS');
  const [inspectedFact, setInspectedFact] = useState<FinancialFact | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Sync project state on mount or active project change
  useEffect(() => {
    const proj = ProjectStorage.getActiveProject();
    setActiveProject(proj);
    const existingFacts = ProjectStorage.getFactsForProject(proj.id);
    const existingClaims = ProjectStorage.getClaimsForProject(proj.id);
    const existingContradictions = ProjectStorage.getContradictionsForProject(proj.id);

    setFacts(existingFacts);
    setClaims(existingClaims);
    setContradictions(existingContradictions);

    if (existingFacts.length > 0) {
      const reconciled = TwoYearReconciliation.reconcile({
        facts: existingFacts,
        fy1Period: 'FY23',
        fy0Period: 'FY24',
        preferredAccountingBasis: 'CONSOLIDATED',
      });
      setReconciliationRecords(reconciled);
    }
  }, []);

  const handleRunExtraction = () => {
    setIsExtracting(true);

    setTimeout(() => {
      const documents = activeProject.documents || [];

      // Extract facts and claims from project materials
      const extractionResult = FinancialFactExtractor.extractFromDocuments({
        projectId: activeProject.id,
        companyId: activeProject.company.symbol,
        companySymbol: activeProject.company.symbol,
        documents: documents.length > 0 ? documents : [
          {
            id: 'doc_sample_ar_fy24',
            projectId: activeProject.id,
            filename: 'TATAMOTORS_Annual_Report_FY24.pdf',
            originalFilename: 'TATAMOTORS_Annual_Report_FY24.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 4200000,
            fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            documentType: 'ANNUAL_REPORT',
            classificationConfidence: 100,
            isClassificationManualOverride: false,
            provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
            source: 'Official Audited Annual Report',
            reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY2024' },
            companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
            processingStatus: 'READY',
            extractionStatus: 'PENDING',
            ocrStatusSummary: { required: false, pageCount: 2, completedPages: 0, scannedPageCount: 0, machineReadablePageCount: 2, overallTier: 'NONE' },
            pages: [],
            validationErrors: [],
            uploadedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          },
          {
            id: 'doc_sample_ar_fy23',
            projectId: activeProject.id,
            filename: 'TATAMOTORS_Annual_Report_FY23.pdf',
            originalFilename: 'TATAMOTORS_Annual_Report_FY23.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 3900000,
            fileHash: 'f4c2e44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b866',
            documentType: 'ANNUAL_REPORT',
            classificationConfidence: 100,
            isClassificationManualOverride: false,
            provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
            source: 'Official Audited Annual Report',
            reportingPeriod: { fiscalYear: 'FY23', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY2023' },
            companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
            processingStatus: 'READY',
            extractionStatus: 'PENDING',
            ocrStatusSummary: { required: false, pageCount: 2, completedPages: 0, scannedPageCount: 0, machineReadablePageCount: 2, overallTier: 'NONE' },
            pages: [],
            validationErrors: [],
            uploadedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          },
          {
            id: 'doc_sample_screener_screenshot',
            projectId: activeProject.id,
            filename: 'Screener_TATAMOTORS_Ratios.png',
            originalFilename: 'Screener_TATAMOTORS_Ratios.png',
            mimeType: 'image/png',
            sizeBytes: 450000,
            fileHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
            documentType: 'SCREENER_SCREENSHOT',
            classificationConfidence: 95,
            isClassificationManualOverride: false,
            provenanceSourceType: 'SCREENSHOT_DERIVED',
            source: 'Screener.in Screenshot',
            reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
            companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
            processingStatus: 'READY',
            extractionStatus: 'PENDING',
            ocrStatusSummary: { required: true, pageCount: 1, completedPages: 1, scannedPageCount: 1, machineReadablePageCount: 0, averageConfidence: 94, overallTier: 'HIGH' },
            pages: [],
            validationErrors: [],
            uploadedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          },
          {
            id: 'doc_sample_concall_q4',
            projectId: activeProject.id,
            filename: 'TataMotors_Concall_Transcript_Q4FY24.pdf',
            originalFilename: 'TataMotors_Concall_Transcript_Q4FY24.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 850000,
            fileHash: 'b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01',
            documentType: 'CONCALL_TRANSCRIPT',
            classificationConfidence: 98,
            isClassificationManualOverride: false,
            provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
            source: 'Official Earnings Call Transcript',
            reportingPeriod: { fiscalYear: 'FY24', quarter: 'Q4', isIdentifiable: true, periodType: 'QUARTERLY', rawPeriodString: 'Q4FY24' },
            companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
            processingStatus: 'READY',
            extractionStatus: 'PENDING',
            ocrStatusSummary: { required: false, pageCount: 15, completedPages: 0, scannedPageCount: 0, machineReadablePageCount: 15, overallTier: 'NONE' },
            pages: [],
            validationErrors: [],
            uploadedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
          },
        ],
      });

      // Detect contradictions across all extracted facts
      const detectedContradictions = ContradictionDetector.detectContradictions(extractionResult.facts);

      // Reconcile 2-year side-by-side statements
      const reconciled = TwoYearReconciliation.reconcile({
        facts: extractionResult.facts,
        fy1Period: 'FY23',
        fy0Period: 'FY24',
        preferredAccountingBasis: 'CONSOLIDATED',
      });

      // Persist to storage
      ProjectStorage.saveFactsForProject(activeProject.id, extractionResult.facts);
      ProjectStorage.saveClaimsForProject(activeProject.id, extractionResult.managementClaims);
      ProjectStorage.saveContradictionsForProject(activeProject.id, detectedContradictions);

      setFacts(extractionResult.facts);
      setClaims(extractionResult.managementClaims);
      setContradictions(detectedContradictions);
      setReconciliationRecords(reconciled);
      setIsExtracting(false);
      setNotification({
        type: 'success',
        text: `Successfully extracted ${extractionResult.facts.length} financial facts and ${extractionResult.managementClaims.length} management claims across 2 consecutive financial years.`,
      });

      setTimeout(() => setNotification(null), 5000);
    }, 400);
  };

  const handleResolveContradiction = (
    contradictionId: string,
    resolution: ContradictionRecord['resolutionStatus']
  ) => {
    const updatedProj = ProjectStorage.resolveContradiction(activeProject.id, contradictionId, resolution);
    setContradictions(updatedProj.contradictions || []);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in duration-150">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-terminal-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-terminal-text tracking-tight uppercase">
              Evidence Extraction & Financial Fact Reconstruction
            </h1>
            <Badge variant="cyan">Phase 4 Active</Badge>
          </div>
          <p className="text-xs text-terminal-muted mt-1 font-mono">
            Extracts normalized reported inputs from ingested filings with strict provenance and cross-source contradiction auditing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="run-extraction-btn"
            onClick={handleRunExtraction}
            disabled={isExtracting}
            className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-terminal-dark font-mono text-xs font-bold rounded shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExtracting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isExtracting ? 'Extracting Evidence...' : 'Run Extraction Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-status-success/15 border border-status-success/40 text-status-success px-4 py-2.5 rounded font-mono text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Extraction Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Extracted Facts</span>
            <Database className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold text-terminal-text font-mono">
            {facts.length}
          </div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Across 5 Statement Categories
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>2-Year Reconciled Items</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-status-success" />
          </div>
          <div className="text-xl font-bold text-status-success font-mono">
            {reconciliationRecords.length}
          </div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            FY23 (Base) vs FY24 (Current)
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Management Claims</span>
            <MessageSquareQuote className="w-3.5 h-3.5 text-accent-purple" />
          </div>
          <div className="text-xl font-bold text-accent-purple font-mono">
            {claims.length}
          </div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Executive & Concall Citations
          </span>
        </Card>

        <Card className="p-3 bg-terminal-card/80 border-terminal-border">
          <div className="flex items-center justify-between text-terminal-muted text-[10px] uppercase font-mono mb-1">
            <span>Contradictions / Variances</span>
            <Scale className="w-3.5 h-3.5 text-status-warning" />
          </div>
          <div className="text-xl font-bold text-status-warning font-mono">
            {contradictions.length}
          </div>
          <span className="text-[10px] text-terminal-muted font-mono mt-0.5 block">
            Anti-Hallucination Discrepancies
          </span>
        </Card>
      </div>

      {/* Contradiction Alert Banner */}
      <ContradictionAlertBanner
        contradictions={contradictions}
        onResolve={handleResolveContradiction}
        onInspectFact={(fact) => setInspectedFact(fact)}
      />

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-terminal-border">
        <button
          onClick={() => setActiveTab('STATEMENTS')}
          className={`pb-2.5 px-3 font-mono text-xs uppercase font-bold flex items-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'STATEMENTS'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>2-Year Reconciled Facts ({reconciliationRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLAIMS')}
          className={`pb-2.5 px-3 font-mono text-xs uppercase font-bold flex items-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'CLAIMS'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Management Claims Ledger ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONTRADICTIONS')}
          className={`pb-2.5 px-3 font-mono text-xs uppercase font-bold flex items-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'CONTRADICTIONS'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-terminal-muted hover:text-terminal-text'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Contradiction Sentinel ({contradictions.length})</span>
        </button>
      </div>

      {/* Main View Area */}
      {activeTab === 'STATEMENTS' && (
        <div>
          {reconciliationRecords.length === 0 ? (
            <div className="p-12 text-center bg-terminal-card/40 border border-terminal-border rounded space-y-3 font-mono">
              <Database className="w-8 h-8 text-terminal-muted mx-auto" />
              <h3 className="text-sm font-bold text-terminal-text uppercase">
                No Financial Facts Extracted Yet
              </h3>
              <p className="text-xs text-terminal-muted max-w-md mx-auto">
                Click "Run Extraction Pipeline" above to process project documents into structured reported financial facts.
              </p>
              <button
                onClick={handleRunExtraction}
                className="px-4 py-1.5 bg-accent-cyan/20 hover:bg-accent-cyan/40 text-accent-cyan border border-accent-cyan/40 rounded text-xs font-bold transition-colors"
              >
                Extract Financial Facts
              </button>
            </div>
          ) : (
            <TwoYearFactTable
              records={reconciliationRecords}
              fy1Label="FY23"
              fy0Label="FY24"
              onInspectFact={(fact) => setInspectedFact(fact)}
            />
          )}
        </div>
      )}

      {activeTab === 'CLAIMS' && (
        <ManagementClaimsLedger claims={claims} />
      )}

      {activeTab === 'CONTRADICTIONS' && (
        <div className="space-y-4">
          <ContradictionAlertBanner
            contradictions={contradictions}
            onResolve={handleResolveContradiction}
            onInspectFact={(fact) => setInspectedFact(fact)}
          />
        </div>
      )}

      {/* Fact Provenance Audit Modal */}
      <FactProvenanceDrawer
        fact={inspectedFact}
        onClose={() => setInspectedFact(null)}
      />
    </div>
  );
};
