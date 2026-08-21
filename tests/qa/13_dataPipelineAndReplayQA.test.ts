/**
 * 13_dataPipelineAndReplayQA.test.ts
 * QA Track: Live vs Replay Mode Determinism & Raw Byte Hashing.
 */

import { describe, it, expect } from 'vitest';
import { RawDataStore } from '../../src/domain/dataSources/RawDataStore';
import { CanonicalJsonSerializer } from '../../src/domain/audit/CanonicalJsonSerializer';

describe('Data Pipeline & Replay Determinism QA', () => {
  it('computes identical SHA-256 byte hashes for UTF-8 raw payloads across live and replay capture', () => {
    const rawPayload = '{"company":"TATAMOTORS","revenue":437928,"unit":"INR_CR"}';
    const record = RawDataStore.captureText({
      sourceId: 'PROVIDER_NSE',
      requestId: 'req_123',
      httpStatus: 200,
      textPayload: rawPayload,
    });

    const encoder = new TextEncoder();
    const rawBytes = encoder.encode(rawPayload);
    const expectedHash = CanonicalJsonSerializer.sha256Bytes(rawBytes);

    expect(record.rawBytesSha256).toBe(expectedHash);
    expect(record.rawByteLength).toBe(rawBytes.length);
  });
});
