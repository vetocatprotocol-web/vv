"use strict";
// packages/integrations/src/integrations/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAPIIntegration = exports.GmailIntegration = exports.SlackIntegration = exports.GoogleDriveIntegration = void 0;
var google_drive_1 = require("./google-drive");
Object.defineProperty(exports, "GoogleDriveIntegration", { enumerable: true, get: function () { return google_drive_1.GoogleDriveIntegration; } });
var slack_1 = require("./slack");
Object.defineProperty(exports, "SlackIntegration", { enumerable: true, get: function () { return slack_1.SlackIntegration; } });
var gmail_1 = require("./gmail");
Object.defineProperty(exports, "GmailIntegration", { enumerable: true, get: function () { return gmail_1.GmailIntegration; } });
var custom_api_1 = require("./custom-api");
Object.defineProperty(exports, "CustomAPIIntegration", { enumerable: true, get: function () { return custom_api_1.CustomAPIIntegration; } });
//# sourceMappingURL=index.js.map