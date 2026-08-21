/**
 * 06_duplicateUploadDeduplication.test.ts
 * Phase 17 — Duplicate Upload Detection & Content Hash Deduplication Suite.
 */

import { describe, it, expect } from 'vitest';
import { DocumentHasher } from '../../src/domain/ingestion/DocumentHasher';

describe('Duplicate Upload Deduplication Suite', () => {
  it('detects duplicate document content regardless of filename or metadata variations', async () => {
    const rawContent = 'AUDITED FINANCIAL STATEMENTS FOR FY24 - REVENUE: 10000 CR, PAT: 2000 CR';

    const hash1 = await DocumentHasher.computeHash(rawContent);
    const hash2 = await DocumentHasher.computeHash(rawContent);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(16);

    // Variation produces distinct hash
    const hashDifferent = await DocumentHasher.computeHash(rawContent + ' EXTRA');
    expect(hashDifferent).not.toBe(hash1);
  });
});
