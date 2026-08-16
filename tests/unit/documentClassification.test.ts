import { describe, it, expect } from 'vitest';
import { DocumentClassifier } from '../../src/domain/ingestion/DocumentClassifier';

describe('Phase 3 — Deterministic Document Classifier', () => {
  it('classifies Annual Reports based on filename and content markers', () => {
    const res1 = DocumentClassifier.classify({
      filename: 'TATAMOTORS_Annual_Report_2024.pdf',
      mimeType: 'application/pdf',
    });
    expect(res1.documentType).toBe('ANNUAL_REPORT');
    expect(res1.requiresReview).toBe(false);

    const res2 = DocumentClassifier.classify({
      filename: 'HDFCBANK_AR24_Integrated_Report.pdf',
      mimeType: 'application/pdf',
    });
    expect(res2.documentType).toBe('ANNUAL_REPORT');
  });

  it('classifies Concall Transcripts', () => {
    const res = DocumentClassifier.classify({
      filename: 'INFY_Q4FY24_Earnings_Call_Transcript.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('CONCALL_TRANSCRIPT');
    expect(res.requiresReview).toBe(false);
  });

  it('classifies Investor Presentations', () => {
    const res = DocumentClassifier.classify({
      filename: 'RELIANCE_Q3_Investor_Presentation_Deck.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('INVESTOR_PRESENTATION');
  });

  it('classifies Standalone/Consolidated Financial Statements', () => {
    const res = DocumentClassifier.classify({
      filename: 'TCS_Audited_Financial_Results_Q4.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('FINANCIAL_STATEMENTS');
  });

  it('classifies Management Discussion & Analysis (MD&A)', () => {
    const res = DocumentClassifier.classify({
      filename: 'LNT_MDA_Management_Discussion_Analysis.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('MDA');
  });

  it('classifies Shareholding Patterns', () => {
    const res = DocumentClassifier.classify({
      filename: 'ITC_Shareholding_Pattern_June2024.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('SHAREHOLDING_PATTERN');
  });

  it('classifies Screener screenshots', () => {
    const res = DocumentClassifier.classify({
      filename: 'screener_tatamotors_10yr_ratios.png',
      mimeType: 'image/png',
    });
    expect(res.documentType).toBe('SCREENER_SCREENSHOT');
  });

  it('classifies Technical Charts', () => {
    const res = DocumentClassifier.classify({
      filename: 'tradingview_weekly_candlestick_chart.png',
      mimeType: 'image/png',
    });
    expect(res.documentType).toBe('TECHNICAL_CHART');
  });

  it('reverts to UNKNOWN / REQUIRES_REVIEW when classification is ambiguous without guessing', () => {
    const res = DocumentClassifier.classify({
      filename: 'random_unlabeled_document_scan_123.pdf',
      mimeType: 'application/pdf',
    });
    expect(res.documentType).toBe('UNKNOWN');
    expect(res.requiresReview).toBe(true);
  });
});
