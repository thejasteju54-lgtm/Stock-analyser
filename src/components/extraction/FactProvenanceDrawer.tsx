import React from 'react';
import { FinancialFact } from '../../domain/extraction/FinancialFactTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { FileText, X, BookOpen, ShieldCheck } from 'lucide-react';

interface FactProvenanceDrawerProps {
  fact: FinancialFact | null;
  onClose: () => void;
}

export const FactProvenanceDrawer: React.FC<FactProvenanceDrawerProps> = ({ fact, onClose }) => {
  if (!fact) return null;

  const isScreenshot = fact.provenanceSourceType === 'SCREENSHOT_DERIVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-terminal-dark border border-terminal-border rounded shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border bg-terminal-card/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-accent-cyan" />
            <div>
              <h2 className="text-sm font-semibold text-terminal-text tracking-wide uppercase">
                Evidence Provenance Audit
              </h2>
              <p className="text-[11px] text-terminal-muted font-mono">
                {fact.factId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-muted hover:text-terminal-text p-1 rounded hover:bg-terminal-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Main Metric Banner */}
          <div className="bg-terminal-card/80 border border-terminal-border p-3 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-terminal-muted uppercase tracking-wider">
                {fact.category.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant={fact.accountingBasis === 'CONSOLIDATED' ? 'cyan' : 'warning'}>
                  {fact.accountingBasis}
                </Badge>
                <Badge variant={isScreenshot ? 'neutral' : 'bullish'}>
                  {isScreenshot ? 'SCREENSHOT EVIDENCE' : 'PRIMARY FILING'}
                </Badge>
              </div>
            </div>
            <div className="text-base font-bold text-terminal-text">
              {fact.metricLabel} ({fact.metric})
            </div>
            {fact.segmentName && (
              <div className="text-[11px] text-accent-cyan mt-0.5">
                Segment: {fact.segmentName}
              </div>
            )}
          </div>

          {/* Metric Values Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 bg-terminal-dark/60 border-terminal-border">
              <span className="text-[10px] text-terminal-muted uppercase block mb-1">
                Normalized Fact Value
              </span>
              <div className="text-lg font-bold text-accent-cyan">
                {fact.value !== undefined ? `₹${fact.value.toLocaleString()} Cr` : 'N/A'}
              </div>
              <span className="text-[10px] text-terminal-muted block mt-0.5">
                Canonical Unit: {fact.normalizedUnit} ({fact.normalizedCurrency})
              </span>
            </Card>

            <Card className="p-3 bg-terminal-dark/60 border-terminal-border">
              <span className="text-[10px] text-terminal-muted uppercase block mb-1">
                Originally Reported Value
              </span>
              <div className="text-lg font-bold text-terminal-text">
                {fact.originalValue !== undefined ? `${fact.originalValue.toLocaleString()}` : 'N/A'}
              </div>
              <span className="text-[10px] text-terminal-muted block mt-0.5">
                Reported Unit: {fact.originalUnit} ({fact.originalCurrency})
              </span>
            </Card>
          </div>

          {/* Source Reference & Provenance Anchor */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold text-terminal-muted uppercase tracking-wider flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Source Document Citation</span>
            </h3>
            <div className="bg-terminal-card/40 border border-terminal-border rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-terminal-muted">Document:</span>
                <span className="text-terminal-text font-semibold">{fact.documentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-terminal-muted">Stable Document ID:</span>
                <span className="text-terminal-text text-[11px] font-mono">{fact.documentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-terminal-muted">Stable Page ID:</span>
                <span className="text-terminal-text text-[11px] font-mono">{fact.pageId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-terminal-muted">Filing Page Number:</span>
                <span className="text-terminal-text">{fact.pageNumber ? `Page ${fact.pageNumber}` : 'N/A (Screenshot)'}</span>
              </div>
              {fact.sourceReference.tableHeader && (
                <div className="flex items-center justify-between">
                  <span className="text-terminal-muted">Table / Section:</span>
                  <span className="text-accent-cyan">{fact.sourceReference.tableHeader}</span>
                </div>
              )}
            </div>
          </div>

          {/* Raw Text Snippet */}
          {fact.sourceReference.rawSnippet && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-semibold text-terminal-muted uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-terminal-muted" />
                <span>Extracted Text Snippet</span>
              </h3>
              <div className="bg-terminal-dark border border-terminal-border rounded p-3 text-terminal-text font-mono text-[11px] leading-relaxed bg-black/40">
                "{fact.sourceReference.rawSnippet}"
              </div>
            </div>
          )}

          {/* Extraction Integrity & Confidence */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-terminal-card/30 border border-terminal-border p-2 rounded text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Method</span>
              <span className="text-[11px] text-terminal-text font-semibold mt-0.5 block">
                {fact.extractionMethod}
              </span>
            </div>
            <div className="bg-terminal-card/30 border border-terminal-border p-2 rounded text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Confidence</span>
              <span className="text-[11px] text-status-success font-semibold mt-0.5 block">
                {fact.confidence}% ({fact.confidenceTier})
              </span>
            </div>
            <div className="bg-terminal-card/30 border border-terminal-border p-2 rounded text-center">
              <span className="text-[9px] text-terminal-muted uppercase block">Verification</span>
              <span className="text-[11px] text-accent-cyan font-semibold mt-0.5 block">
                {fact.verificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-terminal-border bg-terminal-card/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-terminal-border hover:bg-terminal-border/80 text-terminal-text rounded text-xs font-mono font-medium transition-colors"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
