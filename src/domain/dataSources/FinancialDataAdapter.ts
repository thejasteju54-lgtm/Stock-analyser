/**
 * FinancialDataAdapter.ts
 * Phase 16 — Sector-Aware Financial Statements & Disclosures Ingestion Adapter.
 */

import { DataSourceMetadataRegistry } from './DataSourceMetadataRegistry';
import { DataSourceRateLimiter } from './DataSourceRateLimiter';
import { DataSourceCache } from './DataSourceCache';
import { RawDataStore } from './RawDataStore';
import {
  DataFetchQuery,
  DataSourceAdapter,
  DataSourceMetadata,
  SectorFinancialStatement,
  FinancialSectorArchetype,
  ValidationResult,
} from './DataSourceTypes';

export class FinancialDataAdapter implements DataSourceAdapter<SectorFinancialStatement, SectorFinancialStatement> {
  public readonly metadata: DataSourceMetadata;
  public readonly supportedModes: ('REQUEST_RESPONSE' | 'POLLING' | 'STREAM' | 'BATCH_FILE')[] = [
    'REQUEST_RESPONSE',
    'BATCH_FILE',
  ];

  constructor(sourceId: string = 'MCA_XBRL_FINANCIALS') {
    this.metadata = DataSourceMetadataRegistry.getMetadata(sourceId);
  }

  public async healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }> {
    return {
      status: this.metadata.availabilityStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      latencyMs: 45,
    };
  }

  public async fetch(
    query: DataFetchQuery,
    archetype: FinancialSectorArchetype = 'INDUSTRIAL_MANUFACTURING'
  ): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: SectorFinancialStatement;
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }> {
    const cached = DataSourceCache.get<SectorFinancialStatement>(this.metadata.sourceId, query);
    if (cached) {
      const capture = RawDataStore.getCapture(cached.captureId);
      if (capture) {
        return {
          captureRecord: capture,
          parsedData: cached.data,
          rateLimitStatus: { remainingRequests: 25, resetTimestamp: Date.now() + 60000 },
          retryable: false,
        };
      }
    }

    const rateStatus = DataSourceRateLimiter.acquire(this.metadata.sourceId, this.metadata.rateLimitPerMinute);
    if (!rateStatus.isAllowed) {
      throw new Error(`Rate limit exceeded for ${this.metadata.sourceId}. Retry after ${rateStatus.retryAfterMs}ms.`);
    }

    const mockStatement = this.generateMockSectorStatement(query.symbol, archetype, query.periodEnd || '2024-03-31');

    const rawCapture = RawDataStore.captureText({
      sourceId: this.metadata.sourceId,
      requestId: `req_fin_${Date.now()}`,
      textPayload: JSON.stringify(mockStatement),
      mode: 'REQUEST_RESPONSE',
    });

    mockStatement.rawPayloadHash = rawCapture.rawBytesSha256;
    DataSourceCache.set(this.metadata.sourceId, query, rawCapture.captureId, mockStatement, 1440); // 24h TTL

    return {
      captureRecord: rawCapture,
      parsedData: mockStatement,
      rateLimitStatus: {
        remainingRequests: rateStatus.remainingTokens,
        resetTimestamp: rateStatus.resetTime,
      },
      retryable: false,
    };
  }

  public validate(raw: { parsedData: SectorFinancialStatement }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stmt = raw.parsedData;

    if (!stmt.reportingPeriod) errors.push('Missing reportingPeriod in financial statement.');
    if (!stmt.periodStart || !stmt.periodEnd) errors.push('Missing periodStart or periodEnd dates.');

    if (stmt.archetype === 'INDUSTRIAL_MANUFACTURING') {
      if (stmt.revenue <= 0) errors.push('Industrial revenue must be positive.');
      if (stmt.totalAssets <= 0) errors.push('Industrial totalAssets must be positive.');
    } else if (stmt.archetype === 'BANKING') {
      if (stmt.netInterestIncome <= 0) errors.push('Banking NII must be positive for commercial banks.');
      if (stmt.crarPercent <= 0) errors.push('Banking CRAR % must be positive.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public normalize(raw: { parsedData: SectorFinancialStatement }): SectorFinancialStatement {
    return raw.parsedData;
  }

  private generateMockSectorStatement(
    symbol: string,
    archetype: FinancialSectorArchetype,
    periodEnd: string
  ): SectorFinancialStatement {
    const base = {
      statementId: `stmt_${symbol.toLowerCase()}_${periodEnd}`,
      companyId: `comp_${symbol.toLowerCase()}`,
      reportingPeriod: 'FY2024',
      periodStart: '2023-04-01',
      periodEnd,
      periodType: 'ANNUAL_FY' as const,
      statementBasis: 'CONSOLIDATED' as const,
      auditStatus: 'AUDITED' as const,
      publicationDate: '2024-05-15',
      sourceReference: {
        documentId: `doc_${symbol.toLowerCase()}_fy24`,
        documentTitle: `${symbol} Annual Report FY24`,
        pageNumber: 120,
        tableHeader: 'Consolidated Statement of Profit and Loss',
      },
      rawPayloadHash: '',
    };

    if (archetype === 'BANKING') {
      return {
        ...base,
        archetype: 'BANKING',
        interestEarned: 215000,
        interestExpended: 125000,
        netInterestIncome: 90000,
        nonInterestIncome: 35000,
        totalNetIncome: 125000,
        operatingExpenses: 52000,
        preProvisionOperatingProfit: 73000,
        provisionsAndContingencies: 13000,
        pbt: 60000,
        taxExpense: 15000,
        pat: 45000,
        basicEps: 60.5,
        netInterestMarginPercent: 3.65,
        grossNpaAmount: 31000,
        grossNpaRatioPercent: 1.24,
        netNpaAmount: 8200,
        netNpaRatioPercent: 0.33,
        provisionCoverageRatioPercent: 73.5,
        creditCostPercent: 0.52,
        casaRatioPercent: 38.2,
        totalAdvances: 2480000,
        advancesGrowthYoYPercent: 16.5,
        totalDeposits: 2350000,
        depositsGrowthYoYPercent: 15.2,
        cet1RatioPercent: 16.3,
        at1RatioPercent: 0.8,
        tier1CapitalRatioPercent: 17.1,
        tier2CapitalRatioPercent: 1.7,
        crarPercent: 18.8,
        returnOnAssetsPercent: 1.95,
        returnOnEquityPercent: 16.8,
      };
    }

    if (archetype === 'IT_SERVICES') {
      return {
        ...base,
        archetype: 'IT_SERVICES',
        revenueInr: 153670,
        revenueUsd: 18560,
        constantCurrencyGrowthYoY: 3.4,
        softwareDevelopmentExpenses: 82000,
        employeeBenefitExpenses: 78500,
        operatingProfit: 31800,
        operatingMarginPercent: 20.7,
        otherIncome: 3200,
        pbt: 35000,
        taxExpense: 8800,
        pat: 26200,
        basicEps: 63.2,
        cfo: 25800,
        fcf: 23500,
        cashAndLiquidInvestments: 34500,
        headcount: 317000,
        attritionRateLtmPercent: 12.6,
        utilizationRatePercent: 83.5,
      };
    }

    // Default Industrial
    return {
      ...base,
      archetype: 'INDUSTRIAL_MANUFACTURING',
      revenue: 437928,
      rawMaterialCost: 265000,
      employeeExpenses: 38500,
      otherOperatingExpenses: 65000,
      ebitda: 69428,
      depreciationAndAmortization: 28000,
      ebit: 41428,
      financeCosts: 9800,
      otherIncome: 4200,
      pbt: 35828,
      taxExpense: 8200,
      pat: 27628,
      basicEps: 72.1,
      dilutedEps: 72.0,
      cfo: 62000,
      capex: 35000,
      fcf: 27000,
      tradeReceivables: 18500,
      inventory: 48000,
      tradePayables: 65000,
      totalDebt: 82000,
      cashAndEquivalents: 45000,
      netWorth: 92000,
      totalAssets: 345000,
    };
  }
}
