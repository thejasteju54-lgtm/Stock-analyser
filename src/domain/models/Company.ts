import {
  SECTOR_TAXONOMY_REGISTRY,
  resolveDefaultBusinessModelForSector,
  isBusinessModelRegistered,
} from '../taxonomy/SectorTaxonomyRegistry';

export type ExchangeType = 'NSE' | 'BSE';
export type MarketCapCategory = 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';

export interface CompanyIdentity {
  id: string; // generated unique slug/id
  legalName: string; // e.g. "Tata Motors Limited"
  displayName: string; // e.g. "Tata Motors"
  symbol: string; // e.g. "TATAMOTORS"
  exchange: ExchangeType;
  isin?: string; // e.g. "INE155A01022"
  cin?: string; // Corporate Identification Number
  sector: string; // from SectorTaxonomy
  subsector: string;
  businessModel: string; // from BusinessModelRegistry (e.g. BANKING, HFC, REIT, NON_FINANCIAL_OPERATING)
  marketCapCategory: MarketCapCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCompanyIdentity(data: Partial<CompanyIdentity>): ValidationResult {
  const errors: string[] = [];

  if (!data.legalName || data.legalName.trim().length === 0) {
    errors.push('Company legal name is required.');
  } else if (data.legalName.trim().length < 3) {
    errors.push('Company legal name must be at least 3 characters.');
  }

  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.push('Stock symbol is required.');
  } else {
    const cleanSymbol = data.symbol.trim().toUpperCase();
    if (!/^[A-Z0-9&-]{1,20}$/.test(cleanSymbol)) {
      errors.push('Stock symbol must contain only uppercase alphanumeric characters, &, or - (1-20 chars).');
    }
  }

  if (!data.exchange || (data.exchange !== 'NSE' && data.exchange !== 'BSE')) {
    errors.push('Exchange must be either NSE or BSE.');
  }

  if (!data.sector || data.sector.trim().length === 0) {
    errors.push('Sector selection is required.');
  } else if (!SECTOR_TAXONOMY_REGISTRY[data.sector]) {
    errors.push(`Sector "${data.sector}" is not recognized in the SectorTaxonomy registry.`);
  } else {
    const sectorDef = SECTOR_TAXONOMY_REGISTRY[data.sector];
    if (!data.subsector || data.subsector.trim().length === 0) {
      errors.push('Subsector selection is required.');
    } else if (!sectorDef.subsectors.includes(data.subsector)) {
      errors.push(`Subsector "${data.subsector}" is not a valid subsector of "${data.sector}".`);
    }
  }

  if (data.businessModel && data.businessModel.trim().length > 0) {
    if (!isBusinessModelRegistered(data.businessModel)) {
      errors.push(`Business model "${data.businessModel}" is not recognized in the BusinessModel registry.`);
    }
  }

  if (data.isin && !/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(data.isin.trim().toUpperCase())) {
    errors.push('ISIN must follow standard 12-character format (e.g. INE155A01022).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function createCompanyEntity(input: {
  legalName: string;
  displayName?: string;
  symbol: string;
  exchange: ExchangeType;
  isin?: string;
  cin?: string;
  sector: string;
  subsector: string;
  businessModel?: string;
  marketCapCategory?: MarketCapCategory;
}): CompanyIdentity {
  const resolvedBusinessModel =
    input.businessModel?.trim().toUpperCase() ||
    resolveDefaultBusinessModelForSector(input.sector, input.subsector);

  const validation = validateCompanyIdentity({
    ...input,
    businessModel: resolvedBusinessModel,
  });

  if (!validation.isValid) {
    throw new Error(`Cannot create company entity: ${validation.errors.join(', ')}`);
  }

  const now = new Date().toISOString();
  const cleanSymbol = input.symbol.trim().toUpperCase();
  const cleanName = input.legalName.trim();
  const cleanDisplayName = input.displayName?.trim() || cleanName;

  return {
    id: `co_${input.exchange.toLowerCase()}_${cleanSymbol.toLowerCase()}`,
    legalName: cleanName,
    displayName: cleanDisplayName,
    symbol: cleanSymbol,
    exchange: input.exchange,
    isin: input.isin?.trim().toUpperCase(),
    cin: input.cin?.trim().toUpperCase(),
    sector: input.sector,
    subsector: input.subsector,
    businessModel: resolvedBusinessModel,
    marketCapCategory: input.marketCapCategory || 'MID_CAP',
    createdAt: now,
    updatedAt: now,
  };
}
