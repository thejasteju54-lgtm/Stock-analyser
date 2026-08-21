/**
 * 09_boundedRetryAndBackoff.test.ts
 * Phase 17 — Bounded Retry, Exponential Backoff & Jitter Verification Suite.
 */

import { describe, it, expect } from 'vitest';
import { NetworkRetryEngine } from '../../src/domain/reliability/NetworkRetryEngine';

describe('Bounded Retry & Exponential Backoff Suite', () => {
  it('executes bounded retries up to maxAttempts on transient 503 errors and tracks attempt history', async () => {
    let callCount = 0;

    const result = await NetworkRetryEngine.executeWithRetry(
      async () => {
        callCount++;
        if (callCount < 3) {
          const err: any = new Error('Service Unavailable');
          err.status = 503;
          throw err;
        }
        return { message: 'Recovered on attempt 3' };
      },
      { maxAttempts: 3, initialBackoffMs: 10, maxBackoffMs: 50 }
    );

    expect(result.success).toBe(true);
    expect(result.attemptsExecuted).toBe(3);
    expect(result.history.length).toBe(2); // 2 failed attempts prior to success
    expect(result.result?.message).toBe('Recovered on attempt 3');
  });

  it('fails fast on 401 Unauthorized without performing unnecessary retries', async () => {
    let callCount = 0;

    const result = await NetworkRetryEngine.executeWithRetry(
      async () => {
        callCount++;
        const err: any = new Error('Unauthorized');
        err.status = 401;
        throw err;
      },
      { maxAttempts: 3, initialBackoffMs: 10 }
    );

    expect(result.success).toBe(false);
    expect(callCount).toBe(1); // Never retried
    expect(result.finalErrorCategory).toBe('NON_RETRYABLE_AUTH_ERROR');
  });
});
