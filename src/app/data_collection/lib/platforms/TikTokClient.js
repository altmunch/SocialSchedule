"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokClient = void 0;
const base_platform_1 = require("./base-platform");
const deliverables_types_1 = require("../../../deliverables/types/deliverables_types");
const errors_1 = require("../utils/errors");
const tiktok_types_1 = require("./tiktok.types");
const TIKTOK_DEFAULT_TIMEOUT = 20000;
const TIKTOK_API_VERSION = 'v2';
class TikTokClient extends base_platform_1.BasePlatformClient {
    constructor(platformConfigFromFactory, authTokenManager, userId) {
        const configForSuper = {
            baseUrl: platformConfigFromFactory.baseUrl || `https://open.tiktokapis.com/${TIKTOK_API_VERSION}`,
            version: platformConfigFromFactory.version || TIKTOK_API_VERSION,
            rateLimit: platformConfigFromFactory.rateLimit,
            timeout: platformConfigFromFactory.timeout || TIKTOK_DEFAULT_TIMEOUT,
            headers: {
                ...platformConfigFromFactory.headers,
                'Content-Type': 'application/json; charset=UTF-8',
            }
        };
        super(configForSuper, authTokenManager, userId);
        this.platform = deliverables_types_1.Platform.TIKTOK;
    }
    handleRateLimit(headers) {
        const limit = headers['x-ratelimit-limit'];
        const remaining = headers['x-ratelimit-remaining'];
        const reset = headers['x-ratelimit-reset'];
        if (limit && remaining && reset) {
            this.rateLimit = {
                limit: parseInt(Array.isArray(limit) ? limit[0] : limit, 10),
                remaining: parseInt(Array.isArray(remaining) ? remaining[0] : remaining, 10),
                reset: parseInt(Array.isArray(reset) ? reset[0] : reset, 10),
            };
            this.log('info', `Updated TikTok rate limit: ${JSON.stringify(this.rateLimit)}`, this.rateLimit);
        }
        else {
            this.log('debug', 'TikTok rate limit headers (X-RateLimit-*) not found or incomplete.');
        }
    }
    async _callTikTokApi(endpoint, payload, responseSchema, methodName) {
        try {
            const axiosResponse = await this.client.post(endpoint, payload);
            const validationResult = responseSchema.safeParse(axiosResponse.data);
            if (!validationResult.success) {
                this.log('error', `TikTok API response validation failed for ${methodName}`, {
                    errors: validationResult.error.flatten(), rawData: axiosResponse.data
                });
                throw new errors_1.ValidationError(this.platform, `TikTok API response validation failed for ${methodName}.`, validationResult.error.issues);
            }
            const responseDataTyped = validationResult.data;
            if (responseDataTyped.error && responseDataTyped.error.code !== 'ok') {
                this.log('error', `TikTok API error in ${methodName}: ${responseDataTyped.error.message}`, responseDataTyped.error);
                // Pass axiosResponse.status as the statusCode for ApiError
                throw new errors_1.ApiError(this.platform, responseDataTyped.error.code, responseDataTyped.error.message, axiosResponse.status, responseDataTyped.error);
            }
            return { data: responseDataTyped.data, rateLimit: this.rateLimit === null ? undefined : this.rateLimit };
        }
        catch (error) {
            if (error instanceof errors_1.ApiError || error instanceof errors_1.ValidationError || error instanceof errors_1.RateLimitError || error instanceof errors_1.PlatformError) {
                throw error;
            }
            this.log('error', `Unhandled error in ${methodName}`, { error });
            throw new errors_1.PlatformError(this.platform, `Unhandled error in ${methodName}: ${error.message}`);
        }
    }
    async getUserInfo(params) {
        const response = await this._callTikTokApi('/user/info/', params, tiktok_types_1.TikTokUserInfoResponseSchema, 'getUserInfo');
        return { data: response.data?.user, rateLimit: response.rateLimit };
    }
    async listUserVideos(params) {
        return this._callTikTokApi('/video/list/', params, tiktok_types_1.TikTokVideoListResponseSchema, 'listUserVideos');
    }
    async queryVideos(params) {
        return this._callTikTokApi('/video/query/', params, tiktok_types_1.TikTokVideoQueryResponseSchema, 'queryVideos');
    }
    async initiateVideoUpload(params) {
        return this._callTikTokApi('/video/upload/', params, tiktok_types_1.TikTokVideoUploadInitResponseSchema, 'initiateVideoUpload');
    }
    async publishVideo(params) {
        return this._callTikTokApi('/video/publish/', params, tiktok_types_1.TikTokVideoPublishResponseSchema, 'publishVideo');
    }
    async postVideo(params) {
        this.log('info', 'Attempting to post video to TikTok via PULL_URL strategy.', { title: params.title });
        const validationResult = tiktok_types_1.TikTokPostVideoParamsSchema.safeParse(params);
        if (!validationResult.success) {
            this.log('error', 'Invalid parameters for postVideo', { errors: validationResult.error.flatten() });
            throw new errors_1.ValidationError(this.platform, 'Invalid parameters for postVideo.', validationResult.error.issues);
        }
        const validatedParams = validationResult.data;
        const initParams = {
            source_info: {
                source: 'PULL_URL',
                video_url: validatedParams.video_url,
            },
        };
        const initApiResponse = await this.initiateVideoUpload(initParams);
        const initData = initApiResponse.data;
        if (!initData?.upload_id) {
            this.log('error', 'Failed to initiate TikTok video upload. No upload_id received.', { initApiResponse });
            throw new errors_1.PlatformError(this.platform, 'Failed to initiate TikTok video upload. No upload_id.', 'UPLOAD_INIT_FAILED');
        }
        const uploadId = initData.upload_id;
        this.log('info', `TikTok video upload initiated. Upload ID: ${uploadId}`, { uploadId });
        await new Promise(resolve => setTimeout(resolve, 5000));
        const publishParams = {
            upload_id: uploadId,
            title: validatedParams.title,
            description: validatedParams.description,
            privacy_level: validatedParams.privacy_level,
            disable_comment: validatedParams.disable_comment,
            disable_duet: validatedParams.disable_duet,
            disable_stitch: validatedParams.disable_stitch,
        };
        return this.publishVideo(publishParams);
    }
}
exports.TikTokClient = TikTokClient;
