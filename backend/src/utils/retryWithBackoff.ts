/**
 * Retry utility with exponential backoff
 * Handles rate limit (429) and temporary errors with automatic retries
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry on rate limit (429), server errors (5xx), and timeout
    return (
      error?.response?.status === 429 ||
      error?.response?.status === 503 ||
      error?.response?.status === 504 ||
      error?.code === "ETIMEDOUT" ||
      error?.code === "ECONNREFUSED"
    );
  },
};

/**
 * Execute a function with exponential backoff retry logic
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Promise with function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!config.shouldRetry(error)) {
        throw error;
      }

      // Don't retry after max attempts
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      // Extract retry-after header if available (for rate limits)
      const err = error as Record<string, any>;
      const retryAfter = err?.response?.headers?.["retry-after"];
      const actualDelayMs = retryAfter
        ? parseInt(retryAfter) * 1000
        : delayMs;

      console.log(
        `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed. ` +
        `Retrying in ${actualDelayMs}ms...`,
        err?.response?.status || err?.code
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, actualDelayMs));
    }
  }

  throw lastError;
}

/**
 * Wrapper for Groq API calls with automatic retry on rate limit
 * @param fn - Async function that calls Groq API
 * @returns Promise with function result
 */
export async function callGroqWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelayMs: 2000, // Start with 2 seconds for Groq
    maxDelayMs: 60000, // Max 60 seconds
    backoffMultiplier: 2,
  });
}
