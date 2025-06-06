"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStrategy = void 0;
// Defines the strategy used for authentication
var AuthStrategy;
(function (AuthStrategy) {
    AuthStrategy["OAUTH2"] = "oauth2";
    AuthStrategy["API_KEY"] = "api_key";
})(AuthStrategy || (exports.AuthStrategy = AuthStrategy = {}));
