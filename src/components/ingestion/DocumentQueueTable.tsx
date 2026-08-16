import React from 'react';
import {
  FileText,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { IngestedDocument } from '../../domain/ingestion/DocumentTypes';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface DocumentQueueTableProps {
  documents: IngestedDocument[];
  onInspectDocument: (doc: IngestedDocument) => void;
  onRemoveDocument: (docId: string) => void;
}

export const DocumentQueueTable: React.FC<DocumentQueueTableProps> = ({
  documents,
  onInspectDocument,
  onRemoveDocument,
}) => {
  if (documents.length === 0) {
    return (
      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '32px 20px',
          textAlign: 'center',
          background: 'var(--bg-surface-sunken)',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}
        id="empty-document-queue-message"
      >
        <FileText size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <div>No research documents ingested for this company yet.</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>
          Upload Annual Reports (FY-1 & FY-0), Concall Transcripts, or Screener/Chart screenshots above.
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        background: 'var(--bg-surface)',
        overflowX: 'auto',
      }}
      id="document-queue-table-container"
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11px',
          textAlign: 'left',
        }}
        id="document-queue-table"
      >
        <thead>
          <tr
            style={{
              background: 'var(--bg-surface-raised)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            <th style={{ padding: '8px 12px' }}>Document / File</th>
            <th style={{ padding: '8px 12px' }}>Classification</th>
            <th style={{ padding: '8px 12px' }}>Period</th>
            <th style={{ padding: '8px 12px' }}>Provenance</th>
            <th style={{ padding: '8px 12px' }}>OCR Status</th>
            <th style={{ padding: '8px 12px' }}>Processing</th>
            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isScreenshot = doc.provenanceSourceType === 'SCREENSHOT_DERIVED';
            const ocr = doc.ocrStatusSummary;

            return (
              <tr
                key={doc.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.1s ease',
                }}
                className="hover-row"
                id={`doc-row-${doc.id}`}
              >
                {/* File Details */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isScreenshot ? (
                      <Camera size={14} color="#f59e0b" />
                    ) : (
                      <FileText size={14} color="#38bdf8" />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          maxWidth: '220px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.filename}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {formatFileSize(doc.sizeBytes)} • {doc.pages.length} {doc.pages.length === 1 ? 'Page' : 'Pages'}
                        {doc.dimensions && ` • ${doc.dimensions.width}x${doc.dimensions.height}`}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Classification */}
                <td style={{ padding: '10px 12px' }}>
                  <Badge variant={doc.documentType === 'UNKNOWN' ? 'bearish' : 'cyan'}>
                    {doc.documentType}
                  </Badge>
                </td>

                {/* Reporting Period */}
                <td style={{ padding: '10px 12px' }}>
                  {doc.reportingPeriod.isIdentifiable ? (
                    <Badge variant="neutral">
                      {doc.reportingPeriod.fiscalYear || doc.reportingPeriod.rawPeriodString}
                    </Badge>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unspecified</span>
                  )}
                </td>

                {/* Provenance */}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Badge variant={isScreenshot ? 'bearish' : 'neutral'}>
                      {doc.provenanceSourceType}
                    </Badge>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{doc.source}</span>
                  </div>
                </td>

                {/* OCR Status */}
                <td style={{ padding: '10px 12px' }}>
                  {!ocr.required ? (
                    <span style={{ color: 'var(--text-muted)' }}>Machine Text</span>
                  ) : ocr.overallTier === 'HIGH' ? (
                    <Badge variant="bullish">OCR {ocr.averageConfidence}%</Badge>
                  ) : ocr.overallTier === 'MEDIUM' ? (
                    <Badge variant="neutral">OCR {ocr.averageConfidence}%</Badge>
                  ) : (
                    <Badge variant="bearish">OCR Review ({ocr.averageConfidence || 0}%)</Badge>
                  )}
                </td>

                {/* Processing Status */}
                <td style={{ padding: '10px 12px' }}>
                  {doc.processingStatus === 'READY' ? (
                    <Badge variant="bullish" icon={<CheckCircle2 size={10} />}>
                      READY
                    </Badge>
                  ) : doc.processingStatus === 'REQUIRES_REVIEW' ? (
                    <Badge variant="bearish" icon={<AlertTriangle size={10} />}>
                      REVIEW
                    </Badge>
                  ) : (
                    <Badge variant="bearish">{doc.processingStatus}</Badge>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      icon={<Eye size={12} />}
                      onClick={() => onInspectDocument(doc)}
                      id={`inspect-doc-btn-${doc.id}`}
                    >
                      Pages
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<Trash2 size={12} />}
                      onClick={() => onRemoveDocument(doc.id)}
                      id={`remove-doc-btn-${doc.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
