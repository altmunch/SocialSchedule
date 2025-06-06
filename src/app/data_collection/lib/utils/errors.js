"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ValidationError = exports.AuthenticationError = exports.RateLimitError = exports.PlatformError = void 0;
exports.isRetryableError = isRetryableError;
exports.withRetry = withRetry;
class PlatformError extends Error {
    constructor(platform, code, message, details) {
        super(`[${platform}] ${message}`);
        this.platform = platform;
        this.code = code;
        this.details = details;
        this.name = 'PlatformError';
    }
}
exports.PlatformError = PlatformError;
class RateLimitError extends PlatformError {
    constructor(platform, retryAfter, message, statusCode, details) {
        super(platform, 'RATE_LIMIT_EXCEEDED', message || `Rate limit exceeded. Retry after ${retryAfter}ms`, { retryAfter, originalMessage: message, statusCode, originalDetails: details });
        this.retryAfter = retryAfter;
        this.statusCode = statusCode;
    }
}
exports.RateLimitError = RateLimitError;
class AuthenticationError extends PlatformError {
    constructor(platform, message) {
        super(platform, 'AUTHENTICATION_FAILED', message);
    }
}
exports.AuthenticationError = AuthenticationError;
class ValidationError extends PlatformError {
    constructor(platform, message, validationIssues, // Can be ZodError.issues or similar
    details) {
        super(platform, 'VALIDATION_ERROR', message, details);
        this.validationIssues = validationIssues;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ApiError extends PlatformError {
    constructor(platform, code, message, statusCode, details) {
        super(platform, code, message, details);
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
function isRetryableError(error) {
    if (error instanceof RateLimitError)
        return true;
    if (error instanceof ApiError) {
        // Retry on server errors and too many requests
        return error.statusCode >= 500 || error.statusCode === 429;
    }
    return false;
}
function withRetry(fn, options = {}) {
    const { maxRetries = 3, backoffMs = 1000 } = options;
    let attempts = 0;
    const execute = async () => {
        try {
            return await fn();
        }
        catch (error) {
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
