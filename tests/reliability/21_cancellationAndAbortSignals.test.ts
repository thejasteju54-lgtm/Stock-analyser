/**
 * 21_cancellationAndAbortSignals.test.ts
 * Phase 17 — Task Cancellation & AbortSignal Resource Release Suite.
 */

import { describe, it, expect } from 'vitest';
import { NetworkRetryEngine } from '../../src/domain/reliability/NetworkRetryEngine';

describe('Cancellation & AbortSignal Resource Release Suite', () => {
  it('instantly aborts long-running operations when caller triggers AbortController.abort()', async () => {
    const controller = new AbortController();

    // Trigger abort after 20ms
    setTimeout(() => controller.abort(), 20);

    const result = await NetworkRetryEngine.executeWithRetry(
      async (signal) => {
        await new Promise((resolve, reject) => {
          const t = setTimeout(resolve, 500);
          signal?.addEventListener('abort', () => {
            clearTimeout(t);
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
        return { data: 'NEVER_REACHED' };
      },
      { maxAttempts: 3, timeoutMs: 5000 },
      controller.signal
    );

    expect(result.success).toBe(false);
    expect(result.finalErrorCategory).toBe('ABORTED');
  });
});
