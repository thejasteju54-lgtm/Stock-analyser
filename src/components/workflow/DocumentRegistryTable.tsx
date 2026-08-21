/**
 * DocumentRegistryTable.tsx
 * Phase 15 — Document Registry & Versioning Ledger UI Component.
 */

import React from 'react';
import { IngestedDocument } from '../../domain/ingestion/DocumentTypes';
import { FileText, Shield, Hash, CheckCircle, AlertTriangle } from 'lucide-react';

interface DocumentRegistryTableProps {
  documents: IngestedDocument[];
  onUploadClick?: () => void;
}

export const DocumentRegistryTable: React.FC<DocumentRegistryTableProps> = ({ documents, onUploadClick }) => {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Document Registry & Version Ledger ({documents.length})
          </span>
        </div>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            style={{
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Ingest New Document
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
          No documents registered in this research workspace yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px' }}>Document Name</th>
                <th style={{ padding: '8px 10px' }}>Type</th>
                <th style={{ padding: '8px 10px' }}>Period</th>
                <th style={{ padding: '8px 10px' }}>Source Tier</th>
                <th style={{ padding: '8px 10px' }}>Content Hash (SHA-256)</th>
                <th style={{ padding: '8px 10px' }}>Quality</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={doc.id || idx} style={{ borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: '#f8fafc' }}>
                    {doc.filename || (doc as any).name || 'Document'}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '3px', background: '#1e293b', color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>
                      {doc.documentType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', color: '#94a3b8' }}>
                    {doc.reportingPeriod?.fiscalYear || doc.reportingPeriod?.rawPeriodString || 'N/A'}
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '10px', fontWeight: 600 }}>
                      <Shield size={12} />
                      {doc.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED' ? 'Tier 1 Primary' : 'Tier 2 Secondary'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px', fontFamily: 'monospace', color: '#64748b' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Hash size={11} />
                      {(doc.fileHash || (doc as any).contentHash || 'a1b2c3d4e5f67890').substring(0, 12)}...
                    </span>
                  </td>
                  <td style={{ padding: '10px 10px' }}>
                    {doc.processingStatus === 'FAILED' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 600 }}>
                        <AlertTriangle size={12} /> Invalid
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 600 }}>
                        <CheckCircle size={12} /> Valid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
