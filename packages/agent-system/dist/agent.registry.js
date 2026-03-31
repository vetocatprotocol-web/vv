"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    constructor() {
        this.agents = [];
    }
    registerAgent(agent) {
        if (this.agents.some((a) => a.name === agent.name)) {
            return;
        }
        this.agents.push(agent);
    }
    getAgentsForEvent(event) {
        return this.agents.filter((agent) => {
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
        return this.agents.map((agent) => agent.name);
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=agent.registry.js.map