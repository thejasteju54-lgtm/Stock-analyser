import { describe, it, expect } from 'vitest';
import { FinancialFactExtractor } from '../../src/domain/extraction/FinancialFactExtractor';
import { IngestedDocument } from '../../src/domain/ingestion/DocumentTypes';

describe('Phase 4 — FinancialFactExtractor & Statement Parsing', () => {
  const sampleARFY24: IngestedDocument = {
    id: 'doc_tatamotors_ar_fy24',
    projectId: 'proj_tatamotors_test',
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
  };

  const sampleShareholding: IngestedDocument = {
    id: 'doc_tatamotors_shp_fy24',
    projectId: 'proj_tatamotors_test',
    filename: 'TATAMOTORS_Shareholding_Pattern_Q4FY24.pdf',
    originalFilename: 'TATAMOTORS_Shareholding_Pattern_Q4FY24.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 350000,
    fileHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    documentType: 'SHAREHOLDING_PATTERN',
    classificationConfidence: 98,
    isClassificationManualOverride: false,
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    source: 'BSE/NSE Shareholding Filing',
    reportingPeriod: { fiscalYear: 'FY24', quarter: 'Q4', isIdentifiable: true, periodType: 'QUARTERLY', rawPeriodString: 'Q4FY24' },
    companyVerification: { isConsistent: true, targetSymbol: 'TATAMOTORS' },
    processingStatus: 'READY',
    extractionStatus: 'PENDING',
    ocrStatusSummary: { required: false, pageCount: 2, completedPages: 0, scannedPageCount: 0, machineReadablePageCount: 2, overallTier: 'NONE' },
    pages: [],
    validationErrors: [],
    uploadedAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };

  const sampleScreenerScreenshot: IngestedDocument = {
    id: 'doc_tatamotors_screener',
    projectId: 'proj_tatamotors_test',
    filename: 'Screener_TATAMOTORS_Ratios.png',
    originalFilename: 'Screener_TATAMOTORS_Ratios.png',
    mimeType: 'image/png',
    sizeBytes: 450000,
    fileHash: 'c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012',
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
  };

  it('1. Income Statement: extracts Revenue, EBITDA, Depreciation, EBIT, PBT, Tax, PAT, and EPS', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleARFY24],
    });

    const isFacts = result.facts.filter((f) => f.category === 'INCOME_STATEMENT');
    expect(isFacts.length).toBeGreaterThanOrEqual(10);

    const rev = isFacts.find((f) => f.metric === 'REVENUE');
    expect(rev).toBeDefined();
    expect(rev?.value).toBe(437928);
    expect(rev?.accountingBasis).toBe('CONSOLIDATED');
    expect(rev?.confidence).toBeGreaterThan(90);

    const pat = isFacts.find((f) => f.metric === 'PAT');
    expect(pat?.value).toBe(31807);

    const eps = isFacts.find((f) => f.metric === 'EPS');
    expect(eps?.value).toBe(82.89);
    expect(eps?.unit).toBe('PER_SHARE');
  });

  it('2. Balance Sheet: extracts Cash, Investments, Receivables, Inventory, Payables, Debt, and Net Worth', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleARFY24],
    });

    const bsFacts = result.facts.filter((f) => f.category === 'BALANCE_SHEET');
    expect(bsFacts.length).toBeGreaterThanOrEqual(8);

    const cash = bsFacts.find((f) => f.metric === 'CASH_AND_EQUIVALENTS');
    expect(cash?.value).toBe(18942);

    const debt = bsFacts.find((f) => f.metric === 'TOTAL_DEBT');
    expect(debt?.value).toBe(104764);

    const netWorth = bsFacts.find((f) => f.metric === 'NET_WORTH');
    expect(netWorth?.value).toBe(85210);
  });

  it('3. Cash Flow: extracts CFO, Capex, CFI, CFF, and Interest Paid', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleARFY24],
    });

    const cfFacts = result.facts.filter((f) => f.category === 'CASH_FLOW');
    expect(cfFacts.length).toBeGreaterThanOrEqual(5);

    const cfo = cfFacts.find((f) => f.metric === 'CFO');
    expect(cfo?.value).toBe(67120);

    const capex = cfFacts.find((f) => f.metric === 'CAPEX');
    expect(capex?.value).toBe(24300);
  });

  it('4. Ownership & Shareholding: extracts Promoter Holding, Pledge, Institutional, and Public shares', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleShareholding],
    });

    const ownFacts = result.facts.filter((f) => f.category === 'OWNERSHIP');
    expect(ownFacts.length).toBe(4);

    const promoter = ownFacts.find((f) => f.metric === 'PROMOTER_HOLDING');
    expect(promoter?.value).toBe(46.36);
    expect(promoter?.unit).toBe('PERCENT');

    const pledge = ownFacts.find((f) => f.metric === 'PROMOTER_PLEDGE');
    expect(pledge?.value).toBe(0.0);
  });

  it('5. Segment Data: extracts commercial vehicles, passenger vehicles, and JLR segment revenues', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleARFY24],
    });

    const segFacts = result.facts.filter((f) => f.category === 'SEGMENT_DATA');
    expect(segFacts.length).toBe(3);

    const jlr = segFacts.find((f) => f.segmentName === 'Jaguar Land Rover');
    expect(jlr?.value).toBe(290000);
  });

  it('6. Screenshot Extraction: marks facts as SCREENSHOT_DERIVED with visible values only', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleScreenerScreenshot],
    });

    expect(result.facts.length).toBe(3);
    const ssRev = result.facts.find((f) => f.metric === 'REVENUE');
    expect(ssRev?.provenanceSourceType).toBe('SCREENSHOT_DERIVED');
    expect(ssRev?.extractionMethod).toBe('SCREENSHOT_DERIVED');
    expect(ssRev?.confidence).toBe(88); // Lower confidence than primary audited filing
  });

  it('7. Provenance: establishes stable pageId and citations for all extracted facts', () => {
    const result = FinancialFactExtractor.extractFromDocuments({
      projectId: 'proj_tatamotors_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documents: [sampleARFY24],
    });

    for (const fact of result.facts) {
      expect(fact.sourceReference).toBeDefined();
      expect(fact.sourceReference.documentId).toBe(sampleARFY24.id);
      expect(fact.sourceReference.pageId).toBeDefined();
      expect(fact.sourceReference.pageId?.startsWith(sampleARFY24.id)).toBe(true);
      expect(fact.sourceReference.rawSnippet).toBeDefined();
    }
  });
});
