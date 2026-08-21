/**
 * RawDataStore.ts
 * Phase 16 — True Raw Byte Capture & Cryptographic Storage Engine.
 * Operates on Uint8Array binary buffers prior to text decoding or JSON parsing.
 */

import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';
import { DataSourceAdapterMode } from './DataSourceTypes';

export interface RawSourceCaptureRecord {
  captureId: string;
  sourceId: string;
  requestId: string;
  sourceUrl?: string;
  httpStatus: number;
  headers: Record<string, string>;
  contentType: string;
  contentEncoding?: string;
  rawBytesBase64: string;      // Base64 representation of original Uint8Array
  rawByteLength: number;       // Exact Uint8Array byte length (NOT string.length)
  rawBytesSha256: string;      // SHA-256 hash computed directly over Uint8Array
  retrievedAt: string;         // ISO String
  mode: DataSourceAdapterMode;
}

export class RawDataStore {
  private static readonly captures = new Map<string, RawSourceCaptureRecord>();

  /**
   * Captures raw binary response buffer prior to text decoding or JSON parsing.
   */
  public static captureBytes(params: {
    sourceId: string;
    requestId: string;
    sourceUrl?: string;
    httpStatus: number;
    headers: Record<string, string>;
    contentType: string;
    contentEncoding?: string;
    rawBytes: Uint8Array;
    mode: DataSourceAdapterMode;
  }): RawSourceCaptureRecord {
    const rawBytesSha256 = CanonicalJsonSerializer.sha256Bytes(params.rawBytes);
    const rawByteLength = params.rawBytes.byteLength;
    const rawBytesBase64 = CanonicalJsonSerializer.uint8ArrayToBase64(params.rawBytes);
    const captureId = `raw_${params.sourceId}_${Date.now()}_${rawBytesSha256.substring(0, 8)}`;

    const record: RawSourceCaptureRecord = {
      captureId,
      sourceId: params.sourceId,
      requestId: params.requestId,
      sourceUrl: params.sourceUrl,
      httpStatus: params.httpStatus,
      headers: params.headers,
      contentType: params.contentType,
      contentEncoding: params.contentEncoding,
      rawBytesBase64,
      rawByteLength,
      rawBytesSha256,
      retrievedAt: new Date().toISOString(),
      mode: params.mode,
    };

    this.captures.set(captureId, record);
    return record;
  }

  /**
   * Captures string payload by encoding it into UTF-8 Uint8Array first.
   */
  public static captureText(params: {
    sourceId: string;
    requestId: string;
    sourceUrl?: string;
    httpStatus?: number;
    headers?: Record<string, string>;
    contentType?: string;
    textPayload: string;
    mode?: DataSourceAdapterMode;
  }): RawSourceCaptureRecord {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(params.textPayload);
    return this.captureBytes({
      sourceId: params.sourceId,
      requestId: params.requestId,
      sourceUrl: params.sourceUrl,
      httpStatus: params.httpStatus ?? 200,
      headers: params.headers || { 'content-type': 'application/json' },
      contentType: params.contentType || 'application/json',
      contentEncoding: 'utf-8',
      rawBytes: bytes,
      mode: params.mode || 'REQUEST_RESPONSE',
    });
  }

  public static getCapture(captureId: string): RawSourceCaptureRecord | undefined {
    return this.captures.get(captureId);
  }

  public static decodeText(captureId: string): string {
    const record = this.getCapture(captureId);
    if (!record) {
      throw new Error(`Capture ID not found: ${captureId}`);
    }
    const bytes = CanonicalJsonSerializer.base64ToUint8Array(record.rawBytesBase64);
    const decoder = new TextDecoder(record.contentEncoding || 'utf-8');
    return decoder.decode(bytes);
  }

  public static clear(): void {
    this.captures.clear();
  }

  public static count(): number {
    return this.captures.size;
  }
}
