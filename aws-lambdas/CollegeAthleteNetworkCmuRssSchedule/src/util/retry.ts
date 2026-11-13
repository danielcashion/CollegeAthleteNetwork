import type { RetryPolicy } from '../types.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(delay: number): number {
  return delay + Math.floor(Math.random() * Math.min(500, delay * 0.2));
}

export async function withRetry<T>(fn: () => Promise<T>, policy: RetryPolicy): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= policy.maxAttempts || !policy.retryOn(err)) {
        throw err;
      }
      const exp = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** (attempt - 1));
      await sleep(jitter(exp));
    }
  }
  throw lastError;
}

export function isRetryableHttp(status: number): boolean {
  return status === 429 || status >= 500;
}
