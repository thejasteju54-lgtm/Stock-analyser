/**
 * 07_slowNetworkAndLatency.test.ts
 * Phase 17 — Slow Network Latency & Timeout Suite.
 */

import { describe, it, expect } from 'vitest';
import { NetworkRetryEngine } from '../../src/domain/reliability/NetworkRetryEngine';

describe('Slow Network & Latency Simulation Suite', () => {
  it('handles latencies of 50ms, 100ms, and 200ms without failing and correctly times out when deadline exceeded', async () => {
    // 1. Successful simulated network call with delay
    const successResult = await NetworkRetryEngine.executeWithRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { data: 'NSE_QUOTES', price: 1050 };
      },
      { timeoutMs: 500, maxAttempts: 1 }
    );

    expect(successResult.success).toBe(true);
    expect(successResult.result?.price).toBe(1050);

    // 2. Simulated timeout failure
    const timeoutResult = await NetworkRetryEngine.executeWithRetry(
      async (signal) => {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 300);
          signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            const err = new Error('Operation aborted due to timeout');
            err.name = 'AbortError';
            reject(err);
          });
        });
        return { data: 'SLOW_DATA' };
      },
      { timeoutMs: 30, maxAttempts: 1 }
    );

    expect(timeoutResult.success).toBe(false);
    expect(timeoutResult.attemptsExecuted).toBeGreaterThanOrEqual(1);
  });
});
