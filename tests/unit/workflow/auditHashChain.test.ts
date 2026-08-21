import { describe, it, expect } from 'vitest';
import { ResearchAuditLog, sha256Sync } from '../../../src/domain/audit/ResearchAuditLog';
import { CanonicalJsonSerializer } from '../../../src/domain/audit/CanonicalJsonSerializer';

describe('Phase 15 — Cryptographic SHA-256 & Audit Hash Chain', () => {
  it('computes exact 64-hex character deterministic SHA-256', () => {
    const hash1 = sha256Sync('Tata Motors Research Project Payload');
    const hash2 = sha256Sync('Tata Motors Research Project Payload');
    const hashModified = sha256Sync('Tata Motors Research Project Payload 1');

    expect(hash1).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashModified);
  });

  it('recursively canonicalizes JSON object keys and preserves array order', () => {
    const payloadA = { b: 2, a: 1, c: { z: 10, y: 20 } };
    const payloadB = { c: { y: 20, z: 10 }, a: 1, b: 2 };

    const canonA = CanonicalJsonSerializer.canonicalize(payloadA);
    const canonB = CanonicalJsonSerializer.canonicalize(payloadB);

    expect(canonA).toBe(canonB);
    expect(canonA).toBe('{"a":1,"b":2,"c":{"y":20,"z":10}}');
  });

  it('maintains valid cryptographic hash chain and detects payload tampering', () => {
    const log = new ResearchAuditLog();

    const event1 = log.appendEvent('SYSTEM', 'PROJECT_INITIALIZED', { company: 'TATAMOTORS' }, '2024-03-31T10:00:00Z');
    const event2 = log.appendEvent('USER_ANALYST', 'DOCUMENT_INGESTED', { docId: 'doc_1', type: 'ANNUAL_REPORT' }, '2024-03-31T10:05:00Z');
    const event3 = log.appendEvent('SYSTEM', 'PIPELINE_FULL_RUN_COMPLETED', { status: 'SUCCESS' }, '2024-03-31T10:10:00Z');

    expect(event1.previousHash).toBe(ResearchAuditLog.GENESIS_HASH);
    expect(event2.previousHash).toBe(event1.eventHash);
    expect(event3.previousHash).toBe(event2.eventHash);

    // Initial chain verification passes
    const verification = log.verifyAuditChain();
    expect(verification.isValid).toBe(true);
    expect(verification.eventCount).toBe(3);

    // Tampering test: modify payload of event2
    (event2.payload as any).docId = 'doc_tampered';
    const tamperedVerification = log.verifyAuditChain();
    expect(tamperedVerification.isValid).toBe(false);
    expect(tamperedVerification.brokenSequence).toBe(2);
    expect(tamperedVerification.reason).toContain('Tampered payload');
  });
});
