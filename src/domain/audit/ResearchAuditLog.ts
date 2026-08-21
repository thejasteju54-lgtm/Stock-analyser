/**
 * ResearchAuditLog.ts
 * Phase 15 — Cryptographically Linked Tamper-Evident Research Audit Ledger.
 * Uses genuine SHA-256 (64 hex characters) to construct an immutable hash chain.
 */

import { CanonicalJsonSerializer } from './CanonicalJsonSerializer';

export type AuditAction =
  | 'PROJECT_INITIALIZED'
  | 'DOCUMENT_INGESTED'
  | 'DOCUMENT_VERSION_SUPERSEDED'
  | 'PIPELINE_FULL_RUN_STARTED'
  | 'PIPELINE_FULL_RUN_COMPLETED'
  | 'PIPELINE_INCREMENTAL_RUN_COMPLETED'
  | 'PHASE_INVALIDATED'
  | 'ANALYST_OVERRIDE_APPLIED'
  | 'SNAPSHOT_CREATED'
  | 'REPORT_GENERATED'
  | 'REPORT_EXPORTED';

export interface AuditLogEvent {
  sequence: number;
  timestamp: string;
  actor: 'SYSTEM' | 'USER_ANALYST';
  action: AuditAction;
  payload: Record<string, unknown>;
  previousHash: string;
  eventHash: string; // Exactly 64 hex characters
}

export interface AuditVerificationResult {
  isValid: boolean;
  eventCount: number;
  brokenSequence?: number;
  reason?: string;
}

/**
 * Standard FIPS 180-4 compliant SHA-256 implementation.
 * Produces 64-character lowercase hexadecimal hash.
 */
export function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const strLen = ascii.length;
  const asciiBitLength = strLen * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let w: number[] = new Array(64);

  // Encode UTF-8/ASCII into 32-bit big-endian words
  for (i = 0; i < strLen; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] || 0) | ((code & 0xff) << (24 - (i % 4) * 8));
  }

  // Append padding bit '1' (0x80)
  words[strLen >> 2] = (words[strLen >> 2] || 0) | (0x80 << (24 - (strLen % 4) * 8));

  // Pad with zeros until word length is 14 mod 16 (leaving 64 bits for length)
  const paddedLength = (((strLen + 8) >> 6) + 1) * 16;
  for (let p = (strLen >> 2) + 1; p < paddedLength; p++) {
    words[p] = words[p] || 0;
  }
  words[paddedLength - 1] = asciiBitLength;

  // Process 512-bit (16-word) blocks
  for (i = 0; i < words.length; i += 16) {
    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = ((w[j - 16] + s0) | 0) + ((w[j - 7] + s1) | 0);
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((h + s1) | 0) + ((ch + k[j]) | 0) + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const byte = (hash[i] >> (j * 8)) & 0xff;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }

  return result;
}

export class ResearchAuditLog {
  public static readonly GENESIS_HASH =
    '0000000000000000000000000000000000000000000000000000000000000000';

  private events: AuditLogEvent[] = [];

  constructor(initialEvents: AuditLogEvent[] = []) {
    this.events = [...initialEvents];
  }

  /**
   * Appends an immutable audit event to the hash chain.
   */
  public appendEvent(
    actor: 'SYSTEM' | 'USER_ANALYST',
    action: AuditAction,
    payload: Record<string, unknown>,
    explicitTimestamp?: string
  ): AuditLogEvent {
    const sequence = this.events.length + 1;
    const timestamp = explicitTimestamp || new Date().toISOString();
    const previousHash =
      this.events.length === 0
        ? ResearchAuditLog.GENESIS_HASH
        : this.events[this.events.length - 1].eventHash;

    const canonicalPayload = CanonicalJsonSerializer.canonicalize(payload);
    const dataToHash = `${sequence}|${timestamp}|${actor}|${action}|${canonicalPayload}|${previousHash}`;
    const eventHash = sha256Sync(dataToHash);

    const event: AuditLogEvent = {
      sequence,
      timestamp,
      actor,
      action,
      payload,
      previousHash,
      eventHash,
    };

    this.events.push(event);
    return event;
  }

  /**
   * Returns all audit events in chronological order.
   */
  public getEvents(): AuditLogEvent[] {
    return [...this.events];
  }

  /**
   * Returns the total number of events.
   */
  public getEventCount(): number {
    return this.events.length;
  }

  /**
   * Returns the latest event hash.
   */
  public getLatestHash(): string {
    return this.events.length === 0
      ? ResearchAuditLog.GENESIS_HASH
      : this.events[this.events.length - 1].eventHash;
  }

  /**
   * Cryptographically verifies the integrity of the audit hash chain.
   */
  public verifyAuditChain(): AuditVerificationResult {
    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];

      // Check sequence number
      if (event.sequence !== i + 1) {
        return {
          isValid: false,
          eventCount: this.events.length,
          brokenSequence: event.sequence,
          reason: `Invalid sequence index: expected ${i + 1}, got ${event.sequence}`,
        };
      }

      // Check previousHash link
      const expectedPrevHash =
        i === 0 ? ResearchAuditLog.GENESIS_HASH : this.events[i - 1].eventHash;

      if (event.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          eventCount: this.events.length,
          brokenSequence: event.sequence,
          reason: `Broken previousHash link at sequence ${event.sequence}`,
        };
      }

      // Check eventHash cryptographic recomputation
      const canonicalPayload = CanonicalJsonSerializer.canonicalize(event.payload);
      const dataToHash = `${event.sequence}|${event.timestamp}|${event.actor}|${event.action}|${canonicalPayload}|${event.previousHash}`;
      const recomputedHash = sha256Sync(dataToHash);

      if (event.eventHash !== recomputedHash) {
        return {
          isValid: false,
          eventCount: this.events.length,
          brokenSequence: event.sequence,
          reason: `Tampered payload or hash mismatch at sequence ${event.sequence}`,
        };
      }
    }

    return {
      isValid: true,
      eventCount: this.events.length,
    };
  }
}
