import { IngestedDocument } from './DocumentTypes';

export interface TwoYearAuditReport {
  isReadyForTwoYearModel: boolean;
  fy0Document?: IngestedDocument;
  fy1Document?: IngestedDocument;
  detectedFiscalYears: string[];
  hasDuplicateYears: boolean;
  hasUnidentifiedPeriods: boolean;
  hasCompanyMismatch: boolean;
  warnings: string[];
  statusMessage: string;
}

export class TwoYearReportAudit {
  /**
   * Audits all uploaded documents in a research project to verify 2-year annual report baseline readiness.
   */
  public static audit(params: {
    documents: IngestedDocument[];
    targetSymbol: string;
    targetLegalName: string;
  }): TwoYearAuditReport {
    const { documents, targetSymbol } = params;

    // Filter only annual reports
    const annualReports = documents.filter(
      (doc) => doc.documentType === 'ANNUAL_REPORT' && doc.processingStatus !== 'FAILED'
    );

    const warnings: string[] = [];
    const detectedYears: string[] = [];
    const yearCounts: Record<string, IngestedDocument[]> = {};
    let hasUnidentifiedPeriods = false;
    let hasCompanyMismatch = false;

    annualReports.forEach((doc) => {
      // Check company verification
      if (!doc.companyVerification.isConsistent) {
        hasCompanyMismatch = true;
        warnings.push(
          `Document "${doc.filename}" company identity could not be verified against target ${targetSymbol}.`
        );
      }

      // Check period
      if (doc.reportingPeriod.isIdentifiable && doc.reportingPeriod.fiscalYear) {
        const fy = doc.reportingPeriod.fiscalYear.toUpperCase();
        if (!yearCounts[fy]) {
          yearCounts[fy] = [];
          detectedYears.push(fy);
        }
        yearCounts[fy].push(doc);
      } else {
        hasUnidentifiedPeriods = true;
        warnings.push(
          `Document "${doc.filename}" reporting period (Fiscal Year) could not be deterministically identified.`
        );
      }
    });

    // Check duplicate years
    let hasDuplicateYears = false;
    Object.entries(yearCounts).forEach(([fy, docs]) => {
      if (docs.length > 1) {
        hasDuplicateYears = true;
        warnings.push(
          `Multiple annual reports detected for identical period ${fy}: [${docs.map((d) => d.filename).join(', ')}].`
        );
      }
    });

    // Sort detected fiscal years descending (e.g. FY24, FY23)
    const sortedYears = [...detectedYears].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    let fy0Doc: IngestedDocument | undefined;
    let fy1Doc: IngestedDocument | undefined;

    if (sortedYears.length >= 1) {
      fy0Doc = yearCounts[sortedYears[0]]?.[0];
    }
    if (sortedYears.length >= 2) {
      fy1Doc = yearCounts[sortedYears[1]]?.[0];
    }

    const isReadyForTwoYearModel =
      annualReports.length >= 2 &&
      sortedYears.length >= 2 &&
      !hasDuplicateYears &&
      !hasUnidentifiedPeriods;

    let statusMessage = '';
    if (isReadyForTwoYearModel) {
      statusMessage = `Two-Year Baseline Verified: ${sortedYears[1]} (Base) & ${sortedYears[0]} (Current). Ready for comparative extraction.`;
    } else if (annualReports.length === 0) {
      statusMessage = 'No Annual Reports uploaded yet. Upload at least 2 consecutive Annual Reports (e.g. FY23 & FY24).';
    } else if (annualReports.length === 1) {
      statusMessage = `1 Annual Report present (${sortedYears[0] || 'Unidentified'}). Upload a second consecutive Annual Report for 2-year comparative analysis.`;
    } else if (hasDuplicateYears) {
      statusMessage = 'Warning: Conflicting duplicate annual reports for the same fiscal year detected.';
    } else {
      statusMessage = 'Two-year annual report baseline is incomplete or has unverified reporting periods.';
    }

    return {
      isReadyForTwoYearModel,
      fy0Document: fy0Doc,
      fy1Document: fy1Doc,
      detectedFiscalYears: sortedYears,
      hasDuplicateYears,
      hasUnidentifiedPeriods,
      hasCompanyMismatch,
      warnings,
      statusMessage,
    };
  }
}
