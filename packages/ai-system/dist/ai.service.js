"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_provider_1 = require("./providers/openai.provider");
class AIService {
    constructor(provider) {
        if (provider) {
            this.provider = provider;
        }
        else {
            try {
                this.provider = new openai_provider_1.OpenAIProvider();
            }
            catch (err) {
                // Fall back to a safe mock provider if API key missing for local/dev convenience.
                this.provider = {
                    async generate(req) {
                        return {
                            text: `Mock response for prompt: ${req.prompt}`,
                            raw: {
                                fallback: true,
                                prompt: req.prompt,
                                context: req.context,
                            },
                        };
                    },
                };
            }
        }
    }
    async generateText(request) {
        return this.provider.generate(request);
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map