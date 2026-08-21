/**
 * 12_liveReplayDeterminismStress.test.ts
 * Phase 17 — Replay Mode Determinism & Byte Hashing Stress Suite.
 */

import { describe, it, expect } from 'vitest';
import { RawDataStore } from '../../src/domain/dataSources/RawDataStore';
import { CanonicalJsonSerializer } from '../../src/domain/audit/CanonicalJsonSerializer';

describe('Live / Replay Determinism Stress Suite', () => {
  it('guarantees identical SHA-256 byte hashes across 10 repeated captures of identical raw JSON strings', () => {
    const rawPayload = JSON.stringify({
      symbol: 'DIXON',
      revenue: 17690,
      pat: 360,
      fcf: 340,
      timestamp: '2024-05-15T00:00:00.000Z',
    });

    const hashes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const record = RawDataStore.captureText({
        sourceId: 'PROVIDER_BSE',
        requestId: `req_rep_${i}`,
        httpStatus: 200,
        textPayload: rawPayload,
      });
      hashes.push(record.rawBytesSha256);
    }

    const firstHash = hashes[0];
    for (const h of hashes) {
      expect(h).toBe(firstHash);
    }

    const expectedHash = CanonicalJsonSerializer.sha256Bytes(new TextEncoder().encode(rawPayload));
    expect(firstHash).toBe(expectedHash);
  });
});
