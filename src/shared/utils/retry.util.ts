/**
 * Retry utility with exponential backoff
 */

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs?: number;
}

export async function retryCallApi<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 2, initialDelayMs: 1000 }
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs = 10000 } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Log error (simulating CloudWatch)
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(
        initialDelayMs * Math.pow(2, attempt),
        maxDelayMs
      );
      await this.delay(delay);
    }
  }

  // All retries exhausted, throw last error
  throw lastError!;
}

/**
 * Delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
