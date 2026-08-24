/**
 * RealDataGate.ts
 * Absolute Evidence & Real Data Integrity Gate
 * Enforces the 7-point validation criteria before any financial data enters analytical engines.
 */

export interface RawDataCandidate {
  metricId: string;
  canonicalCompanyId: string;
  metricName: string;
  value: number | string | null | undefined;
  unit: string;
  period: string;
  source: string;
  sourceTier: number;
  retrievedAt: string;
  publicationDate?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
}

export interface GateValidationResult {
  isValid: boolean;
  status: 'ACCEPTED' | 'REJECTED' | 'NOT_ASSESSABLE';
  rejectionReason?: string;
  sanitizedValue?: number;
}

export class RealDataGate {
  /**
   * Evaluates a data point candidate against 7 strict integrity criteria.
   */
  static validate(candidate: RawDataCandidate, targetCompanyId: string): GateValidationResult {
    // 1. Source existence check
    if (!candidate.source || candidate.source.trim() === '' || candidate.source.toLowerCase().includes('mock') || candidate.source.toLowerCase().includes('random')) {
      return {
        isValid: false,
        status: 'REJECTED',
        rejectionReason: 'REJECTED: Data point missing verified source provenance or contains forbidden mock identifier.',
      };
    }

    // 2. Retrieval timestamp check
    if (!candidate.retrievedAt || isNaN(Date.parse(candidate.retrievedAt))) {
      return {
        isValid: false,
        status: 'REJECTED',
        rejectionReason: 'REJECTED: Invalid or missing retrieval timestamp.',
      };
    }

    // 3. Exact company identity matching
    if (!candidate.canonicalCompanyId || candidate.canonicalCompanyId !== targetCompanyId) {
      return {
        isValid: false,
        status: 'REJECTED',
        rejectionReason: `REJECTED: Company identity mismatch. Candidate belonged to ${candidate.canonicalCompanyId}, expected ${targetCompanyId}.`,
      };
    }

    // 4. Reporting period validation
    const validPeriodRegex = /^(FY\d{2,4}|Q[1-4]FY\d{2,4}|TTM|LATEST|ANNUAL_\d{4})$/i;
    if (!candidate.period || !validPeriodRegex.test(candidate.period.trim())) {
      return {
        isValid: false,
        status: 'NOT_ASSESSABLE',
        rejectionReason: `NOT_ASSESSABLE: Unrecognized or invalid financial period format '${candidate.period}'.`,
      };
    }

    // 5. Numerical validity & bounds check
    if (candidate.value === null || candidate.value === undefined || candidate.value === '') {
      return {
        isValid: false,
        status: 'NOT_ASSESSABLE',
        rejectionReason: 'NOT_ASSESSABLE: Missing or null numeric value.',
      };
    }

    const num = typeof candidate.value === 'number' ? candidate.value : parseFloat(String(candidate.value));
    if (isNaN(num) || !isFinite(num)) {
      return {
        isValid: false,
        status: 'REJECTED',
        rejectionReason: 'REJECTED: Numeric value is NaN or Infinite.',
      };
    }

    // 6. Unit validation
    const validUnits = ['INR_CRORE', 'INR', 'PERCENTAGE', 'RATIO', 'INR_PER_SHARE', 'COUNT', 'BPS'];
    if (!candidate.unit || !validUnits.includes(candidate.unit.toUpperCase())) {
      return {
        isValid: false,
        status: 'REJECTED',
        rejectionReason: `REJECTED: Unrecognized unit '${candidate.unit}'.`,
      };
    }

    // 7. Success
    return {
      isValid: true,
      status: 'ACCEPTED',
      sanitizedValue: num,
    };
  }

  /**
   * Filter and validate an entire batch of candidate facts for a specific company.
   */
  static filterValidFacts(candidates: RawDataCandidate[], targetCompanyId: string): RawDataCandidate[] {
    return candidates.filter((c) => this.validate(c, targetCompanyId).isValid);
  }
}
