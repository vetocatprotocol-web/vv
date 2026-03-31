"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    constructor() {
        this.agents = new Map();
    }
    registerAgent(agent) {
        if (this.agents.has(agent.name)) {
            return;
        }
        this.agents.set(agent.name, { agent, enabled: true });
    }
    setAgentEnabled(agentName, enabled) {
        const record = this.agents.get(agentName);
        if (!record) {
            return;
        }
        record.enabled = enabled;
    }
    isAgentEnabled(agentName) {
        const record = this.agents.get(agentName);
        return record?.enabled ?? false;
    }
    getAgentsForEvent(event) {
        return Array.from(this.agents.values())
            .filter((record) => record.enabled)
            .map((record) => record.agent)
            .filter((agent) => {
            try {
                return agent.canHandle(event);
            }
            catch (error) {
                console.warn(`[agent-system] canHandle error ${agent.name}:`, error);
                return false;
            }
        });
    }
    listAgents() {
        return Array.from(this.agents.entries()).map(([name, record]) => ({
            name,
            enabled: record.enabled,
        }));
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=agent.registry.js.map