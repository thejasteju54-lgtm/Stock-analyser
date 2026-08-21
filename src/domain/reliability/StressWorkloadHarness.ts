/**
 * StressWorkloadHarness.ts
 * Phase 17 — Synthetic Workload & Fault Injection Harness.
 * Generates deterministic large documents (300+ pages), multi-document bundles,
 * image/OCR payloads, and partial extraction states for stress and resilience testing.
 */

import { IngestedDocument, DocumentPage, DocumentType } from '../ingestion/DocumentTypes';
import { FinancialFact } from '../extraction/FinancialFactTypes';
import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';

export class StressWorkloadHarness {
  /**
   * Generates a realistic multi-page annual report document structure with page-level text and tables.
   */
  public static generateSyntheticAnnualReport(params: {
    documentId: string;
    symbol: string;
    totalPages: number;
    financialStartPage: number;
  }): {
    document: IngestedDocument;
    facts: FinancialFact[];
  } {
    const { documentId, symbol, totalPages, financialStartPage } = params;
    const pages: DocumentPage[] = [];
    const facts: FinancialFact[] = [];

    const fileContent = `Annual Report for ${symbol} with ${totalPages} pages.`;
    const fileHash = CanonicalJsonSerializer.sha256(fileContent);

    for (let p = 1; p <= totalPages; p++) {
      let pageText = `Page ${p} of ${totalPages} - ${symbol} Annual Report FY24. MD&A and statutory disclosures.`;
      const isFinancialPage = p >= financialStartPage && p <= financialStartPage + 10;

      if (isFinancialPage) {
        pageText += `\nRevenue from Operations: 10000 Cr\nProfit After Tax: 2000 Cr\nOperating Cash Flow: 2200 Cr\nTotal Assets: 25000 Cr`;

        if (p === financialStartPage) {
          facts.push({
            factId: `fact_rev_${p}`,
            projectId: `proj_${symbol}`,
            companyId: `comp_${symbol}`,
            companySymbol: symbol,
            documentId,
            documentName: `${symbol}_AR_FY24_${totalPages}pages.pdf`,
            pageNumber: p,
            category: 'INCOME_STATEMENT',
            metric: 'REVENUE',
            metricLabel: 'Revenue from Operations',
            value: 10000,
            originalValue: 10000,
            unit: 'INR_CRORE',
            originalUnit: 'INR_CRORE',
            normalizedUnit: 'INR_CRORE',
            originalCurrency: 'INR',
            normalizedCurrency: 'INR',
            reportingPeriod: {
              fiscalYear: 'FY24',
              periodType: 'ANNUAL',
              isIdentifiable: true,
            },
            accountingBasis: 'CONSOLIDATED',
            availabilityStatus: 'AVAILABLE',
            extractionMethod: 'STRUCTURED_TABLE',
            provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
            sourceReference: {
              documentId,
              documentTitle: `${symbol}_AR_FY24_${totalPages}pages.pdf`,
              pageNumber: p,
            },
            confidence: 98,
            confidenceTier: 'HIGH',
            verificationStatus: 'VERIFIED',
            extractedAt: new Date().toISOString(),
          });
        }
      }

      pages.push({
        pageNumber: p,
        hasText: true,
        isScanned: false,
        textLength: pageText.length,
        textPreview: pageText.substring(0, 100),
        ocrStatus: 'NOT_REQUIRED',
        ocrApplied: false,
      });
    }

    const document: IngestedDocument = {
      id: documentId,
      projectId: `proj_${symbol}`,
      filename: `${symbol}_AR_FY24_${totalPages}pages.pdf`,
      originalFilename: `${symbol}_AR_FY24_${totalPages}pages.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: totalPages * 35000,
      fileHash,
      documentType: 'ANNUAL_REPORT' as DocumentType,
      classificationConfidence: 98,
      isClassificationManualOverride: false,
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      source: 'Statutory Filing',
      reportingPeriod: {
        fiscalYear: 'FY24',
        periodType: 'ANNUAL',
        isIdentifiable: true,
      },
      companyVerification: {
        isConsistent: true,
        targetSymbol: symbol,
        detectedSymbol: symbol,
      },
      processingStatus: 'READY',
      extractionStatus: 'COMPLETE',
      ocrStatusSummary: {
        required: false,
        pageCount: totalPages,
        completedPages: totalPages,
        scannedPageCount: 0,
        machineReadablePageCount: totalPages,
        overallTier: 'NONE',
      },
      pages,
      validationErrors: [],
      uploadedAt: new Date().toISOString(),
    };

    return { document, facts };
  }

  /**
   * Generates a bundle of N distinct documents for multi-document ingestion stress testing.
   */
  public static generateMultiDocumentBundle(symbol: string, count: number): IngestedDocument[] {
    const bundle: IngestedDocument[] = [];

    for (let i = 1; i <= count; i++) {
      const doc = this.generateSyntheticAnnualReport({
        documentId: `doc_${symbol}_${i}`,
        symbol,
        totalPages: 25 + i * 5,
        financialStartPage: 15,
      });
      bundle.push(doc.document);
    }

    return bundle;
  }

  /**
   * Simulates partial extraction scenario where specific financial statements are missing.
   */
  public static generatePartialExtractionScenario(
    symbol: string,
    omittedStatement: 'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'CASH_FLOW'
  ): FinancialFact[] {
    const allFacts: FinancialFact[] = [
      {
        factId: 'fact_rev',
        projectId: `proj_${symbol}`,
        companyId: `comp_${symbol}`,
        companySymbol: symbol,
        documentId: 'doc_1',
        documentName: 'AR.pdf',
        pageNumber: 10,
        category: 'INCOME_STATEMENT',
        metric: 'REVENUE',
        metricLabel: 'Revenue',
        value: 50000,
        originalValue: 50000,
        unit: 'INR_CRORE',
        originalUnit: 'INR_CRORE',
        normalizedUnit: 'INR_CRORE',
        originalCurrency: 'INR',
        normalizedCurrency: 'INR',
        reportingPeriod: { fiscalYear: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
        accountingBasis: 'CONSOLIDATED',
        availabilityStatus: 'AVAILABLE',
        extractionMethod: 'STRUCTURED_TABLE',
        provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
        sourceReference: { documentId: 'doc_1', documentTitle: 'AR.pdf', pageNumber: 10 },
        confidence: 95,
        confidenceTier: 'HIGH',
        verificationStatus: 'VERIFIED',
        extractedAt: new Date().toISOString(),
      },
      {
        factId: 'fact_pat',
        projectId: `proj_${symbol}`,
        companyId: `comp_${symbol}`,
        companySymbol: symbol,
        documentId: 'doc_1',
        documentName: 'AR.pdf',
        pageNumber: 11,
        category: 'INCOME_STATEMENT',
        metric: 'PAT',
        metricLabel: 'Profit After Tax',
        value: 6000,
        originalValue: 6000,
        unit: 'INR_CRORE',
        originalUnit: 'INR_CRORE',
        normalizedUnit: 'INR_CRORE',
        originalCurrency: 'INR',
        normalizedCurrency: 'INR',
        reportingPeriod: { fiscalYear: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
        accountingBasis: 'CONSOLIDATED',
        availabilityStatus: 'AVAILABLE',
        extractionMethod: 'STRUCTURED_TABLE',
        provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
        sourceReference: { documentId: 'doc_1', documentTitle: 'AR.pdf', pageNumber: 11 },
        confidence: 95,
        confidenceTier: 'HIGH',
        verificationStatus: 'VERIFIED',
        extractedAt: new Date().toISOString(),
      },
      {
        factId: 'fact_equity',
        projectId: `proj_${symbol}`,
        companyId: `comp_${symbol}`,
        companySymbol: symbol,
        documentId: 'doc_1',
        documentName: 'AR.pdf',
        pageNumber: 20,
        category: 'BALANCE_SHEET',
        metric: 'EQUITY',
        metricLabel: 'Net Worth',
        value: 30000,
        originalValue: 30000,
        unit: 'INR_CRORE',
        originalUnit: 'INR_CRORE',
        normalizedUnit: 'INR_CRORE',
        originalCurrency: 'INR',
        normalizedCurrency: 'INR',
        reportingPeriod: { fiscalYear: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
        accountingBasis: 'CONSOLIDATED',
        availabilityStatus: 'AVAILABLE',
        extractionMethod: 'STRUCTURED_TABLE',
        provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
        sourceReference: { documentId: 'doc_1', documentTitle: 'AR.pdf', pageNumber: 20 },
        confidence: 95,
        confidenceTier: 'HIGH',
        verificationStatus: 'VERIFIED',
        extractedAt: new Date().toISOString(),
      },
      {
        factId: 'fact_cfo',
        projectId: `proj_${symbol}`,
        companyId: `comp_${symbol}`,
        companySymbol: symbol,
        documentId: 'doc_1',
        documentName: 'AR.pdf',
        pageNumber: 30,
        category: 'CASH_FLOW',
        metric: 'CFO',
        metricLabel: 'Cash from Operations',
        value: 7000,
        originalValue: 7000,
        unit: 'INR_CRORE',
        originalUnit: 'INR_CRORE',
        normalizedUnit: 'INR_CRORE',
        originalCurrency: 'INR',
        normalizedCurrency: 'INR',
        reportingPeriod: { fiscalYear: 'FY24', periodType: 'ANNUAL', isIdentifiable: true },
        accountingBasis: 'CONSOLIDATED',
        availabilityStatus: 'AVAILABLE',
        extractionMethod: 'STRUCTURED_TABLE',
        provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
        sourceReference: { documentId: 'doc_1', documentTitle: 'AR.pdf', pageNumber: 30 },
        confidence: 95,
        confidenceTier: 'HIGH',
        verificationStatus: 'VERIFIED',
        extractedAt: new Date().toISOString(),
      },
    ];

    if (omittedStatement === 'INCOME_STATEMENT') {
      return allFacts.filter((f) => f.category !== 'INCOME_STATEMENT');
    }
    if (omittedStatement === 'BALANCE_SHEET') {
      return allFacts.filter((f) => f.category !== 'BALANCE_SHEET');
    }
    if (omittedStatement === 'CASH_FLOW') {
      return allFacts.filter((f) => f.category !== 'CASH_FLOW');
    }

    return allFacts;
  }
}
