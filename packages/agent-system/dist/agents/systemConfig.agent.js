"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigAgent = void 0;
const base_agent_1 = require("../base.agent");
class SystemConfigAgent extends base_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'SystemConfigAgent';
    }
    canHandle(event) {
        return event.type === 'SYSTEM_CONFIG_UPDATE';
    }
    async execute(context) {
        const payload = context.event.payload || {};
        const key = String(payload.key || '').trim();
        const value = payload.value;
        if (!key) {
            return;
        }
        const existingConfig = (await context.memory.read('system_config')) || {};
        const updatedConfig = { ...existingConfig, [key]: value };
        await context.memory.write('system_config', updatedConfig);
        await context.emit({
            id: `${context.event.id}-system-config-updated`,
            type: 'SYSTEM_CONFIG_UPDATED',
            payload: { config: updatedConfig },
            metadata: {
                source: 'agent-system.SystemConfigAgent',
                correlationId: context.event.metadata?.correlationId || context.event.id,
                timestamp: Date.now(),
            },
        });
    }
}
exports.SystemConfigAgent = SystemConfigAgent;
//# sourceMappingURL=systemConfig.agent.js.map