import { Platform } from '../platforms/types';

export class PlatformError extends Error {
  constructor(
    public readonly platform: Platform,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(`[${platform}] ${message}`);
    this.name = 'PlatformError';
  }
}

export class RateLimitError extends PlatformError {
  constructor(platform: Platform, public readonly retryAfter: number) {
    super(platform, 'RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Retry after ${retryAfter}ms`, { retryAfter });
  }
}

export class AuthenticationError extends PlatformError {
  constructor(platform: Platform, message: string) {
    super(platform, 'AUTHENTICATION_FAILED', message);
  }
}

export class ApiError extends PlatformError {
  constructor(
    platform: Platform,
    code: string,
    message: string,
    public readonly statusCode: number,
    details?: unknown
  ) {
    super(platform, code, message, details);
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof ApiError) {
    // Retry on server errors and too many requests
    return error.statusCode >= 500 || error.statusCode === 429;
  }
  return false;
}

export function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; backoffMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, backoffMs = 1000 } = options;
  let attempts = 0;

  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryableError(error) || attempts >= maxRetries) {
        throw error;
      }
      
      attempts++;
      const delay = backoffMs * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return execute();
    }
  };

  return execute();
}
