import React, { useState } from 'react';
import { X, FileText, AlertTriangle } from 'lucide-react';
import { IngestedDocument, DocumentPage } from '../../domain/ingestion/DocumentTypes';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface DocumentPageInspectorModalProps {
  document: IngestedDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPageInspectorModal: React.FC<DocumentPageInspectorModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  if (!isOpen || !document) return null;

  const pages = document.pages || [];
  const activePage: DocumentPage | undefined = pages[selectedPageIndex] || pages[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      id="page-inspector-modal-backdrop"
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
        id="page-inspector-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-surface-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={16} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Evidence Page Inspector — {document.filename}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Doc ID: <span className="tabular-nums">{document.id}</span> • Hash: {document.fileHash.slice(0, 16)}...
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="cyan">{document.documentType}</Badge>
            <Badge variant={document.provenanceSourceType === 'SCREENSHOT_DERIVED' ? 'bearish' : 'neutral'}>
              {document.provenanceSourceType}
            </Badge>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
              id="close-inspector-btn"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: '400px' }}>
          {/* Left Sidebar: Page List */}
          <div
            style={{
              width: '220px',
              borderRight: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-sunken)',
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
            id="inspector-page-list"
          >
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 6px', fontWeight: 700 }}>
              Pages ({pages.length})
            </div>
            {pages.map((p, idx) => {
              const isSelected = idx === selectedPageIndex;
              return (
                <button
                  key={p.pageNumber}
                  onClick={() => setSelectedPageIndex(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '2px',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid var(--color-brand)' : '1px solid transparent',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: isSelected ? '#f8fafc' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  id={`inspector-page-btn-${p.pageNumber}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong>Page {p.pageNumber}</strong>
                    {p.ocrStatus === 'COMPLETE' && (
                      <span style={{ fontSize: '10px', color: '#10b981' }}>OCR {p.ocrConfidence?.toFixed(0)}%</span>
                    )}
                    {p.ocrStatus === 'REQUIRES_REVIEW' && (
                      <span style={{ fontSize: '10px', color: '#f59e0b' }}>Review</span>
                    )}
                    {p.ocrStatus === 'NOT_REQUIRED' && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Text</span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {p.isScanned ? 'Scanned / Image' : 'Machine Text Stream'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Area: Page Text & OCR Breakdown */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activePage ? (
              <>
                {/* Page Metadata Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-surface-raised)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Page Number: </span>
                    <strong>{activePage.pageNumber} of {pages.length}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>OCR Status:</span>
                    {activePage.ocrStatus === 'NOT_REQUIRED' && (
                      <Badge variant="neutral">NOT REQUIRED (Machine Text)</Badge>
                    )}
                    {activePage.ocrStatus === 'COMPLETE' && (
                      <Badge variant="bullish">COMPLETE ({activePage.ocrConfidence?.toFixed(1)}%)</Badge>
                    )}
                    {activePage.ocrStatus === 'REQUIRES_REVIEW' && (
                      <Badge variant="bearish">REQUIRES REVIEW ({activePage.ocrConfidence?.toFixed(1)}%)</Badge>
                    )}
                    {activePage.ocrStatus === 'FAILED' && (
                      <Badge variant="bearish">OCR FAILED</Badge>
                    )}
                  </div>
                </div>

                {/* Page Warning / Error if low confidence */}
                {activePage.ocrErrorMessage && (
                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#f59e0b',
                      fontSize: '11px',
                    }}
                  >
                    <AlertTriangle size={14} />
                    <span>{activePage.ocrErrorMessage}</span>
                  </div>
                )}

                {/* Extracted Text Content Box */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Extracted Text Layer Preview:
                  </div>
                  <pre
                    style={{
                      background: 'var(--bg-surface-sunken)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      padding: '12px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                    id="page-extracted-text-preview"
                  >
                    {activePage.ocrText || activePage.textPreview || 'No readable text content on this page.'}
                  </pre>
                </div>

                {/* Provenance Trace Box */}
                <div
                  style={{
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Provenance & Evidence Trail
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Document ID:</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{document.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Source Type:</span>
                    <span>{document.provenanceSourceType} ({document.source})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Page Boundary:</span>
                    <span>Page {activePage.pageNumber}</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No pages found in this document.</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg-surface-raised)',
          }}
        >
          <Button size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
