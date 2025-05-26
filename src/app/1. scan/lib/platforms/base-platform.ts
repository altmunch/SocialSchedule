// difficult: This base class handles rate limiting and error handling for all platform clients
// Be cautious with rate limit implementations to avoid hitting API limits

import { ApiConfig, ApiCredentials, ApiResponse } from './types';

export abstract class BasePlatformClient {
  protected config: ApiConfig;
  protected credentials: ApiCredentials;
  protected rateLimitQueue: Array<() => Promise<void>> = [];
  protected isProcessingQueue = false;

  constructor(config: ApiConfig, credentials: ApiCredentials) {
    this.config = config;
    this.credentials = credentials;
  }

  // Abstract methods that must be implemented by platform-specific clients
  protected abstract getAuthHeaders(): Record<string, string>;
  protected abstract handleRateLimit(headers: Headers): void;

  // Enqueue API calls to respect rate limits
  protected async enqueueRequest<T>(
    requestFn: () => Promise<Response>
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      this.rateLimitQueue.push(async () => {
        try {
          const response = await this.executeRequest<T>(requestFn);
          resolve(response);
        } catch (error) {
          resolve({
            error: {
              code: 500,
              message: error instanceof Error ? error.message : 'Unknown error occurred',
              details: error
            }
          });
        }
      });
      this.processQueue();
    });
  }

  // Process the rate limit queue
  private async processQueue() {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const request = this.rateLimitQueue.shift();
    
    if (request) {
      await request();
      
      // Respect rate limits before processing next request
      await new Promise(resolve => 
        setTimeout(resolve, (1000 / this.config.rateLimit.requests) * this.config.rateLimit.perSeconds)
      );
    }
    
    this.isProcessingQueue = false;
    this.processQueue();
  }

  // Execute the actual HTTP request
  private async executeRequest<T>(
    requestFn: () => Promise<Response>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      const data = await response.json().catch(() => ({}));
      
      // Handle rate limiting
      this.handleRateLimit(response.headers);
      
      if (!response.ok) {
        return {
          error: {
            code: response.status,
            message: data.error?.message || 'API request failed',
            details: data.error
          },
          rateLimit: this.extractRateLimit(response.headers)
        };
      }
      
      return {
        data: data as T,
        rateLimit: this.extractRateLimit(response.headers)
      };
    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Extract rate limit information from response headers
  private extractRateLimit(headers: Headers): { limit: number; remaining: number; reset: number } | undefined {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    
    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10)
      };
    }
    
    return undefined;
  }
}
