import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { TerminalRoute } from '../types';
import { IngestedDocument, DocumentType } from '../domain/ingestion/DocumentTypes';
import { DocumentIngestionEngine } from '../domain/ingestion/DocumentIngestionEngine';
import { TwoYearReportAudit } from '../domain/ingestion/TwoYearReportAudit';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DocumentDropzone } from '../components/ingestion/DocumentDropzone';
import { TwoYearAuditCard } from '../components/ingestion/TwoYearAuditCard';
import { DocumentQueueTable } from '../components/ingestion/DocumentQueueTable';
import { DocumentPageInspectorModal } from '../components/ingestion/DocumentPageInspectorModal';

interface IngestionViewProps {
  activeProject: ResearchProject | null;
  onNavigate: (route: TerminalRoute) => void;
  onProjectChange: (project: ResearchProject) => void;
}

export const IngestionView: React.FC<IngestionViewProps> = ({
  activeProject,
  onNavigate,
  onProjectChange,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<IngestedDocument | null>(null);

  if (!activeProject) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No active research project selected.
      </div>
    );
  }

  const documents = activeProject.documents || [];
  const company = activeProject.company;

  // Run Two-Year Annual Report Audit
  const auditReport = TwoYearReportAudit.audit({
    documents,
    targetSymbol: company.symbol,
    targetLegalName: company.legalName,
  });

  // Calculate Pipeline Metrics
  const totalDocs = documents.length;
  const totalPages = documents.reduce((acc, d) => acc + d.pages.length, 0);
  const scannedPages = documents.reduce((acc, d) => acc + d.ocrStatusSummary.scannedPageCount, 0);
  const readyDocs = documents.filter((d) => d.processingStatus === 'READY').length;

  const handleFileIngested = async (
    file: File,
    manualType?: DocumentType,
    customSource?: string
  ) => {
    setIsProcessing(true);
    setDuplicateWarning(null);

    try {
      const result = await DocumentIngestionEngine.ingestDocument({
        file,
        projectId: activeProject.id,
        targetSymbol: company.symbol,
        targetLegalName: company.legalName,
        existingDocuments: documents,
        manualDocumentType: manualType,
        customSourceLabel: customSource,
      });

      if (result.isDuplicate) {
        setDuplicateWarning(result.duplicateReason || 'Duplicate document detected.');
      }

      // Add to project storage
      const updatedProject = ProjectStorage.addDocumentToProject(activeProject.id, result.document);
      onProjectChange(updatedProject);
    } catch (err: any) {
      setDuplicateWarning(err?.message || 'Ingestion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    const updated = ProjectStorage.removeDocumentFromProject(activeProject.id, docId);
    onProjectChange(updated);
  };

  const handleLoadSampleMaterials = async () => {
    setIsProcessing(true);
    setDuplicateWarning(null);

    try {
      const sampleFiles = [
        {
          name: `${company.symbol}_Annual_Report_FY23.pdf`,
          type: 'application/pdf',
          size: 14200000,
          mockTextPages: [
            { text: `Audited Financial Statements for ${company.legalName} FY 2022-23 Balance Sheet and P&L.`, isScanned: false },
            { text: `Management Discussion and Analysis for FY23. Strong operational execution across product verticals.`, isScanned: false },
          ],
        },
        {
          name: `${company.symbol}_Annual_Report_FY24.pdf`,
          type: 'application/pdf',
          size: 16800000,
          mockTextPages: [
            { text: `Audited Annual Financial Results for ${company.legalName} FY 2023-24. Consolidated Balance Sheet.`, isScanned: false },
            { text: `Independent Auditor Report and Cash Flow Statements for FY24.`, isScanned: false },
          ],
        },
        {
          name: `${company.symbol}_Q4FY24_Earnings_Concall_Transcript.pdf`,
          type: 'application/pdf',
          size: 2100000,
          mockTextPages: [
            { text: `Q4 FY24 Earnings Conference Call Transcript for ${company.legalName}. Management commentary and Q&A.`, isScanned: false },
          ],
        },
        {
          name: `Screener_${company.symbol}_10Yr_Financials_Screenshot.png`,
          type: 'image/png',
          size: 1840000,
          mockDimensions: { width: 2560, height: 1440, aspectRatio: '16:9' },
        },
        {
          name: `TradingView_${company.symbol}_Weekly_Technical_Chart.png`,
          type: 'image/png',
          size: 950000,
          mockDimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
        },
      ];

      let currentProject = activeProject;
      for (const sf of sampleFiles) {
        const result = await DocumentIngestionEngine.ingestDocument({
          file: sf as any,
          projectId: activeProject.id,
          targetSymbol: company.symbol,
          targetLegalName: company.legalName,
          existingDocuments: currentProject.documents,
          mockTextPages: sf.mockTextPages,
          mockDimensions: sf.mockDimensions,
        });
        currentProject = ProjectStorage.addDocumentToProject(activeProject.id, result.document);
      }
      onProjectChange(currentProject);
    } catch (err: any) {
      setDuplicateWarning(err?.message || 'Failed loading fixtures.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="view-ingestion">
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c1524 0%, #070a12 100%)',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em', color: '#f8fafc' }}>
              Evidence Intake & Document Ingestion Pipeline
            </h1>
            <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
              Phase 3 Active
            </Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '780px' }}>
            Multi-format PDF, earnings transcript, investor presentation, and canvas screenshot intake engine preserving strict page boundaries, provenance metadata, and deterministic document classification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="md"
            icon={<Sparkles size={13} />}
            onClick={handleLoadSampleMaterials}
            disabled={isProcessing}
            id="load-sample-materials-btn"
          >
            Load 2-Year Research Kit
          </Button>
          <Button
            variant="primary"
            icon={<ArrowRight size={13} />}
            onClick={() => onNavigate('extraction')}
            disabled={!auditReport.isReadyForTwoYearModel}
            id="proceed-to-extraction-btn"
          >
            Review Evidence (P4)
          </Button>
        </div>
      </div>

      {/* Duplicate / Error Alert Banner */}
      {duplicateWarning && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '4px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f59e0b',
            fontSize: '12px',
          }}
          id="ingestion-duplicate-warning-banner"
        >
          <AlertTriangle size={16} />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {/* Grid: Dropzone & Two-Year Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* Dropzone Card */}
        <Card title="Upload Research Materials" icon={<Upload size={14} color="#38bdf8" />}>
          <DocumentDropzone
            onFileIngested={handleFileIngested}
            isProcessing={isProcessing}
          />
        </Card>

        {/* Two-Year Annual Report Audit Card */}
        <TwoYearAuditCard
          auditReport={auditReport}
          targetSymbol={company.symbol}
        />
      </div>

      {/* Pipeline Status Summary Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
        id="ingestion-metrics-grid"
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Ingested Docs
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {totalDocs}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Structured Pages
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {totalPages}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Scanned / Image Pages
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: scannedPages > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '4px' }}>
            {scannedPages}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Pipeline Health
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: readyDocs === totalDocs && totalDocs > 0 ? '#10b981' : '#f8fafc', marginTop: '4px' }}>
            {totalDocs > 0 ? `${readyDocs}/${totalDocs} READY` : 'IDLE'}
          </div>
        </div>
      </div>

      {/* Ingested Documents Queue Table */}
      <Card
        title={`Ingested Evidence Repository (${documents.length} Files)`}
        icon={<Database size={14} color="#38bdf8" />}
      >
        <DocumentQueueTable
          documents={documents}
          onInspectDocument={(doc) => setInspectingDoc(doc)}
          onRemoveDocument={handleRemoveDocument}
        />
      </Card>

      {/* Page Inspector Modal */}
      <DocumentPageInspectorModal
        document={inspectingDoc}
        isOpen={!!inspectingDoc}
        onClose={() => setInspectingDoc(null)}
      />
    </div>
  );
};
