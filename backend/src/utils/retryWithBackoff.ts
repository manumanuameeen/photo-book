/**
 * Enhanced retry utility with exponential backoff
 * Handles Groq rate limits specifically
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
  initialDelayMs: 2000,
  maxDelayMs: 60000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Rate limit errors - ALWAYS retry
    if (error?.response?.status === 429) return true;
    if (error?.response?.data?.error?.code === "rate_limit_exceeded") return true;
    
    // Network/server errors - retry
    if (error?.response?.status === 503) return true;
    if (error?.response?.status === 504) return true;
    if (error?.code === "ETIMEDOUT") return true;
    if (error?.code === "ECONNREFUSED") return true;
    
    return false;
  },
};

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

      if (!config.shouldRetry(error) || attempt === config.maxRetries) {
        throw error;
      }

      let delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelayMs
      );

      // Extract retry-after from Groq's error message
      const errorMessage = (error as any)?.response?.data?.error?.message || "";
      const retryMatch = errorMessage.match(/try again in ([\d.]+)s/);
      if (retryMatch) {
        delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 500;
      }

      const retryAfter = (error as any)?.response?.headers?.["retry-after"];
      if (retryAfter) {
        delayMs = Math.max(delayMs, parseInt(retryAfter as string, 10) * 1000);
      }

      console.log(`[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed.`);
      console.log(`[Retry] Error: ${errorMessage || (error as any).message}`);
      console.log(`[Retry] Waiting ${delayMs}ms before retry...`);
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
