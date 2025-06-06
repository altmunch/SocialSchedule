"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
// Platform type - ensure this aligns with platform definitions used elsewhere (e.g., in SchedulerCore)
var Platform;
(function (Platform) {
    Platform["TIKTOK"] = "tiktok";
    Platform["INSTAGRAM"] = "instagram";
    Platform["YOUTUBE"] = "youtube";
    Platform["FACEBOOK"] = "facebook";
    Platform["LINKEDIN"] = "linkedin";
    Platform["TWITTER"] = "twitter";
})(Platform || (exports.Platform = Platform = {})); // Add other platforms as needed
