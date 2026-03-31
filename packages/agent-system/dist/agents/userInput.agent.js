"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInputAgent = void 0;
const base_agent_1 = require("../base.agent");
class UserInputAgent extends base_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'UserInputAgent';
    }
    canHandle(event) {
        return event.type === 'USER_INPUT' && typeof event.payload?.text === 'string';
    }
    async execute(context) {
        const text = String(context.event.payload?.text || '').trim();
        if (!text) {
            return;
        }
        // Attempt to use memory for context history (optional)
        const memoryKey = `user_input:${context.event.id}`;
        await context.memory.write(memoryKey, {
            id: context.event.id,
            text,
            timestamp: Date.now(),
            metadata: context.event.metadata,
        });
        const aiPrompt = `Process this user input and return a concise agent response:\n${text}`;
        const userContext = await context.memory.read('user_context');
        const contextPayload = Array.isArray(userContext)
            ? userContext.join('\n')
            : userContext || '';
        const aiText = await context.ai.generateText(aiPrompt, contextPayload);
        await this.respond(context, {
            text: aiText,
            original: text,
            generatedAt: Date.now(),
        });
        // maintain memory provenance
        await context.memory.write(`last_user_input`, {
            text,
            aiText,
            timestamp: Date.now(),
        });
    }
}
exports.UserInputAgent = UserInputAgent;
//# sourceMappingURL=userInput.agent.js.map