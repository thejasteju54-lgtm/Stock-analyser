import { FinancialUnit, CurrencyConversionMetadata } from './FinancialFactTypes';

export interface NormalizedUnitResult {
  normalizedValue?: number;
  normalizedUnit: FinancialUnit;
  normalizedCurrency: string;
  conversionMetadata?: CurrencyConversionMetadata;
  warning?: string;
}

export class UnitNormalizer {
  /**
   * Normalizes reported financial numbers into standard canonical units (INR Crores, Percent, etc.)
   * while strictly preserving original values, original units, and original currencies.
   *
   * Crucial rule: Never silently convert foreign currency.
   */
  public static normalize(params: {
    value?: number;
    rawUnit: string;
    rawCurrency?: string;
    allowForeignConversion?: boolean;
    explicitConversionRate?: { rate: number; date: string; source: string };
  }): NormalizedUnitResult {
    const { value, rawUnit, rawCurrency = 'INR', explicitConversionRate } = params;

    // Handle missing/unreadable value
    if (value === undefined || value === null || isNaN(value)) {
      return {
        normalizedValue: undefined,
        normalizedUnit: this.parseUnitString(rawUnit),
        normalizedCurrency: rawCurrency.toUpperCase(),
      };
    }

    const unitUpper = rawUnit.toUpperCase().trim();
    const currencyUpper = rawCurrency.toUpperCase().trim();

    // 1. Percentage / Ratios
    if (unitUpper.includes('%') || unitUpper.includes('PERCENT') || unitUpper.includes('PCT')) {
      return {
        normalizedValue: Math.round(value * 100) / 100,
        normalizedUnit: 'PERCENT',
        normalizedCurrency: currencyUpper,
      };
    }

    // 2. Per-share metrics (EPS, Book Value Per Share, Dividend Per Share)
    if (
      unitUpper.includes('PER_SHARE') ||
      unitUpper.includes('PER SHARE') ||
      unitUpper.includes('EPS') ||
      unitUpper.includes('/SHARE')
    ) {
      return {
        normalizedValue: Math.round(value * 100) / 100,
        normalizedUnit: 'PER_SHARE',
        normalizedCurrency: currencyUpper,
      };
    }

    // 3. Count / Volume metrics
    if (unitUpper.includes('COUNT') || unitUpper.includes('SHARES') || unitUpper.includes('NUMBER')) {
      return {
        normalizedValue: value,
        normalizedUnit: 'COUNT',
        normalizedCurrency: currencyUpper,
      };
    }

    // 4. Foreign Currencies: Never silently convert
    if (currencyUpper !== 'INR') {
      if (explicitConversionRate) {
        const converted = Math.round(value * explicitConversionRate.rate * 100) / 100;
        return {
          normalizedValue: converted,
          normalizedUnit: 'INR_CRORE',
          normalizedCurrency: 'INR',
          conversionMetadata: {
            conversionRate: explicitConversionRate.rate,
            conversionDate: explicitConversionRate.date,
            conversionSource: explicitConversionRate.source,
          },
        };
      }

      // Preserve foreign currency without conversion
      let foreignUnit: FinancialUnit = 'FOREIGN_CURRENCY';
      if (currencyUpper === 'USD') {
        foreignUnit = unitUpper.includes('MILLION') ? 'USD_MILLION' : 'USD';
      }

      return {
        normalizedValue: value,
        normalizedUnit: foreignUnit,
        normalizedCurrency: currencyUpper,
        warning: `Foreign currency (${currencyUpper}) preserved without conversion.`,
      };
    }

    // 5. Standard INR Unit Normalizations to INR Crores
    // Lakhs to Crores (÷ 100)
    if (unitUpper.includes('LAKH') || unitUpper.includes('LACS') || unitUpper === 'INR_LAKH') {
      const inCrores = value / 100;
      return {
        normalizedValue: Math.round(inCrores * 1000) / 1000,
        normalizedUnit: 'INR_CRORE',
        normalizedCurrency: 'INR',
      };
    }

    // Millions to Crores (÷ 10)
    if (unitUpper.includes('MILLION') || unitUpper === 'MN') {
      const inCrores = value / 10;
      return {
        normalizedValue: Math.round(inCrores * 1000) / 1000,
        normalizedUnit: 'INR_CRORE',
        normalizedCurrency: 'INR',
      };
    }

    // Billions to Crores (× 100)
    if (unitUpper.includes('BILLION') || unitUpper === 'BN') {
      const inCrores = value * 100;
      return {
        normalizedValue: Math.round(inCrores * 1000) / 1000,
        normalizedUnit: 'INR_CRORE',
        normalizedCurrency: 'INR',
      };
    }

    // Absolute INR to Crores (÷ 10,000,000)
    if (unitUpper === 'INR' || unitUpper === 'RUPEES' || unitUpper === 'ABSOLUTE') {
      const inCrores = value / 10000000;
      return {
        normalizedValue: Math.round(inCrores * 10000) / 10000,
        normalizedUnit: 'INR_CRORE',
        normalizedCurrency: 'INR',
      };
    }

    // Crores (standard)
    return {
      normalizedValue: Math.round(value * 1000) / 1000,
      normalizedUnit: 'INR_CRORE',
      normalizedCurrency: 'INR',
    };
  }

  /**
   * Helper to identify unit enum from raw string
   */
  public static parseUnitString(unit: string): FinancialUnit {
    const u = unit.toUpperCase();
    if (u.includes('LAKH') || u.includes('LACS')) return 'INR_LAKH';
    if (u.includes('CRORE') || u.includes('CR')) return 'INR_CRORE';
    if (u.includes('%') || u.includes('PERCENT')) return 'PERCENT';
    if (u.includes('PER_SHARE') || u.includes('PER SHARE') || u.includes('SHARE') || u.includes('EPS')) return 'PER_SHARE';
    if (u.includes('MILLION') && u.includes('USD')) return 'USD_MILLION';
    if (u.includes('USD')) return 'USD';
    if (u === 'INR' || u === 'RUPEES') return 'INR';
    if (u.includes('COUNT')) return 'COUNT';
    return 'INR_CRORE';
  }
}
