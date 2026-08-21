/**
 * 08_apiFailureAndErrorClassification.test.ts
 * Phase 17 — API Failure Matrix & Classification Suite.
 */

import { describe, it, expect } from 'vitest';
import { NetworkRetryEngine } from '../../src/domain/reliability/NetworkRetryEngine';

describe('API Failure Matrix & Error Classification Suite', () => {
  it('correctly categorizes HTTP status codes and prevents retrying non-retryable errors', () => {
    // Retryable classifications
    expect(NetworkRetryEngine.classifyHttpError(429)).toBe('RETRYABLE_RATE_LIMIT');
    expect(NetworkRetryEngine.classifyHttpError(500)).toBe('RETRYABLE_SERVER_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(502)).toBe('RETRYABLE_SERVER_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(503)).toBe('RETRYABLE_SERVER_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(504)).toBe('RETRYABLE_SERVER_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(408)).toBe('RETRYABLE_TIMEOUT');

    // Non-retryable classifications
    expect(NetworkRetryEngine.classifyHttpError(400)).toBe('NON_RETRYABLE_CLIENT_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(401)).toBe('NON_RETRYABLE_AUTH_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(403)).toBe('NON_RETRYABLE_AUTH_ERROR');
    expect(NetworkRetryEngine.classifyHttpError(404)).toBe('NON_RETRYABLE_NOT_FOUND');

    // Retry eligibility
    expect(NetworkRetryEngine.isRetryableCategory('RETRYABLE_RATE_LIMIT')).toBe(true);
    expect(NetworkRetryEngine.isRetryableCategory('RETRYABLE_SERVER_ERROR')).toBe(true);
    expect(NetworkRetryEngine.isRetryableCategory('NON_RETRYABLE_AUTH_ERROR')).toBe(false);
    expect(NetworkRetryEngine.isRetryableCategory('NON_RETRYABLE_CLIENT_ERROR')).toBe(false);
  });
});
