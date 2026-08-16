import { ReportingPeriod, CompanyVerificationResult } from './DocumentTypes';

export class PeriodDetector {
  /**
   * Deterministically extracts reporting periods from filename and optional text preview.
   */
  public static detectPeriod(filename: string, textSample?: string): ReportingPeriod {
    const target = ` ${filename} ${textSample ? textSample.slice(0, 800) : ''} `.toUpperCase();

    // 1. Quarterly patterns e.g. "Q1 FY24", "Q3FY2024", "Q2_2024", "Q4 24", "Reliance_Q3FY24_Results.pdf"
    const quarterlyMatch = target.match(/(?:^|[\s_./-])(Q[1-4])[\s_./-]?(?:FY)?[\s_./-]?(20\d{2}|\d{2})(?:[\s_./-]|$)/i);
    if (quarterlyMatch) {
      const quarter = quarterlyMatch[1].toUpperCase() as 'Q1' | 'Q2' | 'Q3' | 'Q4';
      let yearDigits = quarterlyMatch[2];
      if (yearDigits.length === 2) {
        yearDigits = `20${yearDigits}`;
      }
      const shortYear = yearDigits.slice(-2);
      return {
        fiscalYear: `FY${shortYear}`,
        quarter,
        periodType: 'QUARTERLY',
        isIdentifiable: true,
        rawPeriodString: `${quarter} FY${shortYear}`,
      };
    }

    // 2. Annual hyphenated patterns e.g. "2023-24", "2023-2024", "FY23-24"
    const hyphenatedYearMatch = target.match(/(?:^|[\s_./-])(?:FY)?(20\d{2})[-_/](20\d{2}|\d{2})(?:[\s_./-]|$)/i);
    if (hyphenatedYearMatch) {
      let endYear = hyphenatedYearMatch[2];
      if (endYear.length === 2) {
        endYear = `20${endYear}`;
      }
      const shortYear = endYear.slice(-2);
      return {
        fiscalYear: `FY${shortYear}`,
        periodType: 'ANNUAL',
        isIdentifiable: true,
        rawPeriodString: `FY${shortYear} (${hyphenatedYearMatch[1]}-${hyphenatedYearMatch[2]})`,
      };
    }

    // 3. Standard Fiscal Year patterns e.g. "FY24", "FY2024", "FY-24", "AR 2024", "AR24", "TataMotors_AR_FY24.pdf"
    const standardFyMatch = target.match(/(?:^|[\s_./-])(?:FY|AR)[\s_./-]?(20\d{2}|\d{2})(?:[\s_./-]|$)/i);
    if (standardFyMatch) {
      let yearDigits = standardFyMatch[1];
      if (yearDigits.length === 2) {
        yearDigits = `20${yearDigits}`;
      }
      const shortYear = yearDigits.slice(-2);
      return {
        fiscalYear: `FY${shortYear}`,
        periodType: 'ANNUAL',
        isIdentifiable: true,
        rawPeriodString: `FY${shortYear}`,
      };
    }

    // 4. Standalone 4-digit calendar/fiscal year e.g. "Annual_Report_2024.pdf", "Report_2023.pdf"
    const standaloneYearMatch = target.match(/(?:^|[\s_./-])(20[12]\d)(?:[\s_./-]|$)/);
    if (standaloneYearMatch) {
      const fullYear = standaloneYearMatch[1];
      const shortYear = fullYear.slice(-2);
      return {
        fiscalYear: `FY${shortYear}`,
        periodType: 'ANNUAL',
        isIdentifiable: true,
        rawPeriodString: `FY${shortYear} (${fullYear})`,
      };
    }

    // Unidentifiable period
    return {
      periodType: 'OTHER',
      isIdentifiable: false,
      rawPeriodString: undefined,
    };
  }

  /**
   * Verifies if the uploaded document text or filename references the target company symbol or name.
   */
  public static verifyCompanyConsistency(params: {
    filename: string;
    textSample?: string;
    targetSymbol: string;
    targetLegalName: string;
  }): CompanyVerificationResult {
    const { filename, textSample = '', targetSymbol, targetLegalName } = params;
    const combined = `${filename} ${textSample.slice(0, 1000)}`.toUpperCase();
    const cleanSymbol = targetSymbol.toUpperCase();

    // Check symbol match (as a whole word or in filename separated by _, -, .)
    const symbolRegex = new RegExp(`(?:^|[^A-Z0-9])${cleanSymbol}(?:[^A-Z0-9]|$)`, 'i');
    const symbolMatches = symbolRegex.test(combined) || filename.toUpperCase().includes(cleanSymbol);

    // Check key legal name tokens (e.g. "TATA MOTORS", "HDFC BANK")
    const simplifiedName = targetLegalName.toUpperCase().replace(/\b(LIMITED|LTD|CORP|CORPORATION|INC)\b/gi, '').trim();
    const nameMatches = simplifiedName.length > 2 && combined.includes(simplifiedName);

    if (symbolMatches || nameMatches) {
      return {
        isConsistent: true,
        targetSymbol: cleanSymbol,
        detectedSymbol: symbolMatches ? cleanSymbol : undefined,
        detectedName: nameMatches ? simplifiedName : undefined,
        notes: `Document verified to match target company ${cleanSymbol} / ${simplifiedName}.`,
      };
    }

    // If text sample is empty, we don't flag inconsistency aggressively
    if (textSample.length < 50) {
      return {
        isConsistent: true,
        targetSymbol: cleanSymbol,
        notes: 'Document filename does not explicitly contain company symbol; pending text inspection.',
      };
    }

    return {
      isConsistent: false,
      targetSymbol: cleanSymbol,
      notes: `Warning: Neither stock symbol "${cleanSymbol}" nor legal name "${simplifiedName}" was identified in initial document markers.`,
    };
  }
}
