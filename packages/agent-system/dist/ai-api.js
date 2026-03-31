"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAIAPI = void 0;
const ai_core_1 = require("@karyo/ai-core");
// Simple wrapper around AI core as an abstraction layer. In production, connect to LLM providers.
class DefaultAIAPI {
    constructor(contextBuilder = new ai_core_1.ContextBuilder()) {
        this.contextBuilder = contextBuilder;
    }
    async generateText(prompt, context) {
        // placeholder for actual AI call; it may use model router + prompt orchestrator in later iterations.
        const contextSuffix = context ? `\n\nContext:\n${context}` : '';
        const formatted = `Assistant response to: "${prompt}"${contextSuffix}`;
        return Promise.resolve(formatted);
    }
}
exports.DefaultAIAPI = DefaultAIAPI;
//# sourceMappingURL=ai-api.js.map