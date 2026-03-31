"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIConfigAgent = void 0;
const base_agent_1 = require("../base.agent");
class AIConfigAgent extends base_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'AIConfigAgent';
    }
    canHandle(event) {
        return event.type === 'AI_CONFIG_UPDATE';
    }
    async execute(context) {
        const payload = context.event.payload || {};
        const config = { ...((await context.memory.read('ai_config')) || {}), ...payload };
        await context.memory.write('ai_config', config);
        await context.emit({
            id: `${context.event.id}-ai-config-updated`,
            type: 'AI_CONFIG_UPDATED',
            payload: { config },
            metadata: {
                source: 'agent-system.AIConfigAgent',
                correlationId: context.event.metadata?.correlationId || context.event.id,
                timestamp: Date.now(),
            },
        });
    }
}
exports.AIConfigAgent = AIConfigAgent;
//# sourceMappingURL=aiConfig.agent.js.map