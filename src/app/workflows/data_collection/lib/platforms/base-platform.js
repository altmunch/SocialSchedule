"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlatformClient = void 0;
const axios_1 = __importStar(require("axios"));
const events_1 = require("events");
const errors_1 = require("../utils/errors");
const auth_types_1 = require("../auth.types");
/**
 * Base class for all platform API clients
 * Handles common functionality like rate limiting, retries, and error handling
 */
class BasePlatformClient extends events_1.EventEmitter {
    /**
     * Get authentication headers using AuthTokenManager.
     * This method is now concrete and async.
     * @returns Record of authentication headers
     * @throws PlatformError if credentials are not found or invalid.
     */
    async getAuthHeaders() {
        const credentials = await this.authTokenManager.getValidCredentials({ platform: this.platform, userId: this.userId });
        if (!credentials) {
            this.log('error', `No valid credentials found for platform: ${this.platform}, user: ${this.userId || 'default'}`, { platform: this.platform, userId: this.userId });
            throw new errors_1.PlatformError(`Authentication failed: No valid credentials for ${this.platform}.`);
        }
        if (credentials.strategy === auth_types_1.AuthStrategy.OAUTH2) {
            const oauthCreds = credentials;
            return { 'Authorization': `Bearer ${oauthCreds.accessToken}` };
        }
        else if (credentials.strategy === auth_types_1.AuthStrategy.API_KEY) {
            const apiKeyCreds = credentials;
            // The header name for API keys can vary (e.g., 'X-API-Key', 'Authorization: ApiKey ...')
            // This is a common pattern; adjust if platform requires a different header.
            return { 'Authorization': `ApiKey ${apiKeyCreds.apiKey}` }; // Or specific header like 'X-Api-Key'
        }
        this.log('warn', `Unknown authentication strategy for platform ${this.platform}`, { strategy: credentials.strategy });
        throw new errors_1.PlatformError(this.platform, 'UNSUPPORTED_AUTH_STRATEGY', `Unsupported authentication strategy: ${credentials.strategy} for ${this.platform}.`, { strategy: credentials.strategy });
    }
    constructor(config, authTokenManager, userId) {
        super();
        this.rateLimit = null;
        this.requestQueue = [];
        this.isProcessingQueue = false;
        this.lastRequestTime = 0;
        this.retryCount = 0;
        this.requestId = 0;
        // Merge config with defaults, being careful with rateLimit to avoid duplicates
        const { rateLimit: configRateLimit = {}, enableLogging = false, ...restConfig } = config;
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
        this.authTokenManager = authTokenManager;
        this.userId = userId;
        // Create Axios instance with default config
        this.client = axios_1.default.create({
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
        this.client.interceptors.response.use(this.handleResponse.bind(this), this.handleError.bind(this));
    }
    /**
     * Make a request with retry and rate limiting
     * @param config Request configuration
     * @returns Promise with the API response
     */
    async request(config) {
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
            }
            catch (error) {
                console.error('Failed to log request:', error);
            }
        };
        const logResponse = (response, duration) => {
            try {
                this.log('debug', `[${requestId}] ${method} ${response.status} ${url} (${duration}ms)`, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: this.normalizeHeaders(response.headers),
                    data: response.data
                });
            }
            catch (error) {
                console.error('Failed to log response:', error);
            }
        };
        const logError = (error, duration) => {
            try {
                const axiosError = error;
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
            }
            catch (logError) {
                console.error('Failed to log error:', logError);
            }
        };
        try {
            logRequest();
            const response = await (0, errors_1.withRetry)(async () => {
                try {
                    const response = await this.client.request({
                        ...config,
                        _startTime: startTime,
                        _isRetry: config._isRetry || false
                    });
                    // Update rate limit info from response headers
                    this.handleRateLimit(this.normalizeHeaders(response.headers));
                    return response;
                }
                catch (error) {
                    if (axios_1.default.isAxiosError(error)) {
                        if (error.response?.status === 429) {
                            const retryAfter = this.getRetryAfter(error);
                            throw new errors_1.RateLimitError(this.platform, retryAfter);
                        }
                        throw new errors_1.ApiError(this.platform, error.code || 'API_ERROR', error.message, error.response?.status || 500, error.response?.data);
                    }
                    throw error;
                }
            }, {
                maxRetries: config.retryCount ?? this.config.maxRetries,
                backoffMs: this.config.retryDelay
            });
            const duration = Date.now() - startTime;
            logResponse(response, duration);
            return response;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logError(error, duration);
            if (error instanceof errors_1.PlatformError) {
                throw error;
            }
            throw new errors_1.ApiError(this.platform, 'UNKNOWN_ERROR', 'An unknown error occurred', 500, error);
        }
    }
    /**
     * Get the retry-after time in milliseconds
     * @param error Axios error
     * @returns Time to wait before retrying in milliseconds
     */
    getRetryAfter(error) {
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
        const retryCount = error.config?._retryCount || 0;
        return Math.min(1000 * Math.pow(2, retryCount), 30000); // Cap at 30s
    }
    /**
     * Log a message if logging is enabled
     * @param level Log level
     * @param message Log message
     * @param data Additional data to log
     */
    log(level, message, data) {
        if (this.config.enableLogging) {
            const logMessage = `[${this.platform.toUpperCase()}] ${message}`;
            const logArgs = [logMessage];
            if (data !== undefined) {
                logArgs.push(data);
            }
            console[level](...logArgs);
        }
    }
    /**
     * Get headers for a request
     */
    async getRequestHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.config.headers // Default headers from config
        };
        // Add any headers from the specific request config
        if (config.headers) {
            const configHeaders = this.normalizeHeaders(config.headers);
            for (const key in configHeaders) {
                if (Object.prototype.hasOwnProperty.call(configHeaders, key)) {
                    if (configHeaders[key] !== undefined && configHeaders[key] !== null) {
                        headers[key] = String(configHeaders[key]);
                    }
                }
            }
        }
        // Add authorization header if needed
        if (config.useAuth !== false) {
            try {
                const authHeaders = await this.getAuthHeaders();
                for (const key in authHeaders) {
                    if (Object.prototype.hasOwnProperty.call(authHeaders, key)) {
                        headers[key] = authHeaders[key];
                    }
                }
            }
            catch (error) {
                this.log('error', 'Failed to get authentication headers in getRequestHeaders', { error, platform: this.platform, userId: this.userId });
            }
        }
        return headers;
    }
    /**
     * Normalize Axios headers to a plain object
     */
    normalizeHeaders(headers) {
        if (headers instanceof axios_1.AxiosHeaders) {
            return headers.toJSON();
        }
        if (Array.isArray(headers)) { // Assuming this handles a specific [key, value][] format
            return headers.reduce((acc, entry) => {
                if (Array.isArray(entry) && entry.length === 2) {
                    acc[String(entry[0])] = String(entry[1]);
                }
                return acc;
            }, {});
        }
        if (typeof headers === 'object' && headers !== null) { // Added headers !== null check
            return Object.entries(headers).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) { // Ensure value is not undefined/null before String()
                    acc[key] = String(value);
                }
                return acc;
            }, {});
        }
        return {}; // Default empty object if not any of the above
    }
    /**
     * Axios request interceptor. Modifies the request config to add auth headers.
     */
    async handleRequest(config) {
        if (!config.headers) {
            config.headers = new axios_1.AxiosHeaders();
        }
        // Add authentication headers
        if (config.useAuth !== false) {
            try {
                const authHeaders = await this.getAuthHeaders();
                for (const key in authHeaders) {
                    if (Object.prototype.hasOwnProperty.call(authHeaders, key)) {
                        config.headers.set(key, authHeaders[key]);
                    }
                }
            }
            catch (error) {
                this.log('error', 'Failed to get/set authentication headers in handleRequest', { error, platform: this.platform, userId: this.userId });
                // Optionally, re-throw a new PlatformError or allow request to proceed without auth
                // For now, logging the error and letting it proceed (might fail at server)
            }
        }
        // Informational rate limit headers (actual limiting is pre-request or via retry)
        // These are mostly for the server or for debugging, not for client-side enforcement here.
        if (config.useRateLimit !== false && this.rateLimit) {
            config.headers.set('X-Client-RateLimit-Limit', String(this.rateLimit.limit));
            config.headers.set('X-Client-RateLimit-Remaining', String(this.rateLimit.remaining));
            config.headers.set('X-Client-RateLimit-Reset', String(this.rateLimit.reset));
        }
        return config;
    }
    /**
     * Axios response interceptor
     */
    handleResponse(response) {
        // Update rate limit info from response headers
        this.handleRateLimit(this.normalizeHeaders(response.headers));
        return response;
    }
    /**
     * Axios error interceptor
     */
    async handleError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response?.headers) {
                this.handleRateLimit(this.normalizeHeaders(axiosError.response.headers));
            }
            if (axiosError.response?.status === 429) {
                const retryAfter = this.getRetryAfter(axiosError);
                this.log('warn', `Rate limit hit for ${this.platform}. Retrying after ${retryAfter}ms.`, { error: axiosError.message, platform: this.platform });
                return Promise.reject(new errors_1.RateLimitError(this.platform, retryAfter, axiosError.message, axiosError.response.status, axiosError.response.data));
            }
            this.log('error', `API error for ${this.platform}: ${axiosError.message}`, {
                platform: this.platform,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                code: axiosError.code,
            });
            return Promise.reject(new errors_1.ApiError(this.platform, axiosError.code || 'AXIOS_ERROR', axiosError.message, axiosError.response?.status ?? 0, axiosError.response?.data));
        }
        this.log('error', `Unhandled error for ${this.platform}: ${error?.message || 'Unknown error'}`, { error, platform: this.platform });
        return Promise.reject(new errors_1.PlatformError(this.platform, 'UNHANDLED_CLIENT_ERROR', error?.message || `An unknown error occurred with ${this.platform}.`, { originalError: error }));
    }
}
exports.BasePlatformClient = BasePlatformClient;
