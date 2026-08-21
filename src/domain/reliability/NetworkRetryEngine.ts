/**
 * NetworkRetryEngine.ts
 * Phase 17 — Bounded Retry, Exponential Backoff, Full Jitter & Error Classification Engine.
 * Provides bounded retries for idempotent external network operations with AbortSignal cancellation.
 */

export type HttpErrorCategory =
  | 'RETRYABLE_RATE_LIMIT'
  | 'RETRYABLE_SERVER_ERROR'
  | 'RETRYABLE_TIMEOUT'
  | 'RETRYABLE_NETWORK_ERROR'
  | 'NON_RETRYABLE_CLIENT_ERROR'
  | 'NON_RETRYABLE_AUTH_ERROR'
  | 'NON_RETRYABLE_NOT_FOUND'
  | 'NON_RETRYABLE_VALIDATION_ERROR'
  | 'ABORTED';

export interface RetryPolicyConfig {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  timeoutMs: number;
}

export interface RetryAttemptRecord {
  attemptNumber: number;
  timestamp: string;
  errorCategory: HttpErrorCategory;
  errorMessage: string;
  httpStatus?: number;
  backoffDelayMs: number;
}

export interface RetryExecutionResult<T> {
  success: boolean;
  result?: T;
  finalError?: string;
  finalErrorCategory?: HttpErrorCategory;
  attemptsExecuted: number;
  history: RetryAttemptRecord[];
  totalElapsedMs: number;
}

export class NetworkRetryEngine {
  public static readonly DEFAULT_CONFIG: RetryPolicyConfig = {
    maxAttempts: 3,
    initialBackoffMs: 200,
    maxBackoffMs: 4000,
    backoffMultiplier: 2,
    jitterFactor: 0.5,
    timeoutMs: 10000,
  };

  /**
   * Classifies HTTP status codes and error payloads into deterministic retry categories.
   */
  public static classifyHttpError(httpStatus?: number, errorObj?: unknown): HttpErrorCategory {
    if (errorObj instanceof Error && (errorObj.name === 'AbortError' || errorObj.message.includes('aborted'))) {
      return 'ABORTED';
    }

    if (!httpStatus) {
      if (errorObj instanceof Error && (errorObj.message.includes('timeout') || errorObj.message.includes('ETIMEDOUT'))) {
        return 'RETRYABLE_TIMEOUT';
      }
      return 'RETRYABLE_NETWORK_ERROR';
    }

    if (httpStatus === 429) return 'RETRYABLE_RATE_LIMIT';
    if (httpStatus === 408) return 'RETRYABLE_TIMEOUT';
    if (httpStatus >= 500 && httpStatus <= 504) return 'RETRYABLE_SERVER_ERROR';
    if (httpStatus === 401 || httpStatus === 403) return 'NON_RETRYABLE_AUTH_ERROR';
    if (httpStatus === 404) return 'NON_RETRYABLE_NOT_FOUND';
    if (httpStatus >= 400 && httpStatus < 500) return 'NON_RETRYABLE_CLIENT_ERROR';

    return 'NON_RETRYABLE_VALIDATION_ERROR';
  }

  /**
   * Determines if an error category is eligible for retry under analytical policy.
   */
  public static isRetryableCategory(category: HttpErrorCategory): boolean {
    return (
      category === 'RETRYABLE_RATE_LIMIT' ||
      category === 'RETRYABLE_SERVER_ERROR' ||
      category === 'RETRYABLE_TIMEOUT' ||
      category === 'RETRYABLE_NETWORK_ERROR'
    );
  }

  /**
   * Computes exponential backoff with full jitter.
   */
  public static computeBackoffDelay(
    attempt: number,
    config: RetryPolicyConfig = this.DEFAULT_CONFIG
  ): number {
    const rawBackoff = Math.min(
      config.initialBackoffMs * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxBackoffMs
    );
    // Full jitter between (1 - jitterFactor) * rawBackoff and rawBackoff
    const minDelay = rawBackoff * (1 - config.jitterFactor);
    return Math.floor(minDelay + Math.random() * (rawBackoff - minDelay));
  }

  /**
   * Executes an asynchronous operation with bounded retries, deadline enforcement, and error classification.
   */
  public static async executeWithRetry<T>(
    operation: (signal?: AbortSignal, attempt?: number) => Promise<T>,
    customConfig?: Partial<RetryPolicyConfig>,
    parentSignal?: AbortSignal
  ): Promise<RetryExecutionResult<T>> {
    const config: RetryPolicyConfig = { ...this.DEFAULT_CONFIG, ...customConfig };
    const history: RetryAttemptRecord[] = [];
    const startTime = Date.now();

    let attempt = 1;

    while (attempt <= config.maxAttempts) {
      if (parentSignal?.aborted) {
        return {
          success: false,
          finalError: 'Operation aborted by caller',
          finalErrorCategory: 'ABORTED',
          attemptsExecuted: attempt - 1,
          history,
          totalElapsedMs: Date.now() - startTime,
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      // Link parent signal if provided
      const abortListener = () => controller.abort();
      if (parentSignal) {
        parentSignal.addEventListener('abort', abortListener, { once: true });
      }

      try {
        const result = await operation(controller.signal, attempt);
        clearTimeout(timeoutId);
        if (parentSignal) parentSignal.removeEventListener('abort', abortListener);

        return {
          success: true,
          result,
          attemptsExecuted: attempt,
          history,
          totalElapsedMs: Date.now() - startTime,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (parentSignal) parentSignal.removeEventListener('abort', abortListener);

        const status = err?.status || err?.httpStatus || (err?.response ? err.response.status : undefined);
        const category = this.classifyHttpError(status, err);
        const isRetryable = this.isRetryableCategory(category);
        const backoffDelayMs = isRetryable && attempt < config.maxAttempts
          ? this.computeBackoffDelay(attempt, config)
          : 0;

        history.push({
          attemptNumber: attempt,
          timestamp: new Date().toISOString(),
          errorCategory: category,
          errorMessage: err?.message || String(err),
          httpStatus: status,
          backoffDelayMs,
        });

        if (!isRetryable || attempt >= config.maxAttempts || parentSignal?.aborted) {
          return {
            success: false,
            finalError: err?.message || String(err),
            finalErrorCategory: category,
            attemptsExecuted: attempt,
            history,
            totalElapsedMs: Date.now() - startTime,
          };
        }

        if (backoffDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelayMs));
        }

        attempt++;
      }
    }

    return {
      success: false,
      finalError: 'Max retry attempts exceeded',
      finalErrorCategory: 'RETRYABLE_SERVER_ERROR',
      attemptsExecuted: config.maxAttempts,
      history,
      totalElapsedMs: Date.now() - startTime,
    };
  }
}
