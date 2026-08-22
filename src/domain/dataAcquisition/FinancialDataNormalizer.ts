import { NormalizedFinancialStatementItem } from '../../infrastructure/researchSources/SourceAdapterTypes';

export class FinancialDataNormalizer {
  /**
   * Normalizes any input numerical value to Standard INR Crores (₹ Cr)
   */
  static normalizeToCrores(
    value: number,
    fromUnit: 'INR_CR' | 'INR_LAKH' | 'INR_MILLION' | 'INR_THOUSAND' | 'INR_RAW'
  ): number {
    switch (fromUnit) {
      case 'INR_CR':
        return value;
      case 'INR_LAKH':
        return value / 100;
      case 'INR_MILLION':
        return value / 10;
      case 'INR_THOUSAND':
        return value / 100000;
      case 'INR_RAW':
        return value / 10000000;
      default:
        return value;
    }
  }

  /**
   * Validates whether two items can be compared without period or basis distortion
   */
  static validateCompatibility(
    itemA: NormalizedFinancialStatementItem,
    itemB: NormalizedFinancialStatementItem
  ): { isCompatible: boolean; warning?: string } {
    if (itemA.reportingBasis !== itemB.reportingBasis) {
      return {
        isCompatible: false,
        warning: `INCOMPATIBLE_BASIS: Cannot compare ${itemA.reportingBasis} with ${itemB.reportingBasis}`,
      };
    }

    if (itemA.periodType !== itemB.periodType) {
      return {
        isCompatible: false,
        warning: `INCOMPATIBLE_PERIOD_TYPE: Cannot compare ${itemA.periodType} with ${itemB.periodType}`,
      };
    }

    return { isCompatible: true };
  }
}
