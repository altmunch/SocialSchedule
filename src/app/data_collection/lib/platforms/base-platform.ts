import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosHeaders } from 'axios';
import { EventEmitter } from 'events';
import { PlatformError, RateLimitError, ApiError, withRetry } from '../utils/errors';
import { Platform } from './types';

// Extend AxiosRequestConfig with our custom options
declare module 'axios' {
  export interface AxiosRequestConfig {
    retryCount?: number;
    useAuth?: boolean;
    useRateLimit?: boolean;
    _isRetry?: boolean;
    _startTime?: number;
    _retryCount?: number;
  }
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
}

export type HeaderValue = string | string[] | undefined;

export interface ApiCredentials {
  accessToken: string;
  clientId?: string;
  clientSecret?: string;
  [key: string]: any; // Allow for additional credentials
}

export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout?: number;
  rateLimit: {
    requests: number;
    perSeconds: number;
  };
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  enableLogging?: boolean;
  [key: string]: any; // Allow for additional config
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: number | string;
    message: string;
    details?: any;
  };
  rateLimit?: RateLimit;
  metadata?: {
    requestId?: string;
    timestamp?: string;
    duration?: number;
  };
}

export interface RequestOptions extends AxiosRequestConfig {
  retryCount?: number;
  useAuth?: boolean;
  useRateLimit?: boolean;
  timeout?: number;
}

interface RequestMetadata {
  url: string;
  method?: string;
  startTime: number;
  retryCount: number;
}

/**
 * Base class for all platform API clients
 * Handles common functionality like rate limiting, retries, and error handling
 */
export abstract class BasePlatformClient extends EventEmitter {
  protected readonly config: Required<ApiConfig>;
  protected readonly credentials: ApiCredentials;
  protected client: AxiosInstance;
  protected rateLimit: RateLimit | null = null;
  protected requestQueue: Array<() => Promise<void>> = [];
  protected isProcessingQueue = false;
  protected lastRequestTime = 0;
  protected retryCount = 0;
  protected requestId = 0;
  
  /**
   * Platform identifier (must be implemented by child classes)
   */
  protected abstract readonly platform: Platform;
  
  /**
   * Get authentication headers (must be implemented by child classes)
   * @returns Record of authentication headers
   */
  protected abstract getAuthHeaders(): Record<string, string>;
  
  /**
   * Handle rate limit from response headers (must be implemented by child classes)
   * @param headers Response headers from the API
   */
  protected abstract handleRateLimit(headers: Record<string, HeaderValue>): void;

  constructor(config: ApiConfig, credentials: ApiCredentials) {
    super();
    
    // Merge config with defaults, being careful with rateLimit to avoid duplicates
    const {
      rateLimit: configRateLimit = {},
      enableLogging = false,
      ...restConfig
    } = config;

    this.config = {
      // Default values
      timeout: 30000, // 30 seconds default timeout
      maxRetries: 3,
      retryDelay: 1000, // 1 second default retry delay
      headers: {},
      enableLogging,
      
      // Apply user config (excluding rateLimit and enableLogging)
      ...restConfig,
      
      // Apply rate limit config with defaults
      rateLimit: {
        requests: 100, // Default rate limit
        perSeconds: 60, // Per minute
        ...configRateLimit
      }
    };

    this.credentials = credentials;
    
    // Create Axios instance with default config
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers
      }
    });
    
    // Add request interceptor for auth and rate limiting
    this.client.interceptors.request.use(this.handleRequest.bind(this));
    
    // Add response interceptor for error handling and rate limiting
    this.client.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleError.bind(this)
    );
  }

  /**
   * Log a message if logging is enabled
   * @param level Log level
   * @param message Log message
   * @param data Additional data to log
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    if (this.config.enableLogging) {
      const logMessage = `[${this.platform.toUpperCase()}] ${message}`;
      const logData = data ? [logMessage, data] : [logMessage];
      
      switch (level) {
        case 'debug':
          console.debug(...logData);
          break;
        case 'info':
          console.info(...logData);
          break;
        case 'warn':
          console.warn(...logData);
          break;
        case 'error':
          console.error(...logData);
          break;
      }
    }
  }

  /**
   * Make a request with retry and rate limiting
   * @param config Request configuration
   * @returns Promise with the API response
   */
  protected async request<T = any>(
    config: AxiosRequestConfig & { _retryCount?: number }
  ): Promise<AxiosResponse<T>> {
    const requestId = ++this.requestId;
    const startTime = Date.now();
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    
    const logRequest = () => {
      try {
        this.log('debug', `[${requestId}] ${method} ${url}`, {
          params: config.params,
          data: config.data,
          headers: this.getRequestHeaders(config)
        });
      } catch (error) {
        console.error('Failed to log request:', error);
      }
    };

    const logResponse = (response: AxiosResponse, duration: number) => {
      try {
        this.log('debug', `[${requestId}] ${method} ${response.status} ${url} (${duration}ms)`, {
          status: response.status,
          statusText: response.statusText,
          headers: this.normalizeHeaders(response.headers),
          data: response.data
        });
      } catch (error) {
        console.error('Failed to log response:', error);
      }
    };

    const logError = (error: unknown, duration: number) => {
      try {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response
          ? `[${axiosError.response.status}] ${axiosError.response.statusText}`
          : axiosError.message || 'Unknown error';
        
        this.log('error', `[${requestId}] ${method} ${url} failed (${duration}ms): ${errorMessage}`, {
          error: {
            message: axiosError.message,
            code: axiosError.code,
            response: axiosError.response?.data
          }
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    };

    try {
      logRequest();
      
      const response = await withRetry<AxiosResponse<T>>(
        async () => {
          try {
            const response = await this.client.request<T>({
              ...config,
              _startTime: startTime,
              _isRetry: config._isRetry || false
            });
            
            // Update rate limit info from response headers
            this.handleRateLimit(this.normalizeHeaders(response.headers));
            
            return response;
          } catch (error) {
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 429) {
                const retryAfter = this.getRetryAfter(error);
                throw new RateLimitError(this.platform, retryAfter);
              }
              
              throw new ApiError(
                this.platform,
                error.code || 'API_ERROR',
                error.message,
                error.response?.status || 500,
                error.response?.data
              );
            }
            
            throw error;
          }
        },
        {
          maxRetries: config.retryCount ?? this.config.maxRetries,
          backoffMs: this.config.retryDelay
        }
      );
      
      const duration = Date.now() - startTime;
      logResponse(response, duration);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, duration);
      
      if (error instanceof PlatformError) {
        throw error;
      }
      
      throw new ApiError(
        this.platform,
        'UNKNOWN_ERROR',
        'An unknown error occurred',
        500,
        error
      );
    }
  }
  
  /**
   * Get the retry-after time in milliseconds
   * @param error Axios error
   * @returns Time to wait before retrying in milliseconds
   */
  private getRetryAfter(error: AxiosError): number {
    // Check for standard Retry-After header
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      // Could be a delay in seconds or a date
      const delay = parseInt(String(retryAfter), 10);
      if (!isNaN(delay)) {
        return delay * 1000; // Convert seconds to ms
      }
      
      // Try to parse as a date
      const retryDate = new Date(String(retryAfter));
      if (!isNaN(retryDate.getTime())) {
        return retryDate.getTime() - Date.now();
      }
    }
    
    // Default to exponential backoff based on retry count
    const retryCount = (error.config as any)?._retryCount || 0;
    return Math.min(1000 * Math.pow(2, retryCount), 30000); // Cap at 30s
  }
  
  /**
   * Get headers for a request
   */
  protected getRequestHeaders(config: AxiosRequestConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.headers
    };
    
    // Add any headers from config, ensuring they're strings
    if (config.headers) {
      const configHeaders = this.normalizeHeaders(config.headers);
      Object.entries(configHeaders).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          headers[key] = String(value);
        }
      });
    }
    
    // Add authorization header if needed
    if (config.useAuth !== false) {
      const authHeaders = this.getAuthHeaders();
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          headers[key] = String(value);
        }
      });
    }
    
    // Add rate limit headers if needed
    if (config.useRateLimit !== false && this.rateLimit) {
      headers['X-RateLimit-Limit'] = String(this.rateLimit.limit);
      headers['X-RateLimit-Remaining'] = String(this.rateLimit.remaining);
      headers['X-RateLimit-Reset'] = String(this.rateLimit.reset);
    }
    
    return headers;
  }
  
  /**
   * Normalize Axios headers to a plain object
   */
  private normalizeHeaders(headers: unknown): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof AxiosHeaders) {
      return headers.toJSON() as Record<string, string>;
    }
    if (Array.isArray(headers)) {
      return headers.reduce<Record<string, string>>((acc, [key, value]) => ({
        ...acc,
        [key]: String(value)
      }), {});
    }
    if (typeof headers === 'object') {
      return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => ({
        ...acc,
        [key]: value !== undefined && value !== null ? String(value) : ''
      }), {});
    }
    return {};
  }

  /**
   * Axios request interceptor
   */
  private async handleRequest(config: AxiosRequestConfig) {
    // Add auth headers if needed
    if (config.useAuth !== false) {
      const authHeaders = this.getAuthHeaders();
      config.headers = {
        ...config.headers,
        ...authHeaders
      };
    }

    // Add rate limit headers if needed
    if (config.useRateLimit !== false && this.rateLimit) {
      config.headers = {
        ...config.headers,
        'X-RateLimit-Limit': String(this.rateLimit.limit),
        'X-RateLimit-Remaining': String(this.rateLimit.remaining),
        'X-RateLimit-Reset': String(this.rateLimit.reset)
      };
    }

    return config;
  }

  /**
   * Axios response interceptor
   */
  private handleResponse(response: AxiosResponse) {
    // Update rate limit info from response headers
    this.handleRateLimit(this.normalizeHeaders(response.headers));
    return response;
  }

  /**
   * Axios error interceptor
   */
  private async handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      // Update rate limit info from error response headers
      if (error.response?.headers) {
        this.handleRateLimit(this.normalizeHeaders(error.response.headers));
      }

      // Handle rate limit errors
      if (error.response?.status === 429) {
        const retryAfter = this.getRetryAfter(error);
        throw new RateLimitError(this.platform, retryAfter);
      }

      // Handle other API errors
      if (error.response) {
        throw new ApiError(
          this.platform,
          error.code || 'API_ERROR',
          error.message,
          error.response.status,
          error.response.data
        );
      }
    }

    // Re-throw the error if it's not an Axios error
    throw error;
  }
}
