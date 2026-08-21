/**
 * 09_trueRawByteHashingAndStorage.test.ts
 * Phase 16 — True Raw Byte Capture & Multi-Byte Unicode Storage Verification.
 */

import { describe, it, expect } from 'vitest';
import { RawDataStore } from '../../../src/domain/dataSources/RawDataStore';
import { CanonicalJsonSerializer } from '../../../src/domain/audit/CanonicalJsonSerializer';

describe('True Raw Byte Hashing & Storage (Phase 16)', () => {
  it('measures true UTF-8 multi-byte buffer length instead of string.length', () => {
    // Rupee symbol (₹) is 3 bytes in UTF-8, but string.length is 1
    const testText = 'Revenue: ₹437,928 Cr 🚀';
    const encoder = new TextEncoder();
    const bytes = encoder.encode(testText);

    expect(testText.length).toBe(23); // String character length
    expect(bytes.byteLength).toBe(27); // Actual UTF-8 byte length (multi-byte safe)

    const capture = RawDataStore.captureBytes({
      sourceId: 'BSE_DISCLOSURE',
      requestId: 'req_unicode_test',
      httpStatus: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      contentType: 'text/plain',
      contentEncoding: 'utf-8',
      rawBytes: bytes,
      mode: 'REQUEST_RESPONSE',
    });

    expect(capture.rawByteLength).toBe(27);
    expect(capture.rawByteLength).not.toBe(testText.length);
    expect(capture.rawBytesSha256).toBe(CanonicalJsonSerializer.sha256Bytes(bytes));

    // Decode roundtrip
    const decoded = RawDataStore.decodeText(capture.captureId);
    expect(decoded).toBe(testText);
  });

  it('verifies SHA-256 byte hashing matches standard known vector', () => {
    // Known SHA-256 of "hello" in ASCII/UTF-8 is "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    const encoder = new TextEncoder();
    const bytes = encoder.encode('hello');
    const hash = CanonicalJsonSerializer.sha256Bytes(bytes);
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
});
