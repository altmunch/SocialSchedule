import Bottleneck from 'bottleneck';
import EventEmitter from 'events';

// TikTok API rate limits are specific to the API version and endpoint being used.
// For example, the TikTok for Developers API has various quotas (per user, per app, per endpoint).
// It's crucial to consult the official documentation for the specific TikTok API you are integrating with.
// The values below are default recommendations and should be adjusted based on actual API limits and application needs.

const TIKTOK_DEFAULT_RESERVOIR = 100; // Example: 100 requests
const TIKTOK_DEFAULT_INTERVAL_MS = 60 * 60 * 1000; // Example: per hour
const TIKTOK_MAX_CONCURRENT = 3; // Example: max 3 concurrent requests
const TIKTOK_MIN_TIME_MS = 1500; // Example: min 1.5 seconds between requests

// Global limiter for TikTok API calls
// Adjust reservoir, reservoirRefreshInterval, etc., based on the API's most common or restrictive limit.
const globalTikTokLimiter = new Bottleneck({
  reservoir: TIKTOK_DEFAULT_RESERVOIR,
  reservoirRefreshInterval: TIKTOK_DEFAULT_INTERVAL_MS,
  reservoirRefreshAmount: TIKTOK_DEFAULT_RESERVOIR,
  maxConcurrent: TIKTOK_MAX_CONCURRENT,
  minTime: TIKTOK_MIN_TIME_MS,
});

/**
 * Wraps an asynchronous function with the global TikTok rate limiter.
 * @param fn The asynchronous function to be rate-limited.
 * @returns A new function that, when called, will schedule the original function's execution according to rate limits.
 */
export function limitTikTokApiCall<A extends any[], R>(
  fn: (...args: A) => Promise<R>
): (...args: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    return globalTikTokLimiter.schedule(async () => {
      return await fn(...args);
    });
  };
}

// Event listeners for debugging or monitoring the limiter's state (optional)
globalTikTokLimiter.on('error', (error) => {
  console.error('Bottleneck (TikTok) error:', error);
});

globalTikTokLimiter.on('depleted', (empty) => {
  if (empty) {
    console.warn('TikTok API global rate limiter reservoir is depleted. Waiting for refresh.');
  }
});

export { globalTikTokLimiter };

/**
 * Implements a token bucket rate limiter for API requests.
 * The values below are default recommendations and should be adjusted based on actual API limits and application needs.
 */
interface RateLimiterOptions {
  requestsPerMinute: number;
  burstCapacity?: number;
}

export class RateLimiter extends EventEmitter {
  private tokens: number;
  private lastRefillTime: number;
  private _tokensPerSecond: number;
  private _maxTokens: number;
  private queue: Array<() => void> = [];
  private isProcessingQueue = false;

  constructor(options: RateLimiterOptions) {
    super();
    this._tokensPerSecond = options.requestsPerMinute / 60;
    this._maxTokens = options.burstCapacity || options.requestsPerMinute;
    this.tokens = this._maxTokens;
    this.lastRefillTime = Date.now();
  }

  get tokensPerSecond(): number {
    return this._tokensPerSecond;
  }

  get maxTokens(): number {
    return this._maxTokens;
  }

  /**
   * Refill tokens based on the time elapsed since the last refill
   */
  private refillTokens(): void {
    const now = Date.now();
    const timeElapsed = (now - this.lastRefillTime) / 1000; // in seconds
    
    if (timeElapsed > 0) {
      const newTokens = timeElapsed * this._tokensPerSecond;
      this.tokens = Math.min(this.tokens + newTokens, this._maxTokens);
      this.lastRefillTime = now;
    }
  }

  /**
   * Update rate limits based on API response headers
   */
  updateLimits(rateLimit: { limit: number; remaining: number; resetAt: Date }): void {
    const now = Date.now();
    const resetTime = rateLimit.resetAt.getTime();
    const timeUntilReset = Math.max(0, (resetTime - now) / 1000); // in seconds
    
    // Update the token bucket with current state
    this.tokens = rateLimit.remaining;
    this._maxTokens = rateLimit.limit;
    
    // If we're close to rate limiting, adjust tokens per second to slow down
    if (this.tokens < this._maxTokens * 0.2) {
      this._tokensPerSecond = Math.max(
        this.tokens / (timeUntilReset || 60), // Ensure we don't divide by zero
        this._maxTokens / 600 // At least 10% of max per minute as a safety
      );
    } else {
      this._tokensPerSecond = this._maxTokens / 60; // Reset to default
    }
  }

  /**
   * Acquire a token, waiting if necessary
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * Process the queue of waiting requests
   */
  private processQueue(): void {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;
    const processNext = () => {
      if (this.queue.length === 0) {
        this.isProcessingQueue = false;
        return;
      }
      this.refillTokens();
      if (this.tokens >= 1) {
        this.tokens--;
        const next = this.queue.shift();
        next?.();
        this.emit('tokenUsed', { tokens: this.tokens, maxTokens: this._maxTokens });
        processNext();
      } else {
        if (this.tokens < 1) {
          this.emit('rateLimitDepleted', { tokens: this.tokens, maxTokens: this._maxTokens });
        }
        const timeToNextToken = Math.ceil((1 / this.tokensPerSecond) * 1000);
        setTimeout(() => {
          this.refillTokens();
          processNext();
        }, timeToNextToken);
      }
    };
    processNext();
  }

  /**
   * Get the current wait time in milliseconds
   */
  getWaitTime(): number {
    this.refillTokens();
    if (this.tokens >= 1) {
      return 0;
    }
    const tokensNeeded = 1 - this.tokens;
    return Math.ceil((tokensNeeded / this.tokensPerSecond) * 1000);
  }

  updateOptions(options: Partial<RateLimiterOptions>) {
    if (options.requestsPerMinute !== undefined) {
      this._tokensPerSecond = options.requestsPerMinute / 60;
      this._maxTokens = options.burstCapacity || options.requestsPerMinute;
      this.tokens = Math.min(this.tokens, this._maxTokens);
    }
    if (options.burstCapacity !== undefined) {
      this._maxTokens = options.burstCapacity;
      this.tokens = Math.min(this.tokens, this._maxTokens);
    }
    this.emit('rateLimitUpdated', { ...options });
  }
}
