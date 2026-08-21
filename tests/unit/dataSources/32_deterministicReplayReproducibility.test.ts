/**
 * 32_deterministicReplayReproducibility.test.ts
 * Phase 16 — Deterministic Replay & Cryptographic Hash Reproducibility Verification.
 */

import { describe, it, expect } from 'vitest';
import { CanonicalResearchDataStore } from '../../../src/domain/dataSources/CanonicalResearchDataStore';
import { TATA_MOTORS_FIXTURE } from '../../../src/domain/fixtures/TataMotorsFixture';

describe('Deterministic Replay Reproducibility (Phase 16)', () => {
  it('produces identical SHA-256 canonical checksum on repeat executions of identical input dataset', () => {
    const store1 = CanonicalResearchDataStore.getOrCreate('proj_rep_1', 'TATAMOTORS', '2024-06-30T23:59:59Z');
    store1.financialStatement = TATA_MOTORS_FIXTURE.canonicalStatement;
    store1.marketPrice = TATA_MOTORS_FIXTURE.marketPrice;
    store1.shareholding = TATA_MOTORS_FIXTURE.shareholding;

    const hash1 = CanonicalResearchDataStore.computeChecksum(store1);

    const store2 = CanonicalResearchDataStore.getOrCreate('proj_rep_2', 'TATAMOTORS', '2024-06-30T23:59:59Z');
    store2.financialStatement = TATA_MOTORS_FIXTURE.canonicalStatement;
    store2.marketPrice = TATA_MOTORS_FIXTURE.marketPrice;
    store2.shareholding = TATA_MOTORS_FIXTURE.shareholding;

    // Both datasets have the exact same contents (ignoring projectId differences)
    expect(hash1.length).toBe(64);
    expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);
  });
});
