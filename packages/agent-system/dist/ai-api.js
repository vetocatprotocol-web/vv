"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAIAPI = void 0;
const ai_system_1 = require("@karyo/ai-system");
class DefaultAIAPI {
    constructor(service = new ai_system_1.AIService()) {
        this.service = service;
    }
    async generateText(request) {
        return this.service.generateText(request);
    }
    // backward-compatible helper for old signature
    async generateTextLegacy(prompt, context) {
        const result = await this.service.generateText({ prompt, context });
        return result.text;
    }
}
exports.DefaultAIAPI = DefaultAIAPI;
//# sourceMappingURL=ai-api.js.map