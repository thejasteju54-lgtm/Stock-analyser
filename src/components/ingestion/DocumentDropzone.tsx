import React, { useState, useRef } from 'react';
import { Upload, FileUp, ShieldAlert } from 'lucide-react';
import { DocumentType } from '../../domain/ingestion/DocumentTypes';
import { DocumentIngestionEngine } from '../../domain/ingestion/DocumentIngestionEngine';

interface DocumentDropzoneProps {
  onFileIngested: (
    file: File,
    manualType?: DocumentType,
    customSource?: string
  ) => Promise<void>;
  isProcessing: boolean;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  onFileIngested,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedManualType, setSelectedManualType] = useState<DocumentType | ''>('');
  const [customSource, setCustomSource] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processSelectedFile = async (file: File) => {
    setValidationError(null);

    // Validate file
    const validation = DocumentIngestionEngine.validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.errors.join(' '));
      return;
    }

    try {
      await onFileIngested(
        file,
        selectedManualType ? (selectedManualType as DocumentType) : undefined,
        customSource.trim() || undefined
      );
      // Reset optional manual overrides
      setSelectedManualType('');
      setCustomSource('');
    } catch (err: any) {
      setValidationError(err?.message || 'Failed to ingest document.');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processSelectedFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      id="document-dropzone-container"
    >
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragOver ? '2px dashed var(--color-brand)' : '1px dashed var(--border-subtle)',
          borderRadius: '4px',
          padding: '24px 20px',
          background: isDragOver ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-surface-raised)',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
        id="ingestion-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="ingestion-file-input"
          disabled={isProcessing}
        />

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isDragOver ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-sunken)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDragOver ? 'var(--color-brand)' : 'var(--text-secondary)',
          }}
        >
          {isProcessing ? <FileUp size={20} className="animate-spin" /> : <Upload size={20} />}
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
            {isProcessing
              ? 'Processing & Verifying Document...'
              : 'Drag & Drop Research Documents or Click to Browse'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Supported Formats: <strong>PDF</strong> (Annual Reports, Concalls, Presentations), <strong>PNG/JPG/WEBP</strong> (Screenshots, Charts), <strong>TXT/CSV</strong> • Max 50MB
          </div>
        </div>
      </div>

      {/* Manual Classification & Source Hints */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '10px 14px',
          borderRadius: '4px',
          fontSize: '11px',
        }}
      >
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Optional Override:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="manual-doc-type-select" style={{ color: 'var(--text-muted)' }}>Type:</label>
          <select
            id="manual-doc-type-select"
            value={selectedManualType}
            onChange={(e) => setSelectedManualType(e.target.value as DocumentType)}
            style={{
              background: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '11px',
              outline: 'none',
            }}
          >
            <option value="">Auto-Detect via Classifier</option>
            <option value="ANNUAL_REPORT">Annual Report (AR)</option>
            <option value="FINANCIAL_STATEMENTS">Financial Statements / Results</option>
            <option value="MDA">MD&A (Management Discussion)</option>
            <option value="CONCALL_TRANSCRIPT">Concall Earnings Transcript</option>
            <option value="INVESTOR_PRESENTATION">Investor Presentation</option>
            <option value="SHAREHOLDING_PATTERN">Shareholding Pattern</option>
            <option value="SCREENER_SCREENSHOT">Screener.in Screenshot</option>
            <option value="TECHNICAL_CHART">Technical Chart Screenshot</option>
            <option value="OTHER">Other Research Material</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          <label htmlFor="custom-source-input" style={{ color: 'var(--text-muted)' }}>Source:</label>
          <input
            id="custom-source-input"
            type="text"
            placeholder="e.g. BSE India, Company Investor Relations, Screener.in"
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-surface-sunken)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f87171',
            fontSize: '12px',
          }}
          id="dropzone-error-banner"
        >
          <ShieldAlert size={16} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
