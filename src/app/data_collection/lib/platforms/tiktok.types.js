"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokPostVideoParamsSchema = exports.TikTokVideoPublishResponseSchema = exports.TikTokVideoPublishResponseDataSchema = exports.TikTokVideoPublishRequestSchema = exports.TikTokVideoUploadInitResponseSchema = exports.TikTokVideoUploadInitResponseDataSchema = exports.TikTokVideoUploadInitRequestSchema = exports.TikTokVideoQueryResponseSchema = exports.TikTokVideoQueryResponseDataSchema = exports.TikTokVideoQueryDetailSchema = exports.TikTokVideoQueryRequestSchema = exports.TikTokVideoListResponseSchema = exports.TikTokVideoListResponseDataSchema = exports.TikTokVideoListItemSchema = exports.TikTokVideoListRequestSchema = exports.TikTokUserInfoResponseSchema = exports.TikTokUserInfoResponseDataSchema = exports.TikTokUserInfoSchema = exports.TikTokUserInfoRequestSchema = exports.TikTokUserInfoFieldsSchema = exports.TikTokApiErrorDataSchema = exports.TikTokUserQueryResponsePayloadSchema = exports.TikTokUserDataSchema = exports.TikTokVideoQueryResponsePayloadSchema = exports.TikTokVideoDataSchema = exports.TikTokVideoQueryErrorSchema = void 0;
exports.createTikTokApiResponseSchema = createTikTokApiResponseSchema;
const zod_1 = require("zod");
// Schema for TikTok API errors (as part of response payload)
exports.TikTokVideoQueryErrorSchema = zod_1.z.object({
    code: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    message: zod_1.z.string(),
    log_id: zod_1.z.string(),
});
// Schema for individual TikTok video data
exports.TikTokVideoDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    video_description: zod_1.z.string().optional(),
    view_count: zod_1.z.number().int().min(0).optional(),
    like_count: zod_1.z.number().int().min(0).optional(),
    comment_count: zod_1.z.number().int().min(0).optional(),
    share_count: zod_1.z.number().int().min(0).optional(),
    duration: zod_1.z.number().min(0).optional(),
    create_time: zod_1.z.number().int().optional(), // Unix timestamp
    cover_image_url: zod_1.z.string().url().optional(), // URL for the video's cover image
    share_url: zod_1.z.string().url().optional(), // URL to share the video
});
// Schema for the payload of a TikTok video query response
exports.TikTokVideoQueryResponsePayloadSchema = zod_1.z.object({
    videos: zod_1.z.array(exports.TikTokVideoDataSchema).optional(),
    video: exports.TikTokVideoDataSchema.optional(), // For single video fetch
    error: exports.TikTokVideoQueryErrorSchema.optional(),
    cursor: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    has_more: zod_1.z.boolean().optional(),
});
// Schema for TikTok user data
exports.TikTokUserDataSchema = zod_1.z.object({
    follower_count: zod_1.z.number().int().min(0).optional(),
    following_count: zod_1.z.number().int().min(0).optional(),
    video_count: zod_1.z.number().int().min(0).optional(),
});
// Schema for the payload of a TikTok user query response
exports.TikTokUserQueryResponsePayloadSchema = zod_1.z.object({
    user: exports.TikTokUserDataSchema.optional(),
    error: exports.TikTokVideoQueryErrorSchema.optional(),
});
// --- TikTok API v2 Schemas ---
// Common Error Schema for TikTok API v2 responses
exports.TikTokApiErrorDataSchema = zod_1.z.object({
    code: zod_1.z.string(), // e.g., "ok", "error_code_example"
    message: zod_1.z.string(),
    log_id: zod_1.z.string().optional(), // Optional, but often present for debugging
});
// Generic TikTok API Response Wrapper
function createTikTokApiResponseSchema(dataSchema) {
    return zod_1.z.object({
        data: dataSchema.optional(), // Data can be absent on error
        error: exports.TikTokApiErrorDataSchema,
    });
}
// User Info Schemas (/v2/user/info/)
exports.TikTokUserInfoFieldsSchema = zod_1.z.array(zod_1.z.enum([
    'open_id', 'union_id', 'avatar_url', 'avatar_url_100', 'avatar_url_200', 'avatar_large_url',
    'display_name', 'bio_description', 'profile_deep_link', 'is_verified',
    'follower_count', 'following_count', 'likes_count', 'video_count'
]));
exports.TikTokUserInfoRequestSchema = zod_1.z.object({
    fields: exports.TikTokUserInfoFieldsSchema,
});
exports.TikTokUserInfoSchema = zod_1.z.object({
    open_id: zod_1.z.string().optional(),
    union_id: zod_1.z.string().optional(),
    avatar_url: zod_1.z.string().url().optional(),
    avatar_url_100: zod_1.z.string().url().optional(),
    avatar_url_200: zod_1.z.string().url().optional(),
    avatar_large_url: zod_1.z.string().url().optional(),
    display_name: zod_1.z.string().optional(),
    bio_description: zod_1.z.string().optional(),
    profile_deep_link: zod_1.z.string().url().optional(),
    is_verified: zod_1.z.boolean().optional(),
    follower_count: zod_1.z.number().int().min(0).optional(),
    following_count: zod_1.z.number().int().min(0).optional(),
    likes_count: zod_1.z.number().int().min(0).optional(),
    video_count: zod_1.z.number().int().min(0).optional(),
});
exports.TikTokUserInfoResponseDataSchema = zod_1.z.object({
    user: exports.TikTokUserInfoSchema,
});
exports.TikTokUserInfoResponseSchema = createTikTokApiResponseSchema(exports.TikTokUserInfoResponseDataSchema);
// Video List Schemas (/v2/video/list/)
exports.TikTokVideoListRequestSchema = zod_1.z.object({
    fields: zod_1.z.array(zod_1.z.string()), // Specific fields for video list, e.g., from TikTokVideoDataSchema keys
    cursor: zod_1.z.string().optional(), // Or number, depending on API version
    max_count: zod_1.z.number().int().min(1).max(20).optional(), // Max 20 for this endpoint usually
});
exports.TikTokVideoListItemSchema = exports.TikTokVideoDataSchema.extend({}); // Can be extended if list has different fields
exports.TikTokVideoListResponseDataSchema = zod_1.z.object({
    videos: zod_1.z.array(exports.TikTokVideoListItemSchema),
    cursor: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    has_more: zod_1.z.boolean(),
});
exports.TikTokVideoListResponseSchema = createTikTokApiResponseSchema(exports.TikTokVideoListResponseDataSchema);
// Video Query Schemas (/v2/video/query/) - For video analytics/details
exports.TikTokVideoQueryRequestSchema = zod_1.z.object({
    fields: zod_1.z.array(zod_1.z.string()), // Specific fields for video query
    video_ids: zod_1.z.array(zod_1.z.string()),
});
exports.TikTokVideoQueryDetailSchema = exports.TikTokVideoDataSchema.extend({
    // Add more detailed analytics fields if available from this endpoint
    title: zod_1.z.string().optional(),
    embed_html: zod_1.z.string().optional(),
    embed_link: zod_1.z.string().url().optional(),
    privacy_level: zod_1.z.string().optional(), // e.g., PUBLICLY_AVAILABLE, FRIENDS_ONLY, SELF_ONLY
    // Potentially more stats here
});
exports.TikTokVideoQueryResponseDataSchema = zod_1.z.object({
    videos: zod_1.z.array(exports.TikTokVideoQueryDetailSchema),
});
exports.TikTokVideoQueryResponseSchema = createTikTokApiResponseSchema(exports.TikTokVideoQueryResponseDataSchema);
// Video Upload Schemas (/v2/video/upload/)
exports.TikTokVideoUploadInitRequestSchema = zod_1.z.object({
    // TikTok for Business API usually requires source_info for direct posting
    source_info: zod_1.z.object({
        source: zod_1.z.enum(['FILE_URL', 'PULL_URL']), // PULL_URL for direct URL, FILE_URL for resumable
        video_url: zod_1.z.string().url().optional(), // if source is PULL_URL
        video_size: zod_1.z.number().int().min(1).optional(), // if source is FILE_URL (bytes)
        chunk_size: zod_1.z.number().int().min(1024 * 1024).optional(), // if source is FILE_URL (bytes, e.g., 5MB)
        total_chunk_count: zod_1.z.number().int().min(1).optional(), // if source is FILE_URL
    }).optional(),
    // For Resumable Upload (Open API)
    video_name: zod_1.z.string().optional(), // Optional, helps identify the video
});
exports.TikTokVideoUploadInitResponseDataSchema = zod_1.z.object({
    upload_id: zod_1.z.string(),
    upload_url: zod_1.z.string().url(), // URL to PUT the video file to
    // For resumable uploads, it might provide multiple URLs or a pattern
});
exports.TikTokVideoUploadInitResponseSchema = createTikTokApiResponseSchema(exports.TikTokVideoUploadInitResponseDataSchema);
// Video Publish Schemas (/v2/video/publish/)
exports.TikTokVideoPublishRequestSchema = zod_1.z.object({
    upload_id: zod_1.z.string(), // From upload init response
    title: zod_1.z.string().max(150).optional(),
    description: zod_1.z.string().max(500).optional(), // Often used for hashtags too
    privacy_level: zod_1.z.enum(['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY', 'PRIVATE']).optional(),
    disable_comment: zod_1.z.boolean().optional(),
    disable_duet: zod_1.z.boolean().optional(),
    disable_stitch: zod_1.z.boolean().optional(),
    brand_content_toggle: zod_1.z.boolean().optional(),
    brand_organic_toggle: zod_1.z.boolean().optional(),
    // schedule_time: z.number().int().optional(), // Unix timestamp for scheduled posts, if supported
});
exports.TikTokVideoPublishResponseDataSchema = zod_1.z.object({
    video_id: zod_1.z.string(), // The ID of the published video
    // share_url: z.string().url().optional(),
});
exports.TikTokVideoPublishResponseSchema = createTikTokApiResponseSchema(exports.TikTokVideoPublishResponseDataSchema);
// Convenience schema for posting a video directly via URL
exports.TikTokPostVideoParamsSchema = zod_1.z.object({
    video_url: zod_1.z.string().url(),
    title: zod_1.z.string().max(150).optional(),
    description: zod_1.z.string().max(500).optional(),
    privacy_level: zod_1.z.enum(['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY', 'PRIVATE']).optional(),
    disable_comment: zod_1.z.boolean().optional(),
    disable_duet: zod_1.z.boolean().optional(),
    disable_stitch: zod_1.z.boolean().optional(),
});
