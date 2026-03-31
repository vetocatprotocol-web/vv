"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagementAgent = void 0;
const base_agent_1 = require("../base.agent");
class AgentManagementAgent extends base_agent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.name = 'AgentManagementAgent';
    }
    canHandle(event) {
        return event.type === 'AGENT_ENABLE' || event.type === 'AGENT_DISABLE';
    }
    async execute(context) {
        const payload = context.event.payload || {};
        const agentName = String(payload.agentName || '').trim();
        if (!agentName) {
            return;
        }
        const status = context.event.type === 'AGENT_ENABLE' ? 'enabled' : 'disabled';
        const existing = (await context.memory.read('agent_status')) || {};
        const updated = { ...existing, [agentName]: status };
        await context.memory.write('agent_status', updated);
        await context.emit({
            id: `${context.event.id}-agent-status-updated`,
            type: 'AGENT_STATUS_UPDATED',
            payload: { agentName, status, state: updated },
            metadata: {
                source: 'agent-system.AgentManagementAgent',
                correlationId: context.event.metadata?.correlationId || context.event.id,
                timestamp: Date.now(),
            },
        });
    }
}
exports.AgentManagementAgent = AgentManagementAgent;
//# sourceMappingURL=agentManagement.agent.js.map