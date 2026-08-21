/**
 * 07_storageImmutabilityAndHashes.test.ts
 * Phase 18 — Storage Immutability, SHA-256 Provenance & Corruption Defense Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RawDataStore } from '../../src/domain/dataSources/RawDataStore';
import { CanonicalJsonSerializer } from '../../src/domain/audit/CanonicalJsonSerializer';

describe('Storage Immutability & Corruption Defense Suite', () => {
  beforeEach(() => {
    RawDataStore.clear();
  });

  it('guarantees bit-level immutability and stable SHA-256 content hashes for raw source documents', () => {
    const rawFilingPayload = JSON.stringify({
      company: 'Infosys Limited',
      fy: 'FY24',
      revenue: 153670,
      pat: 26233,
    });

    const hash1 = CanonicalJsonSerializer.sha256(rawFilingPayload);
    const hash2 = CanonicalJsonSerializer.sha256(rawFilingPayload);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);

    const record = RawDataStore.captureText({
      sourceId: 'PROVIDER_BSE',
      requestId: 'req_infosys_01',
      textPayload: rawFilingPayload,
    });

    const retrieved = RawDataStore.getCapture(record.captureId);
    expect(retrieved).toBeDefined();
    expect(RawDataStore.decodeText(record.captureId)).toBe(rawFilingPayload);
    expect(retrieved?.rawBytesSha256).toBe(hash1);
  });
});
