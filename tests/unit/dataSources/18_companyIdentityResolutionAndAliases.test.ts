/**
 * 18_companyIdentityResolutionAndAliases.test.ts
 * Phase 16 — Company Identity Resolution & Security Master Verification.
 */

import { describe, it, expect } from 'vitest';
import { LiveCompanyIdentityResolver } from '../../../src/domain/dataSources/LiveCompanyIdentityResolver';

describe('Company Identity Resolution & Aliases (Phase 16)', () => {
  it('resolves exact CIN match', () => {
    const res = LiveCompanyIdentityResolver.resolve('L28920MH1945PLC004520');
    expect(res.confidence).toBe('EXACT_MATCH');
    expect(res.resolvedCompany?.symbol).toBe('TATAMOTORS');
    expect(res.isIngestionAllowed).toBe(true);
  });

  it('resolves exact ISIN match', () => {
    const res = LiveCompanyIdentityResolver.resolve('INE040A01034');
    expect(res.confidence).toBe('EXACT_MATCH');
    expect(res.resolvedCompany?.symbol).toBe('HDFCBANK');
  });

  it('resolves former ticker alias (TELCO -> TATAMOTORS)', () => {
    const res = LiveCompanyIdentityResolver.resolve('TELCO');
    expect(res.confidence).toBe('HIGH_CONFIDENCE');
    expect(res.matchedField).toBe('FORMER_TICKER');
    expect(res.resolvedCompany?.symbol).toBe('TATAMOTORS');
  });

  it('blocks ingestion when query is ambiguous', () => {
    const res = LiveCompanyIdentityResolver.resolve('TATA');
    expect(res.confidence).toBe('AMBIGUOUS');
    expect(res.isIngestionAllowed).toBe(false);
    expect(res.blockReason).toContain('matched multiple entities');
  });
});
